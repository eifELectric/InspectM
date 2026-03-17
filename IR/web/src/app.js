const titlePage = document.getElementById('titlePage');
const titleFileUpload = document.getElementById('titleFileUpload');
const titleParameter = document.getElementById('titleParameter');
const titleImg = document.getElementById('titleImg');
const langLabel = document.getElementById('langLabel');
const statusElement = document.getElementById('status');
const uploadInput = document.getElementById('fileUpload');
const languageSelect = document.getElementById('languageSelect');
const image = document.getElementById('imgView');
const lowestTempLabel = document.getElementById('lowestTempLabel');
const lowestTemp = document.getElementById('lowestTemp');
const highestTempLabel = document.getElementById('highestTempLabel');
const highestTemp = document.getElementById('highestTemp');
const markedPositionLabel = document.getElementById('markedPositionLabel');
const markedPositionX = document.getElementById('markedPositionX');
const markedPositionY = document.getElementById('markedPositionY');
const positionTempLabel = document.getElementById('positionTempLabel');
const positionTemp = document.getElementById('positionTemp');
const fileVersionLabel = document.getElementById('fileVersionLabel');
const fileVersion = document.getElementById('fileVersion');
const deviceTypeLabel = document.getElementById('deviceTypeLabel');
const deviceType = document.getElementById('deviceType');
const unitLabel = document.getElementById('unitLabel');
//const unit = document.getElementById('unit');
const unitSelect = document.getElementById('unitSelect');

let currentLang = 'de';
let currentUnit = 1;

image.addEventListener('click', (event) => {
  const t = translations[currentLang];
  const rect = image.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  markedPositionX.textContent = x.toFixed(2);
  markedPositionY.textContent = y.toFixed(2);

  console.log('1OriginalPicSize:', img.naturalWidth,'x',img.naturalHeight,' Pixel');
  console.log('1ScreenPicSize:', img.clientWidth,'x',img.clientHeight,' Pixel');
  console.log('1CanvasPicSize:', canvas.width,'x',canvas.height,' Pixel');
  
  positionTemp.textContent = celsiusTo(getTemperature(x, y), currentUnit).toFixed(2)
                             + " "+getTemperatureUnitSymbol(currentUnit);
});

languageSelect.addEventListener('change', function() {
  currentLang = this.value;
  updateTexts(currentLang);
});

unitSelect.addEventListener('change', function() {
  currentUnit = parseInt(unitSelect.value, 10);
  positionTemp.textContent = celsiusTo(getTemperature(markedPositionX.textContent, markedPositionY.textContent), currentUnit).toFixed(2)
                             + " "+getTemperatureUnitSymbol(currentUnit);
  lowestTemp.textContent = celsiusTo(ir_parameters.get("lowestTemperature"), currentUnit).toFixed(2)
                           + " "+getTemperatureUnitSymbol(currentUnit);
  highestTemp.textContent = celsiusTo(ir_parameters.get("highestTemperature"), currentUnit).toFixed(2)
                            + " "+getTemperatureUnitSymbol(currentUnit);
});

uploadInput.addEventListener('change', async function(event) {
  const t = translations[currentLang];

  const file = event.target.files[0];
  await readFileAndTransformData(file);

  //Parameter
  deviceType.textContent = ir_parameters.get("deviceType");
  fileVersion.textContent = ir_parameters.get("fileVersion");
  currentUnit = ir_parameters.get("unit");
  //unit.textContent = currentUnit;
  unitSelect.value = currentUnit;
  lowestTemp.textContent = celsiusTo(ir_parameters.get("lowestTemperature"), currentUnit).toFixed(2)
                           + " "+getTemperatureUnitSymbol(currentUnit);
  highestTemp.textContent = celsiusTo(ir_parameters.get("highestTemperature"), currentUnit).toFixed(2)
                            + " "+getTemperatureUnitSymbol(currentUnit);
});

updateTexts(currentLang);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registriert'))
    .catch(err => console.error(err));
}