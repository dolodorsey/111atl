# 111ATL / Kollective Access release evidence

## Product boundary

- 111ATL remains the standalone Kollective discovery, RSVP, reservation, access-pass, and check-in portal.
- The interface uses the approved Kollective and portfolio artwork already stored in the supplied brand-graphics system.
- The live event database currently contains one published event, two ticket types, and no guest, order, reservation, or check-in history.

## Security and lifecycle

- Public database access is limited by RLS to published events and active ticket types.
- Guest, order, reservation, and check-in tables have no anonymous policies.
- Registration now uses a service-only database function that locks inventory, enforces per-order limits, and creates one idempotent order per browser request key.
- Staff check-in now uses a service-only atomic database function, preventing two door-team requests from approving the same pass.
- Both privileged functions are denied to anonymous and authenticated client roles.

## Payment gate

- Complimentary access remains available.
- Paid priority access is disabled in the interface and API until a rotated Stripe secret, a webhook-signing secret, and `STRIPE_PAYMENT_ENABLED=true` are configured and verified.
- The previously exposed Stripe secret was not stored or used.

## Verification

- JavaScript syntax checks and the production build pass.
- Production dependencies report zero known vulnerabilities.
- Browser checks confirm branded video/graphics, responsive layout, and the disabled paid-access message.
- Event-feed failure now falls back to an honest empty state without breaking the page.
