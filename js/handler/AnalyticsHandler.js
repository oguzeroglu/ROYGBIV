var AnalyticsHandler = function(){
  this.reset();
}

AnalyticsHandler.prototype.getServerURL = function(){
  if (isDeployment){
    return this.serverURL;
  }

  return this.devServerURL;
}

AnalyticsHandler.prototype.isEnabled = function(){
  if (isDeployment){
    return this.serverURL && navigator.sendBeacon;
  }

  return this.devServerURL && navigator.sendBeacon;
}

AnalyticsHandler.prototype.reset = function(){
  this.serverURL = null;
  this.devServerURL = null;
  this.lastPingTime = null;
}

AnalyticsHandler.prototype.handle = function(isHello){
  if (!this.isEnabled() || this.isByeSent){
    return;
  }

  if (isHello){
    if (this.isHelloSent){
      var now = performance.now();
      if (now - this.lastPingTime >= 10000){
        this.lastPingTime = now;
        navigator.sendBeacon(this.getServerURL() + "/ping", JSON.stringify({
          id: this.id,
          avgFPS: this.fpsCounter? (this.totalFPS / this.fpsCounter): 0
        }))
      }
      return;
    }

    this.id = generateUUID();

    this.isHelloSent = true;

    navigator.sendBeacon(this.getServerURL() + "/hello", JSON.stringify({
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

    this.lastPingTime = performance.now();

    this.fpsCounter = 0;
    this.totalFPS = 0;
  }else if (this.isHelloSent && !this.isByeSent){
    if (!isDeployment){
      this.isHelloSent = false;
    }else{
      this.isByeSent = true;
    }

    navigator.sendBeacon(this.getServerURL() + "/bye", JSON.stringify({
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
