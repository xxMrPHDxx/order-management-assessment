-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING_SUPPLIER_APPROVAL', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'REJECTED');

-- CreateEnum
CREATE TYPE "actor_role" AS ENUM ('CUSTOMER', 'SUPPLIER', 'SYSTEM');

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shipping_address" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_id" UUID NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'PENDING_SUPPLIER_APPROVAL',
    "shipping_address" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "grand_total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "line_total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "from_status" "order_status",
    "to_status" "order_status" NOT NULL,
    "actor_role" "actor_role" NOT NULL,
    "actor_name" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_customer_id_created_at_idx" ON "orders"("customer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at" DESC);

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_product_id_key" ON "order_items"("order_id", "product_id");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_created_at_idx" ON "order_status_history"("order_id", "created_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Custom SQL (hand-written, not managed by Prisma schema):
--   * trigram indexes for partial, case-insensitive search
--   * sequence/function for human-friendly order numbers
--   * CHECK constraints for money/quantity integrity
--   * append-only trigger protecting the audit trail
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "customers_name_trgm_idx" ON "customers" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "orders_order_number_trgm_idx" ON "orders" USING GIN ("order_number" gin_trgm_ops);

CREATE SEQUENCE "order_number_seq" START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION next_order_number() RETURNS TEXT AS $$
  SELECT 'ORD-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
         lpad(nextval('order_number_seq')::TEXT, 6, '0');
$$ LANGUAGE sql VOLATILE;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_amounts_non_negative"
  CHECK ("unit_price" >= 0 AND "line_total" >= 0);
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_amounts_non_negative"
  CHECK ("subtotal" >= 0 AND "grand_total" >= 0);

CREATE FUNCTION prevent_order_history_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'order_status_history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "order_status_history_immutable"
BEFORE UPDATE OR DELETE ON "order_status_history"
FOR EACH ROW EXECUTE FUNCTION prevent_order_history_mutation();
