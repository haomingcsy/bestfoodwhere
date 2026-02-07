/**
 * BestFoodWhere Embeddable Widget
 *
 * Usage:
 * <script src="https://bestfoodwhere.sg/widget/embed.js"
 *         data-slug="restaurant-slug"
 *         data-style="badge"
 *         data-theme="light">
 * </script>
 */
(function () {
  const script = document.currentScript;
  const slug = script.getAttribute("data-slug") || "";
  const style = script.getAttribute("data-style") || "badge";
  const theme = script.getAttribute("data-theme") || "light";

  if (!slug) {
    console.warn("BestFoodWhere widget: data-slug attribute is required");
    return;
  }

  const baseUrl = "https://bestfoodwhere.sg";
  const widgetUrl = `${baseUrl}/api/widget?slug=${encodeURIComponent(slug)}&style=${style}&theme=${theme}`;
  const menuUrl = `${baseUrl}/menu/${encodeURIComponent(slug)}`;

  // Create container
  const container = document.createElement("div");
  container.className = "bfw-widget";
  container.style.cssText = "display: inline-block;";

  // Create link
  const link = document.createElement("a");
  link.href = menuUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.title = "View on BestFoodWhere - Singapore Food Directory";

  // Create image
  const img = document.createElement("img");
  img.src = widgetUrl;
  img.alt = "Find us on BestFoodWhere";
  img.style.cssText = "border: none; display: block;";
  img.loading = "lazy";

  link.appendChild(img);
  container.appendChild(link);

  // Insert after script
  script.parentNode.insertBefore(container, script.nextSibling);
})();
