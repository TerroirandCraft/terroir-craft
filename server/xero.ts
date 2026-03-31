import { XeroClient } from "xero-node";

// ── Xero credentials ───────────────────────────────────────────────────────
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID || "2CCF339348184115A8DA65454817F574";
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET || "aWYx_6-jUnEt1lVsI9PKv3bmSJWlQ4zeBzm-BZpVr55l1pg4";
// Trim whitespace/newlines to avoid OAuth redirect_uri mismatch
const XERO_REDIRECT_URI = (process.env.XERO_REDIRECT_URI || "https://terroir-craft-production.up.railway.app/api/xero/callback").trim();

export const xero = new XeroClient({
  clientId: XERO_CLIENT_ID,
  clientSecret: XERO_CLIENT_SECRET,
  redirectUris: [XERO_REDIRECT_URI],
  // New granular scopes required for apps created after 2 March 2026
  scopes: [
    "openid",
    "profile",
    "email",
    "offline_access",
    "accounting.invoices",        // create/read invoices
    "accounting.invoices.read",
    "accounting.contacts",        // create/read contacts (unchanged)
    "accounting.contacts.read",
  ],
});

// ── Token storage (in-memory, persists across requests in same process) ────
let xeroTokenSet: any = null;
let xeroTenantId: string | null = null;

export function setXeroTokens(tokens: any, tenantId: string) {
  xeroTokenSet = tokens;
  xeroTenantId = tenantId;
  xero.setTokenSet(tokens);
}

export function getXeroTenantId() { return xeroTenantId; }
export function isXeroConnected() { return !!xeroTokenSet && !!xeroTenantId; }

// ── Refresh token if needed ────────────────────────────────────────────────
async function ensureFreshToken() {
  if (!xeroTokenSet) throw new Error("Xero not connected");
  const tokenSet = await xero.refreshToken();
  xeroTokenSet = tokenSet;
}

// ── Create Invoice in Xero ─────────────────────────────────────────────────
export interface OrderItem {
  name: string;
  itemCode: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceParams {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  recipientName?: string;    // For gifts: recipient name
  recipientPhone?: string;   // For gifts: recipient phone
  isGift?: boolean;          // If true: delivery note only, no prices
  items: OrderItem[];
  referredBy?: string;       // sales rep code e.g. "ALAN"
  orderRef: string;          // internal order reference
  amountPaid?: number;       // Total amount already paid via Payment Asia
}

export async function createXeroInvoice(params: CreateInvoiceParams): Promise<string | null> {
  if (!isXeroConnected()) {
    console.warn("[Xero] Not connected — skipping invoice creation");
    return null;
  }

  try {
    await ensureFreshToken();

    const tenantId = xeroTenantId!;

    // 1. Find or create contact (with delivery address)
    // Build address object if we have delivery info
    const addressLines: any[] = [];
    if (params.deliveryAddress) {
      // deliveryAddress format: "Unit, Floor, Building, Street, District — District Name"
      // Split on " — " to get city from district
      const parts = params.deliveryAddress.split(" — ");
      const streetPart = parts[0] || params.deliveryAddress;
      const cityPart = parts[1] || "Hong Kong";
      addressLines.push({
        addressType: "STREET",
        addressLine1: streetPart,
        city: cityPart,
        country: "HK",
      });
    }
    const contactPayload: any = {
      name: params.customerName,
      emailAddress: params.customerEmail,
    };
    if (params.customerPhone) contactPayload.phones = [{ phoneType: "MOBILE", phoneNumber: params.customerPhone }];
    if (addressLines.length > 0) contactPayload.addresses = addressLines;

    let contactId: string;
    try {
      const existing = await xero.accountingApi.getContacts(
        tenantId,
        undefined, undefined, undefined, undefined, undefined,
        [params.customerEmail]
      );
      if (existing.body.contacts && existing.body.contacts.length > 0) {
        // Update contact name/address to latest info
        const existingContact = existing.body.contacts[0];
        contactId = existingContact.contactID!;
        try {
          await xero.accountingApi.updateContact(tenantId, contactId, {
            contacts: [{ ...contactPayload, contactID: contactId }],
          });
        } catch (updateErr) {
          console.warn("[Xero] Could not update contact:", updateErr);
        }
      } else {
        const created = await xero.accountingApi.createContacts(tenantId, {
          contacts: [contactPayload],
        });
        contactId = created.body.contacts![0].contactID!;
      }
    } catch {
      const created = await xero.accountingApi.createContacts(tenantId, {
        contacts: [contactPayload],
      });
      contactId = created.body.contacts![0].contactID!;
    }

    // 2. Build line items — try item code first, fallback to description only
    const lineItems = params.items.map(item => {
      const base: any = {
        description: item.name,
        quantity: item.quantity,
        unitAmount: item.unitPrice,
        accountCode: "202",
        taxType: "NONE",
      };
      // Only add itemCode if it looks like a valid TC item code (e.g. TCAU-MO0123)
      if (item.itemCode && /^[A-Z]{2,6}-/.test(item.itemCode)) {
        base.itemCode = item.itemCode;
      }
      return base;
    });

    // 3. Reference — keep it short (order ref + sales rep + gift flag only)
    let reference = params.referredBy
      ? `${params.orderRef} | Ref: ${params.referredBy}`
      : params.orderRef;
    if (params.isGift && params.recipientName) {
      reference += ` | GIFT to: ${params.recipientName}${params.recipientPhone ? " " + params.recipientPhone : ""}`;
    }
    // Delivery address is stored on the contact — no need to repeat in reference

    // 4. Create AUTHORISED invoice
    const today = new Date().toISOString().split("T")[0];
    const invoiceResp = await xero.accountingApi.createInvoices(tenantId, {
      invoices: [{
        type: "ACCREC" as any,
        contact: { contactID: contactId },
        lineItems,
        date: today,
        dueDate: today, // Already paid
        reference,
        status: "AUTHORISED" as any,
        currencyCode: "HKD" as any,
      }],
    });

    const invoice = invoiceResp.body.invoices?.[0];
    const invoiceId = invoice?.invoiceID;
    const invoiceNumber = invoice?.invoiceNumber;
    const invoiceTotal = invoice?.total ?? params.amountPaid ?? 0;

    // 5. Email invoice to customer FIRST while still AUTHORISED
    //    (Xero API does not allow emailing a PAID invoice)
    if (invoiceId && !params.isGift) {
      try {
        await xero.accountingApi.emailInvoice(tenantId, invoiceId, {});
        console.log(`[Xero] Invoice ${invoiceNumber} emailed to ${params.customerEmail}`);
      } catch (emailErr) {
        console.warn("[Xero] Invoice created but email failed:", emailErr);
      }
    }

    // 6. THEN mark invoice as PAID (payment already received via Payment Asia)
    if (invoiceId && invoiceTotal > 0) {
      try {
        await xero.accountingApi.createPayment(tenantId, {
          invoice: { invoiceID: invoiceId },
          account: { code: "090" }, // Undeposited Funds
          amount: invoiceTotal,
          date: today,
        } as any);
        console.log(`[Xero] Invoice ${invoiceNumber} marked as PAID`);
      } catch (paidErr) {
        console.warn("[Xero] Could not mark as paid (invoice still created):", paidErr);
      }
    }

    return invoiceNumber || null;

  } catch (err) {
    console.error("[Xero] Failed to create invoice:", err);
    return null;
  }
}
