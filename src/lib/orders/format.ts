export function formatMoney(amount: string | number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: Date | string, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone,
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatDateTime(date: Date | string, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(typeof date === "string" ? new Date(date) : date);
}
