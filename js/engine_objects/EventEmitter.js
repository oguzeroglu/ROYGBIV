var EventEmitter = function(){
  this.registry = {};
  this.eventKeysByIds = {};
}

EventEmitter.prototype.on = function(eventKey, callback){
  var id = generateUUID();
  this.eventKeysByIds[id] = eventKey;
  if (!this.registry[eventKey]){
    this.registry[eventKey] = {};
  }
  this.registry[eventKey][id] = callback;
  return id;
}

EventEmitter.prototype.off = function(id){
  var eventKey = this.eventKeysByIds[id];
  if (typeof eventKey == UNDEFINED){
    return;
  }
  delete this.registry[eventKey][id];
  delete this.eventKeysByIds[id];
}

EventEmitter.prototype.emit = function(eventKey, data){
  var events = this.registry[eventKey];
  if (!events){
    return;
  }
  for (var id in events){
    events[id](data);
  }
}
