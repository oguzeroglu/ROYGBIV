var FPSHandler = function(){
  this.fps = 0;
  this.beginTime = 0;
  this.frames = 0;
  this.prevTime = 0;
  this.log = false;
}

FPSHandler.prototype.begin = function(){
  this.beginTime = performance.now();
}

FPSHandler.prototype.end = function(){
  this.frames ++;
  var curTime = performance.now();
  if (curTime > this.prevTime + 1000) {
    this.onUpdate(Math.round((this.frames * 1000) / (curTime - this.prevTime)));
    this.prevTime = curTime;
    this.frames = 0;
  }
}

FPSHandler.prototype.onUpdate = function(newFPS){
  if (this.log){
    console.log(newFPS);
  }
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
