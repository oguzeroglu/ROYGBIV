precision lowp float;
precision lowp int;

attribute vec3 color;
attribute vec3 position;
attribute vec3 normal;
attribute vec4 diffuseUV;
attribute vec2 metalnessRoughness;
attribute float materialIndex;

varying float vMetalness;
varying float vRoughness;
varying vec3 vColor;
varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec3 cameraPosition;

#define INSERTION

#ifdef HAS_ANIMATION
  uniform mat4 animMatrix1;
  uniform mat4 animMatrix2;
  uniform mat4 animWorldInverseTransposeMatrix1;
  uniform mat4 animWorldInverseTransposeMatrix2;
  uniform mat4 animModelViewMatrix1;
  uniform mat4 animModelViewMatrix2;
#endif

#ifdef HAS_ENVIRONMENT_MAP
  varying float vEnvMapDisabled;
  varying float vEnvMapModeRefraction;
#endif

#ifdef CHILDREN_HIDEABLE
  attribute float hiddenFlag;
  varying float vHiddenFlag;
#endif

#ifdef HAS_TEXTURE
  attribute vec2 uv;
  varying vec2 vUV;
  varying vec4 vDiffuseUV;
#endif

#ifdef HAS_NORMAL_MAP
  attribute vec4 normalUV;
  varying vec4 vNormalUV;
  varying vec3 vViewPosition;
  #ifdef HAS_ENVIRONMENT_MAP
    varying mat4 vSelectedWorldMatrix;
  #endif
#else
  #ifdef HAS_ENVIRONMENT_MAP
    varying vec3 vWorldNormal;
  #endif
#endif

#ifdef HAS_CUSTOM_TEXTURE
  attribute float diffuseTextureIndex;
  varying float vDiffuseTextureIndex;
  #ifdef HAS_NORMAL_MAP
    attribute float normalTextureIndex;
    varying float vNormalTextureIndex;
  #endif
  #ifdef HAS_ALPHA_MAP
    attribute float alphaTextureIndex;
    varying float vAlphaTextureIndex;
  #endif
  #ifdef HAS_ROUGHNESS_MAP
    attribute float roughnessTextureIndex;
    varying float vRoughnessTextureIndex;
  #endif
  #ifdef HAS_METALNESS_MAP
    attribute float metalnessTextureIndex;
    varying float vMetalnessTextureIndex;
  #endif
  #ifdef HAS_EMISSIVE_MAP
    attribute float emissiveTextureIndex;
    varying float vEmissiveTextureIndex;
  #endif
  #ifdef HAS_AO_MAP
    attribute float aoTextureIndex;
    varying float vAOTextureIndex;
  #endif
#endif

#ifdef HAS_ALPHA_MAP
  attribute vec4 alphaUV;
  varying vec4 vAlphaUV;
#endif

#ifdef HAS_ROUGHNESS_MAP
  attribute vec4 roughnessUV;
  varying vec4 vRoughnessUV;
#endif

#ifdef HAS_METALNESS_MAP
  attribute vec4 metalnessUV;
  varying vec4 vMetalnessUV;
#endif

#ifdef HAS_EMISSIVE_MAP
  attribute vec4 emissiveUV;
  varying vec4 vEmissiveUV;
#endif

#ifdef HAS_AO_MAP
  attribute vec4 aoUV;
  varying vec4 vAOUV;
#endif

int isEnvMappingDisabledForMaterial(){
  int mi = int(materialIndex);
  //DISABLE_ENV_MAPPING_CODE
  return 0;
}

int isEnvModeRefractive(){
  int mi = int(materialIndex);
  //ENV_MODE_GETTER_CODE
  return 0;
}

vec4 getTextureTransform() {
  int mi = int(materialIndex);
  //TEXTURE_TRANSFORM_CODE
  return vec4(0.0, 0.0, 1.0, 1.0);
}

