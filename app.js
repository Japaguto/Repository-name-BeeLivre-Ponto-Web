const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginInput = document.getElementById("login");
const pinInput = document.getElementById("pin");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const forgotPasswordView = document.getElementById("forgotPasswordView");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const recoveryEmail = document.getElementById("recoveryEmail");
const sendRecoveryButton = document.getElementById("sendRecoveryButton");
const backToLoginFromRecovery = document.getElementById("backToLoginFromRecovery");
const forgotPasswordMessage = document.getElementById("forgotPasswordMessage");
const inviteView = document.getElementById("inviteView");
const inviteInfo = document.getElementById("inviteInfo");
const inviteName = document.getElementById("inviteName");
const inviteEmail = document.getElementById("inviteEmail");
const inviteProfile = document.getElementById("inviteProfile");
const acceptInviteForm = document.getElementById("acceptInviteForm");
const inviteUsername = document.getElementById("inviteUsername");
const invitePassword = document.getElementById("invitePassword");
const inviteConfirmation = document.getElementById("inviteConfirmation");
const acceptInviteButton = document.getElementById("acceptInviteButton");
const inviteMessage = document.getElementById("inviteMessage");
const inviteToLoginButton = document.getElementById("inviteToLoginButton");
const resetPasswordView = document.getElementById("resetPasswordView");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const newPassword = document.getElementById("newPassword");
const newPasswordConfirmation = document.getElementById("newPasswordConfirmation");
const resetPasswordButton = document.getElementById("resetPasswordButton");
const resetPasswordMessage = document.getElementById("resetPasswordMessage");
const resetToLoginButton = document.getElementById("resetToLoginButton");
const logoutButton = document.getElementById("logoutButton");
const userName = document.getElementById("userName");
const userProfile = document.getElementById("userProfile");
const managerArea = document.getElementById("managerArea");
const dashboardMessage = document.getElementById("dashboardMessage");
const todayDate = document.getElementById("todayDate");
const todayStatusBadge = document.getElementById("todayStatusBadge");
const todayWorked = document.getElementById("todayWorked");
const todayTeiji = document.getElementById("todayTeiji");
const todayZangyo = document.getElementById("todayZangyo");
const todaySituation = document.getElementById("todaySituation");
const scheduleList = document.getElementById("scheduleList");
const historyList = document.getElementById("historyList");
const actionButtons = document.querySelectorAll("[data-action]");
const readQrButton = document.getElementById("readQrButton");
const scanStatus = document.getElementById("scanStatus");
const scanResult = document.getElementById("scanResult");
const resultAction = document.getElementById("resultAction");
const resultRealTime = document.getElementById("resultRealTime");
const resultAppliedTime = document.getElementById("resultAppliedTime");
const resultSituation = document.getElementById("resultSituation");
const scannerModal = document.getElementById("scannerModal");
const closeScannerButton = document.getElementById("closeScanner");
const cameraAction = document.getElementById("cameraAction");
const cameraStatus = document.getElementById("cameraStatus");
const video = document.getElementById("camera");
const generateQrButton = document.getElementById("generateQrButton");
const managerMessage = document.getElementById("managerMessage");
const managerQrCode = document.getElementById("managerQrCode");
const managerQrEmpty = document.getElementById("managerQrEmpty");
const managerQrMeta = document.getElementById("managerQrMeta");
const managerQrCreated = document.getElementById("managerQrCreated");
const managerQrExpires = document.getElementById("managerQrExpires");
const adminUsersArea = document.getElementById("adminUsersArea");
const openInviteModalButton = document.getElementById("openInviteModalButton");
const inviteModal = document.getElementById("inviteModal");
const closeInviteModal = document.getElementById("closeInviteModal");
const selectAllEligibleButton = document.getElementById("selectAllEligibleButton");
const createEmployeeInvitesButton = document.getElementById("createEmployeeInvitesButton");
const sendEmployeeInvitesButton = document.getElementById("sendEmployeeInvitesButton");
const employeeInvitesMessage = document.getElementById("employeeInvitesMessage");
const eligibleEmployeesList = document.getElementById("eligibleEmployeesList");
const employeeInviteResults = document.getElementById("employeeInviteResults");
const manageInvitesButton = document.getElementById("manageInvitesButton");
const manageInvitesModal = document.getElementById("manageInvitesModal");
const closeManageInvitesButton = document.getElementById("closeManageInvitesButton");
const invitesManagerContent = document.getElementById("invitesManagerContent");
const inviteFilters = document.getElementById("inviteFilters");
const inviteFilterButtons = document.querySelectorAll("[data-invite-filter]");
const invitesMessage = document.getElementById("invitesMessage");
const invitesList = document.getElementById("invitesList");
const cancelInviteConfirmation = document.getElementById("cancelInviteConfirmation");
const backFromCancelInviteButton = document.getElementById("backFromCancelInviteButton");
const confirmCancelInviteButton = document.getElementById("confirmCancelInviteButton");
const cancelInviteMessage = document.getElementById("cancelInviteMessage");

const API_URL = "https://script.google.com/macros/s/AKfycbywRC0bJFYrUJdHwS1_7CdwoOO2Eso7Ad6wqAghowdxUhbFGdY6W5roi4l-N18V0rua_Q/exec";
const TOKEN_KEY = "beelivre_ponto_token";
const ZXING_URL = "https://unpkg.com/@zxing/browser@0.2.1";
const QRCODE_URL = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
const scriptLoads = new Map();
const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao sistema. Tente novamente.";

let selectedAction = "";
let selectedActionLabel = "";
let scannerControls = null;
let isLoadingScanner = false;
let isAuthenticating = false;
let isRegistering = false;
let dashboardRequestId = 0;
let qrExpirationTimer = null;
let inviteToken = null;
let recoveryToken = null;
let acceptedInviteUser = "";
let isAcceptingInvite = false;
let isRequestingRecovery = false;
let isResettingPassword = false;
let isLoadingEligibleEmployees = false;
let isCreatingEmployeeInvites = false;
let eligibleEmployees = [];
let currentUserProfile = "";
let loadedInvites = [];
let activeInviteFilter = "pendente";
let pendingCancelInviteId = null;
let isLoadingInvites = false;
let isCancellingInvite = false;
let isResendingInvite = false;

