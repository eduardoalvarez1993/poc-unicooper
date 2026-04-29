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
import { defaults } from "./defaults.js";

const contentFields = [
  "homeHeroTitle",
  "homeHeroText",
  "homeHeroImage",
  "institutionalHeroImage",
  "benefitsHeroImage",
  "agreementsHeroImage",
  "memberAreaHeroImage",
  "calendarHeroImage",
  "contactHeroImage",
  "lgpdHeroImage",
  "homeAboutTitle",
  "homeAboutText",
  "cooperativeCta",
  "business",
  "whoWeAre",
  "mission",
  "vision",
  "values",
  "institutionalText",
  "boardTerm",
  "boardMembers",
  "memberAreaText",
  "portalUrl",
  "clinicSystemUrl",
  "howToJoinText",
  "legalEntityText",
  "transferTrackingText",
  "clinicText",
  "documentsText",
  "sacText",
  "lgpdText",
  "lgpdRequestUrl",
  "lgpdReportUrl"
];

const contactFields = ["address", "phone", "whatsapp", "email", "cnpj", "hours"];

const ADMIN_ACCESS_CODE = "unicooper2026";

const PANEL_TITLES = {
  content: "Conteúdo geral",
  benefits: "Vantagens",
  agreements: "Convênios",
  calendar: "Calendário",
  contact: "Contato & Links"
};

document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
  if (!unlockAdmin()) return;
  initNav();
  bindForms();
  try {
    await ensureInitialData();
    await loadAdminData();
  } catch (error) {
    console.warn("Firestore indisponivel no admin.", error);
    showStatus("Nao foi possivel conectar ao Firestore. Verifique se o banco esta ativo, as regras da POC e a conexao.");
    fillForm("[data-content-form]", contentFields, defaults.siteContent);
    fillForm("[data-contact-form]", contactFields, defaults.contact);
    renderOfflineList("benefits", defaults.benefits, renderBenefitItem);
    renderOfflineList("agreements", defaults.agreements, renderAgreementItem);
    renderOfflineList("calendar", defaults.calendar, renderCalendarItem);
  }
}

function initNav() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.nav));
  });

  const logout = document.querySelector("[data-logout]");
  if (logout) {
    logout.addEventListener("click", () => {
      sessionStorage.removeItem("unicooperAdminUnlocked");
      location.reload();
    });
  }
}

function switchPanel(name) {
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === name);
  });

  const titleEl = document.querySelector("[data-page-title]");
  if (titleEl) titleEl.textContent = PANEL_TITLES[name] || name;
}

function unlockAdmin() {
  const shell = document.querySelector(".admin-shell");
  const lock = document.querySelector("[data-admin-lock]");
  const form = document.querySelector("[data-admin-login]");
  const status = document.querySelector("[data-login-status]");

  if (sessionStorage.getItem("unicooperAdminUnlocked") === "true") {
    lock.hidden = true;
    shell.hidden = false;
    return true;
  }

  shell.hidden = true;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.elements.accessCode.value !== ADMIN_ACCESS_CODE) {
      status.textContent = "Código inválido.";
      return;
    }

    sessionStorage.setItem("unicooperAdminUnlocked", "true");
    lock.hidden = true;
    shell.hidden = false;
    initNav();
    bindForms();
    ensureInitialData().then(loadAdminData).catch((error) => {
      console.warn("Conteudo remoto indisponivel no admin.", error);
      showStatus("Nao foi possivel carregar os dados agora.");
    });
  });

  return false;
}

function bindForms() {
  document.querySelector("[data-content-form]").addEventListener("submit", saveContent);
  document.querySelector("[data-contact-form]").addEventListener("submit", saveContact);
  document.querySelector("[data-benefit-form]").addEventListener("submit", saveBenefit);
  document.querySelector("[data-agreement-form]").addEventListener("submit", saveAgreement);
  document.querySelector("[data-calendar-form]").addEventListener("submit", saveCalendar);
}

function renderOfflineList(collectionName, items, renderer) {
  const container = document.querySelector(`[data-${collectionName}-list]`);
  container.innerHTML = items.map((item, index) => renderer({ id: `offline-${index}`, ...item })).join("");
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

  if (!contentSnap.exists() || contentSnap.data().seedVersion !== defaults.siteContent.seedVersion) {
    await setDoc(contentRef, defaults.siteContent, { merge: true });
  }
  if (!contactSnap.exists() || contactSnap.data().seedVersion !== defaults.contact.seedVersion) {
    await setDoc(contactRef, defaults.contact, { merge: true });
  }

  await seedCollection("benefits", defaults.benefits);
  await seedCollection("agreements", defaults.agreements);
  await seedCollection("calendar", defaults.calendar);
}

async function seedCollection(collectionName, items) {
  const snap = await getDocs(collection(db, collectionName));
  const docs = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
  const shouldReplace = hasOldSeedData(collectionName, docs);
  if (!snap.empty && !shouldReplace) return;

  if (shouldReplace) {
    await Promise.all(snap.docs.map((item) => deleteDoc(doc(db, collectionName, item.id))));
  }

  await Promise.all(items.map((item) => addDoc(collection(db, collectionName), item)));
}

function hasOldSeedData(collectionName, items) {
  const markers = {
    benefits: (item) => item.title === "Atendimento próximo",
    agreements: (item) => item.name === "Clínica Vida Plena" || item.name === "Convênios de consultório em Belo Horizonte" || !("section" in item) || !("imageUrl" in item) || !("allowsInstrumentation" in item) || !("requiresOnsiteAudit" in item),
    calendar: (item) => item.month === "Janeiro" && item.note === "Repasse regular" || item.month === "Calendário de Repasse 2026"
  };

  return Boolean(markers[collectionName] && items.some(markers[collectionName]));
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
  const data = formDataToObject(form, ["name", "section", "category", "city", "unit", "imageUrl", "description", "rules", "link"]);
  data.allowsInstrumentation = form.elements.allowsInstrumentation.checked;
  data.requiresOnsiteAudit = form.elements.requiresOnsiteAudit.checked;
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
  const data = formDataToObject(form, ["date", "type", "label"]);
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
        <p>${escapeHtml(item.section || "Convênios")} · ${escapeHtml(item.category)} · ${item.active === false ? "Inativo" : "Ativo"}</p>
        <p>${escapeHtml([item.city, item.unit].filter(Boolean).join(" · "))}</p>
        <p>Instrumentação cirúrgica: ${item.allowsInstrumentation ? "Sim" : "Não"} · Auditoria in loco: ${item.requiresOnsiteAudit ? "Sim" : "Não"}</p>
        <p>${escapeHtml(item.description)}</p>
        ${item.imageUrl ? `<p>Imagem: ${escapeHtml(item.imageUrl)}</p>` : ""}
        ${item.rules ? `<p>${escapeHtml(item.rules)}</p>` : ""}
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
      <div><strong>${escapeHtml(item.date)} - ${escapeHtml(formatCalendarType(item.type))}</strong><p>${escapeHtml(item.label || item.note || "")}</p></div>
      ${itemActions("calendar", item)}
    </article>
  `;
}

function formatCalendarType(type) {
  return type === "devolucao" ? "Devolução" : "Repasse";
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
