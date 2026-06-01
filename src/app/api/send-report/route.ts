import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ReportData {
  role: 'Admin' | 'Farmer' | 'Exporter';
  // Admin fields
  totalUsers?: number;
  totalFarmers?: number;
  totalExporters?: number;
  unverifiedExporters?: number;
  totalProducts?: number;
  pendingProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  orders?: Array<{
    orderNumber: string;
    exporterName?: string;
    exporterEmail?: string;
    farmerName?: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  // Farmer fields
  farmerName?: string;
  productCount?: number;
  organicCount?: number;
  exportReadyCount?: number;
  totalStock?: number;
  avgPricePerKg?: number;
  farmerRevenue?: number;
  products?: Array<{ name: string; grade: string; status: string; pricePerKg: number; availableQty: number }>;
  // Exporter fields
  exporterName?: string;
  exporterCompany?: string;
  totalSpent?: number;
  completedOrders?: number;
  pendingOrders?: number;
  // Date range
  dateFrom?: string;
  dateTo?: string;
  generatedAt: string;
}

function getRoleFromToken(req: NextRequest): string | null {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const token = auth.slice(7);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return (
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null
    );
  } catch {
    return null;
  }
}

function statBox(label: string, value: string | number, color: string) {
  return `<div style="background:#f9fafb;border-radius:10px;padding:16px;border:1px solid #e5e7eb;">
    <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">${label}</p>
    <p style="margin:0;font-size:22px;font-weight:700;color:${color};">${value}</p>
  </div>`;
}

function orderRow(o: NonNullable<ReportData['orders']>[number], fmt: (n: number) => string, showExporter: boolean) {
  const statusBg = o.status === 'Delivered' ? '#d1fae5' : o.status === 'Cancelled' ? '#fee2e2' : '#fef3c7';
  const statusCol = o.status === 'Delivered' ? '#065f46' : o.status === 'Cancelled' ? '#991b1b' : '#92400e';
  const payBg = o.paymentStatus === 'Completed' ? '#d1fae5' : '#fef3c7';
  const payCol = o.paymentStatus === 'Completed' ? '#065f46' : '#92400e';
  return `<tr style="border-bottom:1px solid #e5e7eb;">
    <td style="padding:8px 12px;font-size:13px;">${o.orderNumber}</td>
    ${showExporter ? `<td style="padding:8px 12px;font-size:13px;">${o.exporterName ?? ''}<br/><span style="color:#6b7280;font-size:11px;">${o.exporterEmail ?? ''}</span></td>` : `<td style="padding:8px 12px;font-size:13px;">${o.farmerName ?? '—'}</td>`}
    <td style="padding:8px 12px;font-size:13px;text-align:right;">${fmt(o.totalAmount)}</td>
    <td style="padding:8px 12px;font-size:13px;"><span style="background:${statusBg};color:${statusCol};padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">${o.status}</span></td>
    <td style="padding:8px 12px;font-size:13px;"><span style="background:${payBg};color:${payCol};padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">${o.paymentStatus}</span></td>
    <td style="padding:8px 12px;font-size:12px;color:#6b7280;">${new Date(o.createdAt).toLocaleDateString('en-LK')}</td>
  </tr>`;
}

