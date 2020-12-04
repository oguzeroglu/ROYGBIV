precision lowp float;
precision lowp int;

attribute vec3 color;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
varying vec3 vColor;

#define INSERTION

void main(){
  vColor = color;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
