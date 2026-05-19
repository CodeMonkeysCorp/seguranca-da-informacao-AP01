const USERS = [
  {
    id: 1,
    name: "Ana Souza",
    email: "aluno@faculdade.local",
    password: "123456",
    role: "ALUNO",
    studentId: "202400001"
  },
  {
    id: 2,
    name: "Prof. Carlos Lima",
    email: "professor@faculdade.local",
    password: "123456",
    role: "PROFESSOR",
    classes: ["5A", "5B"]
  },
  {
    id: 3,
    name: "Administrador Geral",
    email: "admin@faculdade.local",
    password: "admin",
    role: "ADMIN"
  }
];

const STORAGE_KEYS = {
  session: "ocorrencias_sessao",
  occurrences: "ocorrencias_registros",
  audit: "ocorrencias_logs"
};

const ROLE_LABELS = {
  ALUNO: "Aluno",
  PROFESSOR: "Professor",
  ADMIN: "Administrador"
};

// As permissões seguem o princípio do menor privilégio dentro do que é possível
// demonstrar apenas no front-end.
const ROLE_PERMISSIONS = {
  ALUNO: {
    canCreateOccurrence: true,
    canViewAllOccurrences: false,
    canChangeStatus: false,
    canDeleteOccurrence: false,
    canExport: false,
    canClearLogs: false,
    canResetData: false,
    canSeeFullContact: false,
    canSeeCpf: false,
    canSeeInternalNote: false
  },
  PROFESSOR: {
    canCreateOccurrence: true,
    canViewAllOccurrences: true,
    canChangeStatus: true,
    canDeleteOccurrence: false,
    canExport: false,
    canClearLogs: false,
    canResetData: false,
    canSeeFullContact: false,
    canSeeCpf: false,
    canSeeInternalNote: true
  },
  ADMIN: {
    canCreateOccurrence: true,
    canViewAllOccurrences: true,
    canChangeStatus: true,
    canDeleteOccurrence: true,
    canExport: true,
    canClearLogs: true,
    canResetData: true,
    canSeeFullContact: true,
    canSeeCpf: true,
    canSeeInternalNote: true
  }
};

const CATEGORY_OPTIONS = [
  "Nota",
  "Frequência",
  "Comportamento",
  "Solicitação administrativa",
  "Outro"
];

const PRIORITY_OPTIONS = ["Baixa", "Média", "Alta", "Crítica"];
const STATUS_OPTIONS = ["Aberta", "Em análise", "Resolvida"];

const INITIAL_OCCURRENCES = [
  {
    id: "OC-1001",
    studentName: "Marina Alves",
    studentId: "202300145",
    studentCpf: "123.456.789-10",
    studentEmail: "marina.alves@faculdade.local",
    studentPhone: "(47) 99999-1010",
    category: "Nota",
    priority: "Média",
    description: "Solicitação de revisão de nota da avaliação bimestral.",
    internalNote: "Verificar com a coordenação antes de responder.",
    privacyAck: true,
    status: "Aberta",
    createdBy: "professor@faculdade.local",
    createdAt: "2026-05-05T18:40:00.000Z",
    updatedAt: null,
    updatedBy: null
  },
  {
    id: "OC-1002",
    studentName: "Rafael Martins",
    studentId: "202200771",
    studentCpf: "987.654.321-00",
    studentEmail: "rafael.martins@faculdade.local",
    studentPhone: "(47) 98888-2020",
    category: "Frequência",
    priority: "Alta",
    description: "Aluno contesta lançamento de falta em aula prática.",
    internalNote: "Conferir chamada manual.",
    privacyAck: true,
    status: "Em análise",
    createdBy: "professor@faculdade.local",
    createdAt: "2026-05-05T18:50:00.000Z",
    updatedAt: "2026-05-05T19:15:00.000Z",
    updatedBy: "professor@faculdade.local"
  },
  {
    id: "OC-1003",
    studentName: "Beatriz Costa",
    studentId: "202100441",
    studentCpf: "111.222.333-44",
    studentEmail: "beatriz.costa@faculdade.local",
    studentPhone: "(47) 97777-3030",
    category: "Solicitação administrativa",
    priority: "Crítica",
    description: "Solicitação envolvendo documentação acadêmica e prazo de matrícula.",
    internalNote: "Priorizar atendimento.",
    privacyAck: true,
    status: "Aberta",
    createdBy: "admin@faculdade.local",
    createdAt: "2026-05-05T19:00:00.000Z",
    updatedAt: null,
    updatedBy: null
  }
];

