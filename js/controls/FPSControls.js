var FPSControls = function(params){
  this.isControl = true;
  this.isFPSControls = true;
  this.reusableVec2 = new THREE.Vector2();
  this.axisZ = "z";
  this.axisY = "y";
  this.axisX = "x";
  this.weapon1InitQuaternion = new THREE.Quaternion();
  this.weapon2InitQuaternion = new THREE.Quaternion();
  this.keyboardActions = [
    {key: "A", action: this.goLeft},
    {key: "Q", action: this.goLeft},
    {key: "D", action: this.goRight},
    {key: "W", action: this.goForward},
    {key: "Z", action: this.goForward},
    {key: "S", action: this.goBackward},
    {key: "Up", action: this.goForward},
    {key: "Right", action: this.goRight},
    {key: "Left", action: this.goLeft},
    {key: "Down", action: this.goBackward},
    {key: "Space", action: this.jump}
  ];
  this.playerBodyObject = params.playerBodyObject; // default: none
  this.mouseSpeed = params.mouseSpeed; // default: 0.002
  this.touchLookSpeed = params.touchLookSpeed; // default: 0.01
  this.speed = params.speed; // default: 200
  this.jumpSpeed = params.jumpSpeed; // default: 500
  this.jumpableVelocityCoefficient = params.jumpableVelocityCoefficient; // default: 3.5
  this.touchJoystickThreshold = params.touchJoystickThreshold; // default: 1.5
  this.touchJoystickDegreeInterval = params.touchJoystickDegreeInterval; // default: 30
  this.crosshairName = params.crosshairName; // default: none
  this.crosshairExpandSize = params.crosshairExpandSize; // default: none
  this.crosshairAnimationDelta = params.crosshairAnimationDelta; // default: none
  this.doubleJumpTimeThresholdInMs = params.doubleJumpTimeThresholdInMs; // default: 500
  this.weaponObject1 = params.weaponObject1; // default: none
  this.weaponObject2 = params.weaponObject2; // default: none;
  this.hasIdleGunAnimation = params.hasIdleGunAnimation; // default: none
  this.idleGunAnimationSpeed = params.idleGunAnimationSpeed; // default: 0.05
}

FPSControls.prototype.onClick = noop;
FPSControls.prototype.onSwipe = noop;
FPSControls.prototype.onPinch = noop;
FPSControls.prototype.onMouseWheel = noop;
FPSControls.prototype.onKeyUp = noop;

FPSControls.prototype.jump = function(isDouble){
  if ((!isDouble && activeControl.canJump) || (isDouble && activeControl.canDoubleJump)){
    activeControl.playerBodyObject.setVelocityY(activeControl.jumpSpeed);
    if (isDouble){
      activeControl.canDoubleJump = false;
    }
  }
}

FPSControls.prototype.goBackward = function(){
  if (activeControl.zVelocity == activeControl.speed){
    return;
  }
  activeControl.zVelocity += activeControl.speed;
}

FPSControls.prototype.goForward = function(){
  if (activeControl.zVelocity == -activeControl.speed){
    return;
  }
  activeControl.zVelocity -= activeControl.speed;
}

FPSControls.prototype.goLeft = function(){
  if (activeControl.xVelocity == -activeControl.speed){
    return;
  }
  activeControl.xVelocity -= activeControl.speed;
}

FPSControls.prototype.goRight = function(){
  if (activeControl.xVelocity == activeControl.speed){
    return;
  }
  activeControl.xVelocity += activeControl.speed;
}

FPSControls.prototype.onPointerLockChange = function(isPointerLocked){
  if (!isPointerLocked){
    pointerLockRequested = true;
  }
  this.isPointerLocked = isPointerLocked;
}

FPSControls.prototype.onMouseMove = function(event){
  if (!this.isPointerLocked){
    return;
  }
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  var dx = (-movementX * this.mouseSpeed);
  camera.rotation.y += dx;
  if (activeControl.hasWeapon1){
    activeControl.weaponObject1.handleRotation(activeControl.axisY, dx);
  }
  if (activeControl.hasWeapon2){
    activeControl.weaponObject2.handleRotation(activeControl.axisY, dx);
  }
  this.alpha -= dx;
  var dy = -movementY * this.mouseSpeed;
  if (!(dy > 0 && (this.totalXRotation + dy >= 1.10)) && !(dy <0 && (this.totalXRotation + dy <= -1.10))){
    camera.rotation.x += dy;
    if (activeControl.hasWeapon1){
      activeControl.weaponObject1.handleRotation(activeControl.axisX, dy);
    }
    if (activeControl.hasWeapon2){
      activeControl.weaponObject2.handleRotation(activeControl.axisX, dy);
    }
    this.totalXRotation += dy;
  }
}

