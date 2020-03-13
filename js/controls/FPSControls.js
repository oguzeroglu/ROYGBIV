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
  this.playerBodyObject = params.playerBodyObject;
  this.initialPosition = params.initialPosition;
  this.mouseSpeed = params.mouseSpeed;
  this.touchLookSpeed = params.touchLookSpeed;
  this.speed = params.speed;
  this.jumpSpeed = params.jumpSpeed;
  this.touchJoystickThreshold = params.touchJoystickThreshold;
  this.crosshairName = params.crosshairName;
  this.crosshairExpandSize = params.crosshairExpandSize;
  this.crosshairAnimationDelta = params.crosshairAnimationDelta;
  this.hasDoubleJump = params.hasDoubleJump;
  this.doubleJumpTimeThresholdInMs = params.doubleJumpTimeThresholdInMs;
  this.weaponObject1 = params.weaponObject1;
  this.weaponObject2 = params.weaponObject2;
  this.hasIdleGunAnimation = params.hasIdleGunAnimation;
  this.idleGunAnimationSpeed = params.idleGunAnimationSpeed;
  this.weaponRotationRandomnessOn = params.weaponRotationRandomnessOn;
  this.onLook = params.onLook;
  this.onShoot = params.onShoot;
  this.onStoppedShooting = params.onStoppedShooting;
  this.shootableObjects = params.shootableObjects;
  this.onPause = params.onPause;
  this.onResume = params.onResume;
  this.requestFullScreen = params.requestFullScreen;
  if (typeof this.mouseSpeed == UNDEFINED){
    this.mouseSpeed = 0.002;
  }
  if (typeof this.touchLookSpeed == UNDEFINED){
    this.touchLookSpeed = 0.01;
  }
  if (typeof this.speed == UNDEFINED){
    this.speed = 200;
  }
  if (typeof this.jumpSpeed == UNDEFINED){
    this.jumpSpeed = 500;
  }
  if (typeof this.touchJoystickThreshold == UNDEFINED){
    this.touchJoystickThreshold = 1.5;
  }
  if (typeof this.crosshairExpandSize == UNDEFINED){
    this.crosshairExpandSize = 9;
  }
  if (typeof this.crosshairAnimationDelta == UNDEFINED){
    this.crosshairAnimationDelta = 0.2;
  }
  if (typeof this.hasDoubleJump == UNDEFINED){
    this.hasDoubleJump = true;
  }
  if (typeof this.doubleJumpTimeThresholdInMs == UNDEFINED){
    this.doubleJumpTimeThresholdInMs = 500;
  }
  if (typeof this.hasIdleGunAnimation == UNDEFINED){
    this.hasIdleGunAnimation = true;
  }
  if (typeof this.idleGunAnimationSpeed == UNDEFINED){
    this.idleGunAnimationSpeed = 0.05;
  }
  if (typeof this.weaponRotationRandomnessOn == UNDEFINED){
    this.weaponRotationRandomnessOn = true;
  }
  if (typeof this.onLook == UNDEFINED){
    this.onLook = noop;
  }
  if (typeof this.onShoot == UNDEFINED){
    this.onShoot = noop;
  }
  if (typeof this.onStoppedShooting == UNDEFINED){
    this.onStoppedShooting = noop;
  }
  if (typeof this.shootableObjects == UNDEFINED){
    this.shootableObjects = [];
  }
  if (typeof this.onPause == UNDEFINED){
    this.onPause = noop;
  }
  if (typeof this.onResume == UNDEFINED){
    this.onResume = noop;
  }
  if (typeof this.requestFullScreen == UNDEFINED){
    this.requestFullScreen = true;
    fullScreenRequested = true;
  }
  this.init();
}

FPSControls.prototype.onClick = noop;
FPSControls.prototype.onSwipe = noop;
FPSControls.prototype.onPinch = noop;
FPSControls.prototype.onMouseWheel = noop;
FPSControls.prototype.onKeyUp = noop;
FPSControls.prototype.onDrag = noop;

