const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginInput = document.getElementById("login");
const pinInput = document.getElementById("pin");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
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
const resultQr = document.getElementById("resultQr");
const scannerModal = document.getElementById("scannerModal");
const closeScannerButton = document.getElementById("closeScanner");
const cameraAction = document.getElementById("cameraAction");
const cameraStatus = document.getElementById("cameraStatus");
const video = document.getElementById("camera");
const generateQrButton = document.getElementById("generateQrButton");
const managerMessage = document.getElementById("managerMessage");

const API_URL = "https://script.google.com/macros/s/AKfycbywRC0bJFYrUJdHwS1_7CdwoOO2Eso7Ad6wqAghowdxUhbFGdY6W5roi4l-N18V0rua_Q/exec";
const TOKEN_KEY = "beelivre_ponto_token";
const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao sistema. Tente novamente.";

let selectedAction = "";
let scannerControls = null;
let isAuthenticating = false;
let dashboardRequestId = 0;

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
}

function clearUser() {
  userName.textContent = "";
  userProfile.textContent = "";
  managerArea.hidden = true;
  managerMessage.textContent = "";
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
      sessionStorage.removeItem(TOKEN_KEY);
      showLogin();
      loginMessage.className = "message is-error";
      loginMessage.textContent = "Sua sessão expirou. Entre novamente.";
      return;
    }

    if (result.usuario) applyUser(result.usuario);
    renderToday(result.hoje);
    renderSchedule(result.escalaHoje);
    renderHistory(result.historico);
    dashboardMessage.textContent = "";
  } catch {
    if (requestId !== dashboardRequestId) return;
    dashboardMessage.className = "message dashboard-message is-error";
    dashboardMessage.textContent = "Não foi possível carregar os dados. Tente novamente.";
  }
}

function showDashboard(usuario) {
  applyUser(usuario);
  loginView.hidden = true;
  dashboardView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLogin() {
  stopScanner();
  clearUser();
  dashboardView.hidden = true;
  loginView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setLoginLoading(isLoading) {
  isAuthenticating = isLoading;
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? "Entrando..." : "Entrar";
}

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
    loadDashboard(result.token);
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
  loginMessage.textContent = "Validando sessão...";

  try {
    const result = await postToApi("session", { token });

    if (!result?.ok || !result.usuario) {
      sessionStorage.removeItem(TOKEN_KEY);
      loginMessage.className = "message is-error";
      loginMessage.textContent = typeof result?.error === "string" ? result.error : "Sua sessão expirou. Entre novamente.";
      return;
    }

    loginMessage.textContent = "";
    showDashboard(result.usuario);
    loadDashboard(token);
  } catch {
    loginMessage.className = "message is-error";
    loginMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    loginButton.disabled = false;
  }
}

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    actionButtons.forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });

    selectedAction = button.dataset.action;
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
    readQrButton.disabled = false;
    scanStatus.className = "message";
    scanStatus.textContent = `Ação selecionada: ${selectedAction}. Agora leia o QR.`;
    scanResult.hidden = true;
  });
});

function openScanner() {
  if (!selectedAction) {
    scanStatus.className = "message is-error";
    scanStatus.textContent = "Escolha uma ação antes de abrir a câmera.";
    return;
  }

  scannerModal.hidden = false;
  document.body.classList.add("modal-open");
  cameraAction.textContent = `Ação escolhida: ${selectedAction}`;
  cameraStatus.className = "message message--light";
  cameraStatus.textContent = "Abrindo câmera e procurando QR…";
  startScanner();
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
  const actionAtScan = selectedAction;
  stopScanner();
  resultAction.textContent = actionAtScan;
  resultQr.textContent = qrText;
  scanResult.hidden = false;
  scanStatus.className = "message is-success";
  scanStatus.textContent = "QR lido com sucesso. Nenhum ponto foi registrado.";
  scanResult.scrollIntoView({ behavior: "smooth", block: "center" });
}

readQrButton.addEventListener("click", openScanner);
closeScannerButton.addEventListener("click", stopScanner);
scannerModal.querySelector("[data-close-scanner]").addEventListener("click", stopScanner);

generateQrButton.addEventListener("click", () => {
  managerMessage.className = "message";
  managerMessage.textContent = "A geração do QR será ativada quando o backend estiver conectado.";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !scannerModal.hidden) stopScanner();
});

window.addEventListener("pagehide", stopScannerStream);

restoreSession();
