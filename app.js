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
  } catch {
    loginMessage.className = "message is-error";
    loginMessage.textContent = NETWORK_ERROR_MESSAGE;
  } finally {
    setLoginLoading(false);
  }
});

logoutButton.addEventListener("click", async () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
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
