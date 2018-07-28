var TimedChunk = function(callerObject){
  this.callerObject = callerObject;
  this.loopCount = 0;
}

TimedChunk.prototype.forceStop = function(){
  if (this.timeoutID){
    clearTimeout(this.timeoutID);
  }
}

TimedChunk.prototype.run = function(func, maxTime, length){
  if (mode == 0){
    return;
  }
  var that = this;
  this.isBusy = true;
  var loopCount = this.loopCount;
  var functionCallCount = 0;
  var context = this.callerObject;
  var tick = function(){
    var startTime = new Date().getTime();
    for (; loopCount < length && (new Date().getTime())-startTime<maxTime; loopCount++){
      var boundFunction = func.bind(context);
      boundFunction(loopCount);
      functionCallCount ++;
    }
    if (loopCount < length){
      that.timeoutID = setTimeout(tick);
    }else{
      that.isBusy= false;
      return;
    }
  };
  this.timeoutID = setTimeout(tick);
}
