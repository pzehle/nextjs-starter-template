# Cloudflare R2 & Tunnel Setup for Local Development

This guide describes how to connect your `dev` Cloudflare R2 bucket to your **local development environment** using a **Cloudflare Named Tunnel**.  
Unlike Quick Tunnels, this setup gives you a **stable subdomain** (e.g. `username.yourdomain.com`) that does not change every time you restart.  
This makes collaboration possible for multiple developers without stepping on each other.

---

## 🔄 Overview

The data flow is:

```
Client (localhost)
   ⬇ Upload
Cloudflare R2 (dev)
   ⬇ Event
Cloudflare Queue → Worker (Dispatcher)
   ⬇ Routing based on key: dev/<DEV_ID>/...
<DEV_ID>.yourdomain.com (Named Tunnel, per dev)
   ⬇
Webhook @ http://localhost:3000/api/media/webhook
```

---

## Prerequisites

- Access to your Cloudflare zone (e.g. `yourdomain.com`)
- `cloudflared` installed locally
- Your app running locally on `http://localhost:3000`
- The Cloudflare Worker (Queue consumer) deployed

---

## 1) Install cloudflared

```bash
brew install cloudflared
cloudflared --version
```

---

## 2) Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

Authenticate in the browser when prompted.

---

## 3) Create a Named Tunnel (per developer)

Naming convention: `<devname>-project` → Subdomain `<devname>.yourdomain.com`

Example:

```bash
cloudflared tunnel create username-project
```

This prints a **Tunnel UUID** and stores a credentials JSON file locally.

---

## 4) Bind Subdomain to Tunnel (DNS)

This creates or updates the CNAME record for your dev subdomain:

```bash
cloudflared tunnel route dns username-project username.yourdomain.com
```

> Alternatively in the Cloudflare Dashboard (Zone → DNS):  
> CNAME `username` → `<TUNNEL-UUID>.cfargotunnel.com`

---

## 5) Configure the Tunnel (Ingress)

Edit `~/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /Users/<you>/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: <devname>.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

---

## 6) Start the Tunnel

```bash
cloudflared tunnel run <devname>-project
```

---

## 7) Configure Your App (`DEV_ID`)

In your `.env`:

```
DEV_ID=<devname>
```

This makes all R2 object keys look like `dev/<devname>/...`, and the Worker can route webhooks correctly.

---

## 8) Configure the Worker

In the Cloudflare Dashboard → **Workers & Pages** → `your-project-webhook-worker`:

- Variable `TUNNEL_URLS` (JSON):
  ```json
  {
    "username1": "https://username1.yourdomain.com",
    "username2": "https://username2.yourdomain.com",
    "username3": "https://username3.yourdomain.com",
    "dev": "https://dev.yourdomain.com"
  }
  ```
- Variable `WEBHOOK_SECRET` = must match `R2_WEBHOOK_SECRET` in your `.env`.

---

## ✅ Test

1. Start your app:

```bash
npm run dev
```

2. Keep `cloudflared` running.

3. Upload a file to R2 → Event → Queue → Worker → Tunnel → local webhook.

Webhook calls should now reach:

```
http://localhost:3000/api/media/webhook
```
