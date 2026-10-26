/* La Parada del Tigre — scripts compartidos */
const WHATSAPP = "573116726001";

const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// ---------- Header ----------
const header = document.querySelector(".site-header");
const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// ---------- Lightbox ----------
const lightbox = document.getElementById("lightbox");
let lbImages = [];
let lbIndex = 0;

function showLightbox(i) {
  lbIndex = (i + lbImages.length) % lbImages.length;
  const img = lightbox.querySelector("img");
  img.src = lbImages[lbIndex].src;
  img.alt = lbImages[lbIndex].alt;
  lightbox.querySelector(".lb-count").textContent = `${lbIndex + 1} / ${lbImages.length}`;
}

function openLightbox(images, i) {
  if (!lightbox) return;
  lbImages = images;
  showLightbox(i);
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

if (lightbox) {
  lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lb-prev").addEventListener("click", () => showLightbox(lbIndex - 1));
  lightbox.querySelector(".lb-next").addEventListener("click", () => showLightbox(lbIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });
}

// Conecta un contenedor de botones con imágenes al lightbox
function bindGallery(container) {
  const buttons = [...container.querySelectorAll("button[data-full]")];
  const images = buttons.map((b) => ({ src: b.dataset.full, alt: b.querySelector("img").alt }));
  buttons.forEach((b, i) => b.addEventListener("click", () => openLightbox(images, i)));
}

// ---------- Galería (index) ----------
const gallery = document.getElementById("gallery");
if (gallery) {
  const captions = [
    "Vista panorámica con las montañas", "Piscina y kioscos", "Cancha natural de fútbol", "La casa al atardecer",
    "Zonas verdes y piscina", "Kioscos y senderos", "Vista aérea de la finca", "Parque infantil y cancha",
    "Zonas de juego", "Vista cenital", "Rodeados de naturaleza", "Entrada principal", "Casa campo y montañas", "Cabañas y piscina",
  ];
  gallery.innerHTML = captions.map((alt, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `<button type="button" data-full="assets/img/galeria/${n}.webp" aria-label="Ver foto: ${alt}">
      <img src="assets/img/galeria/${n}-th.webp" alt="${alt}" loading="lazy"></button>`;
  }).join("");
  bindGallery(gallery);
}
document.querySelectorAll("[data-lightbox-group]").forEach(bindGallery);

// ---------- Formulario de reservas ----------
const form = document.getElementById("booking-form");
if (form) {
  // Los enlaces "Reservar ..." preseleccionan el servicio
  document.querySelectorAll("[data-service]").forEach((a) => {
    a.addEventListener("click", () => { form.service.value = a.dataset.service; });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    if (!name) { form.name.focus(); form.name.reportValidity(); return; }
    const lines = [
      "¡Hola La Parada del Tigre! 🐯 Quiero hacer una reserva:",
      `• Nombre: ${name}`,
      form.phone.value && `• Teléfono: ${form.phone.value}`,
      `• Servicio: ${form.service.value}`,
      form.date.value && `• Fecha: ${form.date.value.split("-").reverse().join("/")}`,
      form.time.value && `• Hora: ${form.time.value}`,
      form.people.value && `• Personas: ${form.people.value}`,
      form.msg.value.trim() && `• Detalles: ${form.msg.value.trim()}`,
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
