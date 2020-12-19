var AnalyticsHandler = function(){
  this.reset();
}

AnalyticsHandler.prototype.isEnabled = function(){
  return this.serverURL && navigator.sendBeacon;
}

AnalyticsHandler.prototype.reset = function(){
  this.serverURL = null;
}

AnalyticsHandler.prototype.handle = function(isHello){
  if (!this.isEnabled()){
    return;
  }

  if (isHello){
    if (this.isHelloSent){
      return;
    }

    this.id = generateUUID();

    this.isHelloSent = true;

    navigator.sendBeacon(this.serverURL + "/hello", JSON.stringify({
      id: this.id,
      totalLoadTime: loadTime.totalLoadTime,
      shaderLoadTime: loadTime.shaderLoadTime,
      applicationJSONLoadTime: loadTime.applicationJSONLoadTime,
      modeSwitchTime: loadTime.modeSwitchTime,
      firstRendertime: loadTime.firstRendertime,
      isMobile: isMobile || mobileSimulation.isActive,
      isIOS: isIOS || (mobileSimulation.isActive && mobileSimulation.isIOS),
      highPrecisionSupported: HIGH_PRECISION_SUPPORTED,
      browser: BROWSER_NAME
    }));

    this.fpsCounter = 0;
    this.totalFPS = 0;
  }else if (this.isHelloSent){
    this.isHelloSent = false;

    navigator.sendBeacon(this.serverURL + "/bye", JSON.stringify({
      id: this.id,
      avgFPS: this.fpsCounter? (this.totalFPS / this.fpsCounter): 0
    }));
  }
}

AnalyticsHandler.prototype.onFPSUpdate = function(newFPS){
  if (!this.isEnabled() || !this.isHelloSent){
    return;
  }

  this.totalFPS += newFPS;
  this.fpsCounter ++;
}
