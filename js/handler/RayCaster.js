var RayCaster = function(){
  this.binHandler = new WorldBinHandler();
  this.origin = new THREE.Vector3();
  this.direction = new THREE.Vector3();
  this.oldPosition = new THREE.Vector3();
  this.updateBuffer = new Map();
  this.ready = false;
}

RayCaster.prototype.hide2D = function(object){
  objectPicker2D.hide(object);
}

RayCaster.prototype.show2D = function(object){
  objectPicker2D.show(object);
}

RayCaster.prototype.update2D = function(object, forceUpdate){
  objectPicker2D.update(object, forceUpdate);
}

RayCaster.prototype.refresh2D = function(){
  objectPicker2D.refresh();
}

RayCaster.prototype.onReady = function(){
  this.ready = true;
  if (this.onReadyCallback){
    this.onReadyCallback();
  }
  if (!IS_WORKER_CONTEXT){
    sceneHandler.onRaycasterReady();
  }
}

RayCaster.prototype.flush = function(){
  this.updateBuffer.forEach(this.issueUpdate);
  this.updateBuffer.clear();
}

RayCaster.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.ready = false;
  this.refresh2D();
  this.binHandler = new WorldBinHandler();
  for (var objName in this.getAddedObjects()){
    var addedObject = addedObjects[objName];
    if (mode == 1 && !addedObject.isIntersectable){
      continue;
    }
    addedObject.mesh.updateMatrix();
    addedObject.mesh.updateMatrixWorld();
    if (!addedObject.boundingBoxes){
      addedObject.generateBoundingBoxes();
    }else{
      addedObject.updateBoundingBoxes();
    }
    this.binHandler.insert(addedObject.boundingBoxes[0], objName);
  }
  for (var objName in this.getObjectGroups()){
    var objectGroup = objectGroups[objName];
    if (mode == 1 && !objectGroup.isIntersectable){
      continue;
    }
    objectGroup.mesh.updateMatrix();
    objectGroup.mesh.updateMatrixWorld();
    if (!objectGroup.boundingBoxes){
      objectGroup.generateBoundingBoxes();
    }else{
      objectGroup.updateBoundingBoxes();
    }
    for (var i = 0; i<objectGroup.boundingBoxes.length; i++){
      this.binHandler.insert(objectGroup.boundingBoxes[i], objectGroup.boundingBoxes[i].roygbivObjectName, objName);
    }
  }
  if (mode == 0){
    for (var gsName in this.getGridSystems()){
      var gridSystem = gridSystems[gsName];
      this.binHandler.insert(gridSystem.boundingBox, gridSystem.name);
    }
    for (var txtName in this.getAddedTexts()){
      var addedText = addedTexts[txtName];
      if (!addedText.is2D){
        this.binHandler.insert(addedText.boundingBox, txtName);
      }
    }
  }else{
    for (var txtName in this.getAddedTexts()){
      var addedText = addedTexts[txtName];
      if (addedText.isClickable && !addedText.is2D){
        this.binHandler.insert(addedText.boundingBox, txtName);
      }
    }
  }
  this.onReady();
}

RayCaster.prototype.updateObject = function(obj, forceUpdate){
  if ((obj.isAddedText && obj.is2D) || (obj.isSprite && !obj.isBackgroundObject) || (obj.isContainer)){
    this.update2D(obj, forceUpdate);
    return;
  }
  if (forceUpdate){
    this.binHandler.updateObject(obj);
    return;
  }
  this.updateBuffer.set(obj.name, obj);
}

RayCaster.prototype.issueUpdate = function(obj){
  if (!(mode == 1 && (obj.isAddedObject || obj.isObjectGroup) && !obj.isIntersectable)){
    if (obj.isHidden){
      return;
    }
    rayCaster.binHandler.updateObject(obj);
  }
}

RayCaster.prototype.findIntersections = function(from, direction, intersectGridSystems, callbackFunction, clientX, clientY, skip2D){
  intersectionPoint = 0, intersectionObject = 0;
  if (!IS_WORKER_CONTEXT && !skip2D){
    objectPicker2D.find(clientX, clientY);
    if (intersectionPoint){
      callbackFunction();
      return;
    }
  }
  this.origin.copy(from);
  this.direction.copy(direction);
  this.oldPosition.copy(this.origin);
  var iterate = true;
  if (!isDeployment && mode == 0){
    if (keyboardBuffer["Alt"]){
      intersectGridSystems = false;
    }
  }
  while (iterate){
    REUSABLE_LINE.set(this.oldPosition, this.origin);
    var results = this.binHandler.query(this.origin);
    for (var objName in results){
      var result = results[objName];
      if (result == 5){
        var obj = addedObjects[objName];
        if (obj){
          if (!(mode == 0 && keyboardBuffer["Shift"])){
            intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
            if (intersectionPoint){
              intersectionObject = objName;
              callbackFunction(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject);
              return;
            }
          }
        }
      }else if (result == 10){
        var gs = gridSystems[objName];
        if (gs && intersectGridSystems){
          intersectionPoint = gs.intersectsLine(REUSABLE_LINE);
          if (intersectionPoint){
            intersectionObject = objName;
            callbackFunction(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject);
            return;
          }
        }
      }else if (result == 20){
        var addedText = addedTexts[objName];
        if (addedText && addedText.plane){
          intersectionPoint = addedText.intersectsLine(REUSABLE_LINE);
          if (intersectionPoint){
            intersectionObject = objName;
            callbackFunction(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject);
            return;
          }
        }
      }else{
        if (!(mode == 0 && keyboardBuffer["Shift"])){
          var parent = objectGroups[objName];
          if (parent){
            for (var childName in result){
              var obj = parent.group[childName];
              if (obj){
                if (!(mode == 0 && keyboardBuffer["Shift"])){
                  intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
                  if (intersectionPoint){
                    intersectionObject = objName;
                    callbackFunction(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject);
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }
    this.oldPosition.copy(this.origin);
    this.origin.addScaledVector(this.direction, RAYCASTER_STEP_AMOUNT);
    iterate = LIMIT_BOUNDING_BOX.containsPoint(this.origin);
    if (this.oldPosition.x == this.origin.x && this.oldPosition.y == this.origin.y && this.oldPosition.z == this.origin.z){
      iterate = false;
    }
  }
  callbackFunction(0, 0, 0, null);
}

RayCaster.prototype.hide = function(object){
  if ((object.isAddedText && object.is2D) || (object.isSprite)){
    this.hide2D(object);
    return;
  }
  this.binHandler.hide(object);
}

RayCaster.prototype.show = function(object){
  if ((object.isAddedText && object.is2D) || (object.isSprite)){
    this.show2D(object);
    return;
  }
  this.binHandler.show(object);
}

RayCaster.prototype.query = function(point){
  return this.binHandler.query(point);
}

RayCaster.prototype.getGridSystems = function(){
  if (IS_WORKER_CONTEXT){
    return gridSystems;
  }
  return sceneHandler.getGridSystems();
}

RayCaster.prototype.getAddedObjects = function(){
  if (IS_WORKER_CONTEXT){
    return addedObjects;
  }
  return sceneHandler.getAddedObjects();
}

RayCaster.prototype.getObjectGroups = function(){
  if (IS_WORKER_CONTEXT){
    return objectGroups;
  }
  return sceneHandler.getObjectGroups();
}

RayCaster.prototype.getAddedTexts = function(){
  if (IS_WORKER_CONTEXT){
    return addedTexts;
  }
  return sceneHandler.getAddedTexts();
}
