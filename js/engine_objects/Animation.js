var Animation = function(name, type, attachedObject, description, rewind, repeat){
  this.name = name;
  this.type = type;
  this.attachedObject = attachedObject;
  this.description = JSON.parse(JSON.stringify(description));
  this.rewind = rewind;
  this.updateFunction = animationHandler.updateFunctionsByType[type];
  this.actionFunction = animationHandler.actionFunctionsByType[description.action];
  this.totalTimeInSeconds = this.description.totalTimeInSeconds;
  this.repeat = repeat;
  this.params = {object: this.attachedObject};
  if (description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR || description.action == animationHandler.actionTypes.TEXT.TEXT_COLOR || description.action == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR){
    this.changeInValue = 1;
    this.params.targetColor = new THREE.Color(description.targetColor);
    this.params.sourceColor = new THREE.Color();
  }else if (description.action == animationHandler.actionTypes.TEXT.TYPING){
    this.changeInValue = attachedObject.text.length + 1;
    this.params.sourceText = attachedObject.text;
  }else{
    this.changeInValue = this.description.changeInValue;
  }
  animationHandler.assignUUIDToAnimation(this);
}

Animation.prototype.isInitialValueAssigned = function(){
  return this.hasInitialValue;
}

Animation.prototype.invalidateInitialValue = function(){
  this.hasInitialValue = false;
  if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_X){
    this.params.totalTranslationX = 0;
  }else if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_Y){
    this.params.totalTranslationY = 0;
  }else if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_Z){
    this.params.totalTranslationZ = 0;
  }
}

Animation.prototype.setFinishCallbackFunction = function(callbackFunction){
  this.finishCallbackFunction = callbackFunction;
}

Animation.prototype.export = function(){
  return {
    name: this.name, type: this.type, description: this.description, rewind: this.rewind, repeat: this.repeat
  };
}

Animation.prototype.onFinished = function(){
  animationHandler.onAnimationFinished(this);
}

Animation.prototype.onStart = function(initialValue){
  this.initialValue = initialValue;
  this.tick = 0;
  if (this.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR){
    this.params.sourceColor.copy(this.attachedObject.getEmissiveColor());
  }else if (this.description.action == animationHandler.actionTypes.TEXT.TEXT_COLOR){
    this.params.sourceColor.copy(this.attachedObject.getColor());
  }else if (this.description.action == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR){
    this.params.sourceColor.copy(this.attachedObject.getBackgroundColor());
  }else if (this.description.action == animationHandler.actionTypes.TEXT.TYPING){
    this.params.sourceText = this.attachedObject.text;
  }else if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_X){
    this.params.totalTranslationX = 0;
  }else if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_Y){
    this.params.totalTranslationY = 0;
  }else if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_Z){
    this.params.totalTranslationZ = 0;
  }
  this.increaseTick = true;
}

Animation.prototype.onRepeat = function(){
  if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_X){
    this.attachedObject.mesh.translateX(-1 * this.params.totalTranslationX);
    this.params.totalTranslationX = 0;
  }else if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_Y){
    this.attachedObject.mesh.translateY(-1 * this.params.totalTranslationY);
    this.params.totalTranslationY = 0;
  }else if (this.description.action == animationHandler.actionTypes.OBJECT.TRANSLATE_Z){
    this.attachedObject.mesh.translateZ(-1 * this.params.totalTranslationZ);
    this.params.totalTranslationZ = 0;
  }
}

Animation.prototype.update = function(){
  this.params.value = this.updateFunction(this.tick, this.initialValue, this.changeInValue, this.totalTimeInSeconds);
  this.actionFunction(this.params, this.increaseTick);
  if (this.increaseTick){
    this.tick += STEP;
  }else{
    this.tick -= STEP;
  }
  if (this.increaseTick && this.tick > this.totalTimeInSeconds){
    if (this.rewind){
      this.increaseTick = false;
    }else if (!this.repeat){
      this.onFinished();
    }else{
      this.tick = 0;
      if (!this.rewind){
        this.onRepeat();
      }
    }
    if (!this.rewind && this.finishCallbackFunction){
      this.finishCallbackFunction();
    }
  }else if (!this.increaseTick && this.tick <= 0){
    this.increaseTick = true;
    if (!this.repeat){
      this.onFinished();
    }
    if (this.finishCallbackFunction){
      this.finishCallbackFunction();
    }
  }
}