FPSControls.prototype.init = function(){
  this.deactivated = true;
  this.currentLookInfo = {x: 0, y: 0, z: 0, objName: null};
  this.joystickStatus = {right: false, left: false, up: false, down: false};
  this.touchTrack = new Map();
  if (!(typeof this.weaponObject1 == UNDEFINED)){
    this.weaponObject1.isUsedInFPSControl = true;
    this.hasWeapon1 = true;
    this.weaponObject1.beforeFPSControlsInfo = {position: new THREE.Vector3(), quaternion: new THREE.Quaternion()};
    this.weapon1Position = new THREE.Vector3();
    if (this.hasIdleGunAnimation){
      this.weapon1IdleAnimationInfo = {x: 0, z: 0};
    }
  }else{
    this.hasWeapon1 = false;
  }
  if (!(typeof this.weaponObject2 == UNDEFINED)){
    this.weaponObject2.isUsedInFPSControl = true;
    this.hasWeapon2 = true;
    this.weaponObject2.beforeFPSControlsInfo = {position: new THREE.Vector3(), quaternion: new THREE.Quaternion()};
    this.weapon2Position = new THREE.Vector3();
    if (this.hasIdleGunAnimation){
      this.weapon2IdleAnimationInfo = {x: 0, z: 0};
    }
  }else{
    this.hasWeapon2 = false;
  }
  if (this.hasWeapon1 && this.hasWeapon2 && this.weaponObject1.isAddedObject && this.weaponObject2.isAddedObject){
    var sameGeom = (autoInstancingHandler.getObjectKey(this.weaponObject1) == autoInstancingHandler.getObjectKey(this.weaponObject2));
    var sameScale = (this.weaponObject1.fpsWeaponAlignment.scale == this.weaponObject2.fpsWeaponAlignment.scale);
    if (sameGeom && sameScale){
      var pseudoGroup = new Object();
      pseudoGroup[this.weaponObject1.name] = this.weaponObject1;
      pseudoGroup[this.weaponObject2.name] = this.weaponObject2;
      this.autoInstancedObject = new AutoInstancedObject(generateUniqueObjectName(), pseudoGroup);
      this.autoInstancedObject.init();
      this.autoInstancedObject.mesh.visible = false;
      this.autoInstancedObject.mesh.isFPSWeaponAutoInstancedObject = true;
      macroHandler.injectMacro("FPS_WEAPON_SCALE "+this.weaponObject1.fpsWeaponAlignment.scale, this.autoInstancedObject.mesh.material, true, false);
      scene.add(this.autoInstancedObject.mesh);
    }
  }
  if (isMobile){
    this.shootableMap = new Object();
    for (var i = 0; i<this.shootableObjects.length; i++){
      this.shootableMap[this.shootableObjects[i].name] = this.shootableObjects[i];
    }
  }
  this.isShooting = false;
}

FPSControls.prototype.onFullScreenChange = function(isFullScreen){
  if (activeControl.requestFullScreen && !isFullScreen){
    fullScreenRequested = true;
  }
}

