import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc
} from "./firebase.js";

const defaults = {
  siteContent: {
    homeHeroTitle: "Cuidado cooperativo para uma vida mais tranquila",
    homeHeroText: "A Unicooper conecta cooperados a benefícios, convênios e informações essenciais com transparência, proximidade e atendimento humano.",
    homeAboutTitle: "Sobre a Unicooper",
    homeAboutText: "Somos uma cooperativa voltada a fortalecer relações, ampliar vantagens e simplificar o acesso a serviços importantes para nossos cooperados.",
    cooperativeCta: "Quero me cooperar",
    whoWeAre: "A Unicooper nasceu para aproximar pessoas de soluções confiáveis, com foco em cooperação, saúde financeira e benefícios reais no dia a dia.",
    mission: "Promover desenvolvimento e segurança para cooperados por meio de serviços acessíveis, relacionamento próximo e gestão responsável.",
    vision: "Ser referência regional em cooperativismo moderno, transparente e orientado ao bem-estar dos cooperados.",
    values: "Cooperação, ética, transparência, acolhimento, responsabilidade e melhoria contínua.",
    memberAreaText: "A área do cooperado reúne serviços, documentos e informações pessoais em ambiente externo seguro.",
    portalUrl: "https://portal.unicooper.example.com"
  },
  contact: {
    address: "Av. Central, 1000 - Centro",
    phone: "(00) 0000-0000",
    whatsapp: "5500000000000",
    email: "contato@unicooper.com.br"
  },
  benefits: [
    { title: "Atendimento próximo", description: "Equipe preparada para orientar cooperados com clareza e agilidade." },
    { title: "Convênios selecionados", description: "Parcerias úteis em saúde, bem-estar, educação e serviços." },
    { title: "Informação transparente", description: "Calendários, contatos e comunicados sempre acessíveis." }
  ],
  agreements: [
    { name: "Clínica Vida Plena", category: "Saúde", description: "Condições especiais em consultas e exames.", link: "https://example.com", active: true },
    { name: "Instituto Aprender", category: "Educação", description: "Descontos em cursos livres e capacitações.", link: "https://example.com", active: true },
    { name: "Farmácia Essencial", category: "Bem-estar", description: "Benefícios em medicamentos e produtos de cuidado.", link: "https://example.com", active: true }
  ],
  calendar: [
    { month: "Janeiro", date: "10/01/2026", note: "Repasse regular" },
    { month: "Fevereiro", date: "10/02/2026", note: "Sujeito a compensação bancária" },
    { month: "Março", date: "10/03/2026", note: "Repasse regular" }
  ]
};

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
  await ensureInitialData();
  await loadData();
  renderPage();
}

function setupNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}

async function ensureInitialData() {
  const contentRef = doc(db, "siteContent", "main");
  const contactRef = doc(db, "contact", "main");
  const contentSnap = await getDoc(contentRef);
  const contactSnap = await getDoc(contactRef);

  if (!contentSnap.exists()) await setDoc(contentRef, defaults.siteContent);
  if (!contactSnap.exists()) await setDoc(contactRef, defaults.contact);

  await seedCollection("benefits", defaults.benefits);
  await seedCollection("agreements", defaults.agreements);
  await seedCollection("calendar", defaults.calendar);
}

async function seedCollection(name, items) {
  const snap = await getDocs(collection(db, name));
  if (!snap.empty) return;

  await Promise.all(items.map((item) => addDoc(collection(db, name), item)));
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

function mapDocs(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function renderPage() {
  bindText();
  bindLinks();
  renderBenefits();
  renderAgreements();
  renderAgreementFilters();
  renderCalendar();
  renderContact();
  renderMemberArea();
}

function bindText() {
  document.querySelectorAll("[data-content]").forEach((element) => {
    const key = element.dataset.content;
    element.textContent = state.content[key] || "";
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
