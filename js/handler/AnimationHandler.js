var AnimationHandler = function(){
  this.uuidCounter = 0;
  this.activeAnimations = new Map();
  this.animationTypes = {
    LINEAR: "LINEAR",
    QUAD_EASE_IN: "QUAD_EASE_IN", QUAD_EASE_OUT: "QUAD_EASE_OUT", QUAD_EASE_INOUT: "QUAD_EASE_INOUT",
    CUBIC_EASE_IN: "CUBIC_EASE_IN", CUBIC_EASE_OUT: "CUBIC_EASE_OUT", CUBIC_EASE_INOUT: "CUBIC_EASE_INOUT",
    QUART_EASE_IN: "QUART_EASE_IN", QUART_EASE_OUT: "QUART_EASE_OUT", QUART_EASE_INOUT: "QUART_EASE_INOUT",
    QUINT_EASE_IN: "QUINT_EASE_IN", QUINT_EASE_OUT: "QUINT_EASE_OUT", QUINT_EASE_INOUT: "QUINT_EASE_INOUT",
    SINE_EASE_IN: "SINE_EASE_IN", SINE_EASE_OUT: "SINE_EASE_OUT", SINE_EASE_INOUT: "SINE_EASE_INOUT",
    EXPO_EASE_IN: "EXPO_EASE_IN", EXPO_EASE_OUT: "EXPO_EASE_OUT", EXPO_EASE_INOUT: "EXPO_EASE_INOUT",
    CIRC_EASE_IN: "CIRC_EASE_IN", CIRC_EASE_OUT: "CIRC_EASE_OUT", CIRC_EASE_INOUT: "CIRC_EASE_INOUT",
    ELASTIC_EASE_IN: "ELASTIC_EASE_IN", ELASTIC_EASE_OUT: "ELASTIC_EASE_OUT", ELASTIC_EASE_INOUT: "ELASTIC_EASE_INOUT",
    BACK_EASE_IN: "BACK_EASE_IN", BACK_EASE_OUT: "BACK_EASE_OUT", BACK_EASE_INOUT: "BACK_EASE_INOUT",
    BOUNCE_EASE_IN: "BOUNCE_EASE_IN", BOUNCE_EASE_OUT: "BOUNCE_EASE_OUT", BOUNCE_EASE_INOUT: "BOUNCE_EASE_INOUT"
  };
  this.actionTypes = {
    OBJECT: {
      TRANSPARENCY: "TRANSPARENCY", SCALE_X: "SCALE_X", SCALE_Y: "SCALE_Y", SCALE_Z: "SCALE_Z",
      ROTATION_X: "ROTATION_X", ROTATION_Y: "ROTATION_Y", ROTATION_Z: "ROTATION_Z", POSITION_X: "POSITION_X",
      POSITION_Y: "POSITION_Y", POSITION_Z: "POSITION_Z", EMISSIVE_INTENSITY: "EMISSIVE_INTENSITY", DISPLACEMENT_SCALE: "DISPLACEMENT_SCALE",
      DISPLACEMENT_BIAS: "DISPLACEMENT_BIAS", EMISSIVE_COLOR: "EMISSIVE_COLOR", TEXTURE_OFFSET_X: "TEXTURE_OFFSET_X",
      TEXTURE_OFFSET_Y: "TEXTURE_OFFSET_Y"
    }
  };
  // INITIAL VALUE GETTERS
  this.initialValueGetterFunctionsByType = new Object();
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.TRANSPARENCY] = function(object){
    return object.getOpacity();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.SCALE_X] = function(object){
    return object.mesh.scale.x;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.SCALE_Y] = function(object){
    return object.mesh.scale.y;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.SCALE_Z] = function(object){
    return object.mesh.scale.z;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.ROTATION_X] = function(object){
    return object.mesh.rotation.x;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.ROTATION_Y] = function(object){
    return object.mesh.rotation.y;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.ROTATION_Z] = function(object){
    return object.mesh.rotation.z;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.POSITION_X] = function(object){
    return object.mesh.position.x;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.POSITION_Y] = function(object){
    return object.mesh.position.y;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.POSITION_Z] = function(object){
    return object.mesh.position.z;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.EMISSIVE_INTENSITY] = function(object){
    return object.getEmissiveIntensity();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.DISPLACEMENT_SCALE] = function(object){
    return object.getDisplacementScale();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.DISPLACEMENT_BIAS] = function(object){
    return object.getDisplacementBias();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.EMISSIVE_COLOR] = function(object){
    return 0;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.TEXTURE_OFFSET_X] = function(object){
    return object.getTextureOffsetX();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.TEXTURE_OFFSET_Y] = function(object){
    return object.getTextureOffsetY();
  };
  // AFTER ANIMATION SETTER FUNCTIONS
  this.afterAnimationSettersByType = new Object();
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.TRANSPARENCY] = function(animation){
    animation.attachedObject.updateOpacity(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.SCALE_X] = function(animation){
    animation.attachedObject.mesh.scale.x = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.SCALE_Y] = function(animation){
    animation.attachedObject.mesh.scale.y = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.SCALE_Z] = function(animation){
    animation.attachedObject.mesh.scale.z = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.ROTATION_X] = function(animation){
    animation.attachedObject.mesh.rotation.x = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.ROTATION_Y] = function(animation){
    animation.attachedObject.mesh.rotation.y = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.ROTATION_Z] = function(animation){
    animation.attachedObject.mesh.rotation.z = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.POSITION_X] = function(animation){
    animation.attachedObject.mesh.position.x = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.POSITION_Y] = function(animation){
    animation.attachedObject.mesh.position.y = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.POSITION_Z] = function(animation){
    animation.attachedObject.mesh.position.z = animation.initialValue;
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.EMISSIVE_INTENSITY] = function(animation){
    animation.attachedObject.setEmissiveIntensity(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.DISPLACEMENT_SCALE] = function(animation){
    animation.attachedObject.setDisplacementScale(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.DISPLACEMENT_BIAS] = function(animation){
    animation.attachedObject.setDisplacementBias(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.EMISSIVE_COLOR] = function(animation){
    animation.attachedObject.setEmissiveColor(animation.params.sourceColor);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.TEXTURE_OFFSET_X] = function(animation){
    animation.attachedObject.setTextureOffsetX(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.TEXTURE_OFFSET_Y] = function(animation){
    animation.attachedObject.setTextureOffsetY(animation.initialValue);
  };
  // ACTION FUNCTIONS **********************************************
  this.actionFunctionsByType = new Object();
  this.actionFunctionsByType[this.actionTypes.OBJECT.TRANSPARENCY] = this.updateObjectTransparencyFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.SCALE_X] = this.updateObjectScaleXFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.SCALE_Y] = this.updateObjectScaleYFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.SCALE_Z] = this.updateObjectScaleZFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.ROTATION_X] = this.updateObjectRotationXFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.ROTATION_Y] = this.updateObjectRotationYFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.ROTATION_Z] = this.updateObjectRotationZFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.POSITION_X] = this.updateObjectPositionXFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.POSITION_Y] = this.updateObjectPositionYFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.POSITION_Z] = this.updateObjectPositionZFunc;
  this.actionFunctionsByType[this.actionTypes.OBJECT.EMISSIVE_INTENSITY] = this.updateObjectEmissiveIntensity;
  this.actionFunctionsByType[this.actionTypes.OBJECT.DISPLACEMENT_SCALE] = this.updateObjectDisplacementScale;
  this.actionFunctionsByType[this.actionTypes.OBJECT.DISPLACEMENT_BIAS] = this.updateObjectDisplacementBias;
  this.actionFunctionsByType[this.actionTypes.OBJECT.EMISSIVE_COLOR] = this.updateObjectEmissiveColor;
  this.actionFunctionsByType[this.actionTypes.OBJECT.TEXTURE_OFFSET_X] = this.updateObjectTextureOffsetX;
  this.actionFunctionsByType[this.actionTypes.OBJECT.TEXTURE_OFFSET_Y] = this.updateObjectTextureOffsetY;
  // UPDATE FUNCTIONS **********************************************
  this.updateFunctionsByType = new Object();
  this.updateFunctionsByType[this.animationTypes.LINEAR] = this.linearFunc;
  this.updateFunctionsByType[this.animationTypes.QUAD_EASE_IN] = this.quadEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.QUAD_EASE_OUT] = this.quadEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.QUAD_EASE_INOUT] = this.quadEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.CUBIC_EASE_IN] = this.cubicEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.CUBIC_EASE_OUT] = this.cubicEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.CUBIC_EASE_INOUT] = this.cubicEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.QUART_EASE_IN] = this.quartEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.QUART_EASE_OUT] = this.quartEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.QUART_EASE_INOUT] = this.quartEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.QUINT_EASE_IN] = this.quintEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.QUINT_EASE_OUT] = this.quintEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.QUINT_EASE_INOUT] = this.quintEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.SINE_EASE_IN] = this.sineEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.SINE_EASE_OUT] = this.sineEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.SINE_EASE_INOUT] = this.sineEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.EXPO_EASE_IN] = this.expoEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.EXPO_EASE_OUT] = this.expoEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.EXPO_EASE_INOUT] = this.expoEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.CIRC_EASE_IN] = this.circEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.CIRC_EASE_OUT] = this.circEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.CIRC_EASE_INOUT] = this.circEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.ELASTIC_EASE_IN] = this.elasticEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.ELASTIC_EASE_OUT] = this.elasticEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.ELASTIC_EASE_INOUT] = this.elasticEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.BACK_EASE_IN] = this.backEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.BACK_EASE_OUT] = this.backEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.BACK_EASE_INOUT] = this.backEaseInOutFunc;
  this.updateFunctionsByType[this.animationTypes.BOUNCE_EASE_IN] = this.bounceEaseInFunc;
  this.updateFunctionsByType[this.animationTypes.BOUNCE_EASE_OUT] = this.bounceEaseOutFunc;
  this.updateFunctionsByType[this.animationTypes.BOUNCE_EASE_INOUT] = this.bounceEaseInOutFunc;
}

