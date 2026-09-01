# Hosting LaQuMo on GitHub Pages with a Custom Third-Party Domain

This guide walks you through publishing **LaQuMo** directly on **GitHub Pages** using a domain purchased from any third-party registrar (Namecheap, GoDaddy, Cloudflare, Porkbun, Squarespace, etc.).

---

## Table of Contents
1. [Step 1: Push Project to GitHub](#step-1-push-project-to-github)
2. [Step 2: Enable GitHub Pages](#step-2-enable-github-pages)
3. [Step 3: Configure DNS Records at Your Domain Registrar](#step-3-configure-dns-records-at-your-domain-registrar)
4. [Step 4: Set Custom Domain in GitHub Repository](#step-4-set-custom-domain-in-github-repository)
5. [Step 5: Enforce HTTPS & Test](#step-5-enforce-https--test)

---

## Step 1: Push Project to GitHub

Run the following commands in your project directory (`d:\LLM\Website`):

```bash
# Initialize git repository
git init

# Add all project files
git add .

# Commit changes
git commit -m "Initial commit of LaQuMo website"

# Rename branch to main
git branch -M main

# Link to your GitHub repository (replace URL with your repository)
git remote add origin https://github.com/YOUR_USERNAME/laqumo.git

# Push code to GitHub
git push -u origin main
```

---

## Step 2: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/laqumo`.
2. Click on **Settings** (top menu bar).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source**: Select **Deploy from a branch**.
   - **Branch**: Select **`main`** branch and `/ (root)` folder.
5. Click **Save**.

GitHub Pages will build your site at `https://YOUR_USERNAME.github.io/laqumo`.

---

## Step 3: Configure DNS Records at Your Domain Registrar

Log into your third-party domain registrar dashboard (e.g. Namecheap, GoDaddy, Cloudflare, etc.) and navigate to **DNS Management** or **Name Server Settings**.

### 1. Add 4 Apex A Records (for `yourdomain.com`)
Create four **A** records pointing your apex domain `@` to GitHub's official IP addresses:

| Type | Host / Name | IP Address / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `185.199.108.153` | Automatic / 300s |
| **A** | `@` | `185.199.109.153` | Automatic / 300s |
| **A** | `@` | `185.199.110.153` | Automatic / 300s |
| **A** | `@` | `185.199.111.153` | Automatic / 300s |

### 2. Add CNAME Record (for `www.yourdomain.com`)
Create a **CNAME** record to route `www` traffic to your GitHub Pages domain:

| Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` | `YOUR_USERNAME.github.io` | Automatic / 300s |

> [!IMPORTANT]
> Replace `YOUR_USERNAME` with your actual GitHub username!

---

## Step 4: Set Custom Domain in GitHub Repository

1. Return to your repository on GitHub -> **Settings** -> **Pages**.
2. Under **Custom domain**, type your domain (e.g., `laqumo.com` or `www.laqumo.com`).
3. Click **Save**.
4. GitHub will automatically create a file named `CNAME` in your repository containing your domain name.

---

## Step 5: Enforce HTTPS & Test

1. After DNS records propagate (usually 5–15 minutes), check the **Enforce HTTPS** box under GitHub Pages settings.
2. Visit your site at `https://yourdomain.com` or `https://www.yourdomain.com`.

---

## Verification & Troubleshooting

- **Check DNS Propagation**: Run `nslookup yourdomain.com` or use [dnschecker.org](https://dnschecker.org) to verify all 4 GitHub IP addresses are resolved.
- **SSL Certificate Delay**: GitHub issues free TLS/SSL certificates via Let's Encrypt automatically. If you see a warning initially, give it 15–30 minutes for certificate provisioning.