FPSControls.prototype.onTouchStart = function(event){
  for (var i = 0; i<event.changedTouches.length; i++){
    var curTouch = event.changedTouches[i];
    activeControl.touchTrack.set(curTouch.identifier, curTouch);
  }
}

FPSControls.prototype.onLeftHandFinger = function(touch){
  var degreeInterval = activeControl.touchJoystickDegreeInterval;
  var oldTouch = activeControl.touchTrack.get(touch.identifier);
  activeControl.reusableVec2.set((touch.pageX - oldTouch.pageX), (touch.pageY - oldTouch.pageY));
  if(activeControl.reusableVec2.length() <= activeControl.touchJoystickThreshold){
    return;
  }
  var angleInDegrees = THREE.Math.RAD2DEG * activeControl.reusableVec2.angle();
  if (angleInDegrees <= degreeInterval || angleInDegrees >= (360 - degreeInterval)){
    activeControl.joystickStatus.right = true;
    activeControl.joystickStatus.left = false;
    activeControl.joystickStatus.top = false;
    activeControl.joystickStatus.down = false;
  }else if (angleInDegrees >= (180 - degreeInterval) && angleInDegrees <= (180 + degreeInterval)){
    activeControl.joystickStatus.left = true;
    activeControl.joystickStatus.right = false;
    activeControl.joystickStatus.top = false;
    activeControl.joystickStatus.down = false;
  }else if (angleInDegrees >= (270 - degreeInterval) && angleInDegrees <= (270 + degreeInterval)){
    activeControl.joystickStatus.up = true;
    activeControl.joystickStatus.right = false;
    activeControl.joystickStatus.left = false;
    activeControl.joystickStatus.down = false;
  }else if (angleInDegrees >= (90 - degreeInterval) && angleInDegrees <= (90 + degreeInterval)){
    activeControl.joystickStatus.down = true;
    activeControl.joystickStatus.up = false;
    activeControl.joystickStatus.right = false;
    activeControl.joystickStatus.left = false;
  }else if (angleInDegrees >= (270 + degreeInterval) && angleInDegrees <= (360 - degreeInterval)){
    activeControl.joystickStatus.right = true;
    activeControl.joystickStatus.up = true;
    activeControl.joystickStatus.left = false;
    activeControl.joystickStatus.down = false;
  }else if (angleInDegrees >= (90 + degreeInterval) && angleInDegrees <= (180 - degreeInterval)){
    activeControl.joystickStatus.left = true;
    activeControl.joystickStatus.down = true;
    activeControl.joystickStatus.up = false;
    activeControl.joystickStatus.right = false;
  }else if (angleInDegrees >= (180 + degreeInterval) && angleInDegrees <= (270 - degreeInterval)){
    activeControl.joystickStatus.left = true;
    activeControl.joystickStatus.up = true;
    activeControl.joystickStatus.down = false;
    activeControl.joystickStatus.right = false;
  }else if (angleInDegrees >= (degreeInterval) && angleInDegrees <= (90 - degreeInterval)){
    activeControl.joystickStatus.right = true;
    activeControl.joystickStatus.down = true;
    activeControl.joystickStatus.left = false;
    activeControl.joystickStatus.up = false;
  }
}

FPSControls.prototype.onRightHandFinger = function(touch){
  var oldTouch = activeControl.touchTrack.get(touch.identifier);
  var movementX = (touch.pageX - oldTouch.pageX);
  var movementY = (touch.pageY - oldTouch.pageY);
  var dx = -(movementX * activeControl.touchLookSpeed);
  camera.rotation.y += dx;
  if (activeControl.hasWeapon1){
    activeControl.weaponObject1.handleRotation(activeControl.axisY, dx);
  }
  if (activeControl.hasWeapon2){
    activeControl.weaponObject2.handleRotation(activeControl.axisY, dx);
  }
  activeControl.alpha -= dx;
  var dy = -movementY * activeControl.touchLookSpeed;
  if (!(dy > 0 && (activeControl.totalXRotation + dy >= 1.10)) && !(dy <0 && (activeControl.totalXRotation + dy <= -1.10))){
    camera.rotation.x += dy;
    if (activeControl.hasWeapon1){
      activeControl.weaponObject1.handleRotation(activeControl.axisX, dy);
    }
    if (activeControl.hasWeapon2){
      activeControl.weaponObject2.handleRotation(activeControl.axisX, dy);
    }
    activeControl.totalXRotation += dy;
  }
}

