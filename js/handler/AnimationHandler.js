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
      TRANSPARENCY: "OBJECT_TRANSPARENCY", SCALE_X: "OBJECT_SCALE_X", SCALE_Y: "OBJECT_SCALE_Y", SCALE_Z: "OBJECT_SCALE_Z",
      ROTATION_X: "OBJECT_ROTATION_X", ROTATION_Y: "OBJECT_ROTATION_Y", ROTATION_Z: "OBJECT_ROTATION_Z", POSITION_X: "OBJECT_POSITION_X",
      POSITION_Y: "OBJECT_POSITION_Y", POSITION_Z: "OBJECT_POSITION_Z", EMISSIVE_INTENSITY: "OBJECT_EMISSIVE_INTENSITY", DISPLACEMENT_SCALE: "OBJECT_DISPLACEMENT_SCALE",
      DISPLACEMENT_BIAS: "OBJECT_DISPLACEMENT_BIAS", EMISSIVE_COLOR: "OBJECT_EMISSIVE_COLOR", TEXTURE_OFFSET_X: "OBJECT_TEXTURE_OFFSET_X",
      TEXTURE_OFFSET_Y: "OBJECT_TEXTURE_OFFSET_Y", TRANSLATE_X: "OBJECT_TRANSLATE_X", TRANSLATE_Y: "OBJECT_TRANSLATE_Y", TRANSLATE_Z: "OBJECT_TRANSLATE_Z",
      AO_INTENSITY: "OBJECT_AO_INTENSITY", DISP_TEXTURE_OFFSET_X: "OBJECT_DISP_TEXTURE_OFFSET_X", DISP_TEXTURE_OFFSET_Y: "OBJECT_DISP_TEXTURE_OFFSET_Y"
    },
    TEXT: {
      TRANSPARENCY: "TEXT_TRANSPARENCY", CHAR_SIZE: "TEXT_CHAR_SIZE", MARGIN_BETWEEN_CHARS: "TEXT_MARGIN_BETWEEN_CHARS",
      MARGIN_BETWEEN_LINES: "TEXT_MARGIN_BETWEEN_LINES", POSITION_X: "TEXT_POSITION_X", POSITION_Y: "TEXT_POSITION_Y",
      POSITION_Z: "TEXT_POSITION_Z", TEXT_COLOR: "TEXT_TEXT_COLOR", BACKGROUND_COLOR: "TEXT_BACKGROUND_COLOR", TYPING: "TEXT_TYPING"
    },
    SPRITE: {
      TRANSPARENCY: "SPRITE_TRANSPARENCY", SCALE_X: "SPRITE_SCALE_X", SCALE_Y: "SPRITE_SCALE_Y", ROTATION: "SPRITE_ROTATION",
      COLOR: "SPRITE_COLOR", POSITION_X: "SPRITE_POSITION_X", POSITION_Y: "SPRITE_POSITION_Y", TARGET_POSITION_X: "SPRITE_TARGET_POSITION_X",
      TARGET_POSITION_Y: "SPRITE_TARGET_POSITION_Y", TARGET_ROTATION: "SPRITE_TARGET_ROTATION", TARGET_SCALE_X: "SPRITE_TARGET_SCALE_X",
      TARGET_SCALE_Y: "SPRITE_TARGET_SCALE_Y"
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
    if (object.pivotObject){
      object.updatePivot();
      object.pivotObject.pseudoMesh.updateMatrix();
      object.pivotObject.pseudoMesh.updateMatrixWorld();
      return object.pivotObject.pseudoMesh.rotation.x;
    }
    return object.mesh.rotation.x;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.ROTATION_Y] = function(object){
    if (object.pivotObject){
      object.updatePivot();
      object.pivotObject.pseudoMesh.updateMatrix();
      object.pivotObject.pseudoMesh.updateMatrixWorld();
      return object.pivotObject.pseudoMesh.rotation.y;
    }
    return object.mesh.rotation.y;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.ROTATION_Z] = function(object){
    if (object.pivotObject){
      object.updatePivot();
      object.pivotObject.pseudoMesh.updateMatrix();
      object.pivotObject.pseudoMesh.updateMatrixWorld();
      return object.pivotObject.pseudoMesh.rotation.z;
    }
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
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_X] = function(object){
    return object.customDisplacementTextureMatrixInfo.offsetX;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_Y] = function(object){
    return object.customDisplacementTextureMatrixInfo.offsetY;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.TRANSLATE_X] = function(object){
    return 0;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.TRANSLATE_Y] = function(object){
    return 0;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.TRANSLATE_Z] = function(object){
    return 0;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.OBJECT.AO_INTENSITY] = function(object){
    return object.getAOIntensity();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.TRANSPARENCY] = function(object){
    return object.getAlpha();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.CHAR_SIZE] = function(object){
    return object.getCharSize();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.MARGIN_BETWEEN_CHARS] = function(object){
    return object.getMarginBetweenChars();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.MARGIN_BETWEEN_LINES] = function(object){
    return object.getMarginBetweenLines();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.POSITION_X] = function(object){
    return object.getPositionX();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.POSITION_Y] = function(object){
    return object.getPositionY();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.POSITION_Z] = function(object){
    return object.getPositionZ();
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.TEXT_COLOR] = function(object){
    return 0;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.BACKGROUND_COLOR] = function(object){
    return 0;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.TEXT.TYPING] = function(object){
    return 0;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.TRANSPARENCY] = function(object){
    return object.mesh.material.uniforms.alpha.value;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.SCALE_X] = function(object){
    return object.mesh.material.uniforms.scale.value.x;
  };
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.SCALE_Y] = function(object){
    return object.mesh.material.uniforms.scale.value.y;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.ROTATION] = function(object){
    return object.mesh.material.uniforms.rotationAngle.value;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.COLOR] = function(object){
    return 0;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.POSITION_X] = function(object){
    return object.marginPercentX;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.POSITION_Y] = function(object){
    return object.marginPercentY;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.TARGET_POSITION_X] = function(object){
    return 0;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.TARGET_POSITION_Y] = function(object){
    return 0;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.TARGET_ROTATION] = function(object){
    return 0;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.TARGET_SCALE_X] = function(object){
    return 0;
  }
  this.initialValueGetterFunctionsByType[this.actionTypes.SPRITE.TARGET_SCALE_Y] = function(object){
    return 0;
  }
  // AFTER ANIMATION SETTER FUNCTIONS
  this.afterAnimationSettersByType = new Object();
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.TRANSPARENCY] = function(animation){
    animation.attachedObject.updateOpacity(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.SCALE_X] = function(animation){
    animation.attachedObject.mesh.scale.x = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.SCALE_Y] = function(animation){
    animation.attachedObject.mesh.scale.y = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.SCALE_Z] = function(animation){
    animation.attachedObject.mesh.scale.z = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.ROTATION_X] = function(animation){
    if (animation.attachedObject.pivotObject){
      animation.attachedObject.pivotObject.pseudoMesh.rotation.x = animation.initialValue;
      animation.attachedObject.updatePivot();
      animation.attachedObject.pivotObject.updateMatrix();
      animation.attachedObject.pivotObject.updateMatrixWorld();
      animation.attachedObject.updateTransformBasedOnPivot();
      if (animation.attachedObject.autoInstancedParent){
        animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
      }
      animation.attachedObject.onAfterRotationAnimation();
      return;
    }
    animation.attachedObject.mesh.rotation.x = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    animation.attachedObject.onAfterRotationAnimation();
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.ROTATION_Y] = function(animation){
    if (animation.attachedObject.pivotObject){
      animation.attachedObject.pivotObject.pseudoMesh.rotation.y = animation.initialValue;
      animation.attachedObject.updatePivot();
      animation.attachedObject.pivotObject.updateMatrix();
      animation.attachedObject.pivotObject.updateMatrixWorld();
      animation.attachedObject.updateTransformBasedOnPivot();
      if (animation.attachedObject.autoInstancedParent){
        animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
      }
      animation.attachedObject.onAfterRotationAnimation();
      return;
    }
    animation.attachedObject.mesh.rotation.y = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    animation.attachedObject.onAfterRotationAnimation();
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.ROTATION_Z] = function(animation){
    if (animation.attachedObject.pivotObject){
      animation.attachedObject.pivotObject.pseudoMesh.rotation.z = animation.initialValue;
      animation.attachedObject.updatePivot();
      animation.attachedObject.pivotObject.updateMatrix();
      animation.attachedObject.pivotObject.updateMatrixWorld();
      animation.attachedObject.updateTransformBasedOnPivot();
      if (animation.attachedObject.autoInstancedParent){
        animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
      }
      animation.attachedObject.onAfterRotationAnimation();
      return;
    }
    animation.attachedObject.mesh.rotation.z = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    animation.attachedObject.onAfterRotationAnimation();
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.POSITION_X] = function(animation){
    animation.attachedObject.mesh.position.x = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    if (mode == 1 && animation.attachedObject.isChangeable){
      animation.attachedObject.setPosition(animation.attachedObject.mesh.position.x, animation.attachedObject.mesh.position.y, animation.attachedObject.mesh.position.z);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.POSITION_Y] = function(animation){
    animation.attachedObject.mesh.position.y = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    if (mode == 1 && animation.attachedObject.isChangeable){
      animation.attachedObject.setPosition(animation.attachedObject.mesh.position.x, animation.attachedObject.mesh.position.y, animation.attachedObject.mesh.position.z);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.POSITION_Z] = function(animation){
    animation.attachedObject.mesh.position.z = animation.initialValue;
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    if (mode == 1 && animation.attachedObject.isChangeable){
      animation.attachedObject.setPosition(animation.attachedObject.mesh.position.x, animation.attachedObject.mesh.position.y, animation.attachedObject.mesh.position.z);
    }
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
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_X] = function(animation){
    animation.attachedObject.setCustomDisplacementTextureOffset(animation.initialValue, null);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_Y] = function(animation){
    animation.attachedObject.setCustomDisplacementTextureOffset(null, animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.TRANSLATE_X] = function(animation){
    animation.attachedObject.mesh.translateX(-1 * animation.params.totalTranslationX);
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    if (mode == 1 && animation.attachedObject.isChangeable){
      animation.attachedObject.setPosition(animation.attachedObject.mesh.position.x, animation.attachedObject.mesh.position.y, animation.attachedObject.mesh.position.z);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.TRANSLATE_Y] = function(animation){
    animation.attachedObject.mesh.translateY(-1 * animation.params.totalTranslationY);
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    if (mode == 1 && animation.attachedObject.isChangeable){
      animation.attachedObject.setPosition(animation.attachedObject.mesh.position.x, animation.attachedObject.mesh.position.y, animation.attachedObject.mesh.position.z);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.TRANSLATE_Z] = function(animation){
    animation.attachedObject.mesh.translateZ(-1 * animation.params.totalTranslationZ);
    if (animation.attachedObject.autoInstancedParent){
      animation.attachedObject.autoInstancedParent.updateObject(animation.attachedObject);
    }
    if (mode == 1 && animation.attachedObject.isChangeable){
      animation.attachedObject.setPosition(animation.attachedObject.mesh.position.x, animation.attachedObject.mesh.position.y, animation.attachedObject.mesh.position.z);
    }
  };
  this.afterAnimationSettersByType[this.actionTypes.OBJECT.AO_INTENSITY] = function(animation){
    animation.attachedObject.setAOIntensity(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.TEXT.TRANSPARENCY] = function(animation){
    animation.attachedObject.setAlpha(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.TEXT.CHAR_SIZE] = function(animation){
    animation.attachedObject.setCharSize(animation.initialValue);
  };
  this.afterAnimationSettersByType[this.actionTypes.TEXT.MARGIN_BETWEEN_CHARS] = function(animation){
    animation.attachedObject.setMarginBetweenChars(animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.TEXT.MARGIN_BETWEEN_LINES] = function(animation){
    animation.attachedObject.setMarginBetweenLines(animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.TEXT.POSITION_X] = function(animation){
    animation.attachedObject.setPositionX(animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.TEXT.POSITION_Y] = function(animation){
    animation.attachedObject.setPositionY(animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.TEXT.POSITION_Z] = function(animation){
    animation.attachedObject.setPositionZ(animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.TEXT.TEXT_COLOR] = function(animation){
    animation.attachedObject.setColor(animation.params.sourceColor.getHex(), false);
  }
  this.afterAnimationSettersByType[this.actionTypes.TEXT.BACKGROUND_COLOR] = function(animation){
    animation.attachedObject.setBackground(animation.params.sourceColor.getHex(), animation.attachedObject.getBackgroundAlpha(), false);
  }
  this.afterAnimationSettersByType[this.actionTypes.TEXT.TYPING] = function(animation){
    animation.attachedObject.setText(animation.params.sourceText, false);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.TRANSPARENCY] = function(animation){
    animation.attachedObject.mesh.material.uniforms.alpha.value = animation.initialValue;
    if (animation.initialValue >= 1){
      animation.attachedObject.mesh.material.transparent = false;
    }else{
      animation.attachedObject.mesh.material.transparent = true;
    }
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.SCALE_X] = function(animation){
    animation.attachedObject.setScale(animation.initialValue, animation.attachedObject.mesh.material.uniforms.scale.value.y);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.SCALE_Y] = function(animation){
    animation.attachedObject.setScale(animation.attachedObject.mesh.material.uniforms.scale.value.x, animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.ROTATION] = function(animation){
    animation.attachedObject.setRotation(animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.COLOR] = function(animation){
    animation.attachedObject.setColor(animation.params.sourceColor.getHex());
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.POSITION_X] = function(animation){
    animation.attachedObject.set2DCoordinates(animation.initialValue, animation.attachedObject.marginPercentY);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.POSITION_Y] = function(animation){
    animation.attachedObject.set2DCoordinates(animation.attachedObject.marginPercentX, animation.initialValue);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.TARGET_POSITION_X] = function(animation){
    animation.attachedObject.set2DCoordinates(animation.params.sourcePosition, animation.attachedObject.marginPercentY);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.TARGET_POSITION_Y] = function(animation){
    animation.attachedObject.set2DCoordinates(animation.attachedObject.marginPercentX, animation.params.sourcePosition);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.TARGET_ROTATION] = function(animation){
    animation.attachedObject.setRotation(animation.params.sourceRotation);
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.TARGET_SCALE_X] = function(animation){
    if (typeof animation.fixedWidth == UNDEFINED){
      animation.attachedObject.setScale(animation.params.sourceScale, animation.attachedObject.mesh.material.uniforms.scale.value.y);
    }else{
      animation.attachedObject.setWidthPercent(animation.params.fixedWidth);
    }
  }
  this.afterAnimationSettersByType[this.actionTypes.SPRITE.TARGET_SCALE_Y] = function(animation){
    if (typeof animation.fixedHeight == UNDEFINED){
      animation.attachedObject.setScale(animation.attachedObject.mesh.material.uniforms.scale.value.x, animation.params.sourceScale);
    }else{
      animation.attachedObject.setHeightPercent(animation.params.fixedHeight);
    }
  }
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
  this.actionFunctionsByType[this.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_X] = this.updateObjectDispTextureOffsetX;
  this.actionFunctionsByType[this.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_Y] = this.updateObjectDispTextureOffsetY;
  this.actionFunctionsByType[this.actionTypes.OBJECT.TRANSLATE_X] = this.updateObjectTranslationX;
  this.actionFunctionsByType[this.actionTypes.OBJECT.TRANSLATE_Y] = this.updateObjectTranslationY;
  this.actionFunctionsByType[this.actionTypes.OBJECT.TRANSLATE_Z] = this.updateObjectTranslationZ;
  this.actionFunctionsByType[this.actionTypes.OBJECT.AO_INTENSITY] = this.updateObjectAOIntensity;
  this.actionFunctionsByType[this.actionTypes.TEXT.TRANSPARENCY] = this.updateTextTransparencyFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.CHAR_SIZE] = this.updateTextCharSizeFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.MARGIN_BETWEEN_CHARS] = this.updateTextMarginBetweenCharsFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.MARGIN_BETWEEN_LINES] = this.updateTextMarginBetweenLinesFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.POSITION_X] = this.updateTextPositionXFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.POSITION_Y] = this.updateTextPositionYFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.POSITION_Z] = this.updateTextPositionZFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.TEXT_COLOR] = this.updateTextColorFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.BACKGROUND_COLOR] = this.updateTextBackgroundColorFunc;
  this.actionFunctionsByType[this.actionTypes.TEXT.TYPING] = this.updateTextTypingFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.TRANSPARENCY] = this.updateSpriteTransparencyFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.SCALE_X] = this.updateSpriteScaleXFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.SCALE_Y] = this.updateSpriteScaleYFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.ROTATION] = this.updateSpriteRotationFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.COLOR] = this.updateSpriteColorFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.POSITION_X] = this.updateSpritePositionXFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.POSITION_Y] = this.updateSpritePositionYFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.TARGET_POSITION_X] = this.updateSpriteTargetPositionXFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.TARGET_POSITION_Y] = this.updatespriteTargetPositionYFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.TARGET_ROTATION] = this.updateSpriteTargetRotationFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.TARGET_SCALE_X] = this.updateSpriteTargetScaleXFunc;
  this.actionFunctionsByType[this.actionTypes.SPRITE.TARGET_SCALE_Y] = this.updateSpriteTargetScaleYFunc;
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

