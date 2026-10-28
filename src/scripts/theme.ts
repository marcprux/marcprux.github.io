const query = window.matchMedia("(prefers-color-scheme: dark)");
function storedTheme() {
  try {
    const value = localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}
let preference = storedTheme();
function reflect() {
  const theme = preference ?? (query.matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  const button = document.querySelector<HTMLButtonElement>("#theme-btn");
  const label =
    theme === "dark" ? button?.dataset.labelLight : button?.dataset.labelDark;
  if (label) {
    button?.setAttribute("aria-label", label);
    button?.setAttribute("title", label);
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", getComputedStyle(document.body).backgroundColor);
}
function setup() {
  reflect();
  document
    .querySelector<HTMLButtonElement>("#theme-btn")
    ?.addEventListener("click", () => {
      preference =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", preference);
      } catch {
        /* Keep this session usable without storage. */
      }
      reflect();
    });
}
document.addEventListener("astro:page-load", setup);
query.addEventListener("change", () => {
  if (!preference) reflect();
});
window.addEventListener("storage", () => {
  preference = storedTheme();
  reflect();
});
