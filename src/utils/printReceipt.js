/**
 * printReceipt.js
 * Handles receipt printing three ways:
 * 1. Thermal printer (ESC/POS via browser print with thermal-optimised CSS)
 * 2. Standard printer (A4 / any printer)
 * 3. WhatsApp share (formats receipt as text message)
 */

// Set to the public landing page URL once it's hosted; shown on receipts when non-empty.
const PROMO_URL = 'https://swiftpos-sigma.vercel.app/'
const poweredBy = PROMO_URL ? `Powered by SwiftPOS · ${PROMO_URL.replace(/^https?:\/\//, '')}` : 'Powered by SwiftPOS'

export function printReceipt(sale, store) {
  const { name, currency = '₦', vatRate = 0.075 } = store

  const lines = sale.items.map(item =>
    `${item.name.padEnd(20).slice(0, 20)} x${item.qty}  ${currency}${item.lineTotal.toLocaleString()}`
  ).join('\n')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt ${sale.receiptNo}</title>
      <style>
        /* ── Thermal printer styles (58mm / 80mm roll) ── */
        @media print {
          @page {
            margin: 0;
            size: 80mm auto; /* change to 58mm for smaller printers */
          }
          body {
            width: 76mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #000;
            margin: 0;
            padding: 4mm;
          }
        }

        /* Screen preview */
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          max-width: 300px;
          margin: 0 auto;
          padding: 16px;
          color: #000;
          background: #fff;
        }

        .center  { text-align: center; }
        .bold    { font-weight: bold; }
        .large   { font-size: 16px; }
        .small   { font-size: 10px; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .row     { display: flex; justify-content: space-between; margin: 3px 0; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 4px; }
        .item-name { flex: 1; padding-right: 8px; word-break: break-word; }
        .item-amt  { white-space: nowrap; }
        .footer    { text-align: center; margin-top: 10px; font-size: 10px; }
        .barcode-area { text-align: center; margin: 8px 0; letter-spacing: 4px; font-size: 18px; }
      </style>
    </head>
    <body>
      <!-- Store header -->
      <div class="center bold large">${name}</div>
      <div class="center small" style="margin-top:2px;margin-bottom:8px;">
        ${store.type === 'pharmacy' ? 'Licensed Pharmacy' : 'Supermarket & Provisions'}
      </div>

      <div class="divider"></div>

      <!-- Receipt meta -->
      <div class="row small">
        <span>Receipt No:</span><span>${sale.receiptNo}</span>
      </div>
      <div class="row small">
        <span>Date:</span>
        <span>${new Date(sale.timestamp).toLocaleDateString('en-NG', { day:'2-digit', month:'short', year:'numeric' })}</span>
      </div>
      <div class="row small">
        <span>Time:</span>
        <span>${new Date(sale.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
      </div>
      <div class="row small">
        <span>Payment:</span><span>${sale.paymentMethod}</span>
      </div>
      ${sale.paymentMethod === 'Credit' && sale.customer ? `
      <div class="row small">
        <span>Customer:</span><span>${sale.customer.name}</span>
      </div>
      <div class="row small">
        <span>Phone:</span><span>${sale.customer.phone}</span>
      </div>
      ` : ''}

      <div class="divider"></div>

      <!-- Items -->
      <div class="bold small" style="margin-bottom:4px;">ITEMS</div>
      ${sale.items.map(item => `
        <div style="margin-bottom:4px;">
          <div class="bold small">${item.name}</div>
          <div class="row small">
            <span>${currency}${item.price.toLocaleString()} × ${item.qty}</span>
            <span class="bold">${currency}${item.lineTotal.toLocaleString()}</span>
          </div>
        </div>
      `).join('')}

      <div class="divider"></div>

      <!-- Totals -->
      <div class="row small"><span>Subtotal</span><span>${currency}${sale.subtotal.toLocaleString()}</span></div>
      <div class="row small"><span>VAT (${Math.round(vatRate * 100)}%)</span><span>${currency}${sale.vat.toLocaleString()}</span></div>
      <div class="total-row">
        <span>${sale.paymentMethod === 'Credit' ? 'AMOUNT OWED' : 'TOTAL'}</span><span>${currency}${sale.total.toLocaleString()}</span>
      </div>

      <div class="divider"></div>

      <!-- Footer -->
      <div class="footer">
        <div>Thank you for your purchase!</div>
        <div style="margin-top:4px;">Please come again 😊</div>
        <div class="barcode-area" style="margin-top:8px;">|||||||||||||||</div>
        <div style="font-size:9px;letter-spacing:2px;">${sale.receiptNo}</div>
        <div style="font-size:9px;margin-top:6px;color:#555;">${poweredBy}</div>
      </div>

      <script>window.onload = () => window.print()</script>
    </body>
    </html>
  `

  const win = window.open('', '_blank', 'width=340,height=600')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

export function whatsappReceipt(sale, store) {
  const { name, currency = '₦' } = store
  const date = new Date(sale.timestamp)

  const itemLines = sale.items
    .map(i => `  • ${i.name} x${i.qty} = ${currency}${i.lineTotal.toLocaleString()}`)
    .join('\n')

  const text = `
*${name}*
📋 Receipt: ${sale.receiptNo}
📅 ${date.toLocaleDateString('en-NG')} ${date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}

*Items:*
${itemLines}

─────────────────
Subtotal:  ${currency}${sale.subtotal.toLocaleString()}
VAT:       ${currency}${sale.vat.toLocaleString()}
*${sale.paymentMethod === 'Credit' ? 'AMOUNT OWED' : 'TOTAL'}:    ${currency}${sale.total.toLocaleString()}*
Payment:   ${sale.paymentMethod}${sale.paymentMethod === 'Credit' && sale.customer ? `
Customer:  ${sale.customer.name} (${sale.customer.phone})` : ''}
─────────────────
Thank you for shopping with us! 😊
_${poweredBy}_
`.trim()

  const encoded = encodeURIComponent(text)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
}