const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const occurrenceForm = document.querySelector("#occurrenceForm");
const logoutBtn = document.querySelector("#logoutBtn");
const exportBtn = document.querySelector("#exportBtn");
const clearLogsBtn = document.querySelector("#clearLogsBtn");
const resetBtn = document.querySelector("#resetBtn");
const searchInput = document.querySelector("#search");
const statusMessage = document.querySelector("#statusMessage");
const internalNoteField = document.querySelector("#internalNoteField");

const sessionBadge = document.querySelector("#sessionBadge");
const currentUserName = document.querySelector("#currentUserName");
const currentUserDetails = document.querySelector("#currentUserDetails");
const occurrencesTable = document.querySelector("#occurrencesTable");
const auditLog = document.querySelector("#auditLog");
const totalOccurrences = document.querySelector("#totalOccurrences");
const criticalOccurrences = document.querySelector("#criticalOccurrences");
const lastUpdate = document.querySelector("#lastUpdate");

const formFields = {
  studentName: document.querySelector("#studentName"),
  studentId: document.querySelector("#studentId"),
  studentCpf: document.querySelector("#studentCpf"),
  studentEmail: document.querySelector("#studentEmail"),
  studentPhone: document.querySelector("#studentPhone"),
  category: document.querySelector("#category"),
  priority: document.querySelector("#priority"),
  description: document.querySelector("#description"),
  internalNote: document.querySelector("#internalNote"),
  privacyAck: document.querySelector("#privacyAck")
};

// Inicialização centralizada para manter a carga previsível do protótipo.
function initializeApp() {
  seedStorage();
  bindEvents();
  restoreSession();
}

function seedStorage(forceReset = false) {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.occurrences)) {
    saveOccurrences(INITIAL_OCCURRENCES);
  }

  if (forceReset || !localStorage.getItem(STORAGE_KEYS.audit)) {
    saveAuditLogs([
      createAuditEntry(
        "BASE_INICIAL_CRIADA",
        "Dados fictícios carregados no armazenamento local.",
        { email: "sistema", role: "SISTEMA" }
      )
    ]);
  }

}

function bindEvents() {
  loginForm.addEventListener("submit", handleLoginSubmit);
  occurrenceForm.addEventListener("submit", createOccurrence);
  logoutBtn.addEventListener("click", () => logout("Sessão encerrada pelo usuário."));
  exportBtn.addEventListener("click", exportEverything);
  clearLogsBtn.addEventListener("click", clearLogs);
  resetBtn.addEventListener("click", resetData);
  searchInput.addEventListener("input", render);
  occurrencesTable.addEventListener("click", handleOccurrenceTableAction);
}

function createAuditEntry(action, detail, actor = null) {
  return {
    when: new Date().toISOString(),
    user: actor?.email || "anônimo",
    role: actor?.role || "SEM_SESSAO",
    action,
    detail: limitText(detail, 220)
  };
}

function getJsonStorage(key, fallbackValue) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallbackValue));
  } catch (error) {
    return fallbackValue;
  }
}

function getOccurrences() {
  return getJsonStorage(STORAGE_KEYS.occurrences, []);
}

function saveOccurrences(occurrences) {
  localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(occurrences));
}

function getAuditLogs() {
  return getJsonStorage(STORAGE_KEYS.audit, []);
}

function saveAuditLogs(logs) {
  localStorage.setItem(STORAGE_KEYS.audit, JSON.stringify(logs));
}

function getSession() {
  return getJsonStorage(STORAGE_KEYS.session, null);
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function sanitizeUserForSession(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId || null
  };
}

function limitText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

function getPermissions(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.ALUNO;
}

function restoreSession() {
  const session = getSession();

  if (!session) {
    showLogin();
    return;
  }
  showApp(session);
}

function requireSession() {
  const session = getSession();

  if (!session) {
    showMessage("Faça login para continuar.", "warning");
    showLogin();
    return null;
  }
  return session;
}

function showMessage(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.classList.remove("hidden");
}

