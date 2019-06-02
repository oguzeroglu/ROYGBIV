var Animation = function(name, type, attachedObject, description, rewind){
  this.name = name;
  this.type = type;
  this.attachedObject = attachedObject;
  this.description = JSON.parse(JSON.stringify(description));
  this.rewind = rewind;
  this.updateFunction = animationHandler.updateFunctionsByType[type];
}

Animation.prototype.export = function(){

}

Animation.prototype.update = function(){

}