function buildHtml(data: ReportData): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(n);
  const dateStr = new Date(data.generatedAt).toLocaleString('en-LK', { dateStyle: 'full', timeStyle: 'short' });
  const dateRangeStr = data.dateFrom && data.dateTo
    ? `${new Date(data.dateFrom).toLocaleDateString('en-LK', { dateStyle: 'long' })} – ${new Date(data.dateTo).toLocaleDateString('en-LK', { dateStyle: 'long' })}`
    : null;

  let bodyContent = '';

  if (data.role === 'Admin') {
    const orders = data.orders ?? [];
    const products = data.products ?? [];
    const periodLabel = dateRangeStr ? ` in Period` : '';
    bodyContent = `
      <h2 style="margin:0 0 20px;font-size:18px;color:#111827;font-weight:600;">Platform Overview</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
        ${statBox('Total Users', data.totalUsers ?? 0, '#7c3aed')}
        ${statBox('Total Products', data.totalProducts ?? 0, '#2563eb')}
        ${statBox('Orders' + periodLabel, data.totalOrders ?? orders.length, '#d97706')}
        ${statBox('Revenue' + periodLabel, fmt(data.totalRevenue ?? 0), '#16a34a')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
        ${statBox('Farmers', data.totalFarmers ?? 0, '#16a34a')}
        ${statBox('Exporters', data.totalExporters ?? 0, '#2563eb')}
        ${statBox('Pending Products', data.pendingProducts ?? 0, '#d97706')}
        ${statBox('Unverified Exporters', data.unverifiedExporters ?? 0, '#dc2626')}
      </div>
      ${orders.length > 0 ? `
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:600;">Orders${periodLabel} (${orders.length})</h2>
      <div style="overflow-x:auto;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Order #</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Exporter</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Amount</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Status</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Payment</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Date</th>
          </tr></thead>
          <tbody>${orders.slice(0, 50).map(o => orderRow(o, fmt, true)).join('')}</tbody>
        </table>
      </div>` : ''}
      ${products.length > 0 ? `
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:600;">All Products (${products.length})</h2>
      <div style="overflow-x:auto;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Product</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Grade</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Status</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Price/kg</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Stock (kg)</th>
          </tr></thead>
          <tbody>${products.map(p => `<tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 12px;font-size:13px;">${p.name}</td>
            <td style="padding:8px 12px;font-size:13px;">${p.grade}</td>
            <td style="padding:8px 12px;font-size:13px;">${p.status}</td>
            <td style="padding:8px 12px;font-size:13px;text-align:right;">${fmt(p.pricePerKg)}</td>
            <td style="padding:8px 12px;font-size:13px;text-align:right;">${p.availableQty.toFixed(1)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>` : ''}
      ${orders.length === 0 && products.length === 0 ? '<p style="color:#6b7280;margin-bottom:32px;">No data in the selected period.</p>' : ''}`;

  } else if (data.role === 'Farmer') {
    const orders = data.orders ?? [];
    const products = data.products ?? [];
    bodyContent = `
      <h2 style="margin:0 0 20px;font-size:18px;color:#111827;font-weight:600;">My Farm Overview — ${data.farmerName ?? ''}</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
        ${statBox('Total Products', data.productCount ?? 0, '#2563eb')}
        ${statBox('Total Stock', `${(data.totalStock ?? 0).toFixed(1)} kg`, '#7c3aed')}
        ${statBox('Total Revenue', fmt(data.farmerRevenue ?? 0), '#16a34a')}
        ${statBox('Avg Price/kg', fmt(data.avgPricePerKg ?? 0), '#d97706')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
        ${statBox('Organic Products', data.organicCount ?? 0, '#16a34a')}
        ${statBox('Export Ready', data.exportReadyCount ?? 0, '#2563eb')}
        ${statBox('Total Orders', orders.length, '#7c3aed')}
      </div>
      ${products.length > 0 ? `
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:600;">My Products (${products.length})</h2>
      <div style="overflow-x:auto;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Product</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Grade</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Status</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Price/kg</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Stock (kg)</th>
          </tr></thead>
          <tbody>${products.map(p => `<tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 12px;font-size:13px;">${p.name}</td>
            <td style="padding:8px 12px;font-size:13px;">${p.grade}</td>
            <td style="padding:8px 12px;font-size:13px;">${p.status}</td>
            <td style="padding:8px 12px;font-size:13px;text-align:right;">${fmt(p.pricePerKg)}</td>
            <td style="padding:8px 12px;font-size:13px;text-align:right;">${p.availableQty.toFixed(1)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>` : ''}
      ${orders.length > 0 ? `
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:600;">Orders (${orders.length})</h2>
      <div style="overflow-x:auto;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Order #</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Exporter</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Amount</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Status</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Payment</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Date</th>
          </tr></thead>
          <tbody>${orders.slice(0, 50).map(o => orderRow(o, fmt, true)).join('')}</tbody>
        </table>
      </div>` : ''}`;

  } else {
    // Exporter
    const orders = data.orders ?? [];
    bodyContent = `
      <h2 style="margin:0 0 20px;font-size:18px;color:#111827;font-weight:600;">My Procurement Overview — ${data.exporterName ?? ''}${data.exporterCompany ? ` (${data.exporterCompany})` : ''}</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
        ${statBox('Total Orders', orders.length, '#7c3aed')}
        ${statBox('Completed Orders', data.completedOrders ?? 0, '#16a34a')}
        ${statBox('Pending Orders', data.pendingOrders ?? 0, '#d97706')}
        ${statBox('Total Spent', fmt(data.totalSpent ?? 0), '#2563eb')}
      </div>
      ${orders.length > 0 ? `
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:600;">Order History (${orders.length})</h2>
      <div style="overflow-x:auto;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Order #</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Items from</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Amount</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Status</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Payment</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Date</th>
          </tr></thead>
          <tbody>${orders.slice(0, 50).map(o => orderRow(o, fmt, false)).join('')}</tbody>
        </table>
      </div>` : '<p style="color:#6b7280;margin-bottom:32px;">No orders placed yet.</p>'}`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:800px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">🌿 AgriLink Lanka</h1>
      <p style="margin:6px 0 0;color:#bbf7d0;font-size:14px;">${data.role} Report — Generated ${dateStr}</p>
      ${dateRangeStr ? `<div style="margin-top:10px;background:rgba(255,255,255,0.18);border-radius:8px;padding:7px 14px;display:inline-block;"><span style="color:#ffffff;font-size:13px;font-weight:600;">📅 Period: ${dateRangeStr}</span></div>` : ''}
    </div>
    <div style="padding:32px 40px 0;">${bodyContent}</div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Generated by AgriLink Lanka · © ${new Date().getFullYear()} AgriLink Lanka</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const role = getRoleFromToken(req);
  if (!role || !['Admin', 'Farmer', 'Exporter'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.REPORT_RECIPIENT || 'agrilinklanka@gmail.com';

  if (!gmailUser || !gmailPass || gmailPass === 'your_16_char_app_password_here') {
    return NextResponse.json(
      { error: 'Email not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.' },
      { status: 503 }
    );
  }

  let data: ReportData;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  });

  const deliveredCount = (data.orders ?? []).filter((o) => o.status === 'Delivered').length;
  const dateLabel = new Date(data.generatedAt).toLocaleDateString('en-LK', { dateStyle: 'long' });
  const rangeLabel = data.dateFrom && data.dateTo
    ? ` (${new Date(data.dateFrom).toLocaleDateString('en-LK')} \u2013 ${new Date(data.dateTo).toLocaleDateString('en-LK')})`
    : '';

  const subjectMap: Record<string, string> = {
    Admin: `AgriLink Lanka Platform Report${rangeLabel} — ${dateLabel}`,
    Farmer: `AgriLink Lanka Farmer Report${rangeLabel} — ${data.farmerName ?? ''} — ${dateLabel}`,
    Exporter: `AgriLink Lanka Exporter Report${rangeLabel} — ${data.exporterName ?? ''} — ${dateLabel}`,
  };

  try {
    await transporter.sendMail({
      from: `"AgriLink Lanka" <${gmailUser}>`,
      to: recipient,
      subject: subjectMap[data.role] ?? `AgriLink Lanka Report — ${dateLabel}`,
      text: `AgriLink Lanka ${data.role} Report\nGenerated: ${new Date(data.generatedAt).toLocaleString('en-LK')}\nDelivered Orders: ${deliveredCount}\nSee HTML version for full details.`,
      html: buildHtml(data),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Email send error:', message);
    const hint = message.includes('535') || message.includes('Username and Password not accepted')
      ? 'Gmail rejected the password. Use a 16-char App Password from myaccount.google.com/apppasswords'
      : message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')
      ? 'Cannot connect to smtp.gmail.com. Check network/firewall.'
      : message;
    return NextResponse.json({ error: `Failed to send email: ${hint}` }, { status: 500 });
  }
}
