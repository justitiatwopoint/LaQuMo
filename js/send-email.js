/* ==========================================================================
   SEND FORMS BY EMAIL (js/send-email.js)
   GitHub Pages can't run server code, so forms open the visitor's email app
   with the message already written, addressed to info@laqumo.com. Nothing is
   lost: if no email app opens, the visitor is shown the address and a
   "copy message" button.
   ========================================================================== */

window.LaqumoMail = (function () {
  const TO = "info@laqumo.com";

  function values(form) {
    const out = {};
    new FormData(form).forEach((v, k) => { out[k] = String(v).trim(); });
    return out;
  }

  function attach(opts) {
    const form = document.getElementById(opts.form);
    const feedback = document.getElementById(opts.feedback);
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Simple required-field check
      const missing = [...form.querySelectorAll("[required]")].filter(el => !el.value.trim());
      const emailEl = form.querySelector('input[type="email"]');
      const badEmail = emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
      form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
      if (missing.length || badEmail) {
        [...missing, ...(badEmail ? [emailEl] : [])].forEach(el => el.classList.add("is-invalid"));
        (missing[0] || emailEl).focus();
        if (feedback) {
          feedback.className = (feedback.dataset.baseClass || feedback.className.split(" ")[0]) + " is-error";
          feedback.textContent = badEmail && !missing.length ? "Please check your email address." : "Please fill in the required fields.";
        }
        return;
      }

      const f = values(form);
      const subject = typeof opts.subject === "function" ? opts.subject(f) : (opts.subject || "Message from laqumo.com");
      const body = opts.fields
        .filter(([, key]) => f[key])
        .map(([label, key]) => key === "message" ? `\n${f[key]}\n` : `${label}: ${f[key]}`)
        .join("\n") + "\n\n— Sent from laqumo.com";

      const href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;

      if (feedback) {
        if (!feedback.dataset.baseClass) feedback.dataset.baseClass = feedback.className.split(" ")[0];
        feedback.className = feedback.dataset.baseClass + " is-success";
        feedback.innerHTML =
          `Your email app should now open with the message ready. Just press <strong>Send</strong>.<br>
           No email app? Write to <a href="mailto:${TO}">${TO}</a>
           <button type="button" class="copy-msg-btn">Copy message</button>`;
        const btn = feedback.querySelector(".copy-msg-btn");
        btn.onclick = () => {
          const text = `To: ${TO}\nSubject: ${subject}\n\n${body}`;
          (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
            .then(() => { btn.textContent = "Copied ✓"; })
            .catch(() => { window.prompt("Copy this message:", text); });
        };
      }
    });
  }

  return { attach };
})();