FPSControls.prototype.isTouchOnTheRightSide = function(touch){
  var curViewport = renderer.getCurrentViewport();
  var centerX = (curViewport.x + (curViewport.z / screenResolution)) / 2;
  var centerY = (curViewport.y + (curViewport.w / screenResolution)) / 2;
  var clientX = touch.clientX;
  var clientY = touch.clientY;
  return clientX >= centerX;
}

FPSControls.prototype.onTouchMove = function(event){
  var size = activeControl.touchTrack.size;
  if (size != 1 && size != 2){
    return;
  }
  for (var i = 0; i<event.changedTouches.length; i++){
    var curTouch = event.changedTouches[i];
    if (!activeControl.touchTrack.has(curTouch.identifier)){
      activeControl.touchTrack.set(curTouch.identifier, curTouch);
      continue;
    }
    if (activeControl.isTouchOnTheRightSide(curTouch)){
      activeControl.onRightHandFinger(curTouch);
    }else{
      activeControl.onLeftHandFinger(curTouch);
    }
    activeControl.touchTrack.set(curTouch.identifier, curTouch);
  }
}

FPSControls.prototype.onTouchEnd = function(event){
  for (var i = 0; i<event.changedTouches.length; i++){
    var curTouch = event.changedTouches[i];
    activeControl.touchTrack.delete(curTouch.identifier);
    if (!activeControl.isTouchOnTheRightSide(curTouch)){
      activeControl.resetJoystickStatus();
    }
  }
}

FPSControls.prototype.update = function(){
  this.canJump = (this.playerBodyObject.physicsBody.velocity.y <= this.jumpableVelocityCoefficient && this.playerBodyObject.physicsBody.velocity.y >= -this.jumpableVelocityCoefficient);
  if (this.canJump){
    this.canDoubleJump = true;
  }
  camera.position.copy(this.playerBodyObject.mesh.position);
  this.playerBodyObject.setVelocityX(0);
  this.playerBodyObject.setVelocityZ(0);
  this.xVelocity = 0;
  this.zVelocity = 0;
  var hasMotion = this.isMouseDown;
  if (!isMobile){
    var len = this.keyboardActions.length;
    for (var i = 0; i<len; i++){
      var curAction = this.keyboardActions[i];
      if (keyboardBuffer[curAction.key]){
        curAction.action();
        hasMotion = true;
      }
    }
  }else{
    if (this.joystickStatus.up){
      this.goForward();
      hasMotion = true;
    }
    if (this.joystickStatus.down){
      this.goBackward();
      hasMotion = true;
    }
    if (this.joystickStatus.right){
      this.goRight();
      hasMotion = true;
    }
    if (this.joystickStatus.left){
      this.goLeft();
      hasMotion = true;
    }
  }
  this.playerBodyObject.setVelocityX((this.xVelocity * Math.cos(this.alpha)) - (this.zVelocity * Math.sin(this.alpha)));
  this.playerBodyObject.setVelocityZ((this.xVelocity * Math.sin(this.alpha)) + (this.zVelocity * Math.cos(this.alpha)));
  if (this.hasCrosshair){
    if (!hasMotion){
      if (!selectedCrosshair.shrink){
        crosshairHandler.shrinkCrosshair(this.crosshairAnimationDelta);
      }
    }else{
      if (!selectedCrosshair.expand){
        crosshairHandler.expandCrosshair(this.crosshairExpandSize, this.crosshairAnimationDelta);
      }
    }
  }
  if (this.weapon1IdleAnimationInfo){
    this.weapon1IdleAnimationInfo.x += this.idleGunAnimationSpeed * Math.random();
    this.weapon1IdleAnimationInfo.z += this.idleGunAnimationSpeed * Math.random();
    this.weaponObject1.handleRotation(activeControl.axisX, Math.sin(this.weapon1IdleAnimationInfo.x) / 1000 * Math.random());
    this.weaponObject1.handleRotation(activeControl.axisZ, Math.sin(this.weapon1IdleAnimationInfo.z) / 1000 * Math.random());
  }
  if (this.weapon2IdleAnimationInfo){
    this.weapon2IdleAnimationInfo.x += this.idleGunAnimationSpeed * Math.random();
    this.weapon2IdleAnimationInfo.z += this.idleGunAnimationSpeed * Math.random();
    this.weaponObject2.handleRotation(activeControl.axisX, Math.sin(this.weapon2IdleAnimationInfo.x) / 1000 * Math.random());
    this.weaponObject2.handleRotation(activeControl.axisZ, Math.sin(this.weapon2IdleAnimationInfo.z) / 1000 * Math.random());
  }
}

