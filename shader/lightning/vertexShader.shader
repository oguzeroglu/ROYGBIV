precision lowp float;
precision lowp int;

#define INSERTION

attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

#ifdef HAS_SKYBOX_FOG
  varying vec3 vWorldPosition;
  uniform mat4 worldMatrix;
#endif

void main(){
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  #ifdef HAS_SKYBOX_FOG
    vWorldPosition = (worldMatrix * vec4(position, 1.0)).xyz;
  #endif
}
