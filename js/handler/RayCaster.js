var RayCaster = function(){
  this.binHandler = new WorldBinHandler();
  this.origin = new THREE.Vector3();
  this.direction = new THREE.Vector3();
  this.oldPosition;
}

RayCaster.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.binHandler = new WorldBinHandler();
  if (mode == 0){
    for (var gsName in gridSystems){
      var gridSystem = gridSystems[gsName];
      this.binHandler.insert(gridSystem.boundingBox, gridSystem.name);
    }
  }
}

RayCaster.prototype.updateObject = function(obj){
  this.binHandler.updateObject(obj);
}

RayCaster.prototype.findIntersections = function(clickEvent){
  var results = [];
  var rect = renderer.domElement.getBoundingClientRect();
  var coordX = ((clickEvent.clientX - rect.left) / rect.width) * 2 - 1;
  var coordY = - ((clickEvent.clientY - rect.top) / rect.height) * 2 + 1;
  this.origin.setFromMatrixPosition(camera.matrixWorld);
  this.direction.set(coordX, coordY, 0.5).unproject(camera).sub(this.origin).normalize();
  if (!this.oldPosition){
    this.oldPosition = new THREE.Vector3().copy(this.origin);
  }
  var iterate = true;
  while (iterate){
    REUSABLE_LINE.set(this.oldPosition, this.origin);
    var results = this.binHandler.query(this.origin);
    for (var objName in results){
      var result = results[objName];
      if (result == 5){
        var obj = addedObjects[objName];
        if (obj){
          if (mode == 0 && keyboardBuffer["shift"]){
            continue;
          }
          intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
          if (intersectionPoint){
            var objVector = (REUSABLE_VECTOR.set(0, 0, 1)).applyQuaternion(obj.mesh.quaternion);
            var cameraVector = (REUSABLE_VECTOR_2.set(0, 0, -1)).applyQuaternion(camera.quaternion);
            var isFront = false;
            if (objVector.angleTo(cameraVector) > Math.PI/2){
              isFront = true;
            }
            if (!(isFront && obj.mesh.material.side == THREE.BackSide)){
              intersectionObject = objName;
              return;
            }
          }
        }
      }else if (result == 10){
        var gs = gridSystems[objName];
        if (gs){
          intersectionPoint = gs.intersectsLine(REUSABLE_LINE);
          if (intersectionPoint){
            var selectedGrid = gs.getGridFromPoint(intersectionPoint);
            if (!selectedGrid.sliced){
              intersectionObject = objName;
              return;
            }
            intersectionPoint = 0;
          }
        }
      }else{
        if (mode == 0 && keyboardBuffer["shift"]){
          continue;
        }
        var parent = objectGroups[objName];
        if (parent){
          for (var childName in result){
            var obj = parent.group[childName];
            if (obj){
              intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
              if (intersectionPoint){
                var objVector = (REUSABLE_VECTOR.set(0, 0, 1)).applyQuaternion(obj.mesh.quaternion);
                var cameraVector = (REUSABLE_VECTOR_2.set(0, 0, -1)).applyQuaternion(camera.quaternion);
                var isFront = false;
                if (objVector.angleTo(cameraVector) > Math.PI/2){
                  isFront = true;
                }
                if (!(isFront && parent.mesh.material.side == THREE.BackSide)){
                  intersectionObject = objName;
                  return;
                }
              }
            }
          }
        }
      }
    }
    this.oldPosition.copy(this.origin);
    this.origin.addScaledVector(this.direction, 32);
    iterate = LIMIT_BOUNDING_BOX.containsPoint(this.origin);
  }
}
