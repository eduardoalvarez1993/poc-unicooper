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
    console.warn("Conteudo remoto indisponivel. Usando conteudo local de fallback.", error);
    loadFallbackData();
  }
  renderPage();
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Tempo limite ao carregar conteudo remoto.")), timeoutMs);
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
  renderHeroImages();
  renderFloatingWhatsapp();
  renderBenefits();
  renderAgreements();
  renderAgreementFilters();
  renderCalendar();
  renderContact();
}

function renderSkeletons() {
  document.body.classList.add("is-loading");
  renderCardSkeleton("[data-benefits]", 6);
  renderCardSkeleton("[data-agreements]", 6);

  const calendar = document.querySelector("[data-calendar]");
  if (calendar) {
    calendar.innerHTML = Array.from({ length: 4 }, () => `
      <article class="calendar-month skeleton-card">
        <span class="skeleton-line title"></span>
        <span class="skeleton-line"></span>
        <span class="skeleton-line short"></span>
      </article>
    `).join("");
  }

  document.querySelectorAll("[data-content], [data-contact]").forEach(renderTextSkeleton);
  document.querySelectorAll("[data-content-lines]").forEach(renderTextSkeleton);
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

function renderTextSkeleton(element) {
  if (element.textContent.trim() && !element.textContent.includes("Carregando")) return;

  const tag = element.tagName.toLowerCase();
  const titleClass = tag === "h1" || tag === "h2" || tag === "h3" ? " title" : "";
  const lineCount = tag === "h1" ? 2 : 1;
  element.innerHTML = Array.from({ length: lineCount }, (_, index) => {
    const shortClass = index === lineCount - 1 ? " short" : "";
    return `<span class="skeleton-line${titleClass}${shortClass}"></span>`;
  }).join("");
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

function renderHeroImages() {
  document.querySelectorAll("[data-hero-image]").forEach((hero) => {
    const key = hero.dataset.heroImage;
    const imageUrl = state.content[key] || "";
    if (!isSafeExternalUrl(imageUrl)) return;

    hero.classList.add("has-hero-image");
    hero.style.setProperty("--hero-image", `url("${escapeCssUrl(imageUrl)}")`);
  });
}

function renderFloatingWhatsapp() {
  const phone = onlyDigits(state.contact.whatsapp);
  if (!phone || document.querySelector(".whatsapp-float")) return;

  const link = document.createElement("a");
  link.className = "whatsapp-float";
  link.href = `https://wa.me/${phone}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.setAttribute("aria-label", "Falar com a Unicooper pelo WhatsApp");
  link.innerHTML = '<img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" alt="" aria-hidden="true">';
  document.body.appendChild(link);
}

function renderBenefits() {
  const container = document.querySelector("[data-benefits]");
  if (!container) return;

  container.innerHTML = state.benefits.map((item) => `
    <article class="card">
      <div class="benefit-media" aria-hidden="true"></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </article>
  `).join("");
}

function renderAgreements() {
  const container = document.querySelector("[data-agreements]");
  if (!container) return;

  const query = normalizeText(document.querySelector("[data-agreement-search]")?.value || "");
  const location = document.querySelector("[data-agreement-location]")?.value || "Todos";
  const instrumentation = document.querySelector("[data-agreement-instrumentation]")?.value || "Todos";
  const audit = document.querySelector("[data-agreement-audit]")?.value || "Todos";
  const limit = Number(container.dataset.limit || 0);
  const filteredItems = state.agreements.filter((item) => {
    const matchesQuery = !query || agreementSearchText(item).includes(query);
    const matchesLocation = location === "Todos" || agreementLocations(item).some((itemLocation) => normalizeText(itemLocation) === normalizeText(location));
    const matchesInstrumentation = matchesBooleanFilter(item.allowsInstrumentation, instrumentation);
    const matchesAudit = matchesBooleanFilter(item.requiresOnsiteAudit, audit);
    return matchesQuery && matchesLocation && matchesInstrumentation && matchesAudit;
  });
  const items = limit ? filteredItems.slice(0, limit) : filteredItems;

  if (!items.length) {
    container.innerHTML = '<p class="empty">Nenhum convênio encontrado.</p>';
    return;
  }
  container.innerHTML = items.map(renderAgreementCard).join("");
}

function renderAgreementCard(item) {
  return `
    <article class="card">
      <span class="tag">${escapeHtml(item.category || "Convênio")}</span>
      ${renderAgreementImage(item)}
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="meta-list">
        ${item.city ? `<span>${escapeHtml(item.city)}</span>` : ""}
        ${item.unit ? `<span>${escapeHtml(item.unit)}</span>` : ""}
        <span>Instrumentação: ${item.allowsInstrumentation ? "Sim" : "Não"}</span>
        <span>Auditoria in loco: ${item.requiresOnsiteAudit ? "Sim" : "Não"}</span>
      </div>
      ${item.rules ? `<p class="note">${escapeHtml(item.rules)}</p>` : ""}
      ${item.link ? `<div class="actions"><a class="button secondary partner-button" href="${escapeAttr(item.link)}" target="_blank" rel="noopener">Acessar parceiro</a></div>` : ""}
    </article>
  `;
}

function renderAgreementImage(item) {
  const imageUrl = isSafeExternalUrl(item.imageUrl) ? item.imageUrl : "";
  if (!imageUrl) return '<div class="agreement-media placeholder" aria-hidden="true"></div>';

  return `
    <figure class="agreement-media">
      <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(item.name)}" loading="lazy">
    </figure>
  `;
}

function agreementSearchText(item) {
  return normalizeText([
    item.name,
    item.section,
    item.category,
    item.city,
    item.unit,
    item.description,
    item.rules
  ].filter(Boolean).join(" "));
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function renderAgreementFilters() {
  const list = document.querySelector("[data-agreements]");
  if (!list) return;

  const locationSelect = document.querySelector("[data-agreement-location]");
  if (locationSelect) {
    const locations = uniqueAgreementLocations(state.agreements);
    locationSelect.innerHTML = ["Todos", ...locations].map((location) => `
      <option value="${escapeAttr(location)}">${escapeHtml(location)}</option>
    `).join("");
  }

  document.querySelectorAll("[data-agreement-search], [data-agreement-location], [data-agreement-instrumentation], [data-agreement-audit]").forEach((field) => {
    if (field.dataset.bound) return;
    field.dataset.bound = "true";
    field.addEventListener(field.matches("input") ? "input" : "change", renderAgreements);
  });
}

function matchesBooleanFilter(value, filter) {
  if (filter === "Todos") return true;
  return filter === "Sim" ? Boolean(value) : !Boolean(value);
}

function uniqueAgreementLocations(items) {
  return [...new Set(items.flatMap(agreementLocations).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function agreementLocations(item) {
  return String(item.city || "")
    .split(/,|\se\s|\/|;/i)
    .map((location) => location.trim())
    .filter(Boolean);
}

function isSafeExternalUrl(value = "") {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function escapeCssUrl(value = "") {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function renderCalendar() {
  const container = document.querySelector("[data-calendar]");
  if (!container) return;

  const grouped = groupCalendarByMonth(state.calendar.map(normalizeCalendarEvent));
  container.innerHTML = Object.entries(grouped).map(([month, items], index) => `
    <details class="calendar-month" ${index === 0 ? "open" : ""}>
      <summary>${escapeHtml(month)}</summary>
      <div class="calendar-events">
        ${items.map((item) => `
          <article class="calendar-event">
            <time>${escapeHtml(formatEventDay(item.date))}</time>
            <span class="event-type ${escapeAttr(item.type)}">${escapeHtml(formatEventType(item.type))}</span>
            <strong>${escapeHtml(item.label)}</strong>
          </article>
        `).join("")}
      </div>
    </details>
  `).join("");
}

function normalizeCalendarEvent(item) {
  return {
    date: item.date || "",
    type: item.type || inferEventType(item),
    label: item.label || item.note || item.month || "Evento do calendário"
  };
}

function inferEventType(item) {
  const text = normalizeText(`${item.type || ""} ${item.label || ""} ${item.note || ""}`);
  return text.includes("devol") || text.includes("inss") ? "devolucao" : "repasse";
}

function groupCalendarByMonth(items) {
  return items
    .filter((item) => item.date)
    .sort((a, b) => parseCalendarDate(a.date) - parseCalendarDate(b.date))
    .reduce((groups, item) => {
      const month = formatEventMonth(item.date);
      groups[month] = groups[month] || [];
      groups[month].push(item);
      return groups;
    }, {});
}

function parseCalendarDate(value) {
  const [day, month, year] = String(value).split("/").map(Number);
  return new Date(year || 2026, (month || 1) - 1, day || 1).getTime();
}

function formatEventDay(value) {
  return String(value).split("/").slice(0, 2).join("/");
}

function formatEventMonth(value) {
  const [day, month, year] = String(value).split("/").map(Number);
  const date = new Date(year || 2026, (month || 1) - 1, day || 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function formatEventType(value) {
  return value === "devolucao" ? "Devolução" : "Repasse";
}

function renderContact() {
  document.querySelectorAll("[data-contact]").forEach((element) => {
    const key = element.dataset.contact;
    element.textContent = state.contact[key] || "";
  });
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
