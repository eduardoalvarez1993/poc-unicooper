import {
  db,
  collection,
  doc,
  getDocs,
  getDoc
} from "./firebase.js";
import { defaults } from "./defaults.js";

const state = {
  content: defaults.siteContent,
  contact: defaults.contact,
  benefits: [],
  agreements: [],
  calendar: []
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupNavigation();
  renderSkeletons();
  try {
    await withTimeout(loadData(), 3500);
  } catch (error) {
    console.warn("Firestore indisponivel. Usando conteudo local de fallback.", error);
    loadFallbackData();
  }
  renderPage();
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Tempo limite ao carregar Firestore.")), timeoutMs);
    })
  ]);
}

function setupNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}

async function loadData() {
  const [contentSnap, contactSnap, benefitsSnap, agreementsSnap, calendarSnap] = await Promise.all([
    getDoc(doc(db, "siteContent", "main")),
    getDoc(doc(db, "contact", "main")),
    getDocs(collection(db, "benefits")),
    getDocs(collection(db, "agreements")),
    getDocs(collection(db, "calendar"))
  ]);

  state.content = contentSnap.exists() ? { ...defaults.siteContent, ...contentSnap.data() } : defaults.siteContent;
  state.contact = contactSnap.exists() ? { ...defaults.contact, ...contactSnap.data() } : defaults.contact;
  state.benefits = mapDocs(benefitsSnap);
  state.agreements = mapDocs(agreementsSnap).filter((item) => item.active !== false);
  state.calendar = mapDocs(calendarSnap);
}

function loadFallbackData() {
  state.content = defaults.siteContent;
  state.contact = defaults.contact;
  state.benefits = defaults.benefits;
  state.agreements = defaults.agreements.filter((item) => item.active !== false);
  state.calendar = defaults.calendar;
}

function mapDocs(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function renderPage() {
  document.body.classList.remove("is-loading");
  bindText();
  bindMultilineText();
  bindLinks();
  renderBenefits();
  renderAgreements();
  renderAgreementFilters();
  renderCalendar();
  renderContact();
  renderMemberArea();
}

function renderSkeletons() {
  document.body.classList.add("is-loading");
  renderCardSkeleton("[data-benefits]", 6);
  renderCardSkeleton("[data-agreements]", 6);

  const calendar = document.querySelector("[data-calendar]");
  if (calendar) {
    calendar.innerHTML = Array.from({ length: 4 }, () => `
      <tr class="skeleton-row">
        <td><span class="skeleton-line"></span></td>
        <td><span class="skeleton-line short"></span></td>
        <td><span class="skeleton-line"></span></td>
      </tr>
    `).join("");
  }

  document.querySelectorAll("[data-content], [data-contact]").forEach((element) => {
    if (!element.textContent.trim() || element.textContent.includes("Carregando")) {
      element.innerHTML = '<span class="skeleton-line"></span><span class="skeleton-line short"></span>';
    }
  });
}

function renderCardSkeleton(selector, count) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = Array.from({ length: count }, () => `
    <article class="card skeleton-card">
      <span class="skeleton-pill"></span>
      <span class="skeleton-line title"></span>
      <span class="skeleton-line"></span>
      <span class="skeleton-line short"></span>
    </article>
  `).join("");
}

function bindText() {
  document.querySelectorAll("[data-content]").forEach((element) => {
    const key = element.dataset.content;
    element.textContent = state.content[key] || "";
  });
}

function bindMultilineText() {
  document.querySelectorAll("[data-content-lines]").forEach((element) => {
    const key = element.dataset.contentLines;
    const lines = String(state.content[key] || "").split("\n").filter(Boolean);
    element.innerHTML = lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  });
}

function bindLinks() {
  const whatsappUrl = `https://wa.me/${onlyDigits(state.contact.whatsapp)}`;
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = whatsappUrl;
  });

  document.querySelectorAll("[data-portal-link]").forEach((link) => {
    link.href = state.content.portalUrl || "#";
  });

  document.querySelectorAll("[data-clinic-link]").forEach((link) => {
    link.href = state.content.clinicSystemUrl || "#";
  });

  document.querySelectorAll("[data-lgpd-request-link]").forEach((link) => {
    link.href = state.content.lgpdRequestUrl || "#";
  });

  document.querySelectorAll("[data-lgpd-report-link]").forEach((link) => {
    link.href = state.content.lgpdReportUrl || "#";
  });
}

function renderBenefits() {
  const container = document.querySelector("[data-benefits]");
  if (!container) return;

  container.innerHTML = state.benefits.map((item) => `
    <article class="card">
      <span class="tag">Benefício</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </article>
  `).join("");
}

function renderAgreements() {
  const container = document.querySelector("[data-agreements]");
  if (!container) return;

  const selected = container.dataset.category || "Todos";
  const items = selected === "Todos"
    ? state.agreements
    : state.agreements.filter((item) => item.category === selected);

  container.innerHTML = items.length ? items.map((item) => `
    <article class="card">
      <span class="tag">${escapeHtml(item.category || "Convênio")}</span>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description)}</p>
      ${item.link ? `<div class="actions"><a class="button secondary" href="${escapeAttr(item.link)}" target="_blank" rel="noopener">Acessar parceiro</a></div>` : ""}
    </article>
  `).join("") : '<p class="empty">Nenhum convênio ativo nesta categoria.</p>';
}

function renderAgreementFilters() {
  const container = document.querySelector("[data-agreement-filters]");
  const list = document.querySelector("[data-agreements]");
  if (!container || !list) return;

  const categories = ["Todos", ...new Set(state.agreements.map((item) => item.category).filter(Boolean))];
  container.innerHTML = categories.map((category, index) => `
    <button class="filter-button ${index === 0 ? "active" : ""}" type="button" data-category="${escapeAttr(category)}">${escapeHtml(category)}</button>
  `).join("");

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    container.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    list.dataset.category = button.dataset.category;
    renderAgreements();
  });
}

function renderCalendar() {
  const body = document.querySelector("[data-calendar]");
  if (!body) return;

  body.innerHTML = state.calendar.map((item) => `
    <tr>
      <td>${escapeHtml(item.month)}</td>
      <td>${escapeHtml(item.date)}</td>
      <td>${escapeHtml(item.note || "")}</td>
    </tr>
  `).join("");
}

function renderContact() {
  document.querySelectorAll("[data-contact]").forEach((element) => {
    const key = element.dataset.contact;
    element.textContent = state.contact[key] || "";
  });
}

function renderMemberArea() {
  const visibleUrl = document.querySelector("[data-portal-url]");
  if (visibleUrl) visibleUrl.textContent = state.content.portalUrl || "";

  const clinicUrl = document.querySelector("[data-clinic-url]");
  if (clinicUrl) clinicUrl.textContent = state.content.clinicSystemUrl || "";
}

function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