const publicViews = [loginView, forgotPasswordView, inviteView, resetPasswordView];

function showOnlyPublicView(view) {
  stopScanner();
  dashboardView.hidden = true;
  publicViews.forEach((item) => { item.hidden = item !== view; });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function removeSensitiveQueryParameters() {
  const url = new URL(window.location.href);
  const foundInvite = url.searchParams.get("convite");
  const foundRecovery = url.searchParams.get("redefinir");
  if (!foundInvite && !foundRecovery) return { flow: "session", token: null };
  url.searchParams.delete("convite");
  url.searchParams.delete("redefinir");
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return foundInvite
    ? { flow: "invite", token: foundInvite }
    : { flow: "recovery", token: foundRecovery };
}

let initialFlow = removeSensitiveQueryParameters();

function loadScriptOnce(url, expectedGlobal) {
  if (window[expectedGlobal]) return Promise.resolve(window[expectedGlobal]);
  if (scriptLoads.has(url)) return scriptLoads.get(url);

  const load = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => window[expectedGlobal]
      ? resolve(window[expectedGlobal])
      : reject(new Error("Biblioteca indisponível."));
    script.onerror = () => reject(new Error("Falha ao carregar a biblioteca."));
    document.head.append(script);
  });

  scriptLoads.set(url, load);
  load.catch(() => scriptLoads.delete(url));
  return load;
}

