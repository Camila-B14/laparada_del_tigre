/* Menú interactivo: render, búsqueda, pestañas y pedido por WhatsApp */
const fmt = (n) => "$" + n.toLocaleString("es-CO");
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const root = document.getElementById("menu-root");
const tabs = document.getElementById("menu-tabs");

// Cada producto tiene una clave única: sección + nombre
const catalog = new Map();
MENU.forEach((sec) => sec.items.forEach((it) => {
  catalog.set(`${sec.id}|${it.name}`, { ...it, section: sec.title });
}));

const priceTag = (p) => p == null
  ? `<span class="price ask">Consultar</span>`
  : `<span class="price">${fmt(p)}</span>`;

const addBtn = (key, name) =>
  `<button class="add-btn" type="button" data-add="${esc(key)}" aria-label="Agregar ${esc(name)} al pedido">+</button>`;

function render() {
  tabs.innerHTML = MENU.map((s) => `<a href="#${s.id}">${s.icon} ${s.title}</a>`).join("");

  root.innerHTML = MENU.map((sec) => {
    const head = `<div class="menu-section-head"><h2>${sec.icon} ${sec.title}</h2>${sec.note ? `<p>${sec.note}</p>` : ""}</div>`;
    let body;
    if (sec.featured) {
      body = `<div class="feature-grid">${sec.items.map((it) => {
        const key = `${sec.id}|${it.name}`;
        return `<article class="feature-card" data-search="${esc(norm(it.name + " " + (it.desc || "")))}">
          ${it.badge ? `<span class="badge">${it.badge}</span>` : ""}
          <img src="${it.img}" alt="Hamburguesa ${esc(it.name)}" loading="lazy">
          <h3>${it.name}</h3><p>${it.desc}</p>
          <div class="row">${priceTag(it.price)}${addBtn(key, it.name)}</div>
        </article>`;
      }).join("")}</div>`;
    } else {
      body = `<div class="item-grid">${sec.items.map((it) => {
        const key = `${sec.id}|${it.name}`;
        return `<div class="item" data-search="${esc(norm(it.name + " " + (it.desc || "")))}">
          <div class="item-info"><div class="item-name">${it.name}</div>${it.desc ? `<div class="item-desc">${it.desc}</div>` : ""}</div>
          ${priceTag(it.price)}${addBtn(key, it.name)}
        </div>`;
      }).join("")}</div>`;
    }
    return `<section class="menu-section ${sec.style || ""}" id="${sec.id}">${head}${body}</section>`;
  }).join("") + `<p class="menu-empty" id="menu-empty">No encontramos ese producto 😿 Prueba con otra palabra.</p>`;
}
render();

// ---------- Pestaña activa al hacer scroll ----------
const tabLinks = [...tabs.querySelectorAll("a")];
const sections = [...root.querySelectorAll(".menu-section")];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    tabLinks.forEach((a) => {
      const on = a.getAttribute("href") === "#" + e.target.id;
      a.classList.toggle("active", on);
      if (on) a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  });
}, { rootMargin: "-140px 0px -60% 0px" });
sections.forEach((s) => spy.observe(s));

// ---------- Búsqueda ----------
document.getElementById("menu-search").addEventListener("input", (e) => {
  const q = norm(e.target.value.trim());
  let total = 0;
  sections.forEach((sec) => {
    let visible = 0;
    sec.querySelectorAll("[data-search]").forEach((el) => {
      const match = !q || el.dataset.search.includes(q) || norm(sec.querySelector("h2").textContent).includes(q);
      el.style.display = match ? "" : "none";
      if (match) visible++;
    });
    sec.style.display = visible ? "" : "none";
    total += visible;
  });
  document.getElementById("menu-empty").style.display = total ? "none" : "block";
});

// ---------- Pedido ----------
const cart = new Map(); // key -> cantidad
const fab = document.getElementById("cart-fab");
const panel = document.getElementById("cart-panel");
const backdrop = document.getElementById("cart-backdrop");
const linesEl = document.getElementById("cart-items");

function cartTotals() {
  let count = 0, total = 0, unpriced = false;
  cart.forEach((q, key) => {
    const it = catalog.get(key);
    count += q;
    if (it.price == null) unpriced = true; else total += it.price * q;
  });
  return { count, total, unpriced };
}

function renderCart() {
  const { count, total, unpriced } = cartTotals();
  fab.classList.toggle("show", count > 0);
  fab.querySelector(".count").textContent = count;
  fab.querySelector(".fab-total").textContent = fmt(total) + (unpriced ? " +" : "");
  document.getElementById("cart-total").textContent = fmt(total) + (unpriced ? " + consultar" : "");
  linesEl.innerHTML = [...cart].map(([key, q]) => {
    const it = catalog.get(key);
    return `<div class="cart-line">
      <div class="n">${it.name}<small>${it.section} · ${it.price == null ? "Precio a consultar" : fmt(it.price)}</small></div>
      <div class="qty">
        <button type="button" data-dec="${esc(key)}" aria-label="Quitar uno">−</button>
        <span>${q}</span>
        <button type="button" data-inc="${esc(key)}" aria-label="Agregar uno">+</button>
      </div>
    </div>`;
  }).join("") || `<p style="padding:20px 0;color:var(--muted)">Tu pedido está vacío.</p>`;
  if (!count) closeCart();
}

function change(key, delta) {
  const q = (cart.get(key) || 0) + delta;
  if (q <= 0) cart.delete(key); else cart.set(key, q);
  renderCart();
}

root.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  change(btn.dataset.add, 1);
  btn.classList.add("added");
  btn.textContent = "✓";
  setTimeout(() => { btn.classList.remove("added"); btn.textContent = "+"; }, 900);
});

linesEl.addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  if (inc) change(inc.dataset.inc, 1);
  if (dec) change(dec.dataset.dec, -1);
});

function openCart() { panel.classList.add("open"); backdrop.classList.add("open"); }
function closeCart() { panel.classList.remove("open"); backdrop.classList.remove("open"); }
fab.addEventListener("click", openCart);
backdrop.addEventListener("click", closeCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

document.getElementById("cart-send").addEventListener("click", () => {
  const { total, unpriced } = cartTotals();
  const lines = ["¡Hola La Parada del Tigre! 🐯 Quiero hacer este pedido:", ""];
  cart.forEach((q, key) => {
    const it = catalog.get(key);
    lines.push(`• ${q} x ${it.name} (${it.section})${it.price == null ? "" : " — " + fmt(it.price * q)}`);
  });
  lines.push("", `Total: ${fmt(total)}${unpriced ? " + productos por consultar" : ""}`);
  const note = document.getElementById("cart-note").value.trim();
  if (note) lines.push(`Notas: ${note}`);
  window.open(waLink(lines.join("\n")), "_blank", "noopener");
});

renderCart();
