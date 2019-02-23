precision lowp float;
precision lowp int;

#define STR_LEN 1

attribute float xOffset;
attribute float yOffset;
attribute float charIndex;

uniform float charSize;
uniform float xOffsets[STR_LEN];
uniform float yOffsets[STR_LEN];
uniform vec3 isTwoDimensionalInfo;
uniform vec4 cameraQuaternion;
uniform vec4 uvRanges[STR_LEN];
uniform vec4 currentViewport;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

varying vec3 vWorldPosition;
varying vec4 vUVRanges;

vec3 applyQuaternionToVector(vec3 vector, vec4 quaternion){
  float x = vector.x;
  float y = vector.y;
  float z = vector.z;
  float qx = quaternion.x;
  float qy = quaternion.y;
  float qz = quaternion.z;
  float qw = quaternion.w;
  float ix = (qw * x) + (qy * z) - (qz * y);
  float iy = (qw * y) + (qz * x) - (qx * z);
  float iz = (qw * z) + (qx * y) - (qy * x);
  float iw = (-1.0 * qx * x) - (qy * y) - (qz * z);
  float calculatedX = (ix * qw) + (iw * -1.0 * qx) + (iy * -1.0 * qz) - (iz * -1.0 * qy);
  float calculatedY = (iy * qw) + (iw * -1.0 * qy) + (iz * -1.0 * qx) - (ix * -1.0 * qz);
  float calculatedZ = (iz * qw) + (iw * -1.0 * qz) + (ix * -1.0 * qy) - (iy * -1.0 * qx);
  return vec3(calculatedX, calculatedY, calculatedZ);
}

void main(){
  int charIndexInt = int(charIndex);
  vUVRanges = uvRanges[charIndexInt];
  float xOffset = xOffsets[charIndexInt];
  float yOffset = yOffsets[charIndexInt];
  vec3 pos = vec3(xOffset, yOffset, 0.0);
  vec3 quaternionApplied = applyQuaternionToVector(pos, cameraQuaternion);
  vWorldPosition = (worldMatrix * vec4(quaternionApplied, 1.0)).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(quaternionApplied, 1.0);
  float isTwoDimensionalFlag = isTwoDimensionalInfo.x;
  if (isTwoDimensionalFlag < 0.0){
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (500.0) * charSize / length(mvPosition.xyz);
  }else{
    float oldPosX = ((currentViewport.z - currentViewport.x) / 2.0) + currentViewport.x + xOffset;
    float oldPosY = ((currentViewport.w - currentViewport.y) / 2.0) + currentViewport.y + yOffset;
    float x = (((oldPosX - currentViewport.x) * 2.0) / currentViewport.z) - 1.0;
    float y = (((oldPosY - currentViewport.y) * 2.0) / currentViewport.w) - 1.0;
    gl_Position = vec4(x + isTwoDimensionalInfo.y, y + isTwoDimensionalInfo.z, 0.0, 1.0);
    gl_PointSize = charSize;
  }
}
