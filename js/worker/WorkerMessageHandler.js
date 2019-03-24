var WorkerMessageHandler = function(worker){
  if (worker){
    this.worker = worker;
  }
  this.record = false;
  this.bufferIndex = 0;
  this.elementCount = 0;
  this.buffer = new Array(5);
  this.preallocatedArrayCache = new Map();
  this.performanceLogs = {
    preallocatedArrayCacheSize: 0,
    totalArraysSentLastFrame: 0,
    totalBytesSentLastFrame: 0,
    flushTimeLastFrame: 0
  };
}

WorkerMessageHandler.prototype.startRecording = function(){
  this.record = true;
}

WorkerMessageHandler.prototype.dumpPerformanceLogs = function(){
  this.performanceLogs.preallocatedArrayCacheSize = this.preallocatedArrayCache.size;
  console.log("%cFlush time last frame:" +this.performanceLogs.flushTimeLastFrame+" ms", "background: black; color: magenta");
  console.log("%cPreallocated array cache size: "+this.performanceLogs.preallocatedArrayCacheSize, "background: black; color: magenta");
  console.log("%cTotal arrays sent last frame: "+this.performanceLogs.totalArraysSentLastFrame, "background: black; color: magenta");
  console.log("%cTotal bytes sent last frame: "+this.performanceLogs.totalBytesSentLastFrame, "background: black; color: magenta");
}

WorkerMessageHandler.prototype.push = function(data){
  this.buffer[this.bufferIndex ++] = data;
  this.elementCount ++;
}

WorkerMessageHandler.prototype.flush = function(){
  if (this.elementCount > 0){
    if (this.record){
      this.performanceLogs.flushTimeLastFrame = performance.now();
      this.performanceLogs.totalBytesSentLastFrame = 0;
      this.performanceLogs.totalArraysSentLastFrame = this.elementCount;
    }
    var ary = this.preallocatedArrayCache.get(this.elementCount);
    if (!ary){
      ary = new Array(this.elementCount);
      this.preallocatedArrayCache.set(this.elementCount, ary);
    }
    for (var i = 0; i<this.elementCount; i++){
      ary[i] = this.buffer[i];
      if (this.record){
        this.performanceLogs.totalBytesSentLastFrame += this.buffer[i].byteLength
      }
    }
    if (this.worker){
      this.worker.postMessage(ary);
    }else{
      postMessage(ary);
    }
    this.elementCount = 0;
    this.bufferIndex = 0;
    if (this.record){
      this.performanceLogs.flushTimeLastFrame = performance.now() - this.performanceLogs.flushTimeLastFrame;
    }
  }
}
