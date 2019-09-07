var DelayedExecutionHandler = function(){
  this.INITIAL_OBJECT_POOL_SIZE = 5;
  this.initializePool();
}

DelayedExecutionHandler.prototype.reset = function(){
  this.initializePool();
}

DelayedExecutionHandler.prototype.pushNewElementToPool = function(){
  this.pool.push({
    isAvailable: true, triggerTimeInMS: 0, func: null, repeat: false, delayInMS: 0
  });
}

DelayedExecutionHandler.prototype.prepareElement = function(elem, delayInMS, func, repeat){
  elem.isAvailable = false;
  elem.triggerTimeInMS = performance.now() + delayInMS;
  elem.func = func;
  elem.repeat = repeat;
  elem.delayInMS = delayInMS;
}

DelayedExecutionHandler.prototype.requestDelayedExecution = function(delayInMS, func, repeat){
  for (var i = 0; i < this.pool.length; i ++){
    var curElem = this.pool[i];
    if (curElem.isAvailable){
      this.prepareElement(curElem, delayInMS, func, repeat);
      return i;
    }
  }
  this.pushNewElementToPool();
  this.prepareElement(this.pool[this.pool.length -1], delayInMS, func, repeat);
  return this.pool.length -1;
}

DelayedExecutionHandler.prototype.stopDelayedExecution = function(id){
  var elem = this.pool[id];
  if (elem){
    elem.isAvailable = true;
  }
}

DelayedExecutionHandler.prototype.initializePool = function(){
  this.pool = [];
  for (var i = 0; i < this.INITIAL_OBJECT_POOL_SIZE; i++){
    this.pushNewElementToPool();
  }
}

DelayedExecutionHandler.prototype.tick = function(){
  var now = performance.now();
  for (var i = 0; i < this.pool.length; i ++){
    var curElem = this.pool[i];
    if (!curElem.isAvailable){
      if (now >= curElem.triggerTimeInMS){
        curElem.func();
        if (curElem.repeat){
          curElem.triggerTimeInMS += curElem.delayInMS;
        }else{
          curElem.isAvailable = true;
        }
      }
    }
  }
}
