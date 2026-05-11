/** Override from the console or a small inline script: window.HAWN_API_BASE = 'http://127.0.0.1:8000' */
const API_BASE = (window.HAWN_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

/**
 * Same content as first-aid-guidance.json. Used when fetch() fails (e.g. opening index.html as file://
 * or wrong server cwd). HTTP deployments still prefer loading the JSON file when available.
 */
const FIRST_AID_GUIDANCE_EMBEDDED = JSON.parse(`{"first_degree":{"title":"First-Degree Burns (Minor Burns)","description":"","do":["Cool the burn under cool running tap water for 10-15 minutes to help relieve pain and soothe the skin.","Remove accessories such as rings, watches, belts, shoes, or tight clothing gently and quickly before swelling begins.","Cover the burned area with a moist bandage or a clean cool cloth to reduce the risk of infection.","Take pain relief medication if necessary to help reduce discomfort.","Seek medical help immediately if the burn is severe, covers a large area, or if signs of infection appear such as increased pain, redness, or swelling."],"doNot":["Do not touch or break burn blisters.","Do not apply ointments, butter, toothpaste, or other home remedies to the burn.","Do not apply ice directly to the burned area."]},"second_degree":{"title":"Second-Degree Burns","description":"","do":["Protect the injured person from further harm.","Remove jewelry, belts, and tight items, especially around burned areas such as the neck.","Take pain relief medication if necessary to reduce pain.","Cover the burn with a moist bandage or a clean cool cloth.","Cover opened blisters with a dry sterile dressing."],"doNot":["Do not remove burned clothing stuck to the skin.","Do not cover the burn with adhesive dressings.","Do not place large burned areas in cold water to avoid shock.","Do not apply ice directly to the burned area.","Do not apply ointments, butter, toothpaste, or other remedies to the burn.","Do not touch or break burn blisters.","Do not place loose cotton directly on the burned area as it may irritate the skin."]},"third_degree":{"title":"Third-Degree Burns","description":"Third-degree burns are considered the most severe type of burns, affecting all layers of the skin and possibly reaching fat and muscles.","do":["Call emergency medical services immediately and follow these steps until help arrives.","Check the victim's vital signs such as breathing.","Protect the injured person from further harm by moving them away from flames, smoke, or heat sources.","Raise the injured area above heart level if possible.","Cover the burn with a moist bandage or a clean cool cloth."],"doNot":["Do not remove burned clothing stuck to the skin.","Do not place large burned areas in cold water to avoid shock, which can cause a sudden drop in body temperature.","Do not cover the burn with adhesive dressings.","Do not apply ointments, butter, toothpaste, or other remedies to the burn.","Do not place loose cotton directly on the burned area as it may irritate the wound."]}}`);

/** API may return confidence as number or string; store internally as 0–1. */
function normalizeConfidence(raw) {
  if (raw === undefined || raw === null || raw === "") return NaN;
  const n =
    typeof raw === "number"
      ? raw
      : parseFloat(String(raw).replace(",", "."));
  if (Number.isNaN(n)) return NaN;
  if (n > 1 && n <= 100) return n / 100;
  return n;
}

function confidenceFromPredictPayload(data) {
  const raw =
    data.confidence ??
    data.score ??
    data.confidence_score ??
    data.top1conf;
  return normalizeConfidence(raw);
}

const views = {
  home: document.querySelector("#homeView"),
  about: document.querySelector("#aboutView"),
  "user-guide": document.querySelector("#guideView"),
  analyze: document.querySelector("#analyzeView"),
  confirm: document.querySelector("#confirmView"),
  preprocessing: document.querySelector("#preprocessingView"),
  analyzing: document.querySelector("#analyzingView"),
  results: document.querySelector("#resultsView"),
  guidance: document.querySelector("#guidanceView"),
};

const state = {
  imageData: sessionStorage.getItem("hawnImageData") || "",
  classification: sessionStorage.getItem("hawnClassification") || "",
  confidence: (() => {
    const raw = sessionStorage.getItem("hawnConfidence");
    if (raw == null) return null;
    const n = normalizeConfidence(raw);
    return Number.isNaN(n) ? null : n;
  })(),
  predictedClass: sessionStorage.getItem("hawnPredictedClass") || "",
  guidanceData: null,
  activeTimer: null,
};

function hydrateConfidenceFromStorage() {
  const raw = sessionStorage.getItem("hawnConfidence");
  if (raw == null || raw === "") return;
  const n = normalizeConfidence(raw);
  if (!Number.isNaN(n)) state.confidence = n;
}

const classificationLabels = {
  first_degree: "First-degree burn",
  second_degree: "Second-degree burn",
  third_degree: "Third-degree burn",
};

const menuButton = document.querySelector("#menuButton");
const closeMenuButton = document.querySelector("#closeMenuButton");
const sideMenu = document.querySelector("#sideMenu");
const menuBackdrop = document.querySelector("#menuBackdrop");
const uploadError = document.querySelector("#uploadError");
const galleryInput = document.querySelector("#galleryInput");
const cameraInput = document.querySelector("#cameraInput");
const captureButton = document.querySelector("#captureButton");
const confirmAnalyzeButton = document.querySelector("#confirmAnalyzeButton");
const confirmImage = document.querySelector("#confirmImage");
const resultImage = document.querySelector("#resultImage");
const resultTitle = document.querySelector("#resultTitle");
const resultConfidence = document.querySelector("#resultConfidence");

const analyzingLoadingPanel = document.querySelector("#analyzingLoadingPanel");
const analyzingErrorPanel = document.querySelector("#analyzingErrorPanel");
const analyzingError = document.querySelector("#analyzingError");
const analyzingStatus = document.querySelector("#analyzingStatus");
const analyzingSpinner = document.querySelector("#analyzingSpinner");
const analyzingChecklist = document.querySelector("#analyzingChecklist");

function mapToBurnDegree(raw) {
  const n = String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (n === "first" || n === "first_degree" || n === "1") return "first_degree";
  if (n === "second" || n === "second_degree" || n === "2") return "second_degree";
  if (n === "third" || n === "third_degree" || n === "3") return "third_degree";
  return null;
}

async function parsePredictError(response) {
  try {
    const j = await response.json();
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail)) {
      const parts = j.detail.map((x) => x.msg).filter(Boolean);
      if (parts.length) return parts.join(" ");
    }
    if (typeof j.error === "string") return j.error;
  } catch {
    /* ignore */
  }
  if (response.status === 503) {
    return "The AI server is running but the model failed to load. Check the backend terminal and model path.";
  }
  return response.statusText || `Request failed (${response.status})`;
}

