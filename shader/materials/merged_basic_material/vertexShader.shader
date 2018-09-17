precision lowp float;
precision lowp int;

attribute float alpha;
attribute float emissiveIntensity;
attribute float aoIntensity;
attribute vec3 position;
attribute vec3 color;
attribute vec2 diffuseUV;
attribute vec2 emissiveUV;
attribute vec2 alphaUV;
attribute vec2 aoUV;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying float hasDiffuseFlag;
varying float hasEmissiveFlag;
varying float hasAlphaFlag;
varying float hasAOFlag;
varying float vAlpha;
varying float vEmissiveIntensity;
varying float vAOIntensity;
varying vec2 vDiffuseUV;
varying vec2 vEmissiveUV;
varying vec2 vAlphaUV;
varying vec2 vAOUV;
varying vec3 vColor;

void main(){

  hasDiffuseFlag = 10.0;
  if (diffuseUV.x < -50.0 && diffuseUV.y < -50.0){
    hasDiffuseFlag = -10.0;
  }
  hasEmissiveFlag = 10.0;
  if (emissiveUV.x < -50.0 && emissiveUV.y < -50.0){
    hasEmissiveFlag = -10.0;
  }
  hasAlphaFlag = 10.0;
  if (alphaUV.x < -50.0 && alphaUV.y < -50.0){
    hasAlphaFlag = -10.0;
  }
  hasAOFlag = 10.0;
  if (aoUV.x < -50.0 && aoUV.y < -50.0){
    hasAOFlag = -10.0;
  }

  vColor = color;
  vAlpha = alpha;
  vEmissiveIntensity = emissiveIntensity;
  vAOIntensity = aoIntensity;
  vDiffuseUV = diffuseUV;
  vEmissiveUV = emissiveUV;
  vAlphaUV = alphaUV;
  vAOUV = aoUV;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
