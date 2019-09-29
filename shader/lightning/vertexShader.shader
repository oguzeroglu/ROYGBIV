precision lowp float;
precision lowp int;

attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

void main(){
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
