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

  return this;
}
