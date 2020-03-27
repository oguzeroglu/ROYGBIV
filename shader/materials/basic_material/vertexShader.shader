precision lowp float;
precision lowp int;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform vec3 color;
varying vec3 vColor;

#define INSERTION

#ifdef HAS_DISPLACEMENT
  uniform sampler2D displacementMap;
  uniform vec2 displacementInfo;
#endif
#ifdef HAS_TEXTURE
  varying vec2 vUV;
  uniform mat3 textureMatrix;
#endif
#ifdef HAS_SKYBOX_FOG
  uniform mat4 worldMatrix;
  varying vec3 vWorldPosition;
#endif

vec3 handleLighting(){

  vec3 ambient = vec3(0, 0, 0);

  #ifdef HAS_STATIC_AMBIENT_LIGHT_1
    vec3 ambientLight1RGB = vec3(STATIC_AMBIENT_LIGHT_1_R, STATIC_AMBIENT_LIGHT_1_G, STATIC_AMBIENT_LIGHT_1_B);
    ambient += (ambientLight1RGB * STATIC_AMBIENT_LIGHT_1_STRENGTH);
  #endif
  #ifdef HAS_STATIC_AMBIENT_LIGHT_2
    vec3 ambientLight2RGB = vec3(STATIC_AMBIENT_LIGHT_2_R, STATIC_AMBIENT_LIGHT_2_G, STATIC_AMBIENT_LIGHT_2_B);
    ambient += (ambientLight2RGB * STATIC_AMBIENT_LIGHT_2_STRENGTH);
  #endif
  #ifdef HAS_STATIC_AMBIENT_LIGHT_3
    vec3 ambientLight3RGB = vec3(STATIC_AMBIENT_LIGHT_3_R, STATIC_AMBIENT_LIGHT_3_G, STATIC_AMBIENT_LIGHT_3_B);
    ambient += (ambientLight3RGB * STATIC_AMBIENT_LIGHT_3_STRENGTH);
  #endif
  #ifdef HAS_STATIC_AMBIENT_LIGHT_4
    vec3 ambientLight4RGB = vec3(STATIC_AMBIENT_LIGHT_4_R, STATIC_AMBIENT_LIGHT_4_G, STATIC_AMBIENT_LIGHT_4_B);
    ambient += (ambientLight4RGB * STATIC_AMBIENT_LIGHT_4_STRENGTH);
  #endif
  #ifdef HAS_STATIC_AMBIENT_LIGHT_5
    vec3 ambientLight5RGB = vec3(STATIC_AMBIENT_LIGHT_5_R, STATIC_AMBIENT_LIGHT_5_G, STATIC_AMBIENT_LIGHT_5_B);
    ambient += (ambientLight5RGB * STATIC_AMBIENT_LIGHT_5_STRENGTH);
  #endif

  vec3 ambientColor = ambient * color;

  return ambientColor;
}

void main(){

  #ifdef AFFECTED_BY_LIGHT
    vColor = handleLighting();
  #else
    vColor = color;
  #endif

  #ifdef HAS_TEXTURE
    vUV = (textureMatrix * vec3(uv, 1.0)).xy;
  #endif

  #ifdef HAS_SKYBOX_FOG
    vWorldPosition = (worldMatrix * vec4(position, 1.0)).xyz;
  #endif

  vec3 transformedPosition = position;
  #ifdef HAS_DISPLACEMENT
    vec3 objNormal = normalize(normal);
    transformedPosition += objNormal * (texture2D(displacementMap, uv).r * displacementInfo.x + displacementInfo.y);
  #endif

  vec4 mvPosition = modelViewMatrix * vec4(transformedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
