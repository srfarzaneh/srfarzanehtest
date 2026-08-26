/* ==========================================================================
   منطق نمایش محصولات، فیلتر/جستجو و لینک‌های واتساپ
   این فایل رو معمولاً لازم نیست ویرایش کنی — محصولات رو در products-data.js
   اضافه کن، این فایل خودش باقی کارها رو انجام می‌دهد.
   ========================================================================== */

const PLACEHOLDER_SVG = `
  <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
    <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2" opacity="0.55"/>
    <circle cx="32" cy="32" r="17" fill="none" stroke="currentColor" stroke-width="2" opacity="0.75"/>
    <circle cx="32" cy="32" r="7" fill="currentColor" opacity="0.9"/>
  </svg>`;

function whatsappLink(product) {
  const msg = product
    ? `سلام، در مورد «${product.name}» سوال داشتم. لطفاً موجودی و قیمت رو برام بفرستید.`
    : "سلام، می‌خواستم درباره محصولات شما اطلاعات بگیرم.";
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

function productCardHTML(product) {
  const models = product.models
    .map((m) => `<span class="model-pill" dir="ltr">${m}</span>`)
    .join("");

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" data-fallback-target />
        <div class="media-fallback">
          ${PLACEHOLDER_SVG}
          <span>تصویر محصول</span>
        </div>
      </div>
      <div class="product-body">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="model-list" aria-label="مدل‌های موجود">${models}</div>
        <a class="btn btn-whatsapp" target="_blank" rel="noopener"
           href="${whatsappLink(product)}">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.24 0 4.35.87 5.93 2.46a8.26 8.26 0 0 1 2.43 5.88c0 4.59-3.75 8.34-8.36 8.34a8.35 8.35 0 0 1-4.25-1.16l-.3-.18-3.14.82.84-3.06-.2-.32a8.23 8.23 0 0 1-1.27-4.42c0-4.61 3.75-8.36 8.35-8.36 M8.53 6.9c-.17 0-.45.06-.68.32-.23.25-.9.87-.9 2.13s.92 2.47 1.05 2.64c.13.17 1.8 2.86 4.45 3.9 2.2.86 2.65.69 3.13.64.48-.04 1.54-.62 1.76-1.23s.22-1.12.15-1.23c-.07-.11-.24-.17-.5-.3s-1.54-.76-1.78-.85c-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.53-1.44-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45C10.3 8.7 9.8 7.42 9.58 6.9c-.19-.44-.38-.4-.53-.4z"/></svg>
          سفارش از طریق واتساپ
        </a>
      </div>
    </article>`;
}

function attachImageFallbacks(scope) {
  scope.querySelectorAll("img[data-fallback-target]").forEach((img) => {
    img.addEventListener("error", () => {
      img.closest(".product-media").classList.add("no-image");
    });
  });
}

function renderProducts(list, gridEl, emptyEl) {
  if (!list.length) {
    gridEl.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  gridEl.innerHTML = list.map(productCardHTML).join("");
  attachImageFallbacks(gridEl);
}

function initProductsPage() {
  const gridEl = document.getElementById("product-grid");
  const emptyEl = document.getElementById("empty-state");
  const searchEl = document.getElementById("search-input");
  const pillsEl = document.getElementById("category-pills");
  const countEl = document.getElementById("result-count");
  if (!gridEl) return; // این صفحه، صفحه محصولات نیست

  const categories = ["همه", ...new Set(PRODUCTS.map((p) => p.category))];
  let activeCategory = "همه";

  pillsEl.innerHTML = categories
    .map(
      (c, i) =>
        `<button class="pill${i === 0 ? " active" : ""}" data-cat="${c}">${c}</button>`
    )
    .join("");

  function apply() {
    const q = searchEl.value.trim().toLowerCase();
    const filtered = PRODUCTS.filter((p) => {
      const inCategory = activeCategory === "همه" || p.category === activeCategory;
      const haystack = [p.name, p.description, p.category, ...p.models]
        .join(" ")
        .toLowerCase();
      const inSearch = !q || haystack.includes(q);
      return inCategory && inSearch;
    });
    renderProducts(filtered, gridEl, emptyEl);
    countEl.textContent = `${filtered.length} محصول`;
  }

  pillsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    pillsEl.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.cat;
    apply();
  });

  searchEl.addEventListener("input", apply);
  apply();
}

function initGeneralWhatsappLinks() {
  document.querySelectorAll("[data-whatsapp-general]").forEach((el) => {
    el.href = whatsappLink(null);
  });
}

function initBrandText() {
  document.querySelectorAll("[data-company-name]").forEach((el) => {
    el.textContent = CONFIG.companyName;
  });
  document.querySelectorAll("[data-tagline]").forEach((el) => {
    el.textContent = CONFIG.tagline;
  });
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) return; // بدون جاوااسکریپت هم محتوا کاملاً نمایان می‌ماند
  els.forEach((el) => el.classList.add("pre-animate"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initBrandText();
  initGeneralWhatsappLinks();
  initProductsPage();
  initReveal();
});
