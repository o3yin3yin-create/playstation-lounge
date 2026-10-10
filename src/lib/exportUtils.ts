import { GameSession, Shift, Expense } from '../types';

/**
 * Escapes a cell value for standard CSV format
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a browser download of a CSV string with UTF-8 BOM for Excel compatibility
 */
export function downloadCSV(filename: string, csvContent: string) {
  if (typeof window === 'undefined') return;

  // Prepend UTF-8 BOM so Excel opens with proper character encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Closed Invoices to CSV
 */
export function exportInvoicesToCSV(sessions: GameSession[]) {
  const completed = sessions.filter((s) => s.status === 'completed');
  const headers = [
    'Invoice ID',
    'Date',
    'Time',
    'Console / Device',
    'Customer Name',
    'Phone Number',
    'Play Mode',
    'Duration (Minutes)',
    'Hourly Rate (EGP)',
    'Gaming Charge (EGP)',
    'Cafe Orders Total (EGP)',
    'Discount (EGP)',
    'Grand Total (EGP)',
    'Payment Method',
    'Orders Breakdown'
  ];

  const rows = completed.map((sess) => {
    const invId = sess.id.replace('sess-', '').replace('takeaway-', '').slice(-6).toUpperCase();
    const dateObj = sess.endTime ? new Date(sess.endTime) : new Date(sess.startTime);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const ordersSummary = (sess.orders || [])
      .map((o) => `${o.name} (x${o.quantity})`)
      .join('; ');

    return [
      escapeCSV(`INV-${invId}`),
      escapeCSV(dateStr),
      escapeCSV(timeStr),
      escapeCSV(sess.deviceName),
      escapeCSV(sess.customerName || 'Walk-in'),
      escapeCSV(sess.customerPhone || '-'),
      escapeCSV(sess.mode === 'multi' ? 'Multiplayer' : 'Single'),
      escapeCSV(sess.totalTimeMinutes || 0),
      escapeCSV(sess.hourlyRate || 0),
      escapeCSV(sess.totalTimeCost || 0),
      escapeCSV(sess.totalOrdersCost || 0),
      escapeCSV(sess.discount || 0),
      escapeCSV(sess.grandTotal || 0),
      escapeCSV(sess.paymentMethod ? sess.paymentMethod.replace('_', ' ').toUpperCase() : 'CASH'),
      escapeCSV(ordersSummary || 'None')
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const dateTag = new Date().toISOString().split('T')[0];
  downloadCSV(`clash_invoices_${dateTag}.csv`, csv);
}

/**
 * Export Shift Summary Report to CSV
 */
export function exportShiftSummaryToCSV(
  shift: Shift, 
  stats: {
    totalGrossRevenue: number;
    totalTimeRevenue: number;
    totalCafeRevenue: number;
    totalExpenses: number;
    netProfit: number;
    completedInvoicesCount: number;
  }
) {
  const dateTag = new Date().toISOString().split('T')[0];
  const expectedCash = shift.startingCash + stats.totalGrossRevenue - stats.totalExpenses;

  const rows = [
    ['METRIC', 'VALUE'],
    ['Report Title', 'Clash PlayStation Lounge - Shift Financial Summary'],
    ['Generated Date', new Date().toLocaleString()],
    ['Shift Cashier', shift.cashierName],
    ['Shift Opened At', new Date(shift.openedAt).toLocaleString()],
    ['Shift Status', shift.status.toUpperCase()],
    ['Starting Cash in Drawer', `${shift.startingCash} EGP`],
    ['Total Closed Invoices', stats.completedInvoicesCount.toString()],
    ['Gaming Revenues', `${stats.totalTimeRevenue} EGP`],
    ['Cafe Revenues', `${stats.totalCafeRevenue} EGP`],
    ['Total Gross Revenue', `${stats.totalGrossRevenue} EGP`],
    ['Total Recorded Expenses', `${stats.totalExpenses} EGP`],
    ['Net Profit / Loss', `${stats.netProfit} EGP`],
    ['Expected Cash in Drawer', `${expectedCash} EGP`],
    ['Actual Counted Cash', shift.actualClosingCash !== undefined ? `${shift.actualClosingCash} EGP` : 'Not closed yet'],
    ['Cash Difference', shift.actualClosingCash !== undefined ? `${shift.actualClosingCash - expectedCash} EGP` : '-']
  ];

  const csv = rows.map((r) => r.map(escapeCSV).join(',')).join('\n');
  downloadCSV(`clash_shift_summary_${dateTag}.csv`, csv);
}

/**
 * Export Expenses Log to CSV
 */
export function exportExpensesToCSV(expenses: Expense[]) {
  const headers = [
    'Expense ID',
    'Date',
    'Description',
    'Category',
    'Amount (EGP)',
    'Recorded By',
    'Notes'
  ];

  const rows = expenses.map((exp) => [
    escapeCSV(exp.id),
    escapeCSV(new Date(exp.date).toLocaleDateString()),
    escapeCSV(exp.title),
    escapeCSV(exp.category.toUpperCase()),
    escapeCSV(exp.amount),
    escapeCSV(exp.recordedBy || 'Admin'),
    escapeCSV(exp.notes || '-')
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const dateTag = new Date().toISOString().split('T')[0];
  downloadCSV(`clash_expenses_${dateTag}.csv`, csv);
}