AnimationHandler.prototype.assignUUIDToAnimation = function(animation){
  animation.uuid = this.uuidCounter ++;
}

AnimationHandler.prototype.forceFinish = function(animation){
  this.activeAnimations.delete(animation.uuid);
  this.afterAnimationSettersByType[animation.description.action](animation);
}

AnimationHandler.prototype.onAnimationFinished = function(animation){
  if (!animation.rewind){
    this.activeAnimations.delete(animation.uuid);
    this.afterAnimationSettersByType[animation.description.action](animation);
  }
}

AnimationHandler.prototype.resetAnimation = function(animation){
  this.afterAnimationSettersByType[animation.description.action](animation);
}

AnimationHandler.prototype.purgeAnimation = function(animation){
  animation.rewind = false;
  this.onAnimationFinished(animation);
  delete animation.attachedObject.animations[animation.name];
}

AnimationHandler.prototype.animationUpdateFunc = function(animation, animationName){
  animation.update();
}

AnimationHandler.prototype.update = function(){
  this.activeAnimations.forEach(this.animationUpdateFunc);
}

AnimationHandler.prototype.startAnimation = function(animation){
  this.activeAnimations.set(animation.uuid, animation);
  animation.onStart(this.initialValueGetterFunctionsByType[animation.description.action](animation.attachedObject));
}