function openMenu() {
  sideMenu.classList.add("is-open");
  menuBackdrop.classList.add("is-open");
  sideMenu.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  sideMenu.classList.remove("is-open");
  menuBackdrop.classList.remove("is-open");
  sideMenu.setAttribute("aria-hidden", "true");
}

function routeName() {
  return (window.location.hash || "#home").replace("#", "") || "home";
}

function navigate(name) {
  window.location.hash = name;
}

function resetAnalyzingToLoading() {
  if (!analyzingLoadingPanel || !analyzingErrorPanel) return;
  analyzingErrorPanel.hidden = true;
  analyzingLoadingPanel.hidden = false;
  if (analyzingSpinner) analyzingSpinner.style.display = "";
  if (analyzingChecklist) analyzingChecklist.hidden = false;
  if (analyzingStatus) analyzingStatus.textContent = "Preparing image for the model…";
}

async function runBurnPrediction() {
  if (!state.imageData) {
    navigate("analyze");
    return;
  }

  resetAnalyzingToLoading();

  const setStatus = (t) => {
    if (analyzingStatus) analyzingStatus.textContent = t;
  };

  try {
    setStatus("Preparing image for the model…");
    const responseImg = await fetch(state.imageData);
    const blob = await responseImg.blob();

    const ext =
      blob.type === "image/png"
        ? "image.png"
        : blob.type === "image/webp"
          ? "image.webp"
          : "image.jpg";
    const formData = new FormData();
    formData.append("file", blob, ext);

    setStatus("Running burn classification…");

    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const msg = await parsePredictError(response);
      throw new Error(msg);
    }

    const data = await response.json();
    const predictedRaw = data.predicted_class ?? data.result;
    const conf = confidenceFromPredictPayload(data);
    if (!predictedRaw || Number.isNaN(conf)) {
      throw new Error("Invalid response from server (missing class or confidence).");
    }

    const mapped = mapToBurnDegree(predictedRaw);
    state.classification = mapped || "second_degree";
    state.confidence = conf;
    state.predictedClass = predictedRaw;

    sessionStorage.setItem("hawnClassification", state.classification);
    sessionStorage.setItem("hawnConfidence", String(state.confidence));
    sessionStorage.setItem("hawnPredictedClass", predictedRaw);

    navigate("results");
  } catch (err) {
    console.error("[predict]", err);
    const message = err instanceof Error ? err.message : "Analysis failed.";
    const friendly =
      message === "Failed to fetch" ||
      (typeof message === "string" && message.includes("NetworkError"))
        ? `Cannot reach the API at ${API_BASE}. Start the Python backend and try again.`
        : message;

    if (analyzingLoadingPanel) analyzingLoadingPanel.hidden = true;
    if (analyzingSpinner) analyzingSpinner.style.display = "none";
    if (analyzingChecklist) analyzingChecklist.hidden = true;
    if (analyzingErrorPanel) analyzingErrorPanel.hidden = false;
    if (analyzingError) analyzingError.textContent = friendly;
  }
}

