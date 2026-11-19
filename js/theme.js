/* ==========================================================================
   LAQUMO THEME MANAGER (js/theme.js)
   Handles Light (Default on Entry) & Dark Obsidian Theme Switching
   ========================================================================== */

(function() {
  const savedTheme = localStorage.getItem("laqumo_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");

  function updateThemeUI(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("laqumo_theme", theme);

    if (toggleBtn) {
      const textLabel = toggleBtn.querySelector(".theme-text");
      if (textLabel) {
        // Show the mode the button switches TO
        textLabel.textContent = theme === "dark" ? "Light" : "Dark";
      }
      const next = theme === "dark" ? "light" : "dark";
      toggleBtn.setAttribute("aria-label", `Switch to ${next} mode`);
      toggleBtn.setAttribute("title", `Switch to ${next} mode`);
    }
  }

  const currentTheme = localStorage.getItem("laqumo_theme") || "light";
  updateThemeUI(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const activeTheme = document.documentElement.getAttribute("data-theme") || "light";
      const nextTheme = activeTheme === "dark" ? "light" : "dark";
      updateThemeUI(nextTheme);
    });
  }
});
