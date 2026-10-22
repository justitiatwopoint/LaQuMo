# Prof. Schrödinger AI chatbot: free setup (Cloudflare Workers AI)

The chat button now appears on every page. Until you complete these steps it
uses its **built-in answers**. After setup it answers any physics question
with a free AI model running on Cloudflare.

**Cost:** free. Cloudflare's free plan includes a daily AI allowance
(10,000 "neurons" per day, reset at midnight UTC). When it runs out, the bot
quietly switches to built-in answers until the next day. Nothing is charged
unless you choose to upgrade to a paid plan yourself.

**Time:** about 10 minutes.

---

## Step 1: Create a free Cloudflare account

1. Go to <https://dash.cloudflare.com/sign-up> and sign up with your email.
2. Verify your email address.

## Step 2: Create the Worker (the small server function)

1. In the Cloudflare dashboard, open **Workers & Pages** from the left menu
   (under *Compute*).
2. Click **Create** → **Create Worker** (choose the "Hello World" starter).
3. Give it a name, for example `laqumo-chat`, and click **Deploy**.
4. Click **Edit code**.
5. Delete everything in the editor, then open
   `cloudflare-worker/schrodinger-worker.js` from your website folder, copy
   **all** of it, and paste it into the editor.
6. Click **Deploy** (top right).

## Step 3: Give the Worker access to the free AI

1. Go back to your Worker's page and open the **Settings** tab
   (in some layouts this is **Bindings**).
2. Under **Bindings**, click **Add** → **Workers AI**.
3. For the variable name type exactly: `AI` (capital letters).
4. Click **Save** / **Deploy**.

## Step 4: Check the Worker works

1. On the Worker's page, copy its address. It looks like
   `https://laqumo-chat.YOUR-NAME.workers.dev`.
2. Open that address in your browser. You should see:
   `{"ok":true,"service":"LaQuMo Prof. Schrödinger chat","aiBinding":true}`
   - If it says `"aiBinding":false`, repeat Step 3 (the name must be `AI`).

## Step 5: Connect your website to the Worker

1. Open `js/schrodinger-bot.js` in your website folder (Notepad works).
2. Near the top, find:
   ```js
   const SCHRODINGER_API_URL = "";
   ```
3. Put your Worker address between the quotes:
   ```js
   const SCHRODINGER_API_URL = "https://laqumo-chat.YOUR-NAME.workers.dev";
   ```
4. Save, then upload or push the website as usual.

Open your site, click **Prof. Schrödinger** and ask a question. AI answers
take a few seconds.

## Step 6 (recommended once the site is online): lock it to your domain

So that other websites can't use your free daily allowance:

1. In the Cloudflare editor, find `ALLOWED_ORIGINS` near the top of the Worker.
2. Add your site's address(es), with `https://` and no trailing slash:
   ```js
   const ALLOWED_ORIGINS = [
     "https://laqumo.com",
     "https://www.laqumo.com",
   ];
   ```
3. Click **Deploy**.

Note: after this, opening the site straight from your computer's files will
use the built-in answers (that is expected). To test locally with the AI,
leave the list empty, or add `"http://localhost:8080"` and run `node server.js`.

---

## Changing how the bot behaves

All of these are in `schrodinger-worker.js`. Edit in the Cloudflare editor,
then click **Deploy**:

| Setting | What it does |
|---|---|
| `SYSTEM_PROMPT` | The bot's personality, what it knows about LaQuMo, and its rules. Update it when you add new pages or simulators. |
| `MODELS` | Which AI models to use, tried in order. Smaller models use less of the free allowance. |
| `MAX_ANSWER_TOKENS` | Maximum length of each answer. |
| `PER_VISITOR_LIMIT` | Messages one visitor can send per 10 minutes. |

The built-in fallback answers are in `js/schrodinger-bot.js` (`builtInAnswer`).

## Troubleshooting

- **Bot only gives built-in answers.** Check that `SCHRODINGER_API_URL` is
  filled in and saved, that the Worker address opens in a browser (Step 4),
  and, if you set `ALLOWED_ORIGINS`, that your exact site address is listed.
- **"My AI has reached today's free limit".** The daily free allowance is
  used up; it resets at midnight UTC (6 am in Bangladesh).
- **Want to see usage?** Cloudflare dashboard → **AI** → **Workers AI**
  shows how much of the daily allowance has been used.
