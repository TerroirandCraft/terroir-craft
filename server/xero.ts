import { XeroClient } from "xero-node";

// ── Xero credentials ───────────────────────────────────────────────────────
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID || "2CCF339348184115A8DA65454817F574";
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET || "aWYx_6-jUnEt1lVsI9PKv3bmSJWlQ4zeBzm-BZpVr55l1pg4";
const XERO_REDIRECT_URI = process.env.XERO_REDIRECT_URI || "https://terroir-craft-production.up.railway.app/api/xero/callback";

export const xero = new XeroClient({
  clientId: XERO_CLIENT_ID,
  clientSecret: XERO_CLIENT_SECRET,
  redirectUris: [XERO_REDIRECT_URI],
  scopes: ["openid", "profile", "email", "accounting.transactions", "accounting.contacts", "offline_access"],
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
  items: OrderItem[];
  referredBy?: string;   // sales rep code e.g. "ALAN"
  orderRef: string;      // internal order reference
}

export async function createXeroInvoice(params: CreateInvoiceParams): Promise<string | null> {
  if (!isXeroConnected()) {
    console.warn("[Xero] Not connected — skipping invoice creation");
    return null;
  }

  try {
    await ensureFreshToken();

    const tenantId = xeroTenantId!;

    // 1. Find or create contact
    let contactId: string;
    try {
      const existing = await xero.accountingApi.getContacts(
        tenantId,
        undefined, undefined, undefined, undefined, undefined,
        [params.customerEmail]
      );
      if (existing.body.contacts && existing.body.contacts.length > 0) {
        contactId = existing.body.contacts[0].contactID!;
      } else {
        const created = await xero.accountingApi.createContacts(tenantId, {
          contacts: [{
            name: params.customerName,
            emailAddress: params.customerEmail,
          }],
        });
        contactId = created.body.contacts![0].contactID!;
      }
    } catch {
      const created = await xero.accountingApi.createContacts(tenantId, {
        contacts: [{
          name: params.customerName,
          emailAddress: params.customerEmail,
        }],
      });
      contactId = created.body.contacts![0].contactID!;
    }

    // 2. Build line items — all using account code 202 (Online Store)
    const lineItems = params.items.map(item => ({
      description: item.name,
      itemCode: item.itemCode,
      quantity: item.quantity,
      unitAmount: item.unitPrice,
      accountCode: "202",   // Online Store account
      taxType: "NONE",
    }));

    // 3. Build reference string with referred by
    const reference = params.referredBy
      ? `${params.orderRef} | Ref: ${params.referredBy}`
      : params.orderRef;

    // 4. Create invoice
    const invoiceResp = await xero.accountingApi.createInvoices(tenantId, {
      invoices: [{
        type: "ACCREC" as any,
        contact: { contactID: contactId },
        lineItems,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reference,
        status: "AUTHORISED" as any,
        currencyCode: "HKD" as any,
      }],
    });

    const invoice = invoiceResp.body.invoices?.[0];
    const invoiceId = invoice?.invoiceID;
    const invoiceNumber = invoice?.invoiceNumber;

    // 5. Send invoice email to customer
    if (invoiceId) {
      try {
        await xero.accountingApi.emailInvoice(tenantId, invoiceId, {});
        console.log(`[Xero] Invoice ${invoiceNumber} created and emailed to ${params.customerEmail}`);
      } catch (emailErr) {
        console.warn("[Xero] Invoice created but email failed:", emailErr);
      }
    }

    return invoiceNumber || null;

  } catch (err) {
    console.error("[Xero] Failed to create invoice:", err);
    return null;
  }
}
