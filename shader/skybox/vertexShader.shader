precision lowp float;
precision lowp int;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute float materialIndex;

varying float vMaterialIndex;
varying vec2 vUV;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

void main(){
  vMaterialIndex = materialIndex;
  vUV = uv;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