FPSControls.prototype.resetJoystickStatus = function(){
  activeControl.joystickStatus.left = false;
  activeControl.joystickStatus.right = false;
  activeControl.joystickStatus.up = false;
  activeControl.joystickStatus.down = false;
}

FPSControls.prototype.onDoubleTap = function(touch){
  activeControl.jump(true);
}

FPSControls.prototype.onTap = function(touch){
  var isOnTheRightSide = activeControl.isTouchOnTheRightSide(touch);
  if (activeControl.hasDoubleJump && isOnTheRightSide){
    var now = performance.now();
    if (activeControl.lastTapTime){
      if (now - activeControl.lastTapTime < activeControl.doubleJumpTimeThresholdInMs){
        activeControl.onDoubleTap(touch);
        activeControl.lastTapTime = 0;
        return;
      }
    }
    activeControl.lastTapTime = now;
  }
  if (isOnTheRightSide){
    activeControl.jump();
  }
}

FPSControls.prototype.onKeyDown = function(event){
  if (activeControl.hasDoubleJump){
    if (event.keyCode == 32){
      var now = performance.now();
      if (activeControl.lastSpaceKeydownTime){
        if (now - activeControl.lastSpaceKeydownTime < activeControl.doubleJumpTimeThresholdInMs){
          activeControl.jump(true);
          activeControl.lastTapTime = 0;
          return;
        }
      }
      activeControl.lastSpaceKeydownTime = now;
    }
  }
}

FPSControls.prototype.onMouseDown = function(){
  activeControl.isMouseDown = true;
}

FPSControls.prototype.onMouseUp = function(){
  activeControl.isMouseDown = false;
}

FPSControls.prototype.onResize = function(){
  if (activeControl.hasWeapon1){
    var pos = activeControl.weapon1Position;
    activeControl.updateGunAlignment(0, pos.x, pos.y, pos.z);
  }
  if (activeControl.hasWeapon2){
    var pos = activeControl.weapon2Position;
    activeControl.updateGunAlignment(1, pos.x, pos.y, pos.z);
  }
}

FPSControls.prototype.updateGunAlignment = function(gunIndex, x, y, z){
  camera.position.copy(this.playerBodyObject.mesh.position);
  this.resetRotation();
  camera.updateMatrix();
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  var obj;
  if (gunIndex == 0){
    obj = this.weaponObject1;
  }
  if (gunIndex == 1){
    obj = this.weaponObject2;
  }
  if (obj.pivotObject){
    obj.unsetRotationPivot();
  }
  obj.untrackObjectPosition();
  REUSABLE_VECTOR.set(x, y, z);
  REUSABLE_VECTOR.unproject(camera);
  obj.setPosition(REUSABLE_VECTOR.x, REUSABLE_VECTOR.y, REUSABLE_VECTOR.z);
  obj.trackObjectPosition(this.playerBodyObject);
  var pivot = obj.makePivot(camera.position.x - obj.mesh.position.x, camera.position.y - obj.mesh.position.y, camera.position.z - obj.mesh.position.z);
  obj.setRotationPivot(pivot);
}

FPSControls.prototype.resetRotation = function(){
  camera.quaternion.set(0, 0, 0, 1);
  this.totalXRotation = 0;
  this.alpha = 0;
  if (this.hasWeapon1){
    this.weaponObject1.mesh.quaternion.copy(this.weapon1InitQuaternion);
  }
  if (this.hasWeapon2){
    this.weaponObject2.mesh.quaternion.copy(this.weapon2InitQuaternion);
  }
}

FPSControls.prototype.onDeactivated = function(){
  if (this.hasWeapon1){
    this.weaponObject1.unsetRotationPivot();
    this.weaponObject1.untrackObjectPosition();
    this.weaponObject1.mesh.position.copy(this.weaponObject1.beforeFPSControlsInfo.position);
    this.weaponObject1.mesh.quaternion.copy(this.weaponObject1.beforeFPSControlsInfo.quaternion);
    this.weaponObject1.mesh.scale.set(1, 1, 1);
  }
  if (this.hasWeapon2){
    this.weaponObject2.unsetRotationPivot();
    this.weaponObject2.untrackObjectPosition();
    this.weaponObject2.mesh.position.copy(this.weaponObject2.beforeFPSControlsInfo.position);
    this.weaponObject2.mesh.quaternion.copy(this.weaponObject2.beforeFPSControlsInfo.quaternion);
    this.weaponObject2.mesh.scale.set(1, 1, 1);
  }
}

