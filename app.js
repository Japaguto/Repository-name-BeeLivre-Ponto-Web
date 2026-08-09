const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const openDemoButton = document.getElementById("openDemo");
const testPostButton = document.getElementById("testPostButton");
const postTestResponse = document.getElementById("postTestResponse");
const logoutButton = document.getElementById("logoutButton");
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

let selectedAction = "";
let scannerControls = null;

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLogin() {
  stopScanner();
  dashboardView.hidden = true;
  loginView.hidden = false;
  loginForm.reset();
  loginMessage.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginMessage.className = "message";
  loginMessage.textContent = "O backend ainda não está conectado. Nenhum dado foi enviado.";
});

openDemoButton.addEventListener("click", showDashboard);
logoutButton.addEventListener("click", showLogin);

testPostButton.addEventListener("click", async () => {
  const endpoint = "https://script.google.com/macros/s/AKfycbywRC0bJFYrUJdHwS1_7CdwoOO2Eso7Ad6wqAghowdxUhbFGdY6W5roi4l-N18V0rua_Q/exec?api=ping";

  testPostButton.disabled = true;
  postTestResponse.className = "message";
  postTestResponse.textContent = "Enviando teste POST…";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "teste=beelivre"
    });
    const responseText = await response.text();

    postTestResponse.className = response.ok ? "message is-success" : "message is-error";
    postTestResponse.textContent = `HTTP ${response.status}\n${responseText || "Resposta vazia."}`;
  } catch (error) {
    postTestResponse.className = "message is-error";
    postTestResponse.textContent = `Falha no teste POST: ${error.message}`;
  } finally {
    testPostButton.disabled = false;
  }
});

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
