var CrosshairHandler = function(){

}

CrosshairHandler.prototype.selectCrosshair = function(crosshair){
  if (selectedCrosshair){
    selectedCrosshair.mesh.visible = false;
  }
  crosshair.mesh.visible = true;
  crosshair.handleResize();
  selectedCrosshair = crosshair;
  this.stopCrosshairRotation();
}

CrosshairHandler.prototype.changeCrosshairColor = function(colorName){
  if (!selectedCrosshair){
    return;
  }
  REUSABLE_COLOR.set(colorName);
  selectedCrosshair.material.uniforms.color.value.x = REUSABLE_COLOR.r;
  selectedCrosshair.material.uniforms.color.value.y = REUSABLE_COLOR.g;
  selectedCrosshair.material.uniforms.color.value.z = REUSABLE_COLOR.b;
}

CrosshairHandler.prototype.hideCrosshair = function(){
  if (!selectedCrosshair){
    return;
  }
  selectedCrosshair.mesh.visible = false;
  selectedCrosshair = 0;
}

CrosshairHandler.prototype.startCrosshairRotation = function(angularSpeed){
  if (!selectedCrosshair){
    return;
  }
  selectedCrosshair.angularSpeed = angularSpeed;
}

CrosshairHandler.prototype.stopCrosshairRotation = function(){
  if (!selectedCrosshair){
    return;
  }
  selectedCrosshair.rotationTime = 0;
  selectedCrosshair.angularSpeed = 0;
  selectedCrosshair.resetRotation();
}

CrosshairHandler.prototype.pauseCrosshairRotation = function(){
  if (!selectedCrosshair){
    return;
  }
  selectedCrosshair.angularSpeed = 0;
}

CrosshairHandler.prototype.expandCrosshair = function(targetSize, delta){
  if (!selectedCrosshair){
    return;
  }
  selectedCrosshair.expandTick = 0;
  selectedCrosshair.expandTargetSize = targetSize;
  selectedCrosshair.expandDelta = delta;
  selectedCrosshair.expand = true;
  selectedCrosshair.shrink = false;
}

CrosshairHandler.prototype.shrinkCrosshair = function(delta){
  if (!selectedCrosshair){
    return;
  }
  selectedCrosshair.shrinkTick = 0;
  selectedCrosshair.expandDelta = delta;
  selectedCrosshair.material.uniforms.shrinkStartSize.value = selectedCrosshair.curSize;
  selectedCrosshair.expand = false;
  selectedCrosshair.shrink = true;
}