AnimationHandler.prototype.freezeOnFinish = function(animation){
  animation.freezeOnFinish = true;
}

AnimationHandler.prototype.unfreeze = function(animation){
  animation.freezeOnFinish = false;
}

AnimationHandler.prototype.assignUUIDToAnimation = function(animation){
  animation.uuid = this.uuidCounter ++;
}

AnimationHandler.prototype.onBeforePivotRotation = function(animation){
  animation.saveState();
  this.afterAnimationSettersByType[animation.description.action](animation);
}

AnimationHandler.prototype.onAfterPivotRotation = function(animation){
  animation.restore();
}

AnimationHandler.prototype.forceFinish = function(animation){
  if (!animation.isInitialValueAssigned()){
    return;
  }
  animation.animationState = ANIMATION_STATE_NOT_RUNNING;
  animation.isFreezed = false;
  this.activeAnimations.delete(animation.uuid);
  this.afterAnimationSettersByType[animation.description.action](animation);
  animation.invalidateInitialValue();
}

AnimationHandler.prototype.onAnimationFinished = function(animation){
  if (!animation.repeat){
    animation.animationState = ANIMATION_STATE_NOT_RUNNING;
    this.activeAnimations.delete(animation.uuid);
    this.afterAnimationSettersByType[animation.description.action](animation);
    animation.invalidateInitialValue();
  }
}

