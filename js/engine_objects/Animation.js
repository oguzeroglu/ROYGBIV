var Animation = function(name, type, attachedObject, description, rewind){
  this.name = name;
  this.type = type;
  this.attachedObject = attachedObject;
  this.description = JSON.parse(JSON.stringify(description));
  this.rewind = rewind;
  this.updateFunction = animationHandler.updateFunctionsByType[type];
  this.actionFunction = animationHandler.actionFunctionsByType[description.action];
  this.totalTimeInSeconds = this.description.totalTimeInSeconds;
  this.params = {object: this.attachedObject};
  if (description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR){
    this.changeInValue = 1;
    this.params.targetColor = description.targetColor;
    this.params.sourceColor = new THREE.Color();
  }else{
    this.changeInValue = this.description.changeInValue;
  }
  animationHandler.assignUUIDToAnimation(this);
}

Animation.prototype.onFinished = function(){
  animationHandler.onAnimationFinished(this);
}

Animation.prototype.onStart = function(initialValue){
  this.initialValue = initialValue;
  this.tick = 0;
  if (this.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR){
    this.params.sourceColor.copy(this.attachedObject.getEmissiveColor());
  }
}

Animation.prototype.update = function(){
  this.params.value = this.updateFunction(this.tick, this.initialValue, this.changeInValue, this.totalTimeInSeconds);
  this.actionFunction(this.params);
  this.tick +=  STEP;
  if (this.tick >= this.totalTimeInSeconds){
    if (this.rewind){
      this.tick = 0;
    }else{
      this.onFinished();
    }
  }
}
