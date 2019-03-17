var WorkerMessageHandler = function(worker){
  if (worker){
    this.worker = worker;
  }
  this.bufferIndex = 0;
  this.elementCount = 0;
  this.buffer = new Array(5);
  this.preallocatedArrayCache = new Map();
}

WorkerMessageHandler.prototype.push = function(data){
  this.buffer[this.bufferIndex ++] = data;
  this.elementCount ++;
}

WorkerMessageHandler.prototype.flush = function(){
  if (this.elementCount > 0){
    var ary = this.preallocatedArrayCache.get(this.elementCount);
    if (!ary){
      ary = new Array(this.elementCount);
      this.preallocatedArrayCache.set(this.elementCount, ary);
    }
    for (var i = 0; i<this.elementCount; i++){
      ary[i] = this.buffer[i];
    }
    if (this.worker){
      this.worker.postMessage(ary);
    }else{
      postMessage(ary);
    }
    this.elementCount = 0;
    this.bufferIndex = 0;
  }
}
