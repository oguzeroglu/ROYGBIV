var AugmentedRealityHandler = function(){
  var tmpAElement = document.createElement("a");
  this.isQuickLookSupported = tmpAElement.relList && tmpAElement.relList.supports && tmpAElement.relList.supports('ar');
  this.isScreenViewerSupported = isAndroid && !isFirefox && !isOcculus;

  this.aElement = document.createElement("a");
}

AugmentedRealityHandler.prototype.isSupported = function(){
  return this.isQuickLookSupported || this.isScreenViewerSupported;
}

AugmentedRealityHandler.prototype.start = function(modelFolderName, arModelName){
  if (!this.isSupported()){
    return;
  }

  if (this.isQuickLookSupported){
    this.aElement.setAttribute("rel", "ar");
    var img = document.createElement("img");
    this.aElement.appendChild(img);
    this.aElement.setAttribute("href", "./models/" + modelFolderName + "/ar/" + arModelName + ".usdz");
    this.aElement.click();
    this.aElement.removeChild(img);
    return;
  }
}
