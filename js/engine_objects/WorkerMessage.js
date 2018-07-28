var WorkerMessage = function(topic, content){
  this.set(topic, content);
}

WorkerMessage.prototype.set = function(topic, content){
  this.topic = topic;
  this.content = content;
  if (content instanceof Float32Array){
    this.type = MESSAGE_TYPE_BUFFER;
  }else{
    this.type = MESSAGE_TYPE_BASIC;
  }

  delete this.id;
  delete this.forceX;
  delete this.forceY;
  delete this.forceZ;
  delete this.pointX;
  delete this.pointY;
  delete this.pointZ;
  delete this.qx;
  delete this.qy;
  delete this.qz;
  delete this.qw;

  return this;
}