AnimationHandler.prototype.reset = function(){
  this.activeAnimations = new Map();
}

// ACTION FUNCTIONS ************************************************
AnimationHandler.prototype.updateObjectTransparencyFunc = function(params){
  params.object.updateOpacity(params.value);
}
AnimationHandler.prototype.updateObjectScaleXFunc = function(params){
  params.object.mesh.scale.x = params.value;
}
AnimationHandler.prototype.updateObjectScaleYFunc = function(params){
  params.object.mesh.scale.y = params.value;
}
AnimationHandler.prototype.updateObjectScaleZFunc = function(params){
  params.object.mesh.scale.z = params.value;
}
AnimationHandler.prototype.updateObjectRotationXFunc = function(params){
  params.object.mesh.rotation.x = params.value;
}
AnimationHandler.prototype.updateObjectRotationYFunc = function(params){
  params.object.mesh.rotation.y = params.value;
}
AnimationHandler.prototype.updateObjectRotationZFunc = function(params){
  params.object.mesh.rotation.z = params.value;
}
AnimationHandler.prototype.updateObjectPositionXFunc = function(params){
  params.object.mesh.position.x = params.value;
}
AnimationHandler.prototype.updateObjectPositionYFunc = function(params){
  params.object.mesh.position.y = params.value;
}
AnimationHandler.prototype.updateObjectPositionZFunc = function(params){
  params.object.mesh.position.z = params.value;
}
AnimationHandler.prototype.updateObjectEmissiveIntensity = function(params){
  params.object.setEmissiveIntensity(params.value);
}
AnimationHandler.prototype.updateObjectDisplacementScale = function(params){
  params.object.setDisplacementScale(params.value);
}
AnimationHandler.prototype.updateObjectDisplacementBias = function(params){
  params.object.setDisplacementBias(params.value);
}
AnimationHandler.prototype.updateObjectEmissiveColor = function(params){
  params.object.setEmissiveColor(params.sourceColor.lerp(params.targetColor, params.value));
}
AnimationHandler.prototype.updateObjectTextureOffsetX = function(params){
  params.object.setTextureOffsetX(params.value);
}
AnimationHandler.prototype.updateObjectTextureOffsetY = function(params){
  params.object.setTextureOffsetY(params.value);
}
// UPDATE FUNCTIONS ************************************************
AnimationHandler.prototype.linearFunc = function(curTime, startVal, changeInVal, totalTime){
  return (changeInVal * curTime / totalTime) + startVal;
}

