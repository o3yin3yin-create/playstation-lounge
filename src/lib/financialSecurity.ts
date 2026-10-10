/**
 * Financial Security & Input Sanitization Engine
 * Protects against negative charges, mathematical exploits, inventory injection, and XSS.
 */

/**
 * Sanitize text to remove script tags, HTML injection, and control characters.
 */
export function sanitizeText(input: unknown, maxLength: number = 120): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // strip < and >
    .replace(/[\x00-\x1F\x7F]/g, '') // strip non-printable ASCII control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize phone numbers.
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  const cleaned = input.replace(/[^\d+ -]/g, '').trim();
  return cleaned.slice(0, 20);
}

/**
 * Validate and sanitize monetary prices or rates.
 * Ensures the value is a finite number, non-negative, and rounded to 2 decimal places.
 */
export function sanitizeMoney(val: unknown, min: number = 0, max: number = 100_000): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) {
    return min;
  }
  const clamped = Math.max(min, Math.min(max, num));
  return Math.round(clamped * 100) / 100;
}

/**
 * Validate and sanitize order quantities.
 * Must be a positive integer (e.g. 1 to 50).
 */
export function sanitizeQuantity(val: unknown, max: number = 50): number {
  const num = typeof val === 'number' ? val : parseInt(String(val), 10);
  if (isNaN(num) || !isFinite(num) || num < 1) {
    return 1;
  }
  return Math.min(max, Math.floor(num));
}

/**
 * Validate and sanitize discount amounts.
 * CRITICAL RULE: A discount can NEVER be negative (which would artificially pad the bill),
 * and can NEVER exceed the subtotal before discount (bill can never be negative).
 */
export function sanitizeDiscount(discount: unknown, subtotalBeforeDiscount: number): number {
  const rawDiscount = sanitizeMoney(discount, 0, 100_000);
  const safeSubtotal = Math.max(0, subtotalBeforeDiscount);
  // Cap at subtotal
  return Math.min(rawDiscount, safeSubtotal);
}

/**
 * Validate an expense record.
 * Must have a strictly positive amount (> 0).
 */
export function sanitizeExpenseInput(expense: {
  title: string;
  category: string;
  amount: number;
  notes?: string;
  recordedBy?: string;
}): {
  title: string;
  category: 'rent' | 'electricity' | 'maintenance' | 'supplies' | 'salaries' | 'other';
  amount: number;
  notes: string;
  recordedBy: string;
} | null {
  const title = sanitizeText(expense.title, 80);
  if (!title) return null;

  const validCategories = ['rent', 'electricity', 'maintenance', 'supplies', 'salaries', 'other'] as const;
  const category = validCategories.includes(expense.category as any)
    ? (expense.category as 'rent' | 'electricity' | 'maintenance' | 'supplies' | 'salaries' | 'other')
    : 'other';

  const amount = sanitizeMoney(expense.amount, 0.01, 1_000_000);
  if (amount <= 0) return null;

  return {
    title,
    category,
    amount,
    notes: sanitizeText(expense.notes || '', 200),
    recordedBy: sanitizeText(expense.recordedBy || 'Admin', 40),
  };
}

/**
 * Validate shift opening / closing cash.
 */
export function sanitizeShiftCash(cash: unknown): number {
  return sanitizeMoney(cash, 0, 10_000_000);
}
