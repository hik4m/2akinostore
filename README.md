# 2akinoStore

React storefront for digital subscriptions and services. The catalog and admin
settings are stored in the browser's `localStorage`.

## Run locally

Requirements: Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Run the unit tests and production build before pushing changes:

```sh
npm test
npm run build
```

GitHub Actions runs both checks on every push to `main`. See
[CICD.md](./CICD.md) for the repository's single-branch (`main`) commit and
push workflow.

## Admin catalog guide

Open **Admin** in the navigation and sign in. The current starter password is
`0987654321`; change it in **Pengaturan** before using the site. Admin access,
passwords, catalog data, and payment status are browser-local and are not
server-side authentication or shared between devices.

In **Daftar produk**:

- Search products by name, category, or duration.
- Set stock to a non-negative whole number and save it. A stock of `0` marks a
  product as sold out and disables checkout.
- Leave stock empty to mark it unlimited. Products saved before stock
  management was introduced remain unlimited, so the update does not
  unintentionally stop existing sales.
- A finite-stock item is decremented when an admin manually verifies its
  payment. Verification is blocked if the stock has reached zero.
- Categories with products cannot be deleted. Remove those products first;
  deleting an empty category requires confirmation.

WeTV replaces the former YouTube catalog branding. Existing saved YouTube
categories and products are migrated to WeTV when the app loads.

## QRIS operating hours

QRIS checkout is only available every day from 07:00 WIB (inclusive) until
20:00 WIB (exclusive). Outside that window the buy button is disabled, the QR
payload is not generated, and a notice explains when the store reopens:

> Pembayaran QRIS hanya tersedia pukul 07.00–20.00 WIB. Silakan kembali saat jam operasional.

The rule is anchored to the `Asia/Jakarta` timezone, not the visitor's device
clock, so it behaves the same for customers in any timezone. Admin manual
verification is deliberately **not** restricted: an admin may confirm a payment
that genuinely arrived during operating hours.

**This check is advisory.** The rule lives in `src/lib/operatingHours.js` and is
enforced at every QRIS entry point in the app, but this is a static site with no
server, so a user who edits the page in their browser can bypass it. Treat it as
a usability guardrail, not a security control. Enforcing the window so it
cannot be bypassed requires a backend that validates transactions server-side;
`assertQrisOpen()` is kept pure and free of browser APIs so that a future server
can call the exact same function.

## QRIS payment limitation

Checkout creates a dynamic EMVCo QR payload locally from the configured static
QRIS image and inserts the exact order amount. The customer confirmation button
only records a pending order. An admin must check the merchant account and
manually verify receipt before marking the order paid. This static-site
implementation has no acquirer API, server-side webhook, automatic payment
status, or shared order database; do not treat browser-local verification as
provider-confirmed settlement.
