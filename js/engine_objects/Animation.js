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
    this.params.originalSourceColor = new THREE.Color();
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
    this.params.originalSourceColor.copy(this.attachedObject.getEmissiveColor());
  }
  this.increaseTick = true;
}

Animation.prototype.update = function(){
  this.params.value = this.updateFunction(this.tick, this.initialValue, this.changeInValue, this.totalTimeInSeconds);
  this.actionFunction(this.params);
  if (this.increaseTick){
    this.tick += STEP;
  }else{
    this.tick -= STEP;
  }
  if (this.increaseTick && this.tick >= this.totalTimeInSeconds){
    if (this.rewind){
      this.increaseTick = false;
      if (this.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR){
        this.params.sourceColor.copy(this.params.originalSourceColor);
      }
    }else if (!this.repeat){
      if (this.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR){
        this.params.sourceColor.copy(this.params.originalSourceColor);
      }
      this.onFinished();
    }
  }else if (!this.increaseTick && this.tick <= 0){
    if (this.rewind){
      this.increaseTick = true;
    }
    if (!this.repeat){
      if (this.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR){
        this.params.sourceColor.copy(this.params.originalSourceColor);
      }
      this.onFinished();
    }
  }
}
