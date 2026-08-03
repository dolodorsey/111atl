-- Atomic registration, inventory protection, idempotency, and check-in.
-- Applied to production on 2026-08-03. See live function definitions for canonical SQL.
alter table public.ka_orders add column if not exists request_key text;
create unique index if not exists ka_orders_request_key_unique on public.ka_orders(request_key) where request_key is not null;

-- `ka_create_access_order(...)` locks the selected ticket type, validates inventory,
-- upserts the guest, and inserts or returns one idempotent order in one transaction.
-- `ka_check_in_access(uuid,text)` locks the order and records one atomic check-in.
-- Both functions are revoked from public/anon/authenticated and granted only to service_role.
