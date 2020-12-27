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

  var url = new URL("models/" + modelFolderName + "/ar/" + arModelName + ".glb", self.location.toString());
  var fileParam = "?file=" + url.toString() + "&mode=ar_only";
  console.log(fileParam);
  var intent = "intent://arvr.google.com/scene-viewer/1.0" + fileParam + "#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;";
  console.log(intent);
  this.aElement.setAttribute("href", intent);
  this.aElement.click();
}