FPSControls.prototype.onActivated = function(){
  this.isMouseDown = false;
  this.lastTapTime = 0;
  this.lastSpaceKeydownTime = 0;
  this.joystickStatus = {
    right: false, left: false, up: false, down: false
  };
  this.touchTrack = new Map();
  camera.position.copy(this.playerBodyObject.mesh.position);
  this.playerBodyObject.show();
  this.playerBodyObject.hide(true);
  if (!pointerLockEventHandler.isPointerLocked){
    pointerLockRequested = true;
    this.isPointerLocked = false;
  }else{
    this.isPointerLocked = true;
  }
  if (!(typeof this.crosshairName == UNDEFINED)){
    this.hasCrosshair = true;
    crosshairHandler.selectCrosshair(crosshairs[this.crosshairName]);
  }else{
    this.hasCrosshair = false;
  }
  if (!(typeof this.doubleJumpTimeThresholdInMs == UNDEFINED)){
    this.hasDoubleJump = true;
  }else{
    this.hasDoubleJump = false;
  }
  if (!(typeof this.weaponObject1 == UNDEFINED)){
    var pos = this.weaponObject1.mesh.position;
    var quat = this.weaponObject1.mesh.quaternion;
    this.weaponObject1.beforeFPSControlsInfo = {position: pos.clone(), quaternion: quat.clone()};
    this.hasWeapon1 = true;
    this.weaponObject1.mesh.quaternion.set(this.weaponObject1.fpsWeaponAlignment.qx, this.weaponObject1.fpsWeaponAlignment.qy, this.weaponObject1.fpsWeaponAlignment.qz, this.weaponObject1.fpsWeaponAlignment.qw);
    this.weapon1InitQuaternion.copy(this.weaponObject1.mesh.quaternion);
    this.weaponObject1.mesh.scale.set(this.weaponObject1.fpsWeaponAlignment.scale, this.weaponObject1.fpsWeaponAlignment.scale, this.weaponObject1.fpsWeaponAlignment.scale);
    this.weapon1Position = new THREE.Vector3(this.weaponObject1.fpsWeaponAlignment.x, this.weaponObject1.fpsWeaponAlignment.y, this.weaponObject1.fpsWeaponAlignment.z);
    this.updateGunAlignment(0, this.weapon1Position.x, this.weapon1Position.y, this.weapon1Position.z);
    if (this.hasIdleGunAnimation){
      this.weapon1IdleAnimationInfo = {x: 0, z: 0};
    }
  }else{
    this.hasWeapon1 = false;
  }
  if (!(typeof this.weaponObject2 == UNDEFINED)){
    var pos = this.weaponObject2.mesh.position;
    var quat = this.weaponObject2.mesh.quaternion;
    this.weaponObject2.beforeFPSControlsInfo = {position: pos.clone(), quaternion: quat.clone()};
    this.hasWeapon2 = true;
    this.weaponObject2.mesh.quaternion.set(this.weaponObject2.fpsWeaponAlignment.qx, this.weaponObject2.fpsWeaponAlignment.qy, this.weaponObject2.fpsWeaponAlignment.qz, this.weaponObject2.fpsWeaponAlignment.qw);
    this.weapon2InitQuaternion.copy(this.weaponObject2.mesh.quaternion);
    this.weaponObject2.mesh.scale.set(this.weaponObject2.fpsWeaponAlignment.scale, this.weaponObject2.fpsWeaponAlignment.scale, this.weaponObject2.fpsWeaponAlignment.scale);
    this.weapon2Position = new THREE.Vector3(this.weaponObject2.fpsWeaponAlignment.x, this.weaponObject2.fpsWeaponAlignment.y, this.weaponObject2.fpsWeaponAlignment.z);
    this.updateGunAlignment(1, this.weapon2Position.x, this.weapon2Position.y, this.weapon2Position.z);
    if (this.hasIdleGunAnimation){
      this.weapon2IdleAnimationInfo = {x: 0, z: 0};
    }
  }else{
    this.hasWeapon2 = false;
  }
}