function clearMessage() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message hidden";
}

function showLogin() {
  loginView.classList.remove("hidden");
  appView.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  searchInput.value = "";
  sessionBadge.textContent = "Sessão não iniciada";
  sessionBadge.className = "badge muted";
}

function showApp(session) {
  const permissions = getPermissions(session.role);

  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  searchInput.value = "";

  sessionBadge.textContent = `${session.name} - ${getRoleLabel(session.role)}`;
  sessionBadge.className = "badge";

  currentUserName.textContent = session.name;
  currentUserDetails.textContent = `${session.email} | Perfil: ${getRoleLabel(session.role)}`;

  exportBtn.classList.toggle("hidden", !permissions.canExport);
  clearLogsBtn.classList.toggle("hidden", !permissions.canClearLogs);
  resetBtn.classList.toggle("hidden", !permissions.canResetData);

  clearMessage();
  resetOccurrenceForm(session);
  render();
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const email = normalizeWhitespace(document.querySelector("#email").value).toLowerCase();
  const password = document.querySelector("#password").value;

  login(email, password);
}

function login(email, password) {
  const user = USERS.find((item) => item.email === email && item.password === password);

  if (!user) {
    showMessage("Usuário ou senha inválidos.", "error");
    writeLog("LOGIN_FALHOU", `Credenciais inválidas para ${email}.`);
    return;
  }

  const session = sanitizeUserForSession(user);
  saveSession(session);
  writeLog("LOGIN_OK", `Usuário ${email} iniciou sessão.`, session);
  clearMessage();
  showApp(session);
}

function logout(reason) {
  const session = getSession();

  if (session) {
    writeLog("LOGOUT", reason, session);
  }

  localStorage.removeItem(STORAGE_KEYS.session);
  showMessage("Sessão encerrada com sucesso.", "info");
  showLogin();
}

function writeLog(action, detail, actor = null) {
  const logs = getAuditLogs();
  logs.unshift(createAuditEntry(action, detail, actor));
  saveAuditLogs(logs);
}

function authorize(permissionKey, deniedDetail) {
  const session = requireSession();

  if (!session) {
    return null;
  }

  const permissions = getPermissions(session.role);

  if (!permissions[permissionKey]) {
    writeLog("ACESSO_NEGADO", deniedDetail, session);
    showMessage("Seu perfil não possui permissão para esta ação.", "error");
    return null;
  }

  return session;
}

// O formulário muda conforme o perfil para evitar coleta excessiva e ações indevidas.
function resetOccurrenceForm(session = getSession()) {
  occurrenceForm.reset();

  if (!session) {
    return;
  }

  const isStudent = session.role === "ALUNO";

  formFields.studentName.readOnly = isStudent;
  formFields.studentId.readOnly = isStudent;
  formFields.studentEmail.readOnly = isStudent;
  internalNoteField.classList.toggle("hidden", isStudent);

  if (isStudent) {
    formFields.studentName.value = session.name;
    formFields.studentId.value = session.studentId || "";
    formFields.studentEmail.value = session.email;
    formFields.internalNote.value = "";
  }
}

function readOccurrenceForm(session) {
  const isStudent = session.role === "ALUNO";

  return {
    studentName: normalizeWhitespace(formFields.studentName.value),
    studentId: normalizeWhitespace(formFields.studentId.value),
    studentCpf: normalizeWhitespace(formFields.studentCpf.value),
    studentEmail: normalizeWhitespace(formFields.studentEmail.value).toLowerCase(),
    studentPhone: normalizeWhitespace(formFields.studentPhone.value),
    category: formFields.category.value,
    priority: formFields.priority.value,
    description: normalizeWhitespace(formFields.description.value),
    internalNote: isStudent ? "" : normalizeWhitespace(formFields.internalNote.value),
    privacyAck: formFields.privacyAck.checked
  };
}

