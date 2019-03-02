var Preconditions = function(){
  this.object = "object";
  this.objectGroup = "objectGroup";
  this.childObjectName = "childObjectName";
  this.targetVector = "targetVector";
  this.axis = "axis";
  this.markedPointName = "markedPointName";
  this.targetVector = "targetVector";
  this.particleSystem = "particleSystem";
  this.time = "time";
  this.name = "name";
  this.pool = "pool";
  this.textName = "textName";
  this.keepPhysics = "keepPhysics";
  this.force = "force";
  this.point = "point";
  this.radians = "radians";
  this.x = "x";
  this.y = "y";
  this.z = "z";
  this.skipLocalRotation = "skipLocalRotation";
  this.obj = "obj";
  this.mass = "mass";
  this.velocityVector = "velocityVector";
  this.colorName = "colorName";
  this.alpha = "alpha";
  this.rotationPivot = "rotationPivot";
}

Preconditions.prototype.errorHeader = function(callerFunc){
  return callerFunc.roygbivFuncName+" error: ";
}

Preconditions.prototype.throw = function(callerFunc, errorMsg){
  throw new Error(this.errorHeader(callerFunc)+" ["+errorMsg+"]");
}

Preconditions.prototype.checkIfDefined = function(callerFunc, parameterName, obj){
  if (typeof obj == UNDEFINED || obj == null){
    this.throw(callerFunc, parameterName+" is not defined.");
  }
}

Preconditions.prototype.checkIfObjectGroup = function(callerFunc, parameterName, obj){
  if (!obj.isObjectGroup){
    this.throw(callerFunc, parameterName+" is not an object group.");
  }
}

Preconditions.prototype.checkIfParticleSystemPool = function(callerFunc, parameterName, obj){
  if (!obj.isParticleSystemPool){
    this.throw(callerFunc, parameterName+" is not a particle system pool.");
  }
}

Preconditions.prototype.checkIfVectorOnlyIfDefined = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED) && obj !== null){
    if (isNaN(obj.x) || isNaN(obj.y) || isNaN(obj.z)){
      this.throw(callerFunc, "Bad "+parameterName+" parameter. Expected a vector.");
    }
  }
}

Preconditions.prototype.checkIfAxisOnlyIfDefined = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    var axis = obj.toLowerCase();
    if (axis != "x" && axis != "y" && axis != "z"){
      this.throw(callerFunc, parameterName+" must be x, y, or z.");
    }
  }
}

Preconditions.prototype.checkIfAddedObject = function(callerFunc, parameterName, obj){
  if (!obj.isAddedObject){
    this.throw(callerFunc, parameterName+" is not an AddedObject.");
  }
}

Preconditions.prototype.checkIfAddedObjectOrObjectGroup = function(callerFunc, parameterName, obj){
  if (!obj.isAddedObject && !obj.isObjectGroup){
    this.throw(callerFunc, parameterName+" is not an object or an object group.");
  }
}

Preconditions.prototype.checkIfAddedObjectObjectGroupParticleSystem = function(callerFunc, parameterName, obj){
  if (!obj.isAddedObject && !obj.isObjectGroup && !obj.isParticleSystem){
    this.throw(callerFunc, parameterName+" must be an object, object group or a particle system.");
  }
}

Preconditions.prototype.checkIfMarkedPointExists = function(callerFunc, parameterName, obj){
  if (!obj){
    this.throw(callerFunc, "No such marked point.");
  }
}

Preconditions.prototype.checkIfParticleSystemPoolExists = function(callerFunc, parameterName, obj){
  if (!obj){
    this.throw(callerFunc, "No such particle system pool.");
  }
}

Preconditions.prototype.checkIfParticleSystem = function(callerFunc, parameterName, obj){
  if (!obj.isParticleSystem){
    this.throw(callerFunc, parameterName+" is not a particle system.");
  }
}

Preconditions.prototype.checkIfNumber = function(callerFunc, parameterName, obj){
  if (isNaN(obj)){
    this.throw(callerFunc, parameterName+" is not a number.");
  }
}

Preconditions.prototype.checkIfPoolDestroyed = function(callerFunc, parameterName, obj){
  if (obj.destroyed){
    this.throw(callerFunc, "Pool is destroyed.");
  }
}

Preconditions.prototype.checkIfEndPointAxis = function(callerFunc, parameterName, obj){
  if (!(obj == "+x" || obj == "-x" || obj == "+y" || obj == "-y" || obj == "+z" || obj == "-z")){
    this.throw(callerFunc, parameterName+" must be one of +x, +y, +z, -x, -y, -z");
  }
}

Preconditions.prototype.checkIfBooleanOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED) && !(typeof obj == "boolean")){
    this.throw(callerFunc, parameterName+" is not a boolean.");
  }
}

Preconditions.prototype.checkIfChildObjectOnlyIfExists = function(callerFunc, parameterName, obj){
  if (obj.isAddedObject && !addedObjects[obj.name]){
    this.throw(callerFunc, parameterName+" is a child object. Cannot use this API for child objects.");
  }
}

Preconditions.prototype.checkIfNoMass = function(callerFunc, parameterName, obj){
  if (obj.noMass){
    this.throw(callerFunc, parameterName+" has no mass.");
  }
}

Preconditions.prototype.checkIfChangeable = function(callerFunc, parameterName, obj){
  if (!obj.isChangeable){
    this.throw(callerFunc, parameterName+" is not marked as changeable.");
  }
}

Preconditions.prototype.checkIfDynamic = function(callerFunc, parameterName, obj){
  if (!obj.isDynamicObject){
    this.throw(callerFunc, parameterName+" is not a dynamic object.");
  }
}

Preconditions.prototype.checkIfParentExists = function(callerFunc, parameterName, obj){
  if (!obj){
    this.throw(callerFunc, "Parent not defined.");
  }
}

Preconditions.prototype.checkIfColorizable = function(callerFunc, parameterName, obj){
  if (!obj.isColorizable){
    this.throw(callerFunc, parameterName+" is not marked as colorizable.");
  }
}

Preconditions.prototype.checkIfRotationPivot = function(callerFunc, parameterName, obj){
  if (!obj.isObject3D){
    this.throw(callerFunc, parameterName+" is not a rotation pivot.");
  }
}

Preconditions.prototype.checkIfHavePivotPoint = function(callerFunc, parameterName, obj){
  if (!obj.pivotObject){
    this.throw(callerFunc, parameterName+" does not have a pivot point.");
  }
}
