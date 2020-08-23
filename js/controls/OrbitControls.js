var OrbitControls = function(params){
  this.isControl = true;
  this.lookPosition = (!(typeof params.lookPosition == UNDEFINED))? new THREE.Vector3(params.lookPosition.x, params.lookPosition.y, params.lookPosition.z): new THREE.Vector3(0, 0, 0);
  this.maxRadius = (!(typeof params.maxRadius == UNDEFINED))? params.maxRadius: 150;
  this.minRadius = (!(typeof params.minRadius == UNDEFINED))? params.minRadius: 50;
  this.zoomDelta = (!(typeof params.zoomDelta == UNDEFINED))? params.zoomDelta: 1;
  this.mouseWheelRotationSpeed = (!(typeof params.mouseWheelRotationSpeed == UNDEFINED))? params.mouseWheelRotationSpeed: 3;
  this.mouseDragRotationSpeed = (!(typeof params.mouseDragRotationSpeed == UNDEFINED))? params.mouseDragRotationSpeed: 20;
  this.fingerSwipeRotationSpeed = (!(typeof params.fingerSwipeRotationSpeed == UNDEFINED))? params.fingerSwipeRotationSpeed: 20;
  this.keyboardRotationSpeed = (!(typeof params.keyboardRotationSpeed == UNDEFINED))? params.keyboardRotationSpeed: 10;
  this.requestFullScreen = (!(typeof params.requestFullScreen == UNDEFINED))? params.requestFullScreen: false;
  this.keyboardActions = [
    {key: "Right", action: this.rotateAroundYPositiveKeyboard},
    {key: "D", action: this.rotateAroundYPositiveKeyboard},
    {key: "Left", action: this.rotateAroundYNegativeKeyboard},
    {key: "A", action: this.rotateAroundYNegativeKeyboard},
    {key: "Q", action: this.rotateAroundYNegativeKeyboard},
    {key: "W", action: this.zoomIn},
    {key: "Up", action: this.zoomIn},
    {key: "Z", action: this.zoomIn},
    {key: "S", action: this.zoomOut},
    {key: "Down", action: this.zoomOut},
    {key: "Space", action: this.zoom}
  ];
}

OrbitControls.prototype.onMouseMove = noop;
OrbitControls.prototype.onMouseDown = noop;
OrbitControls.prototype.onMouseUp = noop;
OrbitControls.prototype.onTap = noop;
OrbitControls.prototype.onClick = noop;
OrbitControls.prototype.onDeactivated = noop;
OrbitControls.prototype.onTouchStart = noop;
OrbitControls.prototype.onTouchMove = noop;
OrbitControls.prototype.onTouchEnd = noop;
OrbitControls.prototype.onKeyDown = noop;
OrbitControls.prototype.onKeyUp = noop;
OrbitControls.prototype.onResize = noop;

OrbitControls.prototype.onFullScreenChange = function(isFullScreen){
  if (!isFullScreen && activeControl.requestFullScreen){
    fullScreenRequested = true;
  }
}

OrbitControls.prototype.zoom = function(){
  if (activeControl.zoomDirectionIn){
    if (activeControl.zoomedInThisFrame){
      return;
    }
    activeControl.spherical.radius -= activeControl.zoomDelta;
    if (activeControl.spherical.radius < activeControl.minRadius){
      activeControl.spherical.radius = activeControl.minRadius;
      activeControl.zoomDirectionIn = false;
    }
    activeControl.zoomedInThisFrame = true;
  }else{
    if (activeControl.zoomedOutThisFrame){
      return;
    }
    activeControl.spherical.radius += activeControl.zoomDelta;
    if (activeControl.spherical.radius > activeControl.maxRadius){
      activeControl.spherical.radius = activeControl.maxRadius;
      activeControl.zoomDirectionIn = true;
    }
    activeControl.zoomedOutThisFrame = true;
  }
}

OrbitControls.prototype.zoomIn = function(){
  if (activeControl.zoomedInThisFrame){
    return;
  }
  activeControl.spherical.radius -= activeControl.zoomDelta;
  if (activeControl.spherical.radius < activeControl.minRadius){
    activeControl.spherical.radius = activeControl.minRadius;
  }
  activeControl.zoomedInThisFrame = true;
}

