const title = document.getElementById('titlePage');
const fileUploadTitle = document.getElementById('titleFileUpload');
const parameterTitle = document.getElementById('titleParameter');
const chartTitle = document.getElementById('titleChart');
const langLabel = document.getElementById('langLabel');
const languageSelect = document.getElementById('languageSelect');
const uploadInput = document.getElementById('fileUpload');
const chartContainer = document.getElementById('chart');
const modeLabel = document.getElementById('modeLabel');
const mode = document.getElementById('mode');
const sampleIntervalLabel = document.getElementById('sampleIntervalLabel');
const sampleInterval = document.getElementById('sampleInterval');
const fileVersionLabel = document.getElementById('fileVersionLabel');
const fileVersion = document.getElementById('fileVersion');
const deviceTypeLabel = document.getElementById('deviceTypeLabel');
const deviceType = document.getElementById('deviceType');

let currentLang = 'de';


languageSelect.addEventListener('change', function() {
  currentLang = this.value;
  updateTexts(currentLang);
});

uploadInput.addEventListener('change', async function(event) {
  const t = translations[currentLang];

  const file = event.target.files[0];
  const { data, parameter } = await readFileAndTransformData(file);

  //Parameter
  const measurand = getMeasurandFromMode(parameter.get("Mode"));
  //Max / Ratio < 1000 = unit
  deviceType.textContent = parameter.get("Type");
  fileVersion.textContent = parameter.get("Ver");
  mode.textContent = parameter.get("Mode");
  sampleInterval.textContent = parameter.get("Cycle");

  createChart(data, t.time, measurand, "s", parameter.get("Unit"), document.getElementById("chart"));
});

updateTexts(currentLang);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}