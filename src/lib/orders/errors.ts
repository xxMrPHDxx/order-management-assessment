export type OrderErrorCode =
  | "UNKNOWN_PRODUCT"
  | "INVOICE_NOT_AVAILABLE"
  | "INVALID_ORDER"
  | "ORDER_NOT_FOUND"
  | "ILLEGAL_TRANSITION";

export class OrderError extends Error {
  readonly status: 400 | 403 | 404 | 409;
  readonly code: OrderErrorCode;

  constructor(status: 400 | 403 | 404 | 409, code: OrderErrorCode, message: string) {
    super(message);
    this.name = "OrderError";
    this.status = status;
    this.code = code;
  }
}
