precision lowp float;
precision lowp int;

attribute vec3 color;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec4 diffuseUV;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUV;
varying vec3 vColor;
varying vec4 vDiffuseUV;

#define INSERTION

void main(){
  vUV = uv;
  vColor = color;
  vDiffuseUV = diffuseUV;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