function showView(name) {
  const requested = views[name] ? name : "home";

  if (state.activeTimer) {
    clearTimeout(state.activeTimer);
    state.activeTimer = null;
  }

  if (["confirm", "preprocessing", "analyzing", "results"].includes(requested) && !state.imageData) {
    navigate("analyze");
    return;
  }

  Object.values(views).forEach((view) => view.classList.remove("is-active"));
  views[requested].classList.add("is-active");
  closeMenu();

  if (requested === "confirm") {
    confirmImage.src = state.imageData;
  }

  if (requested === "preprocessing") {
    state.activeTimer = setTimeout(() => navigate("analyzing"), 2000);
  }

  if (requested === "analyzing") {
    void runBurnPrediction();
  }

  if (requested === "results") {
    if (!state.classification) {
      navigate("analyze");
      return;
    }
    hydrateConfidenceFromStorage();
    resultImage.src = state.imageData;
    const label =
      classificationLabels[state.classification] || state.classification;
    resultTitle.textContent = `Classification: ${label}`;
    if (resultConfidence) {
      const c = state.confidence;
      if (c != null && !Number.isNaN(c)) {
        resultConfidence.textContent = `Confidence: ${(c * 100).toFixed(1)}%`;
      } else {
        resultConfidence.textContent = "Confidence: —";
      }
    }
  }

  if (requested === "guidance") {
    renderGuidance();
  }
}

function setUploadError(message) {
  uploadError.textContent = message;
  uploadError.hidden = !message;
}

function handleFile(file) {
  if (!file) return;

  const maxSize = 3 * 1024 * 1024;
  const validType = file.type.startsWith("image/");

  if (!validType) {
    setUploadError("Please select a valid image file (JPEG or PNG).");
    return;
  }

  if (file.size > maxSize) {
    setUploadError("Image size must be 3 MB or less.");
    return;
  }

  setUploadError("");

  const reader = new FileReader();
  reader.onload = (event) => {
    state.imageData = event.target.result;
    sessionStorage.setItem("hawnImageData", state.imageData);

    state.classification = "";
    state.confidence = null;
    state.predictedClass = "";
    sessionStorage.removeItem("hawnClassification");
    sessionStorage.removeItem("hawnConfidence");
    sessionStorage.removeItem("hawnPredictedClass");

    navigate("confirm");
  };
  reader.readAsDataURL(file);
}

function createGuidanceItem(text, type) {
  const item = document.createElement("div");
  item.className = `guidance-item ${type}`;

  const marker = document.createElement("span");
  marker.textContent = type === "do" ? "✓" : "x";

  const copy = document.createElement("p");
  copy.textContent = text;

  item.append(marker, copy);
  return item;
}

function renderGuidance() {
  if (!state.guidanceData) return;

  const guidance =
    state.guidanceData[state.classification] ||
    state.guidanceData.second_degree;
  const title = document.querySelector("#guidanceTitle");
  const description = document.querySelector("#guidanceDescription");
  const doList = document.querySelector("#doList");
  const doNotList = document.querySelector("#doNotList");
  const medicalAttention = document.querySelector("#medicalAttention");

  title.textContent = guidance.title;
  description.textContent = guidance.description || "";
  description.hidden = !guidance.description;
  doList.replaceChildren(...guidance.do.map((text) => createGuidanceItem(text, "do")));
  doNotList.replaceChildren(
    ...guidance.doNot.map((text) => createGuidanceItem(text, "dont"))
  );

  if (state.classification === "third_degree") {
    medicalAttention.hidden = false;
    medicalAttention.innerHTML =
      "<h3>Seek Medical Attention</h3><p>Call emergency medical services immediately. Third-degree burns require urgent professional medical treatment.</p>";
  } else if (state.classification === "second_degree") {
    medicalAttention.hidden = false;
    medicalAttention.innerHTML =
      "<h3>Seek Medical Attention</h3><p>Seek immediate medical attention. Second-degree burns require professional evaluation and treatment.</p>";
  } else {
    medicalAttention.hidden = true;
    medicalAttention.textContent = "";
  }
}

async function loadGuidanceData() {
  state.guidanceData = FIRST_AID_GUIDANCE_EMBEDDED;
  try {
    const response = await fetch("first-aid-guidance.json");
    if (!response.ok) throw new Error("Unable to load guidance JSON.");
    state.guidanceData = await response.json();
  } catch {
    /* keep FIRST_AID_GUIDANCE_EMBEDDED — works for file:// and broken paths */
  }
  if (routeName() === "guidance") renderGuidance();
}

menuButton.addEventListener("click", openMenu);
closeMenuButton.addEventListener("click", closeMenu);
menuBackdrop.addEventListener("click", closeMenu);
document
  .querySelectorAll(".side-nav a, .site-footer a")
  .forEach((link) => link.addEventListener("click", closeMenu));

captureButton.addEventListener("click", () => cameraInput.click());
galleryInput.addEventListener("change", (event) =>
  handleFile(event.target.files[0])
);
cameraInput.addEventListener("change", (event) =>
  handleFile(event.target.files[0])
);
confirmAnalyzeButton.addEventListener("click", () =>
  navigate("preprocessing")
);

window.addEventListener("hashchange", () => showView(routeName()));

loadGuidanceData();
showView(routeName());
