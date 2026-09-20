/**
 * Currency formatting lives here and nowhere else.
 * Add a new entry to CURRENCIES and pass it to formatCurrency() to support
 * another currency later — no component has to change.
 */
export const CURRENCIES = {
  BDT: {
    code: "BDT",
    symbol: "৳",
    locale: "en-IN", // lakh/crore grouping: 1,25,000
    decimals: 0,
  },
  USD: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    decimals: 2,
  },
};

export const DEFAULT_CURRENCY = "BDT";

export function getCurrency(code = DEFAULT_CURRENCY) {
  return CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
}

/**
 * formatCurrency(28000)      -> "৳28,000"
 * formatCurrency(125000)     -> "৳1,25,000"
 * formatCurrency(5708.33)    -> "৳5,708"
 */
export function formatCurrency(amount, code = DEFAULT_CURRENCY) {
  const currency = getCurrency(code);
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(value);
  return `${currency.symbol}${formatted}`;
}

/** "Sep 20, 2026" from a "2026-09-20" value (no timezone drift). */
export function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return String(value);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Today's date as YYYY-MM-DD, in the user's local timezone. */
export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
