/**
 * Currency utilities. Backend stores amounts in the smallest currency
 * unit (kobo for NGN). Never pass around float naira values.
 */

const CURRENCY_CONFIG = {
  NGN: { symbol: "₦", decimals: 2, subunit: 100, locale: "en-NG" },
  USD: { symbol: "$", decimals: 2, subunit: 100, locale: "en-US" },
  GBP: { symbol: "£", decimals: 2, subunit: 100, locale: "en-GB" },
  EUR: { symbol: "€", decimals: 2, subunit: 100, locale: "en-IE" },
  GHS: { symbol: "₵", decimals: 2, subunit: 100, locale: "en-GH" },
  KES: { symbol: "KSh", decimals: 2, subunit: 100, locale: "en-KE" },
  ZAR: { symbol: "R", decimals: 2, subunit: 100, locale: "en-ZA" },
};

export const SUPPORTED_CURRENCIES = Object.freeze(Object.keys(CURRENCY_CONFIG));

export function getCurrencyConfig(currency = "NGN") {
  return CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.NGN;
}

/**
 * Format a major-unit amount (e.g., 15000) as "₦15,000.00".
 * Use `minorUnit: true` if you're passing kobo/cents.
 */
export function formatCurrency(amount, currency = "NGN", options = {}) {
  const {
    minorUnit = false,
    showDecimals,
    compact = false,
    showSymbol = true,
  } = options;

  const config = getCurrencyConfig(currency);
  const major = minorUnit ? amount / config.subunit : amount;
  const decimals = showDecimals ?? (compact ? 0 : config.decimals);

  if (compact) {
    return `${showSymbol ? config.symbol : ""}${compactNumber(major)}`;
  }

  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? "currency" : "decimal",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      currencyDisplay: "narrowSymbol",
    });
    return formatter.format(major);
  } catch {
    return `${config.symbol}${major.toLocaleString()}`;
  }
}

/** Compact "1.2K" / "3.4M" formatter. */
export function compactNumber(value, locale = "en-NG") {
  if (value === null || value === undefined) return "0";
  const abs = Math.abs(value);
  if (abs < 1000) return String(Math.round(value));
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return String(Math.round(value));
  }
}

/** Convert major to minor (naira → kobo). */
export const toMinorUnit = (major, currency = "NGN") =>
  Math.round(Number(major) * getCurrencyConfig(currency).subunit);

/** Convert minor to major (kobo → naira). */
export const toMajorUnit = (minor, currency = "NGN") =>
  Number(minor) / getCurrencyConfig(currency).subunit;

/** Free tickets display as "Free" instead of ₦0. */
export const formatPrice = (amount, currency = "NGN", options = {}) => {
  if (amount === 0 || amount === "0") return "Free";
  return formatCurrency(amount, currency, options);
};

/** Parse a user-typed amount string into a number of minor units. */
export function parseCurrencyInput(input, currency = "NGN") {
  if (input === "" || input === null || input === undefined) return 0;
  const cleaned = String(input).replace(/[^\d.-]/g, "");
  const num = Number(cleaned);
  if (Number.isNaN(num)) return 0;
  return toMinorUnit(num, currency);
}

export default formatCurrency;