function validateOccurrence(payload, session) {
  const errors = [];

  if (payload.studentName.length < 5) {
    errors.push("Informe o nome do aluno com pelo menos 5 caracteres.");
  }

  if (!/^\d{9}$/.test(payload.studentId)) {
    errors.push("A matrícula deve conter 9 dígitos.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.studentEmail)) {
    errors.push("Informe um e-mail válido.");
  }

  if (payload.studentCpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(payload.studentCpf)) {
    errors.push("O CPF deve seguir o formato 000.000.000-00.");
  }

  if (payload.studentPhone && !/^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(payload.studentPhone)) {
    errors.push("O telefone deve seguir o formato (00) 00000-0000.");
  }

  if (!CATEGORY_OPTIONS.includes(payload.category)) {
    errors.push("Selecione um tipo de ocorrência válido.");
  }

  if (!PRIORITY_OPTIONS.includes(payload.priority)) {
    errors.push("Selecione uma prioridade válida.");
  }

  if (payload.description.length < 20 || payload.description.length > 400) {
    errors.push("A descrição deve ter entre 20 e 400 caracteres.");
  }

  if (payload.internalNote.length > 240) {
    errors.push("A observação interna deve ter no máximo 240 caracteres.");
  }

  if (!payload.privacyAck) {
    errors.push("Confirme o uso de dados fictícios antes de salvar.");
  }

  if (session.role === "ALUNO") {
    if (payload.studentName !== session.name || payload.studentId !== session.studentId || payload.studentEmail !== session.email) {
      errors.push("O perfil de aluno só pode registrar ocorrências vinculadas à própria conta.");
    }

    if (payload.internalNote) {
      errors.push("O perfil de aluno não pode preencher observação interna.");
    }
  }

  return errors;
}

function generateOccurrenceId() {
  const highestNumber = getOccurrences().reduce((highest, occurrence) => {
    const numericId = Number(String(occurrence.id || "").replace("OC-", ""));
    return Number.isNaN(numericId) ? highest : Math.max(highest, numericId);
  }, 1000);

  return `OC-${highestNumber + 1}`;
}

function createOccurrence(event) {
  event.preventDefault();

  const session = authorize(
    "canCreateOccurrence",
    "Tentativa de criação de ocorrência sem permissão."
  );

  if (!session) {
    return;
  }

  const payload = readOccurrenceForm(session);
  const validationErrors = validateOccurrence(payload, session);

  if (validationErrors.length > 0) {
    showMessage(validationErrors[0], "error");
    writeLog(
      "VALIDACAO_FALHOU",
      `Cadastro rejeitado para ${session.email}: ${validationErrors[0]}`,
      session
    );
    return;
  }

  const occurrences = getOccurrences();
  const occurrence = {
    id: generateOccurrenceId(),
    ...payload,
    status: "Aberta",
    createdBy: session.email,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    updatedBy: null
  };

  occurrences.unshift(occurrence);
  saveOccurrences(occurrences);

  writeLog(
    "OCORRENCIA_CRIADA",
    `Ocorrência ${occurrence.id} criada para a matrícula ${occurrence.studentId}.`,
    session
  );

  showMessage(`Ocorrência ${occurrence.id} registrada com sucesso.`, "success");
  resetOccurrenceForm(session);
  render();
}

function getVisibleOccurrences(session) {
  const permissions = getPermissions(session.role);
  const occurrences = getOccurrences();

  if (permissions.canViewAllOccurrences) {
    return occurrences;
  }

  return occurrences.filter((occurrence) => {
    return occurrence.studentId === session.studentId || occurrence.createdBy === session.email;
  });
}

function canAccessOccurrence(session, occurrence) {
  const permissions = getPermissions(session.role);

  if (permissions.canViewAllOccurrences) {
    return true;
  }

  return occurrence.studentId === session.studentId || occurrence.createdBy === session.email;
}

function changeStatus(id, status) {
  const session = authorize(
    "canChangeStatus",
    `Tentativa de alterar status da ocorrência ${id} sem permissão.`
  );

  if (!session || !STATUS_OPTIONS.includes(status)) {
    return;
  }

  const occurrences = getOccurrences();
  const occurrence = occurrences.find((item) => item.id === id);

  if (!occurrence || !canAccessOccurrence(session, occurrence)) {
    writeLog("ACESSO_NEGADO", `Tentativa de alterar ocorrência ${id} fora do escopo.`, session);
    showMessage("Você não pode alterar esta ocorrência.", "error");
    return;
  }

  occurrence.status = status;
  occurrence.updatedAt = new Date().toISOString();
  occurrence.updatedBy = session.email;

  saveOccurrences(occurrences);
  writeLog("STATUS_ALTERADO", `Ocorrência ${id} alterada para ${status}.`, session);
  showMessage(`Status da ocorrência ${id} atualizado para ${status}.`, "success");
  render();
}

function deleteOccurrence(id) {
  const session = authorize(
    "canDeleteOccurrence",
    `Tentativa de excluir a ocorrência ${id} sem permissão.`
  );

  if (!session) {
    return;
  }

  const occurrences = getOccurrences();
  const occurrence = occurrences.find((item) => item.id === id);

  if (!occurrence || !canAccessOccurrence(session, occurrence)) {
    writeLog("ACESSO_NEGADO", `Tentativa de excluir ocorrência ${id} fora do escopo.`, session);
    showMessage("Você não pode excluir esta ocorrência.", "error");
    return;
  }

  if (!window.confirm(`Confirma a exclusão da ocorrência ${id}?`)) {
    return;
  }

  const updatedOccurrences = occurrences.filter((item) => item.id !== id);
  saveOccurrences(updatedOccurrences);

  writeLog("OCORRENCIA_EXCLUIDA", `Ocorrência ${id} excluída.`, session);
  showMessage(`Ocorrência ${id} excluída.`, "warning");
  render();
}

function buildExportPayload(session) {
  const visibleOccurrences = getVisibleOccurrences(session);

  return {
    exportedAt: new Date().toISOString(),
    exportedBy: {
      name: session.name,
      email: session.email,
      role: session.role
    },
    scope: "dados tratados e minimizados para fins didáticos",
    limitations: [
      "Arquivo gerado no front-end.",
      "Sem garantia criptográfica de integridade.",
      "Não substitui exportação controlada por servidor."
    ],
    occurrences: visibleOccurrences.map((occurrence) => ({
      id: occurrence.id,
      studentName: occurrence.studentName,
      studentId: occurrence.studentId,
      studentCpf: maskCpf(occurrence.studentCpf),
      studentEmail: maskEmail(occurrence.studentEmail),
      studentPhone: maskPhone(occurrence.studentPhone),
      category: occurrence.category,
      priority: occurrence.priority,
      description: occurrence.description,
      status: occurrence.status,
      createdAt: occurrence.createdAt,
      updatedAt: occurrence.updatedAt
    })),
    audit: getAuditLogs().map((log) => ({
      when: log.when,
      user: log.user,
      role: log.role,
      action: log.action,
      detail: log.detail
    }))
  };
}

function exportEverything() {
  const session = authorize(
    "canExport",
    "Tentativa de exportação sem permissão administrativa."
  );

  if (!session) {
    return;
  }

  const payload = buildExportPayload(session);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "ocorrencias-tratadas.json";
  anchor.click();
  URL.revokeObjectURL(url);

  writeLog("EXPORTACAO_EXECUTADA", "Exportação local de dados tratados.", session);
  showMessage("Exportação concluída com dados minimizados.", "success");
}

function clearLogs() {
  const session = authorize(
    "canClearLogs",
    "Tentativa de limpeza de logs sem permissão administrativa."
  );

  if (!session) {
    return;
  }

  if (!window.confirm("Confirma a reinicialização dos logs locais?")) {
    return;
  }

  saveAuditLogs([
    createAuditEntry(
      "LOGS_REINICIALIZADOS",
      "Logs locais foram reinicializados pelo administrador.",
      session
    )
  ]);

  showMessage("Logs locais reinicializados.", "warning");
  render();
}

function resetData() {
  const session = authorize(
    "canResetData",
    "Tentativa de restauração da base sem permissão administrativa."
  );

  if (!session) {
    return;
  }

  if (!window.confirm("Confirma a restauração completa da base de teste?")) {
    return;
  }

  saveOccurrences(INITIAL_OCCURRENCES);
  saveAuditLogs([
    createAuditEntry(
      "BASE_RESTAURADA",
      "Base de testes restaurada pelo administrador.",
      session
    ),
    createAuditEntry(
      "BASE_INICIAL_CRIADA",
      "Dados fictícios carregados no armazenamento local.",
      { email: "sistema", role: "SISTEMA" }
    )
  ]);
  localStorage.removeItem(STORAGE_KEYS.session);

  showMessage("Base de teste restaurada. Faça login novamente.", "warning");
  showLogin();
}

function handleOccurrenceTableAction(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const occurrenceId = button.dataset.occurrenceId;

  if (action === "status") {
    changeStatus(occurrenceId, button.dataset.status);
    return;
  }

  if (action === "delete") {
    deleteOccurrence(occurrenceId);
  }
}

function render() {
  const session = requireSession();

  if (!session) {
    return;
  }

  const visibleOccurrences = getVisibleOccurrences(session);
  const searchTerm = normalizeText(searchInput.value);
  const filteredOccurrences = visibleOccurrences.filter((occurrence) => {
    return buildSearchIndex(occurrence, session).includes(searchTerm);
  });

  totalOccurrences.textContent = String(visibleOccurrences.length);
  criticalOccurrences.textContent = String(
    visibleOccurrences.filter((occurrence) => occurrence.priority === "Crítica").length
  );
  lastUpdate.textContent = `Atualizado em ${formatDateTime(new Date().toISOString())}`;

  renderOccurrencesTable(filteredOccurrences, session);
  renderAuditLog(session);
}

function buildSearchIndex(occurrence, session) {
  const permissions = getPermissions(session.role);
  const values = [
    occurrence.id,
    occurrence.studentName,
    occurrence.studentId,
    occurrence.category,
    occurrence.priority,
    occurrence.status,
    occurrence.description
  ];

  if (permissions.canSeeCpf) {
    values.push(occurrence.studentCpf);
  }

  if (permissions.canSeeFullContact) {
    values.push(occurrence.studentEmail, occurrence.studentPhone);
  }

  if (permissions.canSeeInternalNote) {
    values.push(occurrence.internalNote);
  }

  return normalizeText(values.join(" "));
}

function renderOccurrencesTable(occurrences, session) {
  occurrencesTable.textContent = "";

  if (occurrences.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = "Nenhuma ocorrência encontrada para o perfil atual.";
    row.appendChild(cell);
    occurrencesTable.appendChild(row);
    return;
  }

  occurrences.forEach((occurrence) => {
    occurrencesTable.appendChild(buildOccurrenceRow(occurrence, session));
  });
}

// A tabela é montada com createElement/textContent para reduzir risco de XSS via innerHTML.
function buildOccurrenceRow(occurrence, session) {
  const permissions = getPermissions(session.role);
  const row = document.createElement("tr");

  row.appendChild(buildStudentCell(occurrence));
  row.appendChild(buildSimpleCell(permissions.canSeeCpf ? occurrence.studentCpf || "Não informado" : maskCpf(occurrence.studentCpf)));
  row.appendChild(buildMultilineCell(getContactLines(occurrence, permissions)));
  row.appendChild(buildSimpleCell(occurrence.category));
  row.appendChild(buildPriorityCell(occurrence.priority));
  row.appendChild(buildStatusCell(occurrence));
  row.appendChild(buildDetailsCell(occurrence, permissions));
  row.appendChild(buildActionsCell(occurrence, permissions));

  return row;
}

function buildStudentCell(occurrence) {
  const cell = document.createElement("td");
  const name = document.createElement("strong");
  const studentId = document.createElement("span");

  name.textContent = occurrence.studentName;
  studentId.className = "muted-text";
  studentId.textContent = occurrence.studentId;

  cell.appendChild(name);
  cell.appendChild(document.createElement("br"));
  cell.appendChild(studentId);
  return cell;
}

function buildSimpleCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value || "Não informado";
  return cell;
}

