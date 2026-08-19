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
const inviteUser = document.getElementById("inviteUser");
const inviteProfile = document.getElementById("inviteProfile");
const acceptInviteForm = document.getElementById("acceptInviteForm");
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
const createInviteForm = document.getElementById("createInviteForm");
const createInviteButton = document.getElementById("createInviteButton");
const sendInviteEmail = document.getElementById("sendInviteEmail");
const inviteResult = document.getElementById("inviteResult");
const createdInviteUser = document.getElementById("createdInviteUser");
const createdInviteEmail = document.getElementById("createdInviteEmail");
const createdInviteProfile = document.getElementById("createdInviteProfile");
const createdInviteExpiration = document.getElementById("createdInviteExpiration");
const inviteEmailStatus = document.getElementById("inviteEmailStatus");
const inviteLink = document.getElementById("inviteLink");
const copyInviteLinkButton = document.getElementById("copyInviteLinkButton");
const finishInviteButton = document.getElementById("finishInviteButton");
const createInviteMessage = document.getElementById("createInviteMessage");

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
let currentInviteLink = null;
let isAcceptingInvite = false;
let isRequestingRecovery = false;
let isResettingPassword = false;
let isCreatingInvite = false;

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

  userName.textContent = nome;
  userProfile.textContent = perfil ? `Perfil: ${perfil}` : "";
  managerArea.hidden = perfil !== "ADMIN" && perfil !== "RESPONSAVEL";
  adminUsersArea.hidden = perfil !== "ADMIN";
}

function clearUser() {
  userName.textContent = "";
  userProfile.textContent = "";
  managerArea.hidden = true;
  adminUsersArea.hidden = true;
  closeCreateInvite();
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
    inviteUser.textContent = valueOrDash(info.usuario);
    inviteProfile.textContent = valueOrDash(info.perfil);
    acceptedInviteUser = typeof info.usuario === "string" ? info.usuario : "";
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
  try {
    const result = await postToApi("convite_aceitar", { tokenConvite: token, senha: invitePassword.value, confirmacao: inviteConfirmation.value });
    if (inviteToken !== token) return;
    if (!result?.ok) {
      inviteMessage.className = "message is-error";
      inviteMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível criar a conta.";
      return;
    }
    inviteToken = null;
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
  currentInviteLink = null;
  inviteLink.textContent = "";
  inviteLink.hidden = true;
  inviteModal.hidden = true;
  if (scannerModal.hidden) document.body.classList.remove("modal-open");
}

function openCreateInvite() {
  createInviteForm.reset();
  sendInviteEmail.checked = true;
  createInviteForm.hidden = false;
  inviteResult.hidden = true;
  createInviteMessage.textContent = "";
  createInviteMessage.className = "message";
  currentInviteLink = null;
  inviteModal.hidden = false;
  document.body.classList.add("modal-open");
}

openInviteModalButton.addEventListener("click", openCreateInvite);
closeInviteModal.addEventListener("click", closeCreateInvite);
inviteModal.querySelector("[data-close-invite]").addEventListener("click", closeCreateInvite);
finishInviteButton.addEventListener("click", closeCreateInvite);

createInviteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isCreatingInvite) return;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    closeCreateInvite();
    expireSession();
    return;
  }
  isCreatingInvite = true;
  createInviteButton.disabled = true;
  createInviteButton.textContent = "Criando convite...";
  createInviteMessage.className = "message";
  createInviteMessage.textContent = "Criando convite...";
  const data = new FormData(createInviteForm);
  try {
    const result = await postToApi("convite_criar", {
      token,
      nome: data.get("nome"),
      usuario: data.get("usuario"),
      email: data.get("email"),
      perfil: data.get("perfil"),
      enviarEmail: sendInviteEmail.checked ? "true" : "false"
    });
    if (sessionStorage.getItem(TOKEN_KEY) !== token) return;
    if (isInvalidSession(result)) {
      closeCreateInvite();
      expireSession();
      return;
    }
    if (!result?.ok) {
      createInviteMessage.className = "message is-error";
      createInviteMessage.textContent = typeof result?.error === "string" ? result.error : "Não foi possível criar o convite.";
      return;
    }
    const convite = result.convite || result;
    createdInviteUser.textContent = valueOrDash(convite.usuario);
    createdInviteEmail.textContent = valueOrDash(convite.email);
    createdInviteProfile.textContent = valueOrDash(convite.perfil);
    createdInviteExpiration.textContent = valueOrDash(convite.expiraEm);
    inviteEmailStatus.textContent = sendInviteEmail.checked ? "Convite enviado por e-mail." : "";
    currentInviteLink = typeof convite.linkConvite === "string" ? convite.linkConvite : (typeof result.linkConvite === "string" ? result.linkConvite : null);
    copyInviteLinkButton.hidden = !currentInviteLink;
    createInviteForm.hidden = true;
    inviteResult.hidden = false;
    createInviteMessage.textContent = "";
  } catch {
    createInviteMessage.className = "message is-error";
    createInviteMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    isCreatingInvite = false;
    createInviteButton.disabled = false;
    createInviteButton.textContent = "Criar convite";
  }
});

copyInviteLinkButton.addEventListener("click", async () => {
  if (!currentInviteLink) return;
  try {
    await navigator.clipboard.writeText(currentInviteLink);
    createInviteMessage.className = "message is-success";
    createInviteMessage.textContent = "Link copiado.";
  } catch {
    inviteLink.textContent = currentInviteLink;
    inviteLink.hidden = false;
    createInviteMessage.className = "message is-error";
    createInviteMessage.textContent = "Não foi possível copiar automaticamente. Copie o link exibido.";
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
