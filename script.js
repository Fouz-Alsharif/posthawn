const views = {
  home: document.querySelector("#homeView"),
  about: document.querySelector("#aboutView"),
  "user-guide": document.querySelector("#guideView"),
  analyze: document.querySelector("#analyzeView"),
  confirm: document.querySelector("#confirmView"),
  preprocessing: document.querySelector("#preprocessingView"),
  analyzing: document.querySelector("#analyzingView"),
  results: document.querySelector("#resultsView"),
  guidance: document.querySelector("#guidanceView")
};

const state = {
  imageData: sessionStorage.getItem("hawnImageData") || "",
  classification: sessionStorage.getItem("hawnClassification") || "second_degree",
  guidanceData: null,
  activeTimer: null
};

const classificationLabels = {
  first_degree: "First-degree burn",
  second_degree: "Second-degree burn",
  third_degree: "Third-degree burn"
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
    state.activeTimer = setTimeout(() => navigate("results"), 3000);
  }

  if (requested === "results") {
    resultImage.src = state.imageData;
    resultTitle.textContent = `Classification: ${classificationLabels[state.classification]}`;
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
    setUploadError("Please select an image file.");
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

    // Mock classification until the real YOLO output is connected.
    state.classification = "second_degree";
    sessionStorage.setItem("hawnClassification", state.classification);
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

  const guidance = state.guidanceData[state.classification] || state.guidanceData.second_degree;
  const title = document.querySelector("#guidanceTitle");
  const description = document.querySelector("#guidanceDescription");
  const doList = document.querySelector("#doList");
  const doNotList = document.querySelector("#doNotList");
  const medicalAttention = document.querySelector("#medicalAttention");

  title.textContent = guidance.title;
  description.textContent = guidance.description || "";
  description.hidden = !guidance.description;
  doList.replaceChildren(...guidance.do.map((text) => createGuidanceItem(text, "do")));
  doNotList.replaceChildren(...guidance.doNot.map((text) => createGuidanceItem(text, "dont")));

  if (state.classification === "third_degree") {
    medicalAttention.hidden = false;
    medicalAttention.innerHTML = "<h3>Seek Medical Attention</h3><p>Call emergency medical services immediately. Third-degree burns require urgent professional medical treatment.</p>";
  } else if (state.classification === "second_degree") {
    medicalAttention.hidden = false;
    medicalAttention.innerHTML = "<h3>Seek Medical Attention</h3><p>Seek immediate medical attention. Second-degree burns require professional evaluation and treatment.</p>";
  } else {
    medicalAttention.hidden = true;
    medicalAttention.textContent = "";
  }
}

async function loadGuidanceData() {
  try {
    const response = await fetch("first-aid-guidance.json");
    if (!response.ok) throw new Error("Unable to load guidance JSON.");
    state.guidanceData = await response.json();
    if (routeName() === "guidance") renderGuidance();
  } catch (error) {
    state.guidanceData = {
      second_degree: {
        title: "Guidance unavailable",
        description: "The first aid guidance file could not be loaded. Open this project through Live Server so the JSON file can be fetched by the browser.",
        do: [],
        doNot: []
      }
    };
    renderGuidance();
  }
}

menuButton.addEventListener("click", openMenu);
closeMenuButton.addEventListener("click", closeMenu);
menuBackdrop.addEventListener("click", closeMenu);
document.querySelectorAll(".side-nav a, .site-footer a").forEach((link) => link.addEventListener("click", closeMenu));

captureButton.addEventListener("click", () => cameraInput.click());
galleryInput.addEventListener("change", (event) => handleFile(event.target.files[0]));
cameraInput.addEventListener("change", (event) => handleFile(event.target.files[0]));
confirmAnalyzeButton.addEventListener("click", () => navigate("preprocessing"));

window.addEventListener("hashchange", () => showView(routeName()));

loadGuidanceData();
showView(routeName());