AnimationHandler.prototype.quadEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal * (curTime/=totalTime) * curTime + startVal;
}

AnimationHandler.prototype.quadEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return -changeInVal * (curTime/=totalTime) * (curTime-2) + startVal;
}

AnimationHandler.prototype.quadEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  if ((curTime/=totalTime/2) < 1) return changeInVal/2*curTime*curTime + startVal;
  return -changeInVal/2 * ((--curTime)*(curTime-2) - 1) + startVal;
}

AnimationHandler.prototype.cubicEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal*(curTime/=totalTime)*curTime*curTime + startVal;
}

AnimationHandler.prototype.cubicEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal*((curTime=curTime/totalTime-1)*curTime*curTime + 1) + startVal;
}

AnimationHandler.prototype.cubicEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  if ((curTime/=totalTime/2) < 1) return changeInVal/2*curTime*curTime*curTime + startVal;
  return changeInVal/2*((curTime-=2)*curTime*curTime + 2) + startVal;
}

AnimationHandler.prototype.quartEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal*(curTime/=totalTime)*curTime*curTime*curTime + startVal;
}

AnimationHandler.prototype.quartEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return -changeInVal * ((curTime=curTime/totalTime-1)*curTime*curTime*curTime - 1) + startVal;
}

AnimationHandler.prototype.quartEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  if ((curTime/=totalTime/2) < 1) return changeInVal/2*curTime*curTime*curTime*curTime + startVal;
  return -changeInVal/2 * ((curTime-=2)*curTime*curTime*curTime - 2) + startVal;
}

AnimationHandler.prototype.quintEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal*(curTime/=totalTime)*curTime*curTime*curTime*curTime + startVal;
}

AnimationHandler.prototype.quintEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal*((curTime=curTime/totalTime-1)*curTime*curTime*curTime*curTime + 1) + startVal;
}

AnimationHandler.prototype.quintEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  if ((curTime/=totalTime/2) < 1) return changeInVal/2*curTime*curTime*curTime*curTime*curTime + startVal;
  return changeInVal/2*((curTime-=2)*curTime*curTime*curTime*curTime + 2) + startVal;
}

AnimationHandler.prototype.sineEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  return -changeInVal * Math.cos(curTime/totalTime * (Math.PI/2)) + changeInVal + startVal;
}

AnimationHandler.prototype.sineEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal * Math.sin(curTime/totalTime * (Math.PI/2)) + startVal;
}

AnimationHandler.prototype.sineEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return -changeInVal/2 * (Math.cos(Math.PI*curTime/totalTime) - 1) + startVal;
}

AnimationHandler.prototype.expoEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  return (curTime==0) ? startVal : changeInVal * Math.pow(2, 10 * (curTime/totalTime - 1)) + startVal;
}

AnimationHandler.prototype.expoEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return (curTime==totalTime) ? startVal+changeInVal : changeInVal * (-Math.pow(2, -10 * curTime/totalTime) + 1) + startVal;
}

AnimationHandler.prototype.expoEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return (curTime==totalTime) ? startVal+changeInVal : changeInVal * (-Math.pow(2, -10 * curTime/totalTime) + 1) + startVal;
}

AnimationHandler.prototype.circEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  return -changeInVal * (Math.sqrt(1 - (curTime/=totalTime)*curTime) - 1) + startVal;
}

AnimationHandler.prototype.circEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  return changeInVal * Math.sqrt(1 - (curTime=curTime/totalTime-1)*curTime) + startVal;
}

AnimationHandler.prototype.circEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  if ((curTime/=totalTime/2) < 1) return -changeInVal/2 * (Math.sqrt(1 - curTime*curTime) - 1) + startVal;
  return changeInVal/2 * (Math.sqrt(1 - (curTime-=2)*curTime) + 1) + startVal;
}

