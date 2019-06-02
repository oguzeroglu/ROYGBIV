var Animation = function(name, type, attachedObject, description, rewind){
  this.name = name;
  this.type = type;
  this.attachedObject = attachedObject;
  this.description = JSON.parse(JSON.stringify(description));
  this.rewind = rewind;
  this.updateFunction = animationHandler.updateFunctionsByType[type];
  this.actionFunction = animationHandler.actionFunctionsByType[description.action];
  this.tick = 0;
  this.changeInValue = this.description.targetValue - this.description.initialValue;
}

Animation.prototype.onFinished = function(){
  animationHandler.onAnimationFinished(this);
}

Animation.prototype.update = function(){
  var newVal = this.updateFunction(this.tick, this.description.initialValue, this.changeInValue, this.description.totalTimeInSeconds);
  this.actionFunction(this.attachedObject, newVal);
  this.tick +=  STEP;
  if (this.tick >= this.description.totalTimeInSeconds){
    if (this.rewind){
      this.tick = 0;
    }else{
      this.onFinished();
    }
  }
}