FPSControls.prototype.jump = function(isDouble){
  if ((!isDouble && activeControl.canJump) || (isDouble && activeControl.canDoubleJump)){
    activeControl.playerBodyObject.setVelocityY(activeControl.jumpSpeed);
    activeControl.canJump = false;
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
    var randomness = 0;
    if (activeControl.weaponRotationRandomnessOn){
      activeControl.weapon1RotationRandomnessCounter += 0.06 * Math.random();
      randomness = (Math.random() * (Math.sin(activeControl.weapon1RotationRandomnessCounter) / 800));
    }
    activeControl.weaponObject1.handleRotation(activeControl.axisY, dx + randomness);
  }
  if (activeControl.hasWeapon2){
    var randomness = 0;
    if (activeControl.weaponRotationRandomnessOn){
      activeControl.weapon2RotationRandomnessCounter += 0.06 * Math.random();
      randomness = (Math.random() * (Math.sin(activeControl.weapon2RotationRandomnessCounter) / 800));
    }
    activeControl.weaponObject2.handleRotation(activeControl.axisY, dx + randomness);
  }
  this.alpha -= dx;
  var dy = -movementY * this.mouseSpeed;
  if (!(dy > 0 && (this.totalXRotation + dy >= 1.10)) && !(dy <0 && (this.totalXRotation + dy <= -1.10))){
    camera.rotation.x += dy;
    if (activeControl.hasWeapon1){
      var randomness = 0;
      if (activeControl.weaponRotationRandomnessOn){
        activeControl.weapon1RotationRandomnessCounter2 += 0.06 * Math.random();
        randomness = (Math.random() * (Math.sin(activeControl.weapon1RotationRandomnessCounter2) / 800));
      }
      activeControl.weaponObject1.handleRotation(activeControl.axisX, dy + randomness);
    }
    if (activeControl.hasWeapon2){
      var randomness = 0;
      if (activeControl.weaponRotationRandomnessOn){
        activeControl.weapon2RotationRandomnessCounter2 += 0.06 * Math.random();
        randomness = (Math.random() * (Math.sin(activeControl.weapon2RotationRandomnessCounter2) / 800));
      }
      activeControl.weaponObject2.handleRotation(activeControl.axisX, dy + randomness);
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
  if (activeControl.pausedDueToScreenOrientation){
    return;
  }
  var degreeInterval = 30;
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
  if (activeControl.pausedDueToScreenOrientation){
    return;
  }
  var oldTouch = activeControl.touchTrack.get(touch.identifier);
  var movementX = (touch.pageX - oldTouch.pageX);
  var movementY = (touch.pageY - oldTouch.pageY);
  var dx = -(movementX * activeControl.touchLookSpeed);
  camera.rotation.y += dx;
  if (activeControl.hasWeapon1){
    var randomness = 0;
    if (activeControl.weaponRotationRandomnessOn){
      activeControl.weapon1RotationRandomnessCounter += 0.06 * Math.random();
      randomness = (Math.random() * (Math.sin(activeControl.weapon1RotationRandomnessCounter) / 800));
    }
    activeControl.weaponObject1.handleRotation(activeControl.axisY, dx + randomness);
  }
  if (activeControl.hasWeapon2){
    var randomness = 0;
    if (activeControl.weaponRotationRandomnessOn){
      activeControl.weapon2RotationRandomnessCounter += 0.06 * Math.random();
      randomness = (Math.random() * (Math.sin(activeControl.weapon2RotationRandomnessCounter) / 800));
    }
    activeControl.weaponObject2.handleRotation(activeControl.axisY, dx + randomness);
  }
  activeControl.alpha -= dx;
  var dy = -movementY * activeControl.touchLookSpeed;
  if (!(dy > 0 && (activeControl.totalXRotation + dy >= 1.10)) && !(dy <0 && (activeControl.totalXRotation + dy <= -1.10))){
    camera.rotation.x += dy;
    if (activeControl.hasWeapon1){
      var randomness = 0;
      if (activeControl.weaponRotationRandomnessOn){
        activeControl.weapon1RotationRandomnessCounter2 += 0.06 * Math.random();
        randomness = (Math.random() * (Math.sin(activeControl.weapon1RotationRandomnessCounter2) / 800));
      }
      activeControl.weaponObject1.handleRotation(activeControl.axisX, dy + randomness);
    }
    if (activeControl.hasWeapon2){
      var randomness = 0;
      if (activeControl.weaponRotationRandomnessOn){
        activeControl.weapon2RotationRandomnessCounter2 += 0.06 * Math.random();
        randomness = (Math.random() * (Math.sin(activeControl.weapon2RotationRandomnessCounter2) / 800));
      }
      activeControl.weaponObject2.handleRotation(activeControl.axisX, dy + randomness);
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

FPSControls.prototype.pauseDueToScreenOrientation = function(){
  this.onPause();
  this.pausedDueToScreenOrientation = true;
  if (this.isShooting){
    this.onStoppedShooting();
  }
  this.isShooting = false;
  if (this.hasWeapon1){
    this.weaponObject1.hide(false);
    if (this.weaponObject1.muzzleFlashParameters){
      muzzleFlashes[this.weaponObject1.muzzleFlashParameters.muzzleFlashName].onWeaponDeactivated();
    }
  }
  if (this.hasWeapon2){
    this.weaponObject2.hide(false);
    if (this.weaponObject2.muzzleFlashParameters){
      muzzleFlashes[this.weaponObject2.muzzleFlashParameters.muzzleFlashName].onWeaponDeactivated();
    }
  }
}

FPSControls.prototype.resume = function(){
  this.onResume();
  this.pausedDueToScreenOrientation = false;
  if (this.hasWeapon1){
    this.weaponObject1.show();
  }
  if (this.hasWeapon2){
    this.weaponObject2.show();
  }
}

FPSControls.prototype.applyCustomVelocity = function(axis, velocity, milliseconds){
  if (axis == "x"){
    this.hasCustomXVelocity = true;
    this.customXVelocity = velocity;
    this.customXVelocityEndTime = performance.now() + milliseconds;
  }else if (axis == "y"){
    this.hasCustomYVelocity = true;
    this.customYVelocity = velocity;
    this.customYVelocityEndTime = performance.now() + milliseconds;
  }else if (axis == "z"){
    this.hasCustomZVelocity = true;
    this.customZVelocity = velocity;
    this.customZVelocityEndTime = performance.now() + milliseconds;
  }
}

FPSControls.prototype.update = function(){
  if (isMobile && !isOrientationLandscape){
    if (!this.pausedDueToScreenOrientation){
      this.pauseDueToScreenOrientation();
    }
    return;
  }else{
    if (this.pausedDueToScreenOrientation){
      this.resume();
    }
  }
  camera.position.copy(this.playerBodyObject.mesh.position);
  var now = performance.now();
  if (!this.hasCustomXVelocity){
    this.playerBodyObject.setVelocityX(0);
    this.xVelocity = 0;
  }else{
    this.playerBodyObject.setVelocityX(this.customXVelocity);
    this.xVelocity = this.customXVelocity;
    if (now >= this.customXVelocityEndTime){
      this.hasCustomXVelocity = false;
    }
  }
  if (!this.hasCustomZVelocity){
    this.playerBodyObject.setVelocityZ(0);
    this.zVelocity = 0;
  }else{
    this.playerBodyObject.setVelocityZ(this.customZVelocity);
    this.zVelocity = this.customZVelocity;
    if (now >= this.customZVelocityEndTime){
      this.hasCustomZVelocity = false;
    }
  }
  if (this.hasCustomYVelocity){
    this.playerBodyObject.setVelocityY(this.customYVelocity);
    this.yVelocity = this.customYVelocity;
    if (now >= this.customYVelocityEndTime){
      this.hasCustomYVelocity = false;
      this.playerBodyObject.setVelocityY(0);
      this.yVelocity = 0;
    }
  }

  var hasMotion = this.isMouseDown || this.isShooting;
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
  this.lookIntersectionTest();
}

FPSControls.prototype.onlookRaycasterComplete = function(x, y, z, objName){
  if (activeControl.deactivated){
    return;
  }
  if (isNaN(x) || isNaN(y) || isNaN(z)){
    return;
  }
  activeControl.currentLookInfo.x = x;
  activeControl.currentLookInfo.y = y;
  activeControl.currentLookInfo.z = z;
  activeControl.currentLookInfo.objName = objName;
  activeControl.onLook(x, y, z, objName);
  if (!isMobile){
    if (activeControl.isMouseDown){
      activeControl.onShoot(x, y, z, objName);
      activeControl.isShooting = true;
    }else if (activeControl.isShooting){
      activeControl.onStoppedShooting();
      activeControl.isShooting = false;
    }
  }else{
    if (objName != null && activeControl.shootableMap[objName]){
      activeControl.onShoot(x, y, z, objName);
      activeControl.isShooting = true;
    }else if (activeControl.isShooting){
      activeControl.onStoppedShooting();
      activeControl.isShooting = false;
    }
  }
}

FPSControls.prototype.lookIntersectionTest = function(){
  REUSABLE_VECTOR.copy(camera.position);
  REUSABLE_VECTOR_2.set(0, 0, -1).applyQuaternion(camera.quaternion);
  rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, false, this.onlookRaycasterComplete, null, null, true);
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
  if (activeControl.pausedDueToScreenOrientation){
    return;
  }
  if (activeControl.requestFullScreen && !onFullScreen){
    return;
  }
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

FPSControls.prototype.onDeactivated = function(doNotShowElements){
  this.deactivated = true;
  this.playerBodyObject.usedAsFPSPlayerBody = false;
  this.playerBodyObject.removeCollisionListener();
  if (this.autoInstancedObject){
    this.autoInstancedObject.mesh.visible = false;
    this.weaponObject1.mesh.visible = true;
    this.weaponObject2.mesh.visible = true;
  }
  if (!doNotShowElements){
    this.playerBodyObject.show();
  }
  if (this.hasWeapon1){
    if (!doNotShowElements){
      this.weaponObject1.show();
    }
    this.weaponObject1.mesh.renderOrder = renderOrders.OBJECT;
    this.weaponObject1.unsetRotationPivot();
    this.weaponObject1.untrackObjectPosition();
    this.weaponObject1.mesh.position.copy(this.weaponObject1.beforeFPSControlsInfo.position);
    this.weaponObject1.mesh.quaternion.copy(this.weaponObject1.beforeFPSControlsInfo.quaternion);
    this.weaponObject1.mesh.scale.set(1, 1, 1);
    if (this.weaponObject1.muzzleFlashParameters){
      muzzleFlashes[this.weaponObject1.muzzleFlashParameters.muzzleFlashName].onWeaponDeactivated();
    }
  }
  if (this.hasWeapon2){
    if (!doNotShowElements){
      this.weaponObject2.show();
    }
    this.weaponObject2.mesh.renderOrder = renderOrders.OBJECT;
    this.weaponObject2.unsetRotationPivot();
    this.weaponObject2.untrackObjectPosition();
    this.weaponObject2.mesh.position.copy(this.weaponObject2.beforeFPSControlsInfo.position);
    this.weaponObject2.mesh.quaternion.copy(this.weaponObject2.beforeFPSControlsInfo.quaternion);
    this.weaponObject2.mesh.scale.set(1, 1, 1);
    if (this.weaponObject2.muzzleFlashParameters){
      muzzleFlashes[this.weaponObject2.muzzleFlashParameters.muzzleFlashName].onWeaponDeactivated();
    }
  }
  if (isMobile){
    touchEventHandler.tapThreshold = 310;
  }
  this.isShooting = false;
}

FPSControls.prototype.onTrackingUpdate = function(){
  this.onResize();
  this.trackingUpdateNeeded = false;
}

FPSControls.prototype.onPlayerBodyCollision = function(event){
  if (event.y < this.physicsBody.position.y){
    activeControl.canJump = true;
    activeControl.canDoubleJump = true;
  }
}

FPSControls.prototype.onActivated = function(){
  this.resetRotation();
  this.playerBodyObject.setPosition(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
  this.deactivated = false;
  this.canJump = true;
  this.canDoubleJump = true;
  this.pausedDueToScreenOrientation = false;
  this.currentLookInfo.x = 0;
  this.currentLookInfo.y = 0;
  this.currentLookInfo.z = 0;
  this.currentLookInfo.objName = null;
  this.isMouseDown = false;
  this.lastTapTime = 0;
  this.lastSpaceKeydownTime = 0;
  this.joystickStatus.right = false;
  this.joystickStatus.left = false;
  this.joystickStatus.up = false;
  this.joystickStatus.down = false;
  this.touchTrack.clear();
  camera.position.copy(this.playerBodyObject.mesh.position);
  this.playerBodyObject.show();
  this.playerBodyObject.hide(true);
  this.playerBodyObject.usedAsFPSPlayerBody = true;
  this.playerBodyObject.setCollisionListener(this.onPlayerBodyCollision);
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
  if (this.hasWeapon1){
    this.weaponObject1.show();
    this.weaponObject1.mesh.renderOrder = renderOrders.FPS_WEAPON;
    var pos = this.weaponObject1.mesh.position;
    var quat = this.weaponObject1.mesh.quaternion;
    this.weaponObject1.beforeFPSControlsInfo.position.copy(pos);
    this.weaponObject1.beforeFPSControlsInfo.quaternion.copy(quat);
    this.weaponObject1.mesh.quaternion.set(this.weaponObject1.fpsWeaponAlignment.qx, this.weaponObject1.fpsWeaponAlignment.qy, this.weaponObject1.fpsWeaponAlignment.qz, this.weaponObject1.fpsWeaponAlignment.qw);
    this.weapon1InitQuaternion.copy(this.weaponObject1.mesh.quaternion);
    this.weaponObject1.mesh.scale.set(this.weaponObject1.fpsWeaponAlignment.scale, this.weaponObject1.fpsWeaponAlignment.scale, this.weaponObject1.fpsWeaponAlignment.scale);
    this.weapon1Position.set(this.weaponObject1.fpsWeaponAlignment.x, this.weaponObject1.fpsWeaponAlignment.y, this.weaponObject1.fpsWeaponAlignment.z);
    this.trackingUpdateNeeded = true;
    if (this.hasIdleGunAnimation){
      this.weapon1IdleAnimationInfo.x = 0;
      this.weapon1IdleAnimationInfo.z = 0;
    }
    this.weapon1RotationRandomnessCounter = 0;
    this.weapon1RotationRandomnessCounter2 = 0;
    if (this.weaponObject1.muzzleFlashParameters){
      muzzleFlashes[this.weaponObject1.muzzleFlashParameters.muzzleFlashName].onWeaponActivated(this.weaponObject1);
    }
  }
  if (this.hasWeapon2){
    this.weaponObject2.show();
    this.weaponObject2.mesh.renderOrder = renderOrders.FPS_WEAPON;
    var pos = this.weaponObject2.mesh.position;
    var quat = this.weaponObject2.mesh.quaternion;
    this.weaponObject2.beforeFPSControlsInfo.position.copy(pos);
    this.weaponObject2.beforeFPSControlsInfo.quaternion.copy(quat);
    this.weaponObject2.mesh.quaternion.set(this.weaponObject2.fpsWeaponAlignment.qx, this.weaponObject2.fpsWeaponAlignment.qy, this.weaponObject2.fpsWeaponAlignment.qz, this.weaponObject2.fpsWeaponAlignment.qw);
    this.weapon2InitQuaternion.copy(this.weaponObject2.mesh.quaternion);
    this.weaponObject2.mesh.scale.set(this.weaponObject2.fpsWeaponAlignment.scale, this.weaponObject2.fpsWeaponAlignment.scale, this.weaponObject2.fpsWeaponAlignment.scale);
    this.weapon2Position.set(this.weaponObject2.fpsWeaponAlignment.x, this.weaponObject2.fpsWeaponAlignment.y, this.weaponObject2.fpsWeaponAlignment.z);
    this.trackingUpdateNeeded = true;
    if (this.hasIdleGunAnimation){
      this.weapon2IdleAnimationInfo.x = 0;
      this.weapon2IdleAnimationInfo.z = 0;
    }
    this.weapon2RotationRandomnessCounter = 0;
    this.weapon2RotationRandomnessCounter2 = 0;
    if (this.weaponObject2.muzzleFlashParameters){
      muzzleFlashes[this.weaponObject2.muzzleFlashParameters.muzzleFlashName].onWeaponActivated(this.weaponObject2);
    }
  }
  if (this.autoInstancedObject){
    this.weaponObject1.mesh.visible = false;
    this.weaponObject2.mesh.visible = false;
    this.autoInstancedObject.mesh.renderOrder = renderOrders.FPS_WEAPON;
    this.autoInstancedObject.mesh.visible = true;
  }
  if (isMobile){
    touchEventHandler.tapThreshold = 110;
  }
}