function buildMultilineCell(lines) {
  const cell = document.createElement("td");
  lines.forEach((line, index) => {
    const span = document.createElement("span");
    span.textContent = line;
    cell.appendChild(span);

    if (index < lines.length - 1) {
      cell.appendChild(document.createElement("br"));
    }
  });

  return cell;
}

function buildPriorityCell(priority) {
  const cell = document.createElement("td");
  const badge = document.createElement("span");

  badge.className = "priority";
  badge.dataset.priority = priority;
  badge.textContent = priority;

  cell.appendChild(badge);
  return cell;
}

function buildStatusCell(occurrence) {
  const cell = document.createElement("td");
  const badge = document.createElement("span");

  badge.className = "status-pill";
  badge.textContent = occurrence.status;

  cell.appendChild(badge);

  if (occurrence.updatedAt) {
    const note = document.createElement("div");
    note.className = "table-note";
    note.textContent = `Última atualização: ${formatDateTime(occurrence.updatedAt)}`;
    cell.appendChild(note);
  }

  return cell;
}

function buildDetailsCell(occurrence, permissions) {
  const cell = document.createElement("td");
  const container = document.createElement("div");
  container.className = "cell-detail";

  const description = document.createElement("span");
  description.textContent = `Descrição: ${occurrence.description}`;
  container.appendChild(description);

  const internalNote = document.createElement("span");
  internalNote.className = "muted-text";
  internalNote.textContent = permissions.canSeeInternalNote && occurrence.internalNote
    ? `Obs. interna: ${occurrence.internalNote}`
    : "Obs. interna: restrita ao tratamento interno.";
  container.appendChild(internalNote);

  cell.appendChild(container);
  return cell;
}

