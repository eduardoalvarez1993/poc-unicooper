import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from "./firebase.js";

const contentFields = [
  "homeHeroTitle",
  "homeHeroText",
  "homeAboutTitle",
  "homeAboutText",
  "cooperativeCta",
  "whoWeAre",
  "mission",
  "vision",
  "values",
  "memberAreaText",
  "portalUrl"
];

const contactFields = ["address", "phone", "whatsapp", "email"];

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

document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
  bindForms();
  await ensureInitialData();
  await loadAdminData();
}

function bindForms() {
  document.querySelector("[data-content-form]").addEventListener("submit", saveContent);
  document.querySelector("[data-contact-form]").addEventListener("submit", saveContact);
  document.querySelector("[data-benefit-form]").addEventListener("submit", saveBenefit);
  document.querySelector("[data-agreement-form]").addEventListener("submit", saveAgreement);
  document.querySelector("[data-calendar-form]").addEventListener("submit", saveCalendar);
}

async function loadAdminData() {
  await Promise.all([
    loadContent(),
    loadContact(),
    renderCollection("benefits", renderBenefitItem),
    renderCollection("agreements", renderAgreementItem),
    renderCollection("calendar", renderCalendarItem)
  ]);
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

async function seedCollection(collectionName, items) {
  const snap = await getDocs(collection(db, collectionName));
  if (!snap.empty) return;

  await Promise.all(items.map((item) => addDoc(collection(db, collectionName), item)));
}

async function loadContent() {
  const snap = await getDoc(doc(db, "siteContent", "main"));
  const data = snap.exists() ? snap.data() : {};
  fillForm("[data-content-form]", contentFields, data);
}

async function loadContact() {
  const snap = await getDoc(doc(db, "contact", "main"));
  const data = snap.exists() ? snap.data() : {};
  fillForm("[data-contact-form]", contactFields, data);
}

function fillForm(selector, fields, data) {
  const form = document.querySelector(selector);
  fields.forEach((field) => {
    const input = form.elements[field];
    if (input) input.value = data[field] || "";
  });
}

async function saveContent(event) {
  event.preventDefault();
  const data = formDataToObject(event.currentTarget, contentFields);
  await setDoc(doc(db, "siteContent", "main"), data, { merge: true });
  showStatus("Conteúdo salvo.");
}

async function saveContact(event) {
  event.preventDefault();
  const data = formDataToObject(event.currentTarget, contactFields);
  await setDoc(doc(db, "contact", "main"), data, { merge: true });
  showStatus("Contato salvo.");
}

async function saveBenefit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formDataToObject(form, ["title", "description"]);
  await upsertCollectionItem("benefits", form.elements.id.value, data);
  resetForm(form);
  await renderCollection("benefits", renderBenefitItem);
  showStatus("Vantagem salva.");
}

async function saveAgreement(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formDataToObject(form, ["name", "category", "description", "link"]);
  data.active = form.elements.active.checked;
  await upsertCollectionItem("agreements", form.elements.id.value, data);
  resetForm(form);
  form.elements.active.checked = true;
  await renderCollection("agreements", renderAgreementItem);
  showStatus("Convênio salvo.");
}

async function saveCalendar(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formDataToObject(form, ["month", "date", "note"]);
  await upsertCollectionItem("calendar", form.elements.id.value, data);
  resetForm(form);
  await renderCollection("calendar", renderCalendarItem);
  showStatus("Calendário salvo.");
}

async function upsertCollectionItem(collectionName, id, data) {
  if (id) {
    await updateDoc(doc(db, collectionName, id), data);
    return;
  }
  await addDoc(collection(db, collectionName), data);
}

async function renderCollection(collectionName, renderer) {
  const container = document.querySelector(`[data-${collectionName}-list]`);
  const snap = await getDocs(collection(db, collectionName));
  const items = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
  container.innerHTML = items.length ? items.map(renderer).join("") : '<p class="empty">Nenhum item cadastrado.</p>';
  bindItemActions(container, collectionName);
}

function bindItemActions(container, collectionName) {
  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editItem(collectionName, button.dataset.edit));
  });

  container.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeItem(collectionName, button.dataset.remove));
  });

  container.querySelectorAll("[data-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleAgreement(button.dataset.toggle, button.dataset.active === "true"));
  });
}

async function editItem(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return;

  const data = snap.data();
  const form = document.querySelector(`[data-${singular(collectionName)}-form]`);
  Object.keys(data).forEach((key) => {
    if (!form.elements[key]) return;
    if (form.elements[key].type === "checkbox") {
      form.elements[key].checked = Boolean(data[key]);
    } else {
      form.elements[key].value = data[key] || "";
    }
  });
  form.elements.id.value = id;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function removeItem(collectionName, id) {
  const confirmed = window.confirm("Remover este item?");
  if (!confirmed) return;

  await deleteDoc(doc(db, collectionName, id));
  await renderCollection(collectionName, getRenderer(collectionName));
  showStatus("Item removido.");
}

async function toggleAgreement(id, active) {
  await updateDoc(doc(db, "agreements", id), { active: !active });
  await renderCollection("agreements", renderAgreementItem);
  showStatus(active ? "Convênio inativado." : "Convênio ativado.");
}

function renderBenefitItem(item) {
  return `
    <article class="admin-item">
      <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p></div>
      ${itemActions("benefits", item)}
    </article>
  `;
}

function renderAgreementItem(item) {
  return `
    <article class="admin-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.category)} · ${item.active === false ? "Inativo" : "Ativo"}</p>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <div class="item-actions">
        <button class="button small secondary" type="button" data-edit="${item.id}">Editar</button>
        <button class="button small secondary" type="button" data-toggle="${item.id}" data-active="${item.active !== false}">${item.active === false ? "Ativar" : "Inativar"}</button>
        <button class="button small danger" type="button" data-remove="${item.id}">Remover</button>
      </div>
    </article>
  `;
}

function renderCalendarItem(item) {
  return `
    <article class="admin-item">
      <div><strong>${escapeHtml(item.month)} - ${escapeHtml(item.date)}</strong><p>${escapeHtml(item.note || "")}</p></div>
      ${itemActions("calendar", item)}
    </article>
  `;
}

function itemActions(collectionName, item) {
  return `
    <div class="item-actions">
      <button class="button small secondary" type="button" data-edit="${item.id}">Editar</button>
      <button class="button small danger" type="button" data-remove="${item.id}">Remover</button>
    </div>
  `;
}

function formDataToObject(form, fields) {
  return fields.reduce((data, field) => {
    data[field] = form.elements[field]?.value.trim() || "";
    return data;
  }, {});
}

function resetForm(form) {
  form.reset();
  if (form.elements.id) form.elements.id.value = "";
}

function singular(collectionName) {
  return {
    benefits: "benefit",
    agreements: "agreement",
    calendar: "calendar"
  }[collectionName];
}

function getRenderer(collectionName) {
  return {
    benefits: renderBenefitItem,
    agreements: renderAgreementItem,
    calendar: renderCalendarItem
  }[collectionName];
}

function showStatus(message) {
  const status = document.querySelector("[data-status]");
  status.textContent = message;
  window.setTimeout(() => {
    status.textContent = "";
  }, 2600);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