AnimationHandler.prototype.resetAnimation = function(animation){
  this.afterAnimationSettersByType[animation.description.action](animation);
}

AnimationHandler.prototype.purgeAnimation = function(animation){
  animation.repeat = false;
  this.onAnimationFinished(animation);
  delete animation.attachedObject.animations[animation.name];
}

AnimationHandler.prototype.animationUpdateFunc = function(animation, animationName){
  animation.update();
}

AnimationHandler.prototype.update = function(){
  this.activeAnimations.forEach(this.animationUpdateFunc);
}

AnimationHandler.prototype.assignInitialValue = function(animation){
  animation.initialValue = this.initialValueGetterFunctionsByType[animation.description.action](animation.attachedObject);
  if (animation.description.action == this.actionTypes.OBJECT.EMISSIVE_COLOR){
    animation.params.sourceColor.copy(animation.attachedObject.getEmissiveColor());
  }else if (animation.description.action == this.actionTypes.TEXT.TEXT_COLOR){
    animation.params.sourceColor.copy(animation.attachedObject.getColor());
  }else if (animation.description.action == this.actionTypes.TEXT.BACKGROUND_COLOR){
    animation.params.sourceColor.copy(animation.attachedObject.getBackgroundColor());
  }else if (animation.description.action == this.actionTypes.TEXT.TYPING){
    animation.params.sourceText = animation.attachedObject.text;
  }else if (animation.description.action == this.actionTypes.OBJECT.TRANSLATE_X){
    animation.params.totalTranslationX = 0;
  }else if (animation.description.action == this.actionTypes.OBJECT.TRANSLATE_Y){
    animation.params.totalTranslationY = 0;
  }else if (animation.description.action == this.actionTypes.OBJECT.TRANSLATE_Z){
    animation.params.totalTranslationZ = 0;
  }else if (animation.description.action == this.actionTypes.SPRITE.COLOR){
    animation.params.sourceColor.copy(animation.attachedObject.getColor());
  }
  animation.hasInitialValue = true;
}