function buildActionsCell(occurrence, permissions) {
  const cell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "row-actions";

  if (permissions.canChangeStatus && occurrence.status !== "Em análise") {
    actions.appendChild(
      buildActionButton("Em análise", "secondary", {
        action: "status",
        occurrenceId: occurrence.id,
        status: "Em análise"
      })
    );
  }

  if (permissions.canChangeStatus && occurrence.status !== "Resolvida") {
    actions.appendChild(
      buildActionButton("Resolver", "secondary", {
        action: "status",
        occurrenceId: occurrence.id,
        status: "Resolvida"
      })
    );
  }

  if (permissions.canDeleteOccurrence) {
    actions.appendChild(
      buildActionButton("Excluir", "danger", {
        action: "delete",
        occurrenceId: occurrence.id
      })
    );
  }

  if (actions.children.length === 0) {
    cell.textContent = "Consulta";
    return cell;
  }

  cell.appendChild(actions);
  return cell;
}

function buildActionButton(label, variant, dataset) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn ${variant}`;
  button.textContent = label;

  Object.entries(dataset).forEach(([key, value]) => {
    button.dataset[key] = value;
  });

  return button;
}

// Logs também respeitam escopo por perfil para não expor eventos internos desnecessariamente.
function renderAuditLog(session) {
  const visibleLogs = getVisibleLogs(session);
  auditLog.textContent = "";

  if (visibleLogs.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "notice";
    emptyState.textContent = "Nenhum log visível para o perfil atual.";
    auditLog.appendChild(emptyState);
    return;
  }

  visibleLogs.forEach((log) => {
    const item = document.createElement("div");
    const header = document.createElement("strong");
    const summary = document.createElement("div");
    const detail = document.createElement("div");

    item.className = "log-item";
    header.textContent = formatDateTime(log.when);
    summary.textContent = `usuario=${log.user} | perfil=${log.role} | acao=${log.action}`;
    detail.className = "log-detail";
    detail.textContent = `detalhe=${log.detail}`;

    item.appendChild(header);
    item.appendChild(document.createElement("br"));
    item.appendChild(summary);
    item.appendChild(detail);
    auditLog.appendChild(item);
  });
}

function getVisibleLogs(session) {
  const logs = getAuditLogs();

  if (session.role === "ADMIN") {
    return logs;
  }

  return logs.filter((log) => log.user === session.email).slice(0, 20);
}

function getContactLines(occurrence, permissions) {
  const email = permissions.canSeeFullContact
    ? occurrence.studentEmail || "E-mail não informado"
    : maskEmail(occurrence.studentEmail);
  const phone = permissions.canSeeFullContact
    ? occurrence.studentPhone || "Telefone não informado"
    : maskPhone(occurrence.studentPhone);

  return [email, phone];
}

function maskCpf(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "");

  if (digits.length !== 11) {
    return "CPF não informado";
  }

  return `***.***.${digits.slice(6, 9)}-**`;
}

function maskEmail(email) {
  const value = String(email || "").trim();

  if (!value.includes("@")) {
    return "E-mail não informado";
  }

  const [localPart, domain] = value.split("@");
  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 10) {
    return "Telefone não informado";
  }

  return `(${digits.slice(0, 2)}) *****-${digits.slice(-4)}`;
}

function formatDateTime(isoString) {
  const parsedDate = new Date(isoString);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("pt-BR");
}

initializeApp();
