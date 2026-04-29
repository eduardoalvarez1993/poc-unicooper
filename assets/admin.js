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

const pageFields = {
  home: ["homeHeroTitle", "homeHeroText", "homeHeroImage", "homeAboutTitle", "homeAboutText", "cooperativeCta", "business", "whoWeAre", "mission", "vision", "values"],
  institucional: ["institutionalHeroImage", "institutionalText", "boardTerm"],
  vantagens: ["benefitsHeroImage"],
  convenios: ["agreementsHeroImage"],
  cooperado: ["memberAreaHeroImage", "memberAreaText", "portalUrl", "clinicSystemUrl", "howToJoinText", "legalEntityText", "transferTrackingText", "clinicText", "documentsText", "sacText"],
  calendario: ["calendarHeroImage"],
  contato: ["contactHeroImage"],
  lgpd: ["lgpdHeroImage", "lgpdText", "lgpdRequestUrl", "lgpdReportUrl"]
};

const contactFields = ["address", "phone", "whatsapp", "email", "cnpj", "hours"];

const ADMIN_ACCESS_CODE = "unicooper2026";

const PANEL_TITLES = {
  pages: "Páginas",
  "page-home": "Home",
  "page-institucional": "Institucional",
  "page-vantagens": "Vantagens",
  "page-convenios": "Convênios",
  "page-cooperado": "Área do Cooperado",
  "page-calendario": "Calendário",
  "page-contato": "Contato",
  "page-lgpd": "LGPD",
  directors: "Diretores",
  benefits: "Vantagens",
  agreements: "Convênios",
  calendar: "Calendário",
  contact: "Contato"
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
    Object.keys(pageFields).forEach((pageKey) => {
      fillForm(`[data-page-form="${pageKey}"]`, pageFields[pageKey], defaults.siteContent);
    });
    fillForm("[data-contact-form]", contactFields, defaults.contact);
    renderOfflineList("directors", defaults.directors, renderDirectorItem);
    renderOfflineList("benefits", defaults.benefits, renderBenefitItem);
    renderOfflineList("agreements", defaults.agreements, renderAgreementItem);
    renderOfflineList("calendar", defaults.calendar, renderCalendarItem);
  }
}

function initNav() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.nav));
  });

  document.querySelectorAll("[data-page]").forEach((card) => {
    card.addEventListener("click", () => switchPanel(`page-${card.dataset.page}`));
  });

  document.querySelectorAll("[data-back-to-pages]").forEach((btn) => {
    btn.addEventListener("click", () => switchPanel("pages"));
  });

  document.querySelectorAll("[data-manage]").forEach((btn) => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.manage));
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

  const sidebarTarget = name.startsWith("page-") ? "pages" : name;
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === sidebarTarget);
  });

  const backBtn = document.querySelector("[data-back-to-pages]");
  if (backBtn) backBtn.hidden = !name.startsWith("page-");

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
  Object.keys(pageFields).forEach((pageKey) => {
    const form = document.querySelector(`[data-page-form="${pageKey}"]`);
    if (form) form.addEventListener("submit", (event) => savePage(pageKey, event));
  });
  document.querySelector("[data-director-form]").addEventListener("submit", saveDirector);
  document.querySelector("[data-benefit-form]").addEventListener("submit", saveBenefit);
  document.querySelector("[data-agreement-form]").addEventListener("submit", saveAgreement);
  document.querySelector("[data-calendar-form]").addEventListener("submit", saveCalendar);
  document.querySelector("[data-contact-form]").addEventListener("submit", saveContact);
}

function renderOfflineList(collectionName, items, renderer) {
  const container = document.querySelector(`[data-${collectionName}-list]`);
  if (!container) return;
  container.innerHTML = items.map((item, index) => renderer({ id: `offline-${index}`, ...item })).join("");
}

async function loadAdminData() {
  await Promise.all([
    loadContent(),
    loadContact(),
    renderCollection("directors", renderDirectorItem),
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

  await seedCollection("directors", defaults.directors);
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
  Object.keys(pageFields).forEach((pageKey) => {
    fillForm(`[data-page-form="${pageKey}"]`, pageFields[pageKey], data);
  });
}

async function loadContact() {
  const snap = await getDoc(doc(db, "contact", "main"));
  const data = snap.exists() ? snap.data() : {};
  fillForm("[data-contact-form]", contactFields, data);
}

function fillForm(selector, fields, data) {
  const form = document.querySelector(selector);
  if (!form) return;
  fields.forEach((field) => {
    const input = form.elements[field];
    if (input) input.value = data[field] || "";
  });
}

async function savePage(pageKey, event) {
  event.preventDefault();
  const data = formDataToObject(event.currentTarget, pageFields[pageKey]);
  await setDoc(doc(db, "siteContent", "main"), data, { merge: true });
  showStatus("Salvo.");
}

async function saveContact(event) {
  event.preventDefault();
  const data = formDataToObject(event.currentTarget, contactFields);
  await setDoc(doc(db, "contact", "main"), data, { merge: true });
  showStatus("Contato salvo.");
}

async function saveDirector(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formDataToObject(form, ["name", "role", "photoUrl"]);
  data.order = parseInt(form.elements.order.value, 10) || 0;
  await upsertCollectionItem("directors", form.elements.id.value, data);
  resetForm(form);
  await renderCollection("directors", renderDirectorItem);
  showStatus("Diretor salvo.");
}

async function saveBenefit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formDataToObject(form, ["title", "description", "imageUrl"]);
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
  if (!container) return;
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

function renderDirectorItem(item) {
  return `
    <article class="admin-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.role)}${item.order ? ` · Ordem ${item.order}` : ""}</p>
        ${item.photoUrl ? `<p class="item-url">${escapeHtml(item.photoUrl)}</p>` : ""}
      </div>
      ${itemActions("directors", item)}
    </article>
  `;
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
        <p>Instrumentação: ${item.allowsInstrumentation ? "Sim" : "Não"} · Auditoria in loco: ${item.requiresOnsiteAudit ? "Sim" : "Não"}</p>
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
      <div><strong>${escapeHtml(item.date)} — ${escapeHtml(formatCalendarType(item.type))}</strong><p>${escapeHtml(item.label || item.note || "")}</p></div>
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
    directors: "director",
    benefits: "benefit",
    agreements: "agreement",
    calendar: "calendar"
  }[collectionName];
}

function getRenderer(collectionName) {
  return {
    directors: renderDirectorItem,
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
