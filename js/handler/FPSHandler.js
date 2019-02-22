var FPSHandler = function(){
  this.fps = 0;
}

FPSHandler.prototype.onUpdate = function(newFPS){
  if (mode == 1 && newFPS < 60){
    if (fpsDropCallbackFunction){
      fpsDropCallbackFunction(60 - newFPS);
    }
    if (performanceDropCallbackFunction){
      if(newFPS < this.performanceDropMinFPS){
        this.performanceDropCounter ++;
        if (this.performanceDropCounter == this.performanceDropSeconds){
          performanceDropCallbackFunction();
          this.reset();
          performanceDropCallbackFunction = 0;
        }
      }else{
        this.performanceDropCounter = 0;
      }
    }
  }else if (mode == 1 && newFPS >= 60 && performanceDropCallbackFunction){
    this.performanceDropCounter = 0;
  }
  this.fps = newFPS;
}

FPSHandler.prototype.reset = function(){
  this.performanceDropMinFPS = 0;
  this.performanceDropSeconds = 0;
  this.performanceDropCounter = 0;
}

FPSHandler.prototype.initiatePerformanceDropMonitoring = function(minFPS, seconds){
  this.performanceDropMinFPS = minFPS;
  this.performanceDropSeconds = seconds;
  this.performanceDropCounter = 0;
}
