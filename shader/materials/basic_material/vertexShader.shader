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

vec3 diffuseLight(float dirX, float dirY, float dirZ, float r, float g, float b, float strength, vec3 normal){
  vec3 lightDir = normalize(vec3(dirX, dirY, dirZ));
  float diffuseFactor = dot(normal, -lightDir);
  vec3 lightColor = vec3(r, g, b);
  if (diffuseFactor > 0.0){
     return (strength * diffuseFactor * lightColor);
  }
  return vec3(0.0, 0.0, 0.0);
}

vec3 handleLighting(){

  vec3 ambient = vec3(0.0, 0.0, 0.0);
  vec3 diffuse = vec3(0.0, 0.0, 0.0);

  #ifdef HAS_STATIC_AMBIENT_LIGHT
    vec3 ambientLightRGB = vec3(float(STATIC_AMBIENT_LIGHT_R), float(STATIC_AMBIENT_LIGHT_G), float(STATIC_AMBIENT_LIGHT_B));
    ambient += (ambientLightRGB * float(STATIC_AMBIENT_LIGHT_STRENGTH));
  #endif

  #ifdef HAS_STATIC_DIFFUSE_LIGHT_1
    diffuse += diffuseLight(
      float(STATIC_DIFFUSE_LIGHT_1_DIR_X), float(STATIC_DIFFUSE_LIGHT_1_DIR_Y), float(STATIC_DIFFUSE_LIGHT_1_DIR_Z),
      float(STATIC_DIFFUSE_LIGHT_1_R), float(STATIC_DIFFUSE_LIGHT_1_G), float(STATIC_DIFFUSE_LIGHT_1_B),
      float(STATIC_DIFFUSE_LIGHT_1_STRENGTH), normal
    );
  #endif
  #ifdef HAS_STATIC_DIFFUSE_LIGHT_2
    diffuse += diffuseLight(
      float(STATIC_DIFFUSE_LIGHT_2_DIR_X), float(STATIC_DIFFUSE_LIGHT_2_DIR_Y), float(STATIC_DIFFUSE_LIGHT_2_DIR_Z),
      float(STATIC_DIFFUSE_LIGHT_2_R), float(STATIC_DIFFUSE_LIGHT_2_G), float(STATIC_DIFFUSE_LIGHT_2_B),
      float(STATIC_DIFFUSE_LIGHT_2_STRENGTH), normal
    );
  #endif
  #ifdef HAS_STATIC_DIFFUSE_LIGHT_3
    diffuse += diffuseLight(
      float(STATIC_DIFFUSE_LIGHT_3_DIR_X), float(STATIC_DIFFUSE_LIGHT_3_DIR_Y), float(STATIC_DIFFUSE_LIGHT_3_DIR_Z),
      float(STATIC_DIFFUSE_LIGHT_3_R), float(STATIC_DIFFUSE_LIGHT_3_G), float(STATIC_DIFFUSE_LIGHT_3_B),
      float(STATIC_DIFFUSE_LIGHT_3_STRENGTH), normal
    );
  #endif
  #ifdef HAS_STATIC_DIFFUSE_LIGHT_4
    diffuse += diffuseLight(
      float(STATIC_DIFFUSE_LIGHT_4_DIR_X), float(STATIC_DIFFUSE_LIGHT_4_DIR_Y), float(STATIC_DIFFUSE_LIGHT_4_DIR_Z),
      float(STATIC_DIFFUSE_LIGHT_4_R), float(STATIC_DIFFUSE_LIGHT_4_G), float(STATIC_DIFFUSE_LIGHT_4_B),
      float(STATIC_DIFFUSE_LIGHT_4_STRENGTH), normal
    );
  #endif
  #ifdef HAS_STATIC_DIFFUSE_LIGHT_5
    diffuse += diffuseLight(
      float(STATIC_DIFFUSE_LIGHT_5_DIR_X), float(STATIC_DIFFUSE_LIGHT_5_DIR_Y), float(STATIC_DIFFUSE_LIGHT_5_DIR_Z),
      float(STATIC_DIFFUSE_LIGHT_5_R), float(STATIC_DIFFUSE_LIGHT_5_G), float(STATIC_DIFFUSE_LIGHT_5_B),
      float(STATIC_DIFFUSE_LIGHT_5_STRENGTH), normal
    );
  #endif

  vec3 ambientColor = (ambient + diffuse) * color;

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
