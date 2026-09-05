interface PdfColumn {
  header: string
  key: string
  width?: string
}

interface PdfOptions {
  title: string
  subtitle?: string
  columns: PdfColumn[]
  rows: Record<string, any>[]
  meta?: { label: string; value: string }[]
}

export function exportToPDF(opts: PdfOptions) {
  const { title, subtitle, columns, rows, meta } = opts

  const printWindow = window.open("", "_blank", "width=900,height=700")
  if (!printWindow) {
    alert("Please allow popups to export PDF")
    return
  }

  const tableHeaders = columns
    .map(
      (c) =>
        `<th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:600;color:#475569;border-bottom:2px solid #e2e8f0;${c.width ? `width:${c.width};` : ""}">${c.header}</th>`
    )
    .join("")

  const tableRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map(
            (c) =>
              `<td style="padding:8px 12px;font-size:11px;color:#334155;border-bottom:1px solid #f1f5f9;">${row[c.key] ?? "—"}</td>`
          )
          .join("")}</tr>`
    )
    .join("")

  const metaHtml = meta
    ? `<div style="display:flex;gap:24px;margin-bottom:20px;flex-wrap:wrap;">
        ${meta
          .map(
            (m) =>
              `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 16px;"><span style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">${m.label}</span><br><span style="font-size:14px;font-weight:600;color:#0f172a;">${m.value}</span></div>`
          )
          .join("")}
      </div>`
    : ""

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #0f172a; padding-bottom: 16px; }
    .header h1 { font-size: 22px; font-weight: 800; }
    .header .brand { font-size: 12px; color: #64748b; text-align: right; }
    .header .brand strong { font-size: 14px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 16px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${title}</h1>
      ${subtitle ? `<p style="font-size:12px;color:#64748b;margin-top:4px;">${subtitle}</p>` : ""}
    </div>
    <div class="brand">
      <strong>DeliveryOption</strong><br>
      Generated: ${new Date().toLocaleString("en-GB")}<br>
      Currency: TZS
    </div>
  </div>
  ${metaHtml}
  <table>
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">
    DeliveryOption Logistics Platform &mdash; Confidential Report<br>
    This document was system-generated on ${new Date().toLocaleDateString("en-GB")}
  </div>
  <div class="no-print" style="margin-top:24px;text-align:center;">
    <button onclick="window.print()" style="background:#0f172a;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;">Print / Save as PDF</button>
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 500); }
  </script>
</body>
</html>`

  printWindow.document.write(html)
  printWindow.document.close()
}