async function postToApi(route, data) {
  const response = await fetch(`${API_URL}?api=${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(data).toString()
  });

  if (!response.ok) throw new Error("HTTP_ERROR");
  return response.json();
}

function applyUser(usuario) {
  const nome = typeof usuario?.nome === "string" ? usuario.nome : "";
  const perfil = typeof usuario?.perfil === "string" ? usuario.perfil.toUpperCase() : "";

  currentUserProfile = perfil;
  userName.textContent = nome;
  userProfile.textContent = perfil ? `Perfil: ${perfil}` : "";
  managerArea.hidden = perfil !== "ADMIN" && perfil !== "RESPONSAVEL";
  adminUsersArea.hidden = perfil !== "ADMIN";
}

function clearUser() {
  currentUserProfile = "";
  userName.textContent = "";
  userProfile.textContent = "";
  managerArea.hidden = true;
  adminUsersArea.hidden = true;
  closeCreateInvite();
  closeInvitesManager(true);
  clearManagerQr();
}

function isInvalidSession(result) {
  return result?.ok === false && result?.error === "Sessão inválida.";
}

function expireSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  dashboardRequestId += 1;
  pinInput.value = "";
  showLogin();
  loginMessage.className = "message is-error";
  loginMessage.textContent = "Sua sessão expirou. Entre novamente.";
}

function clearManagerQr() {
  if (qrExpirationTimer) {
    clearTimeout(qrExpirationTimer);
    qrExpirationTimer = null;
  }
  managerQrCode.replaceChildren();
  managerQrEmpty.hidden = false;
  managerQrMeta.hidden = true;
  managerQrCreated.textContent = "—";
  managerQrExpires.textContent = "—";
  managerMessage.textContent = "";
  managerMessage.className = "message";
}

function valueOrDash(value) {
  return value === null || value === undefined || String(value).trim() === "" ? "—" : String(value);
}

function createEmptyState(icon, message) {
  const emptyState = document.createElement("div");
  const iconElement = document.createElement("span");
  const text = document.createElement("p");

  emptyState.className = "empty-state";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;
  text.textContent = message;
  emptyState.append(iconElement, text);
  return emptyState;
}

function setDashboardLoading() {
  dashboardMessage.textContent = "Carregando...";
  dashboardMessage.className = "message dashboard-message";
  todayDate.textContent = "";
  todayStatusBadge.textContent = "Carregando...";
  todayWorked.textContent = "Carregando...";
  todayTeiji.textContent = "Carregando...";
  todayZangyo.textContent = "Carregando...";
  todaySituation.textContent = "Carregando...";
  scheduleList.replaceChildren(createEmptyState("◷", "Carregando..."));
  historyList.replaceChildren(createEmptyState("☷", "Carregando..."));
}

function renderToday(hoje) {
  todayDate.textContent = valueOrDash(hoje?.data) === "—" ? "" : String(hoje.data);
  todayWorked.textContent = valueOrDash(hoje?.trabalhado);
  todayTeiji.textContent = valueOrDash(hoje?.teiji);
  todayZangyo.textContent = valueOrDash(hoje?.zangyo);
  todaySituation.textContent = valueOrDash(hoje?.situacao);
  todayStatusBadge.textContent = valueOrDash(hoje?.situacao);
}

function renderSchedule(items) {
  scheduleList.replaceChildren();

  if (!Array.isArray(items) || items.length === 0) {
    scheduleList.append(createEmptyState("◷", "Sem escala cadastrada para hoje."));
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    const position = document.createElement("h3");
    const hours = document.createElement("p");

    card.className = "schedule-item";
    position.textContent = valueOrDash(item?.posicao);
    hours.className = "schedule-item__hours";
    hours.textContent = `${valueOrDash(item?.entrada)} – ${valueOrDash(item?.saida)}`;
    card.append(position, hours);

    if (item?.intervaloInicio || item?.intervaloFim) {
      const interval = document.createElement("p");
      interval.className = "schedule-item__detail";
      interval.textContent = `Intervalo: ${valueOrDash(item.intervaloInicio)} – ${valueOrDash(item.intervaloFim)}`;
      card.append(interval);
    }

    if (item?.nivel) {
      const level = document.createElement("p");
      level.className = "schedule-item__detail";
      level.textContent = `Nível: ${item.nivel}`;
      card.append(level);
    }

    scheduleList.append(card);
  });
}

function createHistoryMetric(label, value) {
  const metric = document.createElement("div");
  const name = document.createElement("span");
  const content = document.createElement("strong");

  metric.className = "history-metric";
  name.textContent = label;
  content.textContent = valueOrDash(value);
  metric.append(name, content);
  return metric;
}

function renderHistory(items) {
  historyList.replaceChildren();

  if (!Array.isArray(items) || items.length === 0) {
    historyList.append(createEmptyState("☷", "Nenhum registro de ponto ainda."));
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    const header = document.createElement("div");
    const date = document.createElement("h3");
    const status = document.createElement("span");
    const metrics = document.createElement("div");

    card.className = "history-item";
    header.className = "history-item__header";
    date.textContent = valueOrDash(item?.data || item?.dataKey);
    status.className = "history-item__status";
    status.textContent = valueOrDash(item?.situacao);
    header.append(date, status);

    metrics.className = "history-metrics";
    metrics.append(
      createHistoryMetric("Trabalhado", item?.trabalhado),
      createHistoryMetric("TEIJI", item?.teiji),
      createHistoryMetric("ZANGYO", item?.zangyo)
    );
    card.append(header, metrics);

    if (item?.entradaAplicada || item?.saidaAplicada) {
      const applied = document.createElement("p");
      applied.className = "history-item__times";
      applied.textContent = `Aplicado: ${valueOrDash(item.entradaAplicada)} – ${valueOrDash(item.saidaAplicada)}`;
      card.append(applied);
    }

    const realDiffers =
      (item?.entradaReal && item.entradaReal !== item.entradaAplicada) ||
      (item?.saidaReal && item.saidaReal !== item.saidaAplicada);

    if (realDiffers) {
      const real = document.createElement("p");
      real.className = "history-item__real";
      real.textContent = `Horário real: ${valueOrDash(item.entradaReal)} – ${valueOrDash(item.saidaReal)}`;
      card.append(real);
    }

    historyList.append(card);
  });
}

async function loadDashboard(token) {
  const requestId = ++dashboardRequestId;
  setDashboardLoading();

  try {
    const result = await postToApi("dashboard", { token });
    if (requestId !== dashboardRequestId) return;

    if (!result?.ok) {
      expireSession();
      return;
    }

    renderDashboard(result);
  } catch {
    if (requestId !== dashboardRequestId) return;
    dashboardMessage.className = "message dashboard-message is-error";
    dashboardMessage.textContent = "Não foi possível carregar os dados. Tente novamente.";
  }
}

function renderDashboard(result) {
  if (result?.usuario) applyUser(result.usuario);
  renderToday(result?.hoje);
  renderSchedule(result?.escalaHoje);
  renderHistory(result?.historico);
  dashboardMessage.textContent = "";
}

function showDashboard(usuario) {
  applyUser(usuario);
  publicViews.forEach((view) => { view.hidden = true; });
  dashboardView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLogin() {
  clearUser();
  showOnlyPublicView(loginView);
}

function setLoginLoading(isLoading) {
  isAuthenticating = isLoading;
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? "Entrando..." : "Entrar";
}

function goToLogin(prefillUser = "") {
  inviteToken = null;
  recoveryToken = null;
  acceptedInviteUser = "";
  acceptInviteForm.reset();
  resetPasswordForm.reset();
  if (prefillUser) loginInput.value = prefillUser;
  showLogin();
}

forgotPasswordButton.addEventListener("click", () => {
  forgotPasswordForm.reset();
  forgotPasswordMessage.textContent = "";
  forgotPasswordMessage.className = "message";
  showOnlyPublicView(forgotPasswordView);
});

backToLoginFromRecovery.addEventListener("click", () => goToLogin());

forgotPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isRequestingRecovery) return;
  isRequestingRecovery = true;
  sendRecoveryButton.disabled = true;
  sendRecoveryButton.textContent = "Enviando...";
  forgotPasswordMessage.className = "message";
  forgotPasswordMessage.textContent = "Enviando link...";
  try {
    const result = await postToApi("senha_solicitar", { email: recoveryEmail.value });
    const message = typeof result?.message === "string" ? result.message : result?.error;
    forgotPasswordMessage.className = result?.ok ? "message is-success" : "message is-error";
    forgotPasswordMessage.textContent = typeof message === "string" ? message : NETWORK_ERROR_MESSAGE;
  } catch {
    forgotPasswordMessage.className = "message is-error";
    forgotPasswordMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    isRequestingRecovery = false;
    sendRecoveryButton.disabled = false;
    sendRecoveryButton.textContent = "Enviar link";
  }
});

async function startInviteFlow(token) {
  inviteToken = token;
  inviteInfo.hidden = true;
  acceptInviteForm.hidden = true;
  inviteToLoginButton.hidden = true;
  inviteMessage.className = "message";
  inviteMessage.textContent = "Validando convite...";
  showOnlyPublicView(inviteView);
  try {
    const result = await postToApi("convite_info", { tokenConvite: token });
    if (inviteToken !== token) return;
    if (!result?.ok) {
      inviteMessage.className = "message is-error";
      inviteMessage.textContent = typeof result?.error === "string" ? result.error : "Convite inválido.";
      return;
    }
    const info = result.convite || result;
    inviteName.textContent = valueOrDash(info.nome);
    inviteEmail.textContent = valueOrDash(info.email);
    inviteProfile.textContent = valueOrDash(info.perfil);
    acceptedInviteUser = "";
    inviteInfo.hidden = false;
    acceptInviteForm.hidden = false;
    inviteMessage.textContent = "";
  } catch {
    if (inviteToken !== token) return;
    inviteMessage.className = "message is-error";
    inviteMessage.textContent = NETWORK_ERROR_MESSAGE;
  }
}

acceptInviteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isAcceptingInvite || !inviteToken) return;
  isAcceptingInvite = true;
  acceptInviteButton.disabled = true;
  acceptInviteButton.textContent = "Criando sua conta...";
  inviteMessage.className = "message";
  inviteMessage.textContent = "Criando sua conta...";
  const token = inviteToken;
  const chosenUsername = inviteUsername.value.trim();
  try {
    const result = await postToApi("convite_aceitar", {
      tokenConvite: token,
      usuario: chosenUsername,
      senha: invitePassword.value,
      confirmacao: inviteConfirmation.value
    });
    if (inviteToken !== token) return;
    if (!result?.ok) {
      inviteMessage.className = "message is-error";
      inviteMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível criar a conta.";
      return;
    }
    inviteToken = null;
    acceptedInviteUser = chosenUsername;
    invitePassword.value = "";
    inviteConfirmation.value = "";
    acceptInviteForm.hidden = true;
    inviteMessage.className = "message is-success";
    inviteMessage.textContent = "Conta criada com sucesso.";
    inviteToLoginButton.hidden = false;
  } catch {
    inviteMessage.className = "message is-error";
    inviteMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    isAcceptingInvite = false;
    acceptInviteButton.disabled = false;
    acceptInviteButton.textContent = "Criar minha conta";
  }
});

inviteToLoginButton.addEventListener("click", () => goToLogin(acceptedInviteUser));

resetPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isResettingPassword || !recoveryToken) return;
  isResettingPassword = true;
  resetPasswordButton.disabled = true;
  resetPasswordButton.textContent = "Alterando senha...";
  resetPasswordMessage.className = "message";
  resetPasswordMessage.textContent = "Alterando senha...";
  const token = recoveryToken;
  try {
    const result = await postToApi("senha_redefinir", { tokenRecuperacao: token, novaSenha: newPassword.value, confirmacao: newPasswordConfirmation.value });
    if (recoveryToken !== token) return;
    if (!result?.ok) {
      resetPasswordMessage.className = "message is-error";
      resetPasswordMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível alterar a senha.";
      return;
    }
    recoveryToken = null;
    resetPasswordForm.reset();
    resetPasswordButton.hidden = true;
    resetPasswordMessage.className = "message is-success";
    resetPasswordMessage.textContent = "Senha alterada com sucesso.";
    resetToLoginButton.hidden = false;
  } catch {
    resetPasswordMessage.className = "message is-error";
    resetPasswordMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    isResettingPassword = false;
    resetPasswordButton.disabled = false;
    resetPasswordButton.textContent = "Salvar nova senha";
  }
});

resetToLoginButton.addEventListener("click", () => {
  resetPasswordButton.hidden = false;
  resetToLoginButton.hidden = true;
  goToLogin();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isAuthenticating) return;

  setLoginLoading(true);
  loginMessage.className = "message";
  loginMessage.textContent = "Entrando...";

  try {
    const result = await postToApi("login", {
      login: loginInput.value,
      pin: pinInput.value
    });

    if (!result?.ok) {
      loginMessage.className = "message is-error";
      loginMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível entrar.";
      return;
    }

    if (typeof result.token !== "string" || !result.usuario) {
      throw new Error("INVALID_RESPONSE");
    }

    sessionStorage.setItem(TOKEN_KEY, result.token);
    pinInput.value = "";
    loginMessage.textContent = "";
    showDashboard(result.usuario);
    if (result.dashboard) {
      renderDashboard(result.dashboard);
    } else {
      await loadDashboard(result.token);
    }
  } catch {
    loginMessage.className = "message is-error";
    loginMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    setLoginLoading(false);
  }
});

logoutButton.addEventListener("click", async () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  dashboardRequestId += 1;
  logoutButton.disabled = true;

  try {
    if (token) await postToApi("logout", { token });
  } catch {
    // A limpeza local deve acontecer mesmo se o backend estiver indisponível.
  } finally {
    sessionStorage.removeItem(TOKEN_KEY);
    pinInput.value = "";
    loginForm.reset();
    loginMessage.textContent = "";
    logoutButton.disabled = false;
    showLogin();
  }
});

async function restoreSession() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return;

  loginButton.disabled = true;
  loginMessage.className = "message";
  loginMessage.textContent = "Carregando seus dados...";

  try {
    const result = await postToApi("dashboard", { token });

    if (!result?.ok || !result.usuario) {
      sessionStorage.removeItem(TOKEN_KEY);
      loginMessage.className = "message is-error";
      loginMessage.textContent = typeof result?.error === "string" ? result.error : "Sua sessão expirou. Entre novamente.";
      return;
    }

    loginMessage.textContent = "";
    showDashboard(result.usuario);
    renderDashboard(result);
  } catch {
    loginMessage.className = "message is-error";
    loginMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    loginButton.disabled = false;
  }
}

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isRegistering) return;

    actionButtons.forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });

    selectedAction = button.dataset.action;
    selectedActionLabel = button.dataset.label;
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
    readQrButton.disabled = false;
    scanStatus.className = "message";
    scanStatus.textContent = `Ação selecionada: ${selectedActionLabel}. Agora leia o QR.`;
    scanResult.hidden = true;
  });
});

async function openScanner() {
  if (isRegistering || isLoadingScanner) return;

  if (!selectedAction) {
    scanStatus.className = "message is-error";
    scanStatus.textContent = "Escolha uma ação antes de abrir a câmera.";
    return;
  }

  isLoadingScanner = true;
  readQrButton.disabled = true;
  scanStatus.className = "message";
  scanStatus.textContent = "Carregando leitor de QR...";

  try {
    await loadScriptOnce(ZXING_URL, "ZXingBrowser");
    scannerModal.hidden = false;
    document.body.classList.add("modal-open");
    cameraAction.textContent = `Ação escolhida: ${selectedActionLabel}`;
    cameraStatus.className = "message message--light";
    cameraStatus.textContent = "Abrindo câmera e procurando QR…";
    scanStatus.textContent = `Ação selecionada: ${selectedActionLabel}. Aponte a câmera para o QR.`;
    startScanner();
  } catch {
    scanStatus.className = "message is-error";
    scanStatus.textContent = "Não foi possível carregar o leitor de QR. Tente novamente.";
    readQrButton.disabled = false;
  } finally {
    isLoadingScanner = false;
  }
}

async function startScanner() {
  try {
    if (!window.ZXingBrowser) {
      throw new Error("Não foi possível carregar o leitor de QR.");
    }

    stopScannerStream();
    const reader = new ZXingBrowser.BrowserQRCodeReader();

    scannerControls = await reader.decodeFromConstraints(
      {
        video: { facingMode: { ideal: "environment" } },
        audio: false
      },
      video,
      (result) => {
        if (result) {
          completeScan(result.getText());
        }
      }
    );
  } catch (error) {
    cameraStatus.className = "message message--light is-error";
    cameraStatus.textContent = `Não foi possível abrir a câmera: ${error.message}`;
  }
}

function stopScannerStream() {
  if (scannerControls) {
    scannerControls.stop();
    scannerControls = null;
  }

  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }
}

function stopScanner() {
  stopScannerStream();
  scannerModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function completeScan(qrText) {
  if (isRegistering) return;

  const actionAtScan = selectedAction;
  stopScanner();
  registerPoint(actionAtScan, qrText);
}

function clearSelectedAction() {
  selectedAction = "";
  selectedActionLabel = "";
  actionButtons.forEach((button) => {
    button.classList.remove("is-selected");
    button.setAttribute("aria-pressed", "false");
  });
  readQrButton.disabled = true;
}

function formatRegisteredAction(action) {
  const labels = {
    ENTRADA: "Entrada",
    INTERVALO_INICIO: "Início intervalo",
    INTERVALO_FIM: "Fim intervalo",
    SAIDA: "Saída"
  };
  return labels[action] || valueOrDash(action);
}

async function registerPoint(action, qrPayload) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    expireSession();
    return;
  }

  isRegistering = true;
  readQrButton.disabled = true;
  actionButtons.forEach((button) => { button.disabled = true; });
  scanResult.hidden = true;
  scanStatus.className = "message";
  scanStatus.textContent = "Registrando ponto...";

  try {
    const result = await postToApi("registrar", {
      token,
      acao: action,
      qr: qrPayload
    });
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;

    if (isInvalidSession(result)) {
      expireSession();
      return;
    }

    if (!result?.ok) {
      scanStatus.className = "message is-error";
      scanStatus.textContent = typeof result?.error === "string" ? result.error : "Não foi possível registrar o ponto.";
      return;
    }

    const registro = result.registro || {};
    resultAction.textContent = formatRegisteredAction(registro.acao);
    resultRealTime.textContent = valueOrDash(registro.horaReal);
    resultAppliedTime.textContent = valueOrDash(registro.horaAplicada);
    resultSituation.textContent = valueOrDash(registro.situacao);
    scanResult.hidden = false;
    scanStatus.className = "message is-success";
    scanStatus.textContent = "Ponto registrado com sucesso.";
    clearSelectedAction();
    scanResult.scrollIntoView({ behavior: "smooth", block: "center" });
    if (result.dashboard) {
      renderDashboard(result.dashboard);
    } else {
      await loadDashboard(token);
    }
  } catch {
    scanStatus.className = "message is-error";
    scanStatus.textContent = "Não foi possível registrar o ponto. Tente novamente.";
  } finally {
    isRegistering = false;
    actionButtons.forEach((button) => { button.disabled = false; });
    if (selectedAction) readQrButton.disabled = false;
  }
}

readQrButton.addEventListener("click", openScanner);
closeScannerButton.addEventListener("click", stopScanner);
scannerModal.querySelector("[data-close-scanner]").addEventListener("click", stopScanner);

function closeCreateInvite() {
  if (isCreatingEmployeeInvites) return;
  eligibleEmployees = [];
  eligibleEmployeesList.replaceChildren();
  employeeInviteResults.replaceChildren();
  employeeInviteResults.hidden = true;
  inviteModal.hidden = true;
  if (scannerModal.hidden && manageInvitesModal.hidden) document.body.classList.remove("modal-open");
}

function openCreateInvite() {
  if (currentUserProfile !== "ADMIN") return;
  eligibleEmployees = [];
  employeeInviteResults.replaceChildren();
  employeeInviteResults.hidden = true;
  employeeInvitesMessage.textContent = "";
  employeeInvitesMessage.className = "message";
  inviteModal.hidden = false;
  document.body.classList.add("modal-open");
  loadEligibleEmployees();
}

openInviteModalButton.addEventListener("click", openCreateInvite);
closeInviteModal.addEventListener("click", () => closeCreateInvite());
inviteModal.querySelector("[data-close-invite]").addEventListener("click", () => closeCreateInvite());

function createEmployeeInfo(label, value) {
  const item = document.createElement("span");
  item.textContent = `${label}: ${valueOrDash(value)}`;
  return item;
}

function renderEligibleEmployees() {
  eligibleEmployeesList.replaceChildren();
  if (eligibleEmployees.length === 0) {
    eligibleEmployeesList.append(createEmptyState("◇", "Nenhum funcionário encontrado no Cadastro."));
    return;
  }
  eligibleEmployees.forEach((employee) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const content = document.createElement("span");
    const name = document.createElement("strong");
    const details = document.createElement("span");
    const status = document.createElement("span");
    label.className = `eligible-employee${employee?.elegivel ? "" : " is-disabled"}`;
    checkbox.type = "checkbox";
    checkbox.className = "eligible-employee__checkbox";
    checkbox.value = String(employee?.id || "");
    checkbox.disabled = !employee?.elegivel || !checkbox.value;
    content.className = "eligible-employee__content";
    name.textContent = valueOrDash(employee?.nomeCompleto || employee?.nome);
    details.className = "eligible-employee__details";
    details.append(
      createEmployeeInfo("Email", employee?.email || "Não cadastrado"),
      createEmployeeInfo("Nível", employee?.nivel),
      createEmployeeInfo("Transporte/dia", employee?.transporteDia)
    );
    status.className = `eligible-employee__status${employee?.elegivel ? " is-eligible" : ""}`;
    status.textContent = valueOrDash(employee?.situacao);
    content.append(name, details, status);
    label.append(checkbox, content);
    eligibleEmployeesList.append(label);
  });
}

async function loadEligibleEmployees(preserveResults = false) {
  if (isLoadingEligibleEmployees) return;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    closeCreateInvite();
    expireSession();
    return;
  }
  isLoadingEligibleEmployees = true;
  if (!preserveResults) {
    employeeInvitesMessage.className = "message";
    employeeInvitesMessage.textContent = "Carregando funcionários...";
  }
  eligibleEmployeesList.replaceChildren();
  if (!preserveResults) {
    employeeInviteResults.replaceChildren();
    employeeInviteResults.hidden = true;
  }
  try {
    const result = await postToApi("funcionarios_convites_listar", { token });
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;
    if (isInvalidSession(result)) {
      closeCreateInvite();
      expireSession();
      return;
    }
    if (!result?.ok || !Array.isArray(result.funcionarios)) {
      employeeInvitesMessage.className = "message is-error";
      employeeInvitesMessage.textContent = "Não foi possível carregar os funcionários.";
      return;
    }
    eligibleEmployees = result.funcionarios;
    renderEligibleEmployees();
    if (!preserveResults) employeeInvitesMessage.textContent = "";
  } catch {
    employeeInvitesMessage.className = "message is-error";
    employeeInvitesMessage.textContent = "Não foi possível carregar os funcionários.";
  } finally {
    isLoadingEligibleEmployees = false;
  }
}

function selectedEmployeeIds() {
  return Array.from(eligibleEmployeesList.querySelectorAll(".eligible-employee__checkbox:checked"), (checkbox) => checkbox.value);
}

function renderEmployeeInviteResults(results, emailRequested) {
  employeeInviteResults.replaceChildren();
  const title = document.createElement("h3");
  title.textContent = "Resultado dos convites";
  employeeInviteResults.append(title);
  results.forEach((result) => {
    const card = document.createElement("article");
    const name = document.createElement("strong");
    const status = document.createElement("span");
    name.textContent = valueOrDash(result?.nome || result?.funcionarioId);
    status.textContent = valueOrDash(result?.status);
    card.append(name, status);
    if (typeof result?.linkConvite === "string" && result.linkConvite) {
      const link = document.createElement("span");
      link.className = "employee-invite-result__link";
      link.textContent = result.linkConvite;
      card.append(link);
    }
    if (emailRequested && result?.emailEnviado) {
      const sent = document.createElement("span");
      sent.textContent = "Enviado por e-mail.";
      card.append(sent);
    }
    employeeInviteResults.append(card);
  });
  employeeInviteResults.hidden = false;
}

async function createEmployeeInvites(sendEmail) {
  if (isCreatingEmployeeInvites) return;
  const ids = selectedEmployeeIds();
  if (ids.length === 0) {
    employeeInvitesMessage.className = "message is-error";
    employeeInvitesMessage.textContent = "Selecione ao menos um funcionário elegível.";
    return;
  }
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    closeCreateInvite();
    expireSession();
    return;
  }
  isCreatingEmployeeInvites = true;
  createEmployeeInvitesButton.disabled = true;
  sendEmployeeInvitesButton.disabled = true;
  selectAllEligibleButton.disabled = true;
  const activeButton = sendEmail ? sendEmployeeInvitesButton : createEmployeeInvitesButton;
  const originalText = activeButton.textContent;
  activeButton.textContent = sendEmail ? "Enviando..." : "Criando...";
  employeeInvitesMessage.className = "message";
  employeeInvitesMessage.textContent = sendEmail ? "Criando e enviando convites..." : "Criando convites...";
  try {
    const result = await postToApi("funcionarios_convites_criar", {
      token,
      idsFuncionarios: JSON.stringify(ids),
      enviarEmail: sendEmail ? "true" : "false"
    });
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;
    if (isInvalidSession(result)) {
      isCreatingEmployeeInvites = false;
      closeCreateInvite();
      expireSession();
      return;
    }
    if (!result?.ok || !Array.isArray(result.resultados)) {
      employeeInvitesMessage.className = "message is-error";
      employeeInvitesMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível criar os convites.";
      return;
    }
    renderEmployeeInviteResults(result.resultados, sendEmail);
    const links = result.resultados.map((item) => typeof item?.linkConvite === "string" ? item.linkConvite : "").filter(Boolean);
    let copied = false;
    if (!sendEmail && links.length > 0 && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(links.join("\n"));
        copied = true;
      } catch {
        copied = false;
      }
    }
    employeeInvitesMessage.className = "message is-success";
    employeeInvitesMessage.textContent = sendEmail
      ? "Processamento concluído. Confira o resultado abaixo."
      : copied ? "Convites criados e links copiados." : "Convites criados. Copie os links exibidos abaixo.";
    await loadEligibleEmployees(true);
  } catch {
    employeeInvitesMessage.className = "message is-error";
    employeeInvitesMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    isCreatingEmployeeInvites = false;
    createEmployeeInvitesButton.disabled = false;
    sendEmployeeInvitesButton.disabled = false;
    selectAllEligibleButton.disabled = false;
    activeButton.textContent = originalText;
  }
}

selectAllEligibleButton.addEventListener("click", () => {
  eligibleEmployeesList.querySelectorAll(".eligible-employee__checkbox:not(:disabled)").forEach((checkbox) => {
    checkbox.checked = true;
  });
});
createEmployeeInvitesButton.addEventListener("click", () => createEmployeeInvites(false));
sendEmployeeInvitesButton.addEventListener("click", () => createEmployeeInvites(true));

function closeInvitesManager(force = false) {
  if ((isCancellingInvite || isResendingInvite) && !force) return;
  pendingCancelInviteId = null;
  loadedInvites = [];
  invitesList.replaceChildren();
  cancelInviteConfirmation.hidden = true;
  invitesManagerContent.hidden = false;
  manageInvitesModal.hidden = true;
  if (scannerModal.hidden && inviteModal.hidden) document.body.classList.remove("modal-open");
}

function normalizeInviteStatus(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return ["pendente", "usado", "expirado", "cancelado"].includes(normalized) ? normalized : "";
}

function createInviteDetail(label, value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = String(value);
  row.append(term, description);
  return row;
}

function inviteEmptyMessage(filter) {
  const messages = {
    todos: "Nenhum convite encontrado.",
    pendente: "Nenhum convite pendente.",
    usado: "Nenhum convite usado.",
    expirado: "Nenhum convite expirado.",
    cancelado: "Nenhum convite cancelado."
  };
  return messages[filter] || messages.todos;
}

function updateInviteFilterCounts() {
  const counts = { todos: loadedInvites.length, pendente: 0, usado: 0, expirado: 0, cancelado: 0 };
  loadedInvites.forEach((invite) => {
    const status = normalizeInviteStatus(invite?.status);
    if (status) counts[status] += 1;
  });
  Object.entries(counts).forEach(([filter, count]) => {
    const element = inviteFilters.querySelector(`[data-filter-count="${filter}"]`);
    if (element) element.textContent = `(${count})`;
  });
}

function renderInvites() {
  invitesList.replaceChildren();
  inviteFilterButtons.forEach((button) => {
    const active = button.dataset.inviteFilter === activeInviteFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const visibleInvites = activeInviteFilter === "todos"
    ? loadedInvites
    : loadedInvites.filter((invite) => normalizeInviteStatus(invite?.status) === activeInviteFilter);

  if (visibleInvites.length === 0) {
    invitesList.append(createEmptyState("◇", inviteEmptyMessage(activeInviteFilter)));
    return;
  }

  visibleInvites.forEach((invite) => {
    const status = normalizeInviteStatus(invite?.status);
    const card = document.createElement("article");
    const header = document.createElement("div");
    const title = document.createElement("h3");
    const badge = document.createElement("span");
    const details = document.createElement("dl");

    card.className = "invite-card";
    header.className = "invite-card__header";
    title.textContent = valueOrDash(invite?.nome);
    badge.className = `invite-status invite-status--${status || "desconhecido"}`;
    badge.textContent = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Desconhecido";
    header.append(title, badge);

    details.className = "invite-card__details";
    [
      createInviteDetail("Usuário", invite?.usuario),
      createInviteDetail("Email", invite?.email),
      createInviteDetail("Perfil", invite?.perfil),
      createInviteDetail("Criado em", invite?.criadoEm),
      createInviteDetail("Expira em", invite?.expiraEm),
      status === "cancelado" ? createInviteDetail("Cancelado em", invite?.canceladoEm) : null,
      status === "cancelado" ? createInviteDetail("Cancelado por", invite?.canceladoPorNome) : null
    ].filter(Boolean).forEach((row) => details.append(row));
    card.append(header, details);

    if (status === "pendente" && invite?.id !== null && invite?.id !== undefined && String(invite.id).trim() !== "") {
      const actions = document.createElement("div");
      const cancelButton = document.createElement("button");
      cancelButton.className = "button button--danger invite-card__cancel";
      cancelButton.type = "button";
      cancelButton.dataset.cancelInviteId = String(invite.id);
      cancelButton.textContent = "Cancelar convite";
      actions.className = "invite-card__actions";
      actions.append(cancelButton);
      if (typeof invite?.funcionarioId === "string" && invite.funcionarioId.trim()) {
        const resendButton = document.createElement("button");
        resendButton.className = "button button--secondary invite-card__resend";
        resendButton.type = "button";
        resendButton.dataset.resendInviteId = String(invite.id);
        resendButton.textContent = "Reenviar convite";
        actions.append(resendButton);
      }
      card.append(actions);
    }
    invitesList.append(card);
  });
}

async function loadInvites(successMessage = "") {
  if (isLoadingInvites) return;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    closeInvitesManager();
    expireSession();
    return;
  }
  isLoadingInvites = true;
  invitesMessage.className = "message";
  invitesMessage.textContent = "Carregando convites...";
  invitesList.replaceChildren();
  try {
    const result = await postToApi("convites_listar", { token });
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;
    if (isInvalidSession(result)) {
      closeInvitesManager();
      expireSession();
      return;
    }
    if (!result?.ok || !Array.isArray(result.convites)) {
      invitesMessage.className = "message is-error";
      invitesMessage.textContent = "Não foi possível carregar os convites.";
      return;
    }
    loadedInvites = result.convites;
    updateInviteFilterCounts();
    renderInvites();
    invitesMessage.className = successMessage ? "message is-success" : "message";
    invitesMessage.textContent = successMessage;
  } catch {
    invitesMessage.className = "message is-error";
    invitesMessage.textContent = "Não foi possível carregar os convites.";
  } finally {
    isLoadingInvites = false;
  }
}

function openInvitesManager() {
  if (currentUserProfile !== "ADMIN") return;
  activeInviteFilter = "pendente";
  pendingCancelInviteId = null;
  loadedInvites = [];
  updateInviteFilterCounts();
  renderInvites();
  cancelInviteConfirmation.hidden = true;
  invitesManagerContent.hidden = false;
  manageInvitesModal.hidden = false;
  document.body.classList.add("modal-open");
  loadInvites();
}

function showCancelInviteConfirmation(inviteId) {
  pendingCancelInviteId = inviteId;
  cancelInviteMessage.textContent = "";
  cancelInviteMessage.className = "message";
  invitesManagerContent.hidden = true;
  cancelInviteConfirmation.hidden = false;
}

function hideCancelInviteConfirmation() {
  if (isCancellingInvite) return;
  pendingCancelInviteId = null;
  cancelInviteConfirmation.hidden = true;
  invitesManagerContent.hidden = false;
}

manageInvitesButton.addEventListener("click", openInvitesManager);
closeManageInvitesButton.addEventListener("click", () => closeInvitesManager());
manageInvitesModal.querySelector("[data-close-manage-invites]").addEventListener("click", () => closeInvitesManager());
backFromCancelInviteButton.addEventListener("click", hideCancelInviteConfirmation);

inviteFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeInviteFilter = button.dataset.inviteFilter;
    renderInvites();
  });
});

invitesList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cancel-invite-id]");
  if (!button) return;
  showCancelInviteConfirmation(button.dataset.cancelInviteId);
});

invitesList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-resend-invite-id]");
  if (!button || isResendingInvite) return;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    closeInvitesManager();
    expireSession();
    return;
  }
  isResendingInvite = true;
  button.disabled = true;
  button.textContent = "Reenviando...";
  invitesMessage.className = "message";
  invitesMessage.textContent = "Reenviando convite...";
  try {
    const result = await postToApi("funcionario_convite_reenviar", {
      token,
      conviteId: button.dataset.resendInviteId,
      enviarEmail: "true"
    });
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;
    if (isInvalidSession(result)) {
      closeInvitesManager();
      expireSession();
      return;
    }
    if (!result?.ok) {
      invitesMessage.className = "message is-error";
      invitesMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível reenviar o convite.";
      return;
    }
    await loadInvites("Convite reenviado com sucesso.");
  } catch {
    invitesMessage.className = "message is-error";
    invitesMessage.textContent = "Não foi possível reenviar o convite.";
  } finally {
    isResendingInvite = false;
    if (button.isConnected) {
      button.disabled = false;
      button.textContent = "Reenviar convite";
    }
  }
});

confirmCancelInviteButton.addEventListener("click", async () => {
  if (isCancellingInvite || !pendingCancelInviteId) return;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    closeInvitesManager();
    expireSession();
    return;
  }
  isCancellingInvite = true;
  confirmCancelInviteButton.disabled = true;
  confirmCancelInviteButton.textContent = "Cancelando...";
  cancelInviteMessage.className = "message";
  cancelInviteMessage.textContent = "Cancelando...";
  try {
    const result = await postToApi("convite_cancelar", { token, conviteId: pendingCancelInviteId });
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;
    if (isInvalidSession(result)) {
      closeInvitesManager();
      expireSession();
      return;
    }
    if (!result?.ok) {
      cancelInviteMessage.className = "message is-error";
      cancelInviteMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível cancelar o convite.";
      return;
    }
    pendingCancelInviteId = null;
    cancelInviteConfirmation.hidden = true;
    invitesManagerContent.hidden = false;
    await loadInvites("Convite cancelado com sucesso.");
  } catch {
    cancelInviteMessage.className = "message is-error";
    cancelInviteMessage.textContent = "Não foi possível cancelar o convite.";
  } finally {
    isCancellingInvite = false;
    confirmCancelInviteButton.disabled = false;
    confirmCancelInviteButton.textContent = "Cancelar convite";
  }
});

generateQrButton.addEventListener("click", async () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    expireSession();
    return;
  }

  generateQrButton.disabled = true;
  generateQrButton.textContent = "Gerando QR...";
  managerMessage.className = "message";
  managerMessage.textContent = "Gerando QR...";

  try {
    const [result] = await Promise.all([
      postToApi("qr", { token }),
      loadScriptOnce(QRCODE_URL, "QRCode")
    ]);
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;

    if (isInvalidSession(result)) {
      expireSession();
      return;
    }

    if (!result?.ok) {
      managerMessage.className = "message is-error";
      managerMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível gerar o QR.";
      return;
    }

    if (typeof result.qr !== "string" || !window.QRCode) {
      managerMessage.className = "message is-error";
      managerMessage.textContent = "Não foi possível gerar o QR.";
      return;
    }

    clearManagerQr();
    managerQrEmpty.hidden = true;
    new QRCode(managerQrCode, {
      text: result.qr,
      width: 220,
      height: 220,
      correctLevel: QRCode.CorrectLevel.M
    });
    managerQrCreated.textContent = valueOrDash(result.criadoEm);
    managerQrExpires.textContent = valueOrDash(result.expiraEm);
    managerQrMeta.hidden = false;

    const validityMinutes = Number(result.validadeMinutos);
    const validMinutes = Number.isFinite(validityMinutes) && validityMinutes > 0 ? validityMinutes : 5;
    managerMessage.className = "message is-success";
    managerMessage.textContent = `QR válido por ${validMinutes} minutos.`;
    qrExpirationTimer = setTimeout(() => {
      managerMessage.className = "message is-error";
      managerMessage.textContent = "QR expirado — gere um novo.";
      qrExpirationTimer = null;
    }, validMinutes * 60 * 1000);
  } catch {
    managerMessage.className = "message is-error";
    managerMessage.textContent = "Não foi possível gerar o QR. Tente novamente.";
  } finally {
    generateQrButton.disabled = false;
    generateQrButton.textContent = "Gerar novo QR";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !scannerModal.hidden) stopScanner();
  if (event.key === "Escape" && !inviteModal.hidden) closeCreateInvite();
  if (event.key === "Escape" && !manageInvitesModal.hidden && !isCancellingInvite) closeInvitesManager();
});

window.addEventListener("pagehide", stopScannerStream);

async function initializeApp() {
  if (initialFlow.flow === "invite") {
    const token = initialFlow.token;
    initialFlow = { flow: "handled", token: null };
    await startInviteFlow(token);
    return;
  }
  if (initialFlow.flow === "recovery") {
    recoveryToken = initialFlow.token;
    initialFlow = { flow: "handled", token: null };
    resetPasswordForm.reset();
    resetPasswordButton.hidden = false;
    resetToLoginButton.hidden = true;
    resetPasswordMessage.textContent = "";
    showOnlyPublicView(resetPasswordView);
    return;
  }
  showLogin();
  await restoreSession();
}

initializeApp();
