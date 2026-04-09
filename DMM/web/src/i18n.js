function updateTexts(currentLang) {
  const t = translations[currentLang];
  
  document.title = t.titlePage;
  title.textContent = t.titlePage;
  fileUploadTitle.textContent = t.titleFileUpload;
  parameterTitle.textContent = t.titleParameterData;
  chartTitle.textContent = t.titleMeasurementData;
  fileVersionLabel.textContent = t.fileVersionLabel;
  deviceTypeLabel.textContent = t.deviceTypeLabel;
  modeLabel.textContent = t.modeLabel;
  sampleIntervalLabel.textContent = t.sampleIntervalLabel;
}
