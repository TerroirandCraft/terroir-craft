export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-2">Legal 法律條款</p>
          <h1 className="font-display text-4xl font-light mb-1">Terms & Conditions</h1>
          <p className="font-display text-xl font-light text-white/70">服務條款</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* Delivery Policy */}
        <section>
          <h2 className="font-display text-2xl font-light text-foreground mb-1">Delivery Policy</h2>
          <p className="font-display text-lg font-light text-muted-foreground mb-6">送貨政策</p>
          <div className="space-y-5">

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                We offer free delivery for orders of HKD1,000 or above to addresses within Hong Kong (single delivery location per order).
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                香港地址訂單滿港幣1,000元或以上，可享免費送貨服務（每張訂單只限一個送貨地址）。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                Orders below HKD1,000 will be subject to a standard delivery charge, which will be shown at checkout.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                訂單金額低於港幣1,000元，須繳付標準運費，具體金額將於結帳時顯示。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                Orders are normally processed within 1–2 working days after payment is confirmed, and delivery usually takes 2–5 working days, depending on the courier arrangement and delivery district.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                訂單一般於確認付款後1至2個工作天內處理，送貨時間通常為2至5個工作天，視乎速遞安排及送貨地區而定。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                Delivery service is available from Monday to Friday, excluding public holidays. Orders placed on weekends and public holidays will be processed on the next working day.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                送貨服務於星期一至五（公眾假期除外）提供。於週末及公眾假期下單的訂單，將於下一個工作天起處理。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                Remote areas (including but not limited to outlying islands, certain New Territories districts and locations with restricted access) may incur an additional surcharge or a longer lead time. The exact surcharge and arrangement will be notified before confirmation of delivery.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                偏遠地區（包括但不限於離島、部分新界地區及有出入限制的地點）或需繳付額外附加費或需較長的處理時間。具體附加費及安排將於確認送貨前通知。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <p className="font-body text-sm text-foreground leading-relaxed">
                If delivery is delayed or rescheduled due to incorrect delivery information, unsuccessful delivery attempts, severe weather, traffic or other circumstances beyond our control, we shall not be liable for any loss or damage arising from such delay.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                如因送貨資料有誤、未能成功送達、惡劣天氣、交通或其他不可抗力因素導致送貨延誤或需重新安排，本公司概不負責因此引致的任何損失或損害。
              </p>
            </div>

          </div>
        </section>

        <div className="border-t-2 border-[hsl(355,62%,28%)]/20" />

        {/* Refund and Return Policy */}
        <section>
          <h2 className="font-display text-2xl font-light text-foreground mb-1">Refund and Return Policy</h2>
          <p className="font-display text-lg font-light text-muted-foreground mb-6">退款及退貨政策</p>
          <div className="space-y-5">

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                If you are not satisfied with your purchase, you may request a return or refund within 5 days from the date of delivery.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                如您對所購買的產品不滿意，可於送貨日期起計5天內申請退貨或退款。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                Returned products must be unopened, unused, in their original packaging and in resalable condition. Products that are opened, damaged, altered or not in their original condition may not be eligible for refund.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                退回的產品必須未開封、未使用、保持原有包裝及可轉售狀態。已開封、損壞、經改動或不符合原有狀態的產品，或不符合退款資格。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                To request a return, please contact our customer service with your order number, contact details and reason for return. We will review your request and provide further instructions.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                如需申請退貨，請提供訂單號碼、聯絡資料及退貨原因，聯絡我們的客戶服務部。我們將審核您的申請並提供進一步指示。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pb-5 border-b border-border">
              <p className="font-body text-sm text-foreground leading-relaxed">
                Once the returned goods are received and inspected, we will process the refund to your original method of payment within 7–14 working days. Any original delivery fees and additional surcharges (including remote area surcharge) are non-refundable unless the return is due to our error (e.g. wrong item sent or product defect).
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                一旦收到並檢查退回的貨品後，我們將於7至14個工作天內，將退款退回至原付款方式。原有運費及額外附加費（包括偏遠地區附加費）概不退還，除非退貨原因屬本公司過失（例如發錯貨品或產品有缺陷）。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <p className="font-body text-sm text-foreground leading-relaxed">
                We reserve the right to refuse any return or refund request that does not meet the above conditions.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                本公司保留拒絕任何不符合上述條件之退貨或退款申請的權利。
              </p>
            </div>

          </div>
        </section>

        {/* Contact */}
        <div className="bg-[hsl(30,15%,96%)] dark:bg-muted/30 rounded-2xl p-6 border border-border">
          <h3 className="font-display text-lg font-medium mb-1">Questions? 有任何疑問？</h3>
          <p className="font-body text-sm text-muted-foreground mb-3">
            Contact our customer service team. 請聯絡我們的客戶服務團隊。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:info@terroirandcraft.com" className="font-body text-sm text-[hsl(355,62%,28%)] hover:underline font-medium">
              📧 info@terroirandcraft.com
            </a>
            <a href="tel:+85229818868" className="font-body text-sm text-[hsl(355,62%,28%)] hover:underline font-medium">
              📞 +852 2981 8868
            </a>
          </div>
        </div>

        <p className="font-body text-xs text-muted-foreground/60 text-center pb-4">
          Last updated: March 2026 · Terroir & Craft Co., Ltd 天地人酒業有限公司
        </p>

      </div>
    </div>
  );
}
