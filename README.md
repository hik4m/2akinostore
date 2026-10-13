# 2akinoStore

React storefront for digital subscriptions and services. The catalog and admin
settings are stored in the browser's `localStorage`.

## Run locally

Requirements: Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Run the unit tests and production build before submitting changes:

```sh
npm test
npm run build
```

GitHub Actions runs both checks on pushes and pull requests targeting `main`.
See [CICD.md](./CICD.md) for the repository's branch, commit, push, and PR workflow.

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

## QRIS payment limitation

Checkout creates a dynamic EMVCo QR payload locally from the configured static
QRIS image and inserts the exact order amount. The customer confirmation button
only records a pending order. An admin must check the merchant account and
manually verify receipt before marking the order paid. This static-site
implementation has no acquirer API, server-side webhook, automatic payment
status, or shared order database; do not treat browser-local verification as
provider-confirmed settlement.
