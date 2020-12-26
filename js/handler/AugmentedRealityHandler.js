var AugmentedRealityHandler = function(){
  var tmpAElement = document.createElement("a");
  this.isQuickLookSupported = tmpAElement.relList && tmpAElement.relList.supports && tmpAElement.relList.supports('ar');
  this.isScreenViewerSupported = isAndroid && !isFirefox && !isOcculus;
}

AugmentedRealityHandler.prototype.isSupported = function(){
  return this.isQuickLookSupported || this.isScreenViewerSupported;
}
