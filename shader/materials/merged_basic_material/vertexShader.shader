precision lowp float;
precision lowp int;

attribute float alpha;
attribute vec3 color;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
varying vec3 vColor;
varying float vAlpha;

#define INSERTION

#ifdef HAS_EMISSIVE
  attribute float emissiveIntensity;
  attribute vec3 emissiveColor;
  varying vec3 vEmissiveColor;
  varying float vEmissiveIntensity;
#endif
#ifdef HAS_AO
  attribute float aoIntensity;
  varying float vAOIntensity;
#endif
#ifdef HAS_DISPLACEMENT
  attribute vec2 displacementInfo;
  uniform sampler2D displacementMap;
  uniform vec2 totalDisplacementInfo;
#endif
#ifdef HAS_TEXTURE
  attribute vec2 uv;
  attribute vec4 textureInfo;
  attribute vec4 textureMatrixInfo;
  varying vec2 vUV;
  uniform vec2 totalTextureOffset;
  #ifdef HAS_AO
    varying float hasAOMap;
  #endif
  #ifdef HAS_DIFFUSE
    varying float hasDiffuseMap;
  #endif
  #ifdef HAS_EMISSIVE
    varying float hasEmissiveMap;
  #endif
  #ifdef HAS_ALPHA
    varying float hasAlphaMap;
  #endif
#endif
#if defined(HAS_SKYBOX_FOG) || defined(AFFECTED_BY_LIGHT)
  uniform mat4 worldMatrix;
#endif
#ifdef HAS_SKYBOX_FOG
  varying vec3 vWorldPosition;
#endif

#ifdef AFFECTED_BY_LIGHT
  uniform mat4 worldInverseTranspose;
#endif

vec3 pointLight(float pX, float pY, float pZ, float r, float g, float b, float strength, vec3 worldPosition, vec3 normal){
  vec3 pointLightPosition = vec3(pX, pY, pZ);
  vec3 toLight = normalize(pointLightPosition - worldPosition);
  float diffuseFactor = dot(normal, toLight);
  if (diffuseFactor > 0.0){
    vec3 lightColor = vec3(r, g, b);
    return (strength * diffuseFactor * lightColor);
  }
  return vec3(0.0, 0.0, 0.0);
}

vec3 diffuseLight(float dirX, float dirY, float dirZ, float r, float g, float b, float strength, vec3 normal){
  vec3 lightDir = normalize(vec3(dirX, dirY, dirZ));
  float diffuseFactor = dot(normal, -lightDir);
  if (diffuseFactor > 0.0){
     vec3 lightColor = vec3(r, g, b);
     return (strength * diffuseFactor * lightColor);
  }
  return vec3(0.0, 0.0, 0.0);
}