AnimationHandler.prototype.elasticEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  var s=1.70158;var p=0;var a=changeInVal;
  if (curTime==0) return startVal;  if ((curTime/=totalTime)==1) return startVal+changeInVal;  if (!p) p=totalTime*.3;
  if (a < Math.abs(changeInVal)) { a=changeInVal; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (changeInVal/a);
  return -(a*Math.pow(2,10*(curTime-=1)) * Math.sin( (curTime*totalTime-s)*(2*Math.PI)/p )) + startVal;
}

AnimationHandler.prototype.elasticEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  var s=1.70158;var p=0;var a=changeInVal;
  if (curTime==0) return startVal;  if ((curTime/=totalTime)==1) return startVal+changeInVal;  if (!p) p=totalTime*.3;
  if (a < Math.abs(changeInVal)) { a=changeInVal; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (changeInVal/a);
  return a*Math.pow(2,-10*curTime) * Math.sin( (curTime*totalTime-s)*(2*Math.PI)/p ) + changeInVal + startVal;
}

AnimationHandler.prototype.elasticEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  var s=1.70158;var p=0;var a=changeInVal;
  if (curTime==0) return b;  if ((curTime/=totalTime/2)==2) return b+changeInVal;  if (!p) p=totalTime*(.3*1.5);
  if (a < Math.abs(changeInVal)) { a=changeInVal; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (changeInVal/a);
  if (curTime < 1) return -.5*(a*Math.pow(2,10*(curTime-=1)) * Math.sin( (curTime*totalTime-s)*(2*Math.PI)/p )) + startVal;
  return a*Math.pow(2,-10*(curTime-=1)) * Math.sin( (curTime*totalTime-s)*(2*Math.PI)/p )*.5 + changeInVal + startVal;
}

AnimationHandler.prototype.backEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  var s = 1.70158;
  return changeInVal*(curTime/=totalTime)*curTime*((s+1)*curTime - s) + startVal;
}

AnimationHandler.prototype.backEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  var s = 1.70158;
  return changeInVal*((curTime=curTime/totalTime-1)*curTime*((s+1)*curTime + s) + 1) + startVal;
}

AnimationHandler.prototype.backEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  var s = 1.70158;
  if ((curTime/=totalTime/2) < 1) return changeInVal/2*(curTime*curTime*(((s*=(1.525))+1)*curTime - s)) + startVal;
  return changeInVal/2*((curTime-=2)*curTime*(((s*=(1.525))+1)*curTime + s) + 2) + startVal;
}

AnimationHandler.prototype.bounceEaseInFunc = function(curTime, startVal, changeInVal, totalTime){
  var easeOutBounceFunc = animationHandler.updateFunctionsByType[animationHandler.animationTypes.BOUNCE_EASE_OUT];
  return changeInVal - easeOutBounceFunc(totalTime-curTime, 0, changeInVal, totalTime) + startVal;
}

AnimationHandler.prototype.bounceEaseOutFunc = function(curTime, startVal, changeInVal, totalTime){
  if ((curTime/=totalTime) < (1/2.75)){
    return changeInVal*(7.5625*curTime*curTime) + startVal;
  }else if (curTime < (2/2.75)){
    return changeInVal*(7.5625*(curTime-=(1.5/2.75))*curTime + .75) + startVal;
  }else if (curTime < (2.5/2.75)){
    return changeInVal*(7.5625*(curTime-=(2.25/2.75))*curTime + .9375) + startVal;
  }else{
    return changeInVal*(7.5625*(curTime-=(2.625/2.75))*curTime + .984375) + startVal;
  }
}

AnimationHandler.prototype.bounceEaseInOutFunc = function(curTime, startVal, changeInVal, totalTime){
  var easeInBounceFunc = animationHandler.updateFunctionsByType[animationHandler.animationTypes.BOUNCE_EASE_IN];
  var easeOutBounceFunc = animationHandler.updateFunctionsByType[animationHandler.animationTypes.BOUNCE_EASE_OUT];
  if (curTime < totalTime/2) return easeInBounceFunc(curTime*2, 0, changeInVal, totalTime) * .5 + startVal;
  return easeOutBounceFunc(curTime*2-totalTime, 0, changeInVal, totalTime) * .5 + changeInVal*.5 + startVal;
}
