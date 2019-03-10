var WorkerMessageHandler = function(worker){
  if (worker){
    this.worker = worker;
  }
  this.buffer = [];
}

WorkerMessageHandler.prototype.push = function(data){
  this.buffer.push(data);
}

WorkerMessageHandler.prototype.flush = function(){
  if (this.buffer.length > 0){
    if (this.worker){
      this.worker.postMessage(this.buffer);
    }else{
      postMessage(this.buffer);
    }
    this.buffer.length = 0;
  }
}