#ifdef AFFECTED_BY_LIGHT
  vec3 handleLighting(vec3 worldPositionComputed){

    vec3 ambient = vec3(0.0, 0.0, 0.0);
    vec3 diffuse = vec3(0.0, 0.0, 0.0);

    #ifdef HAS_STATIC_AMBIENT_LIGHT
      vec3 ambientLightRGB = vec3(float(STATIC_AMBIENT_LIGHT_R), float(STATIC_AMBIENT_LIGHT_G), float(STATIC_AMBIENT_LIGHT_B));
      ambient += (ambientLightRGB * float(STATIC_AMBIENT_LIGHT_STRENGTH));
    #endif

    vec3 computedNormal = mat3(worldInverseTranspose) * normal;

    #ifdef HAS_STATIC_DIFFUSE_LIGHT_1
      diffuse += diffuseLight(
        float(STATIC_DIFFUSE_LIGHT_1_DIR_X), float(STATIC_DIFFUSE_LIGHT_1_DIR_Y), float(STATIC_DIFFUSE_LIGHT_1_DIR_Z),
        float(STATIC_DIFFUSE_LIGHT_1_R), float(STATIC_DIFFUSE_LIGHT_1_G), float(STATIC_DIFFUSE_LIGHT_1_B),
        float(STATIC_DIFFUSE_LIGHT_1_STRENGTH), computedNormal
      );
    #endif
    #ifdef HAS_STATIC_DIFFUSE_LIGHT_2
      diffuse += diffuseLight(
        float(STATIC_DIFFUSE_LIGHT_2_DIR_X), float(STATIC_DIFFUSE_LIGHT_2_DIR_Y), float(STATIC_DIFFUSE_LIGHT_2_DIR_Z),
        float(STATIC_DIFFUSE_LIGHT_2_R), float(STATIC_DIFFUSE_LIGHT_2_G), float(STATIC_DIFFUSE_LIGHT_2_B),
        float(STATIC_DIFFUSE_LIGHT_2_STRENGTH), computedNormal
      );
    #endif
    #ifdef HAS_STATIC_DIFFUSE_LIGHT_3
      diffuse += diffuseLight(
        float(STATIC_DIFFUSE_LIGHT_3_DIR_X), float(STATIC_DIFFUSE_LIGHT_3_DIR_Y), float(STATIC_DIFFUSE_LIGHT_3_DIR_Z),
        float(STATIC_DIFFUSE_LIGHT_3_R), float(STATIC_DIFFUSE_LIGHT_3_G), float(STATIC_DIFFUSE_LIGHT_3_B),
        float(STATIC_DIFFUSE_LIGHT_3_STRENGTH), computedNormal
      );
    #endif
    #ifdef HAS_STATIC_DIFFUSE_LIGHT_4
      diffuse += diffuseLight(
        float(STATIC_DIFFUSE_LIGHT_4_DIR_X), float(STATIC_DIFFUSE_LIGHT_4_DIR_Y), float(STATIC_DIFFUSE_LIGHT_4_DIR_Z),
        float(STATIC_DIFFUSE_LIGHT_4_R), float(STATIC_DIFFUSE_LIGHT_4_G), float(STATIC_DIFFUSE_LIGHT_4_B),
        float(STATIC_DIFFUSE_LIGHT_4_STRENGTH), computedNormal
      );
    #endif
    #ifdef HAS_STATIC_DIFFUSE_LIGHT_5
      diffuse += diffuseLight(
        float(STATIC_DIFFUSE_LIGHT_5_DIR_X), float(STATIC_DIFFUSE_LIGHT_5_DIR_Y), float(STATIC_DIFFUSE_LIGHT_5_DIR_Z),
        float(STATIC_DIFFUSE_LIGHT_5_R), float(STATIC_DIFFUSE_LIGHT_5_G), float(STATIC_DIFFUSE_LIGHT_5_B),
        float(STATIC_DIFFUSE_LIGHT_5_STRENGTH), computedNormal
      );
    #endif

    #ifdef HAS_STATIC_POINT_LIGHT_1
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_1_X), float(STATIC_POINT_LIGHT_1_Y), float(STATIC_POINT_LIGHT_1_Z),
        float(STATIC_POINT_LIGHT_1_R), float(STATIC_POINT_LIGHT_1_G), float(STATIC_POINT_LIGHT_1_B),
        float(STATIC_POINT_LIGHT_1_STRENGTH), worldPositionComputed, computedNormal
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_2
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_2_X), float(STATIC_POINT_LIGHT_2_Y), float(STATIC_POINT_LIGHT_2_Z),
        float(STATIC_POINT_LIGHT_2_R), float(STATIC_POINT_LIGHT_2_G), float(STATIC_POINT_LIGHT_2_B),
        float(STATIC_POINT_LIGHT_2_STRENGTH), worldPositionComputed, computedNormal
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_3
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_3_X), float(STATIC_POINT_LIGHT_3_Y), float(STATIC_POINT_LIGHT_3_Z),
        float(STATIC_POINT_LIGHT_3_R), float(STATIC_POINT_LIGHT_3_G), float(STATIC_POINT_LIGHT_3_B),
        float(STATIC_POINT_LIGHT_3_STRENGTH), worldPositionComputed, computedNormal
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_4
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_4_X), float(STATIC_POINT_LIGHT_4_Y), float(STATIC_POINT_LIGHT_4_Z),
        float(STATIC_POINT_LIGHT_4_R), float(STATIC_POINT_LIGHT_4_G), float(STATIC_POINT_LIGHT_4_B),
        float(STATIC_POINT_LIGHT_4_STRENGTH), worldPositionComputed, computedNormal
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_5
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_5_X), float(STATIC_POINT_LIGHT_5_Y), float(STATIC_POINT_LIGHT_5_Z),
        float(STATIC_POINT_LIGHT_5_R), float(STATIC_POINT_LIGHT_5_G), float(STATIC_POINT_LIGHT_5_B),
        float(STATIC_POINT_LIGHT_5_STRENGTH), worldPositionComputed, computedNormal
      );
    #endif

    vec3 ambientColor = (ambient + diffuse) * color;

    return ambientColor;
  }
#endif

void main(){

  #if defined(HAS_SKYBOX_FOG) || defined(AFFECTED_BY_LIGHT)
    vec3 worldPositionComputed = (worldMatrix * vec4(position, 1.0)).xyz;
  #endif

  #ifdef AFFECTED_BY_LIGHT
    vColor = handleLighting(worldPositionComputed);
  #else
    vColor = color;
  #endif

  vAlpha = alpha;

  #ifdef HAS_TEXTURE
    vUV = (
      mat3(
        textureMatrixInfo.z, 0.0, 0.0,
        0.0, textureMatrixInfo.w, 0.0,
        textureMatrixInfo.x + totalTextureOffset.x, textureMatrixInfo.y + totalTextureOffset.y, 1.0
      ) * vec3(uv, 1.0)
    ).xy;
    #ifdef HAS_DIFFUSE
      hasDiffuseMap = -10.0;
      if (textureInfo[0] > 0.0){
        hasDiffuseMap = 10.0;
      }
    #endif
    #ifdef HAS_EMISSIVE
      vEmissiveIntensity = emissiveIntensity;
      vEmissiveColor = emissiveColor;
      hasEmissiveMap = -10.0;
      if (textureInfo[1] > 0.0){
        hasEmissiveMap = 10.0;
      }
    #endif
    #ifdef HAS_AO
      vAOIntensity = aoIntensity;
      hasAOMap = -10.0;
      if (textureInfo[3] > 0.0){
        hasAOMap = 10.0;
      }
    #endif
    #ifdef HAS_ALPHA
      hasAlphaMap = -10.0;
      if (textureInfo[2] > 0.0){
        hasAlphaMap = 10.0;
      }
    #endif
  #endif
  #ifdef HAS_SKYBOX_FOG
    vWorldPosition = worldPositionComputed;
  #endif
  vec3 transformedPosition = position;
  #ifdef HAS_DISPLACEMENT
    if (displacementInfo.x > -60.0 && displacementInfo.y > -60.0){
      vec3 objNormal = normalize(normal);
      float totalDisplacementScale = displacementInfo.x * totalDisplacementInfo.x;
      float totalDisplacementBias = displacementInfo.y * totalDisplacementInfo.y;
      transformedPosition += objNormal * (texture2D(displacementMap, uv).r * totalDisplacementScale + totalDisplacementBias);
    }
  #endif
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
}