AnimationHandler.prototype.forceRewind = function(animation){
  if (animation.animationState == ANIMATION_STATE_RUNNING){
    animation.forceRewind();
  }
}

AnimationHandler.prototype.cancelRewind = function(animation){
  if (animation.animationState == ANIMATION_STATE_REWINDING){
    animation.cancelRewind();
  }
}

AnimationHandler.prototype.startAnimation = function(animation){
  this.unfreeze(animation);
  this.assignInitialValue(animation);
  this.activeAnimations.set(animation.uuid, animation);
  animation.onStart(this.initialValueGetterFunctionsByType[animation.description.action](animation.attachedObject));
}

AnimationHandler.prototype.startAllAnimations = function(obj){
  for (var animName in obj.animations){
    var animation = obj.animations[animName];

    this.forceFinish(animation);
    this.startAnimation(animation);
  }
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
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
}
AnimationHandler.prototype.updateObjectScaleYFunc = function(params){
  params.object.mesh.scale.y = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
}
AnimationHandler.prototype.updateObjectScaleZFunc = function(params){
  params.object.mesh.scale.z = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
}
AnimationHandler.prototype.updateObjectRotationXFunc = function(params){
  if (params.object.pivotObject){
    params.object.pivotObject.pseudoMesh.rotation.x = params.value;
    params.object.updatePivot();
    params.object.pivotObject.updateMatrix();
    params.object.pivotObject.updateMatrixWorld();
    params.object.updateTransformBasedOnPivot();
    if (params.object.autoInstancedParent){
      params.object.autoInstancedParent.updateObject(params.object);
    }
    params.object.onAfterRotationAnimation();
    return;
  }
  params.object.mesh.rotation.x = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  params.object.onAfterRotationAnimation();
}
AnimationHandler.prototype.updateObjectRotationYFunc = function(params){
  if (params.object.pivotObject){
    params.object.pivotObject.pseudoMesh.rotation.y = params.value;
    params.object.updatePivot();
    params.object.pivotObject.updateMatrix();
    params.object.pivotObject.updateMatrixWorld();
    params.object.updateTransformBasedOnPivot();
    if (params.object.autoInstancedParent){
      params.object.autoInstancedParent.updateObject(params.object);
    }
    params.object.onAfterRotationAnimation();
    return;
  }
  params.object.mesh.rotation.y = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  params.object.onAfterRotationAnimation();
}
AnimationHandler.prototype.updateObjectRotationZFunc = function(params){
  if (params.object.pivotObject){
    params.object.pivotObject.pseudoMesh.rotation.z = params.value;
    params.object.updatePivot();
    params.object.pivotObject.updateMatrix();
    params.object.pivotObject.updateMatrixWorld();
    params.object.updateTransformBasedOnPivot();
    if (params.object.autoInstancedParent){
      params.object.autoInstancedParent.updateObject(params.object);
    }
    params.object.onAfterRotationAnimation();
    return;
  }
  params.object.mesh.rotation.z = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  params.object.onAfterRotationAnimation();
}
AnimationHandler.prototype.updateObjectPositionXFunc = function(params){
  params.object.mesh.position.x = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  if (mode == 1 && params.object.isChangeable){
    params.object.setPosition(params.object.mesh.position.x, params.object.mesh.position.y, params.object.mesh.position.z);
  }
}
AnimationHandler.prototype.updateObjectPositionYFunc = function(params){
  params.object.mesh.position.y = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  if (mode == 1 && params.object.isChangeable){
    params.object.setPosition(params.object.mesh.position.x, params.object.mesh.position.y, params.object.mesh.position.z);
  }
}
AnimationHandler.prototype.updateObjectPositionZFunc = function(params){
  params.object.mesh.position.z = params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  if (mode == 1 && params.object.isChangeable){
    params.object.setPosition(params.object.mesh.position.x, params.object.mesh.position.y, params.object.mesh.position.z);
  }
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
  REUSABLE_COLOR.copy(params.sourceColor);
  params.object.setEmissiveColor(REUSABLE_COLOR.lerp(params.targetColor, params.value));
}
AnimationHandler.prototype.updateObjectTextureOffsetX = function(params){
  params.object.setTextureOffsetX(params.value);
}
AnimationHandler.prototype.updateObjectTextureOffsetY = function(params){
  params.object.setTextureOffsetY(params.value);
}
AnimationHandler.prototype.updateObjectDispTextureOffsetX = function(params){
  params.object.setCustomDisplacementTextureOffset(params.value, null);
}
AnimationHandler.prototype.updateObjectDispTextureOffsetY = function(params){
  params.object.setCustomDisplacementTextureOffset(null, params.value);
}
AnimationHandler.prototype.updateObjectTranslationX = function(params, increaseTick){
  var coef = increaseTick? 1: -1;
  params.object.mesh.translateX(coef * params.value);
  params.totalTranslationX += coef * params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  if (mode == 1 && params.object.isChangeable){
    params.object.setPosition(params.object.mesh.position.x, params.object.mesh.position.y, params.object.mesh.position.z);
  }
}
AnimationHandler.prototype.updateObjectTranslationY = function(params, increaseTick){
  var coef = increaseTick? 1: -1;
  params.object.mesh.translateY(coef * params.value);
  params.totalTranslationY += coef * params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  if (mode == 1 && params.object.isChangeable){
    params.object.setPosition(params.object.mesh.position.x, params.object.mesh.position.y, params.object.mesh.position.z);
  }
}
AnimationHandler.prototype.updateObjectTranslationZ = function(params, increaseTick){
  var coef = increaseTick? 1: -1;
  params.object.mesh.translateZ(coef * params.value);
  params.totalTranslationZ += coef * params.value;
  if (params.object.autoInstancedParent){
    params.object.autoInstancedParent.updateObject(params.object);
  }
  if (mode == 1 && params.object.isChangeable){
    params.object.setPosition(params.object.mesh.position.x, params.object.mesh.position.y, params.object.mesh.position.z);
  }
}
AnimationHandler.prototype.updateObjectAOIntensity = function(params){
  params.object.setAOIntensity(params.value);
}
AnimationHandler.prototype.updateTextTransparencyFunc = function(params){
  params.object.setAlpha(params.value);
}
AnimationHandler.prototype.updateTextCharSizeFunc = function(params){
  params.object.setCharSize(params.value);
}
AnimationHandler.prototype.updateTextMarginBetweenCharsFunc = function(params){
  params.object.setMarginBetweenChars(params.value);
}
AnimationHandler.prototype.updateTextMarginBetweenLinesFunc = function(params){
  params.object.setMarginBetweenLines(params.value);
}
AnimationHandler.prototype.updateTextPositionXFunc = function(params){
  params.object.setPositionX(params.value);
}
AnimationHandler.prototype.updateTextPositionYFunc = function(params){
  params.object.setPositionY(params.value);
}
AnimationHandler.prototype.updateTextPositionZFunc = function(params){
  params.object.setPositionZ(params.value);
}
AnimationHandler.prototype.updateTextColorFunc = function(params){
  REUSABLE_COLOR.copy(params.sourceColor);
  params.object.setColor(REUSABLE_COLOR.lerp(params.targetColor, params.value).getHex(), false);
}
AnimationHandler.prototype.updateTextBackgroundColorFunc = function(params){
  REUSABLE_COLOR.copy(params.sourceColor);
  params.object.setBackground(REUSABLE_COLOR.lerp(params.targetColor, params.value).getHex(), params.object.getBackgroundAlpha(), false);
}
AnimationHandler.prototype.updateTextTypingFunc = function(params){
  params.object.firstNChars(params.sourceText, params.value);
}
AnimationHandler.prototype.updateSpriteTransparencyFunc = function(params){
  params.object.mesh.material.uniforms.alpha.value = params.value;
  if (params.value >= 1){
    params.object.mesh.material.transparent = false;
  }else{
    params.object.mesh.material.transparent = true;
  }
}
AnimationHandler.prototype.updateSpriteScaleXFunc = function(params){
  params.object.setScale(params.value, params.object.mesh.material.uniforms.scale.value.y);
}
AnimationHandler.prototype.updateSpriteScaleYFunc = function(params){
  params.object.setScale(params.object.mesh.material.uniforms.scale.value.x, params.value);
}
AnimationHandler.prototype.updateSpriteRotationFunc = function(params){
  params.object.setRotation(params.value);
}
AnimationHandler.prototype.updateSpriteColorFunc = function(params){
  REUSABLE_COLOR.copy(params.sourceColor);
  params.object.setColor(REUSABLE_COLOR.lerp(params.targetColor, params.value).getHex());
}
AnimationHandler.prototype.updateSpritePositionXFunc = function(params){
  params.object.set2DCoordinates(params.value, params.object.marginPercentY);
}
AnimationHandler.prototype.updateSpritePositionYFunc = function(params){
  params.object.set2DCoordinates(params.object.marginPercentX, params.value);
}
AnimationHandler.prototype.updateSpriteTargetPositionXFunc = function(params){
  var newVal = params.sourcePosition + (params.targetPosition - params.sourcePosition) * params.value;
  params.object.set2DCoordinates(newVal, params.object.marginPercentY);
}
AnimationHandler.prototype.updatespriteTargetPositionYFunc = function(params){
  var newVal = params.sourcePosition + (params.targetPosition - params.sourcePosition) * params.value;
  params.object.set2DCoordinates(params.object.marginPercentX, newVal);
}
AnimationHandler.prototype.updateSpriteTargetRotationFunc = function(params){
  var newVal = params.sourceRotation + (params.targetRotation - params.sourceRotation) * params.value;
  params.object.setRotation(newVal);
}
AnimationHandler.prototype.updateSpriteTargetScaleXFunc = function(params){
  var newVal = params.sourceScale + (params.targetScale - params.sourceScale) * params.value;
  if (typeof params.object.fixedWidth == UNDEFINED){
    params.object.setScale(newVal, params.object.mesh.material.uniforms.scale.value.y);
  }else{
    params.object.setWidthPercent(newVal);
  }
}
AnimationHandler.prototype.updateSpriteTargetScaleYFunc = function(params){
  var newVal = params.sourceScale + (params.targetScale - params.sourceScale) * params.value;
  if (typeof params.object.fixedHeight == UNDEFINED){
    params.object.setScale(params.object.mesh.material.uniforms.scale.value.x, newVal);
  }else{
    params.object.setHeightPercent(newVal);
  }
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
  if (curTime==0) return startVal;  if ((curTime/=totalTime/2)==2) return startVal+changeInVal;  if (!p) p=totalTime*(.3*1.5);
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
