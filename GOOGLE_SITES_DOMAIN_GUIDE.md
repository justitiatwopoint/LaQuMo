# Comprehensive Guide: Host & Publish LaQuMo on Google Sites with a Custom Third-Party Domain

This guide walks you through publishing **LaQuMo** (Large Quantum Model) on **Google Sites** and mapping your third-party custom domain (e.g. from Namecheap, GoDaddy, Cloudflare, Squarespace, etc.).

---

## Table of Contents
1. [Overview & Prerequisites](#1-overview--prerequisites)
2. [Step 1: Setting Up Your Google Site](#step-1-setting-up-your-google-site)
3. [Step 2: Embedding LaQuMo Interactive Sample & Widgets](#step-2-embedding-laqumo-interactive-sample--widgets)
4. [Step 3: Verifying Your Domain in Google Search Console](#step-3-verifying-your-domain-in-google-search-console)
5. [Step 4: Setting Up DNS Records on Third-Party Registrars](#step-4-setting-up-dns-records-on-third-party-registrars)
6. [Step 5: Connecting Custom URL in Google Sites](#step-5-connecting-custom-url-in-google-sites)
7. [Step 6: Publishing & SSL Verification](#step-6-publishing--ssl-verification)

---

## 1. Overview & Prerequisites

Google Sites is a free, reliable web host with integrated SSL security. 
To publish your site with a scientific dark mode theme under your custom domain (e.g., `laqumo.com` or `www.laqumo.com`), you need:
- Access to [Google Sites](https://sites.google.com) using your Google Account.
- Access to your domain registrar dashboard (Namecheap, GoDaddy, Cloudflare, Porkbun, etc.).

---

## Step 1: Setting Up Your Google Site

1. Go to [Google Sites](https://sites.google.com) and click **+ Blank** to create a new site.
2. In the top left, set the site name to **LaQuMo**.
3. In the right panel, select the **Themes** tab:
   - Choose a sleek font style (e.g., **Vision** or **Aristotle**).
   - Set the theme color scheme to **Dark / Black** (`#050508`).
4. Set the Header Type to **Banner** or **Title Only** with a dark, high-contrast scientific background image.

---

## Step 2: Embedding LaQuMo Interactive Sample & Widgets

Google Sites supports custom HTML/CSS/JS via the **Embed** tool.

### Method A: Host the Full Sample Page (Recommended for Full Interactivity)
1. Host the generated `index.html`, `styles.css`, and `app.js` on **GitHub Pages**, **Vercel**, or **Netlify** (all free).
2. On Google Sites, click **Insert > Embed > By URL**.
3. Paste your live hosted URL (e.g. `https://laqumo.github.io` or `https://laqumo.vercel.app`).
4. Drag the embed container to full width and height.

### Method B: Directly Insert Embed Code Snippets
1. On your Google Sites page, click **Insert > Embed > Embed Code**.
2. Paste the custom HTML/CSS/JS widget snippet (e.g., the Bloch sphere simulator or particle canvas code from `index.html`).
3. Click **Next > Insert**.

---

## Step 3: Verifying Your Domain in Google Search Console

Before Google Sites lets you assign your custom domain, Google must confirm you own it.

1. Open [Google Search Console](https://search.google.com/search-console).
2. Log in with the **same Google account** used for Google Sites.
3. Select **Domain** (or **URL prefix**) and enter your domain: `laqumo.com` (replace with your actual domain).
4. Google will give you a **TXT Record** (e.g., `google-site-verification=xxxx...`).
5. Log into your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.).
6. Go to **DNS Management** and add the TXT record:
   - **Type**: `TXT`
   - **Host / Name**: `@` (or leave empty)
   - **Value**: `google-site-verification=xxxx...`
   - **TTL**: Automatic / 300 seconds
7. Return to Google Search Console and click **Verify**. (Verification takes 1–5 minutes).

---

## Step 4: Setting Up DNS Records on Third-Party Registrars

Now route traffic from your domain to Google’s web hosting servers.

### 1. Add CNAME Record for `www` (Subdomain)
In your domain registrar's DNS settings, add or edit the CNAME record:

| Type | Host / Name | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` | `ghs.googlehosted.com` | Automatic / 300s |

### 2. Configure Apex Domain Redirect (`laqumo.com` -> `www.laqumo.com`)
Google Sites requires `www` for custom URLs. To ensure users visiting `laqumo.com` also land on your site:
- **Namecheap**: Go to **Domain > Redirect Domain** and forward `@` to `https://www.laqumo.com`.
- **GoDaddy**: Go to **Forwarding > Domain Forwarding** and forward `laqumo.com` to `https://www.laqumo.com`.
- **Cloudflare**: Go to **Rules > Page Rules** or **Redirect Rules** to redirect `laqumo.com/*` to `https://www.laqumo.com/$1`.

---

## Step 5: Connecting Custom URL in Google Sites

1. In your Google Site editor, click the **Settings ⚙️** icon at the top right.
2. Select **Custom URLs** from the left menu.
3. Type your custom domain: `www.laqumo.com` (replace with your domain).
4. Google Sites will check verification. If verified in Step 3, a green checkmark will appear.
5. Click **Assign**.

---

## Step 6: Publishing & SSL Verification

1. Click the blue **Publish** button at the top right of Google Sites.
2. Set your web address suffix (e.g., `laqumo`) and ensure access is set to **Public**.
3. Click **Publish**.
4. Test your domain in your browser: `https://www.laqumo.com`.

> [!NOTE]
> DNS propagation typically takes **5 to 30 minutes** (up to 24 hours in rare cases). HTTPS / SSL certificates are issued automatically by Google free of charge within a few hours of DNS propagation.

---

## Summary Checklist

- [x] **Theme**: Dark mode (#050508) black & grayscale with glassmorphism.
- [x] **Sample Web App**: `index.html`, `styles.css`, `app.js` created in workspace.
- [x] **Interactive Features**: Monochromatic quantum node particle canvas, Bloch sphere state vector projection, state amplitudes, LaTeX formula rendering, API playground, publication abstracts.
- [x] **Google Search Console**: TXT ownership verification complete.
- [x] **DNS Setup**: CNAME `www` -> `ghs.googlehosted.com`. Apex redirect configured.
