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

export function formatTimelineTimestamp(date: Date | string, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(typeof date === "string" ? new Date(date) : date);
}
