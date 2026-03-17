function updateTexts(currentLang) {
  const t = translations[currentLang];
  
  document.title = t.titlePage;
  titlePage.textContent = t.titlePage;
  titleFileUpload.textContent = t.titleFileUpload;
  titleParameter.textContent = t.titleParameter;
  titleImg.textContent = t.titleIRPicture;
  //langLabel.textContent = t.langLabel;
  image.alt = t.previewAlt;
  fileVersionLabel.textContent = t.fileVersionLabel;
  deviceTypeLabel.textContent = t.deviceTypeLabel;
  unitLabel.textContent = t.unitLabel;
  lowestTempLabel.textContent = t.lowestTempLabel;
  highestTempLabel.textContent = t.highestTempLabel;
  markedPositionLabel.textContent = t.markedPositionLabel;
  positionTempLabel.textContent = t.positionTempLabel;
}