void main(){
  #ifdef HAS_ANIMATION
    int mi = int(materialIndex);
    mat4 selectedMVMatrix;
    mat4 selectedWorldMatrix;
    mat4 selectedWorldInverseTranspose;
    #ANIMATION_MATRIX_CODE
  #else
    mat4 selectedWorldMatrix = worldMatrix;
    mat4 selectedWorldInverseTranspose = worldInverseTranspose;
    mat4 selectedMVMatrix = modelViewMatrix;
  #endif

  #ifdef CHILDREN_HIDEABLE
    vHiddenFlag = hiddenFlag;
    if (hiddenFlag > 0.0){
      return;
    }
  #endif

  #ifdef HAS_ALPHA_MAP
    vAlphaUV = alphaUV;
  #endif

  #ifdef HAS_ROUGHNESS_MAP
    vRoughnessUV = roughnessUV;
  #endif

  #ifdef HAS_METALNESS_MAP
    vMetalnessUV = metalnessUV;
  #endif

  #ifdef HAS_EMISSIVE_MAP
    vEmissiveUV = emissiveUV;
  #endif

  #ifdef HAS_AO_MAP
    vAOUV = aoUV;
  #endif

  vec3 worldPositionComputed = (selectedWorldMatrix * vec4(position, 1.0)).xyz;
  vWorldPosition = worldPositionComputed;

  #if !defined(HAS_NORMAL_MAP) && defined(HAS_ENVIRONMENT_MAP)
    vWorldNormal = mat3(selectedWorldMatrix) * normal;
  #endif

  #if defined(HAS_NORMAL_MAP) && defined(HAS_ENVIRONMENT_MAP)
    vSelectedWorldMatrix = selectedWorldMatrix;
  #endif

  vNormal = normalize(mat3(selectedWorldInverseTranspose) * normal);
  #ifdef HAS_NORMAL_MAP
    vNormalUV = normalUV;
  #endif

  #ifdef HAS_TEXTURE
    vUV = uv;
    vDiffuseUV = diffuseUV;
  #endif

  #ifdef HAS_CUSTOM_TEXTURE
    vec4 textureTransformInfo = getTextureTransform(); //offsetX, offsetY, repeatX, repeatY

    vUV = (
      mat3(
        textureTransformInfo.z, 0.0, 0.0,
        0.0, textureTransformInfo.w, 0.0,
        textureTransformInfo.x, textureTransformInfo.y, 1.0
      ) * vec3(uv, 1.0)
    ).xy;

    vDiffuseTextureIndex = diffuseTextureIndex;
    #ifdef HAS_NORMAL_MAP
      vNormalTextureIndex = normalTextureIndex;
    #endif
    #ifdef HAS_ALPHA_MAP
      vAlphaTextureIndex = alphaTextureIndex;
    #endif
    #ifdef HAS_ROUGHNESS_MAP
      vRoughnessTextureIndex = roughnessTextureIndex;
    #endif
    #ifdef HAS_METALNESS_MAP
      vMetalnessTextureIndex = metalnessTextureIndex;
    #endif
    #ifdef HAS_EMISSIVE_MAP
      vEmissiveTextureIndex = emissiveTextureIndex;
    #endif
    #ifdef HAS_AO_MAP
      vAOTextureIndex = aoTextureIndex;
    #endif
  #endif

  vColor = color;
  vMetalness = metalnessRoughness[0];
  vRoughness = metalnessRoughness[1];

  #ifdef HAS_ENVIRONMENT_MAP
    if (isEnvMappingDisabledForMaterial() == 1){
      vEnvMapDisabled = 100.0;
    }else{
      vEnvMapDisabled = -100.0;
    }

    if (isEnvModeRefractive() == 1){
      vEnvMapModeRefraction = 100.0;
    }else{
      vEnvMapModeRefraction = -100.0;
    }
  #endif

  vec4 mvPosition = selectedMVMatrix * vec4(position, 1.0);

  #ifdef HAS_NORMAL_MAP
    vViewPosition = -mvPosition.xyz;
  #endif

  gl_Position = projectionMatrix * mvPosition;
}