OrbitControls.prototype.zoomOut = function(){
  if (activeControl.zoomedOutThisFrame){
    return;
  }
  activeControl.spherical.radius += activeControl.zoomDelta;
  if (activeControl.spherical.radius > activeControl.maxRadius){
    activeControl.spherical.radius = activeControl.maxRadius;
  }
  activeControl.zoomedOutThisFrame = true;
}

OrbitControls.prototype.rotateAroundYPositiveKeyboard = function(){
  if (activeControl.rotatedYPositiveThisFrame){
    return;
  }
  activeControl.spherical.theta += activeControl.keyboardRotationSpeed / 1000;
  activeControl.rotatedYPositiveThisFrame = true;
}

OrbitControls.prototype.rotateAroundYNegativeKeyboard = function(){
  if (activeControl.rotatedYNegativeThisFrame){
    return;
  }
  activeControl.spherical.theta -= activeControl.keyboardRotationSpeed / 1000;
  activeControl.rotatedYNegativeThisFrame = true;
}

OrbitControls.prototype.onMouseWheel = function(event){
  var deltaX = event.deltaX / 10000;
  var deltaY = event.deltaY / 10000;

  if (Math.abs(deltaX) > Math.abs(deltaY)){
    var thetaDelta = deltaX * activeControl.mouseWheelRotationSpeed;

    if (thetaDelta > 0.09){
      thetaDelta = 0.09;
    }

    if (thetaDelta < -0.09){
      thetaDelta = -0.09;
    }

    activeControl.spherical.theta += thetaDelta;
  }else{
    var phiDelta = deltaY * activeControl.mouseWheelRotationSpeed;

    if (phiDelta > 0.09){
      phiDelta = 0.09;
    }

    if (phiDelta < -0.09){
      phiDelta = -0.09;
    }

    activeControl.spherical.phi -= phiDelta;
  }
}

OrbitControls.prototype.onDrag = function(x, y, moveX, moveY){
  activeControl.spherical.theta += (moveX / 10000) * activeControl.mouseDragRotationSpeed;
  activeControl.spherical.phi -= (moveY / 10000) * activeControl.mouseDragRotationSpeed;
}

OrbitControls.prototype.onPinch = function(diff){
  if (diff > 0){
    activeControl.zoomIn();
  }else{
    activeControl.zoomOut();
  }
}

OrbitControls.prototype.onSwipe = function(x, y, diffX, diffY){
  activeControl.spherical.theta += (diffX / 10000) * activeControl.fingerSwipeRotationSpeed;
  activeControl.spherical.phi -= (diffY / 10000) * activeControl.fingerSwipeRotationSpeed;
}

OrbitControls.prototype.resetStatus = function(){
  this.zoomedInThisFrame = false;
  this.zoomedOutThisFrame = false;
  this.rotatedYNegativeThisFrame = false;
  this.rotatedYPositiveThisFrame = false;
}

OrbitControls.prototype.onActivated = function(){
  camera.position.copy(this.lookPosition);
  this.spherical = new THREE.Spherical(this.maxRadius, Math.PI/4, Math.PI/4);
  this.resetStatus();
  this.zoomDirectionIn = true;
  if (this.requestFullScreen){
    fullScreenRequested = true;
  }
}

OrbitControls.prototype.update = function(){
  if (this.spherical.phi > 2.66){
    this.spherical.phi = 2.66;
  }
  if (this.spherical.phi < 0.41){
    this.spherical.phi = 0.41;
  }
  if (!isMobile){
    for (var i = 0; i<this.keyboardActions.length; i++){
      var curAction = this.keyboardActions[i];
      if (keyboardBuffer[curAction.key]){
        curAction.action();
      }
    }
  }
  camera.position.setFromSpherical(this.spherical);
  camera.lookAt(this.lookPosition.x, this.lookPosition.y, this.lookPosition.z);
  this.resetStatus();
}
