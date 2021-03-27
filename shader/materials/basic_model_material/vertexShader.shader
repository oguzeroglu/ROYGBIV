precision lowp float;
precision lowp int;

attribute vec3 color;
attribute vec3 position;
attribute vec3 normal;
attribute vec4 diffuseUV;
attribute vec2 metalnessRoughness;
attribute float materialIndex;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec3 vColor;

vec3 lightDiffuse = vec3(1.0, 1.0, 1.0);
vec3 lightSpecular = vec3(0.0, 0.0, 0.0);
varying vec3 vLightDiffuse;

#define INSERTION

#ifdef ENABLE_SPECULARITY
  varying vec3 vLightSpecular;
#endif

#ifdef HAS_ENVIRONMENT_MAP
  varying float vMetalness;
#endif

#ifdef HAS_PHONG_LIGHTING
  varying vec3 vViewPosition;
#endif

#if defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY)
  varying float vMaterialIndex;
#endif

#ifdef HAS_ANIMATION
  uniform mat4 animMatrix1;
  uniform mat4 animMatrix2;
  uniform mat4 animWorldInverseTransposeMatrix1;
  uniform mat4 animWorldInverseTransposeMatrix2;
  uniform mat4 animModelViewMatrix1;
  uniform mat4 animModelViewMatrix2;
#endif

#if defined(HAS_ENVIRONMENT_MAP) || (defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY))
  varying float vRoughness;
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

#ifdef AFFECTED_BY_LIGHT
  uniform vec3 cameraPosition;
#endif

#if defined(HAS_PHONG_LIGHTING) || defined(HAS_ENVIRONMENT_MAP)
  varying vec3 vWorldPosition;
#endif

#ifdef HAS_ENVIRONMENT_MAP
  #ifdef HAS_NORMAL_MAP
    varying mat4 vSelectedWorldMatrix;
  #else
    varying vec3 vWorldNormal;
  #endif
#endif

#ifdef HAS_PHONG_LIGHTING
  varying vec3 vNormal;
  #ifdef HAS_NORMAL_MAP
    attribute vec4 normalUV;
    varying vec4 vNormalUV;
  #endif

  #ifdef HAS_SPECULAR_MAP
    attribute vec4 specularUV;
    varying vec4 vSpecularUV;
  #endif
#endif

#ifdef AFFECTED_BY_LIGHT
  uniform mat4 dynamicLightsMatrix;
#endif

#ifdef IS_LIGHT_BAKED
  attribute vec3 bakedColor;
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

#ifdef HAS_CUSTOM_TEXTURE
  attribute float diffuseTextureIndex;
  varying float vDiffuseTextureIndex;
  #ifdef HAS_NORMAL_MAP
    attribute float normalTextureIndex;
    varying float vNormalTextureIndex;
  #endif
  #ifdef HAS_SPECULAR_MAP
    attribute float specularTextureIndex;
    varying float vSpecularTextureIndex;
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

#ifdef AFFECTED_BY_LIGHT

  #ifdef ENABLE_SPECULARITY
    int isSpecularityDisabledForMaterial(){
      int mi = int(materialIndex);
      //LIGHT_DISABLE_SPECULARITY_CODE
      return 0;
    }
  #endif

  vec3 pointLight(float pX, float pY, float pZ, float r, float g, float b, float strength, vec3 worldPosition, vec3 normal){
    vec3 pointLightPosition = vec3(pX, pY, pZ);
    vec3 toLight = normalize(pointLightPosition - worldPosition);
    float diffuseFactor = dot(normal, toLight);

    if (diffuseFactor > 0.0){
      vec3 lightColor = vec3(r, g, b);

      #ifdef ENABLE_SPECULARITY
        vec3 toCamera = normalize(cameraPosition - worldPosition);
        vec3 halfVector = normalize(toLight + toCamera);
        float shininess = 4.0 / pow(metalnessRoughness[1], 4.0) - 2.0;
        float specular = pow(dot(normal, halfVector), shininess);
        lightSpecular.rgb += specular;
      #endif

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
#endif

#ifdef AFFECTED_BY_LIGHT
  float getFloatFromLightMatrix(int index){
    if (index == 0){
      return dynamicLightsMatrix[0][0];
    }else if (index == 1){
      return dynamicLightsMatrix[0][1];
    }else if (index == 2){
      return dynamicLightsMatrix[0][2];
    }else if (index == 3){
      return dynamicLightsMatrix[0][3];
    }else if (index == 4){
      return dynamicLightsMatrix[1][0];
    }else if (index == 5){
      return dynamicLightsMatrix[1][1];
    }else if (index == 6){
      return dynamicLightsMatrix[1][2];
    }else if (index == 7){
      return dynamicLightsMatrix[1][3];
    }else if (index == 8){
      return dynamicLightsMatrix[2][0];
    }else if (index == 9){
      return dynamicLightsMatrix[2][1];
    }else if (index == 10){
      return dynamicLightsMatrix[2][2];
    }else if (index == 11){
      return dynamicLightsMatrix[2][3];
    }else if (index == 12){
      return dynamicLightsMatrix[3][0];
    }else if (index == 13){
      return dynamicLightsMatrix[3][1];
    }else if (index == 14){
      return dynamicLightsMatrix[3][2];
    }else if (index == 15){
      return dynamicLightsMatrix[3][3];
    }
  }

  vec3 getVec3FromLightMatrix(int index){
    if (index == 0){
      return vec3(dynamicLightsMatrix[0][0], dynamicLightsMatrix[0][1], dynamicLightsMatrix[0][2]);
    }else if (index == 1){
      return vec3(dynamicLightsMatrix[0][1], dynamicLightsMatrix[0][2], dynamicLightsMatrix[0][3]);
    }else if (index == 2){
      return vec3(dynamicLightsMatrix[0][2], dynamicLightsMatrix[0][3], dynamicLightsMatrix[1][0]);
    }else if (index == 3){
      return vec3(dynamicLightsMatrix[0][3], dynamicLightsMatrix[1][0], dynamicLightsMatrix[1][1]);
    }else if (index == 4){
      return vec3(dynamicLightsMatrix[1][0], dynamicLightsMatrix[1][1], dynamicLightsMatrix[1][2]);
    }else if (index == 5){
      return vec3(dynamicLightsMatrix[1][1], dynamicLightsMatrix[1][2], dynamicLightsMatrix[1][3]);
    }else if (index == 6){
      return vec3(dynamicLightsMatrix[1][2], dynamicLightsMatrix[1][3], dynamicLightsMatrix[2][0]);
    }else if (index == 7){
      return vec3(dynamicLightsMatrix[1][3], dynamicLightsMatrix[2][0], dynamicLightsMatrix[2][1]);
    }else if (index == 8){
      return vec3(dynamicLightsMatrix[2][0], dynamicLightsMatrix[2][1], dynamicLightsMatrix[2][2]);
    }else if (index == 9){
      return vec3(dynamicLightsMatrix[2][1], dynamicLightsMatrix[2][2], dynamicLightsMatrix[2][3]);
    }else if (index == 10){
      return vec3(dynamicLightsMatrix[2][2], dynamicLightsMatrix[2][3], dynamicLightsMatrix[3][0]);
    }else if (index == 11){
      return vec3(dynamicLightsMatrix[2][3], dynamicLightsMatrix[3][0], dynamicLightsMatrix[3][1]);
    }else if (index == 12){
      return vec3(dynamicLightsMatrix[3][0], dynamicLightsMatrix[3][1], dynamicLightsMatrix[3][2]);
    }else if (index == 13){
      return vec3(dynamicLightsMatrix[3][1], dynamicLightsMatrix[3][2], dynamicLightsMatrix[3][3]);
    }
  }

  vec3 getStaticPosition(int lightIndex){
    if (lightIndex == 1){
      #ifdef DYNAMIC_LIGHT_1_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_1_STATIC_POS_X, DYNAMIC_LIGHT_1_STATIC_POS_Y, DYNAMIC_LIGHT_1_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 2){
      #ifdef DYNAMIC_LIGHT_2_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_2_STATIC_POS_X, DYNAMIC_LIGHT_2_STATIC_POS_Y, DYNAMIC_LIGHT_2_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 3){
      #ifdef DYNAMIC_LIGHT_3_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_3_STATIC_POS_X, DYNAMIC_LIGHT_3_STATIC_POS_Y, DYNAMIC_LIGHT_3_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 4){
      #ifdef DYNAMIC_LIGHT_4_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_4_STATIC_POS_X, DYNAMIC_LIGHT_4_STATIC_POS_Y, DYNAMIC_LIGHT_4_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 5){
      #ifdef DYNAMIC_LIGHT_5_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_5_STATIC_POS_X, DYNAMIC_LIGHT_5_STATIC_POS_Y, DYNAMIC_LIGHT_5_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 6){
      #ifdef DYNAMIC_LIGHT_6_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_6_STATIC_POS_X, DYNAMIC_LIGHT_6_STATIC_POS_Y, DYNAMIC_LIGHT_6_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 7){
      #ifdef DYNAMIC_LIGHT_7_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_7_STATIC_POS_X, DYNAMIC_LIGHT_7_STATIC_POS_Y, DYNAMIC_LIGHT_7_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 8){
      #ifdef DYNAMIC_LIGHT_8_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_8_STATIC_POS_X, DYNAMIC_LIGHT_8_STATIC_POS_Y, DYNAMIC_LIGHT_8_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 9){
      #ifdef DYNAMIC_LIGHT_9_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_9_STATIC_POS_X, DYNAMIC_LIGHT_9_STATIC_POS_Y, DYNAMIC_LIGHT_9_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 10){
      #ifdef DYNAMIC_LIGHT_10_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_10_STATIC_POS_X, DYNAMIC_LIGHT_10_STATIC_POS_Y, DYNAMIC_LIGHT_10_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 11){
      #ifdef DYNAMIC_LIGHT_11_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_11_STATIC_POS_X, DYNAMIC_LIGHT_11_STATIC_POS_Y, DYNAMIC_LIGHT_11_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 12){
      #ifdef DYNAMIC_LIGHT_12_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_12_STATIC_POS_X, DYNAMIC_LIGHT_12_STATIC_POS_Y, DYNAMIC_LIGHT_12_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 13){
      #ifdef DYNAMIC_LIGHT_13_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_13_STATIC_POS_X, DYNAMIC_LIGHT_13_STATIC_POS_Y, DYNAMIC_LIGHT_13_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 14){
      #ifdef DYNAMIC_LIGHT_14_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_14_STATIC_POS_X, DYNAMIC_LIGHT_14_STATIC_POS_Y, DYNAMIC_LIGHT_14_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 15){
      #ifdef DYNAMIC_LIGHT_15_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_15_STATIC_POS_X, DYNAMIC_LIGHT_15_STATIC_POS_Y, DYNAMIC_LIGHT_15_STATIC_POS_Z);
      #endif
    }else if (lightIndex == 16){
      #ifdef DYNAMIC_LIGHT_16_STATIC_POS_X
        return vec3(DYNAMIC_LIGHT_16_STATIC_POS_X, DYNAMIC_LIGHT_16_STATIC_POS_Y, DYNAMIC_LIGHT_16_STATIC_POS_Z);
      #endif
    }

    return vec3(0.0, 0.0, 0.0);
  }

  vec3 getStaticDirection(int lightIndex){
    if (lightIndex == 1){
      #ifdef DYNAMIC_LIGHT_1_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_1_STATIC_DIR_X, DYNAMIC_LIGHT_1_STATIC_DIR_Y, DYNAMIC_LIGHT_1_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 2){
      #ifdef DYNAMIC_LIGHT_2_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_2_STATIC_DIR_X, DYNAMIC_LIGHT_2_STATIC_DIR_Y, DYNAMIC_LIGHT_2_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 3){
      #ifdef DYNAMIC_LIGHT_3_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_3_STATIC_DIR_X, DYNAMIC_LIGHT_3_STATIC_DIR_Y, DYNAMIC_LIGHT_3_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 4){
      #ifdef DYNAMIC_LIGHT_4_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_4_STATIC_DIR_X, DYNAMIC_LIGHT_4_STATIC_DIR_Y, DYNAMIC_LIGHT_4_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 5){
      #ifdef DYNAMIC_LIGHT_5_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_5_STATIC_DIR_X, DYNAMIC_LIGHT_5_STATIC_DIR_Y, DYNAMIC_LIGHT_5_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 6){
      #ifdef DYNAMIC_LIGHT_6_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_6_STATIC_DIR_X, DYNAMIC_LIGHT_6_STATIC_DIR_Y, DYNAMIC_LIGHT_6_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 7){
      #ifdef DYNAMIC_LIGHT_7_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_7_STATIC_DIR_X, DYNAMIC_LIGHT_7_STATIC_DIR_Y, DYNAMIC_LIGHT_7_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 8){
      #ifdef DYNAMIC_LIGHT_8_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_8_STATIC_DIR_X, DYNAMIC_LIGHT_8_STATIC_DIR_Y, DYNAMIC_LIGHT_8_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 9){
      #ifdef DYNAMIC_LIGHT_9_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_9_STATIC_DIR_X, DYNAMIC_LIGHT_9_STATIC_DIR_Y, DYNAMIC_LIGHT_9_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 10){
      #ifdef DYNAMIC_LIGHT_10_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_10_STATIC_DIR_X, DYNAMIC_LIGHT_10_STATIC_DIR_Y, DYNAMIC_LIGHT_10_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 11){
      #ifdef DYNAMIC_LIGHT_11_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_11_STATIC_DIR_X, DYNAMIC_LIGHT_11_STATIC_DIR_Y, DYNAMIC_LIGHT_11_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 12){
      #ifdef DYNAMIC_LIGHT_12_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_12_STATIC_DIR_X, DYNAMIC_LIGHT_12_STATIC_DIR_Y, DYNAMIC_LIGHT_12_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 13){
      #ifdef DYNAMIC_LIGHT_13_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_13_STATIC_DIR_X, DYNAMIC_LIGHT_13_STATIC_DIR_Y, DYNAMIC_LIGHT_13_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 14){
      #ifdef DYNAMIC_LIGHT_14_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_14_STATIC_DIR_X, DYNAMIC_LIGHT_14_STATIC_DIR_Y, DYNAMIC_LIGHT_14_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 15){
      #ifdef DYNAMIC_LIGHT_15_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_15_STATIC_DIR_X, DYNAMIC_LIGHT_15_STATIC_DIR_Y, DYNAMIC_LIGHT_15_STATIC_DIR_Z);
      #endif
    }else if (lightIndex == 16){
      #ifdef DYNAMIC_LIGHT_16_STATIC_DIR_X
        return vec3(DYNAMIC_LIGHT_16_STATIC_DIR_X, DYNAMIC_LIGHT_16_STATIC_DIR_Y, DYNAMIC_LIGHT_16_STATIC_DIR_Z);
      #endif
    }

    return vec3(0.0, 0.0, 0.0);
  }

  vec3 getStaticColor(int lightIndex){
    if (lightIndex == 1){
      #ifdef DYNAMIC_LIGHT_1_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_1_STATIC_COLOR_R, DYNAMIC_LIGHT_1_STATIC_COLOR_G, DYNAMIC_LIGHT_1_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 2){
      #ifdef DYNAMIC_LIGHT_2_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_2_STATIC_COLOR_R, DYNAMIC_LIGHT_2_STATIC_COLOR_G, DYNAMIC_LIGHT_2_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 3){
      #ifdef DYNAMIC_LIGHT_3_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_3_STATIC_COLOR_R, DYNAMIC_LIGHT_3_STATIC_COLOR_G, DYNAMIC_LIGHT_3_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 4){
      #ifdef DYNAMIC_LIGHT_4_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_4_STATIC_COLOR_R, DYNAMIC_LIGHT_4_STATIC_COLOR_G, DYNAMIC_LIGHT_4_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 5){
      #ifdef DYNAMIC_LIGHT_5_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_5_STATIC_COLOR_R, DYNAMIC_LIGHT_5_STATIC_COLOR_G, DYNAMIC_LIGHT_5_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 6){
      #ifdef DYNAMIC_LIGHT_6_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_6_STATIC_COLOR_R, DYNAMIC_LIGHT_6_STATIC_COLOR_G, DYNAMIC_LIGHT_6_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 7){
      #ifdef DYNAMIC_LIGHT_7_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_7_STATIC_COLOR_R, DYNAMIC_LIGHT_7_STATIC_COLOR_G, DYNAMIC_LIGHT_7_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 8){
      #ifdef DYNAMIC_LIGHT_8_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_8_STATIC_COLOR_R, DYNAMIC_LIGHT_8_STATIC_COLOR_G, DYNAMIC_LIGHT_8_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 9){
      #ifdef DYNAMIC_LIGHT_9_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_9_STATIC_COLOR_R, DYNAMIC_LIGHT_9_STATIC_COLOR_G, DYNAMIC_LIGHT_9_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 10){
      #ifdef DYNAMIC_LIGHT_10_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_10_STATIC_COLOR_R, DYNAMIC_LIGHT_10_STATIC_COLOR_G, DYNAMIC_LIGHT_10_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 11){
      #ifdef DYNAMIC_LIGHT_11_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_11_STATIC_COLOR_R, DYNAMIC_LIGHT_11_STATIC_COLOR_G, DYNAMIC_LIGHT_11_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 12){
      #ifdef DYNAMIC_LIGHT_12_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_12_STATIC_COLOR_R, DYNAMIC_LIGHT_12_STATIC_COLOR_G, DYNAMIC_LIGHT_12_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 13){
      #ifdef DYNAMIC_LIGHT_13_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_13_STATIC_COLOR_R, DYNAMIC_LIGHT_13_STATIC_COLOR_G, DYNAMIC_LIGHT_13_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 14){
      #ifdef DYNAMIC_LIGHT_14_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_14_STATIC_COLOR_R, DYNAMIC_LIGHT_14_STATIC_COLOR_G, DYNAMIC_LIGHT_14_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 15){
      #ifdef DYNAMIC_LIGHT_15_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_15_STATIC_COLOR_R, DYNAMIC_LIGHT_15_STATIC_COLOR_G, DYNAMIC_LIGHT_15_STATIC_COLOR_B);
      #endif
    }else if (lightIndex == 16){
      #ifdef DYNAMIC_LIGHT_16_STATIC_COLOR_R
        return vec3(DYNAMIC_LIGHT_16_STATIC_COLOR_R, DYNAMIC_LIGHT_16_STATIC_COLOR_G, DYNAMIC_LIGHT_16_STATIC_COLOR_B);
      #endif
    }

    return vec3(0.0, 0.0, 0.0);
  }

  float getStaticStrength(int lightIndex){
    if (lightIndex == 1){
      #ifdef DYNAMIC_LIGHT_1_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_1_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 2){
      #ifdef DYNAMIC_LIGHT_2_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_2_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 3){
      #ifdef DYNAMIC_LIGHT_3_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_3_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 4){
      #ifdef DYNAMIC_LIGHT_4_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_4_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 5){
      #ifdef DYNAMIC_LIGHT_5_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_5_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 6){
      #ifdef DYNAMIC_LIGHT_6_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_6_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 7){
      #ifdef DYNAMIC_LIGHT_7_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_7_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 8){
      #ifdef DYNAMIC_LIGHT_8_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_8_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 9){
      #ifdef DYNAMIC_LIGHT_9_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_9_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 10){
      #ifdef DYNAMIC_LIGHT_10_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_10_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 11){
      #ifdef DYNAMIC_LIGHT_11_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_11_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 12){
      #ifdef DYNAMIC_LIGHT_12_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_12_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 13){
      #ifdef DYNAMIC_LIGHT_13_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_13_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 14){
      #ifdef DYNAMIC_LIGHT_14_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_14_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 15){
      #ifdef DYNAMIC_LIGHT_15_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_15_STATIC_STRENGTH);
      #endif
    }else if (lightIndex == 16){
      #ifdef DYNAMIC_LIGHT_16_STATIC_STRENGTH
        return float(DYNAMIC_LIGHT_16_STATIC_STRENGTH);
      #endif
    }

    return 0.0;
  }

  void handleDynamicLight(inout vec3 ambient, inout vec3 diffuse, inout int currentIndex, int lightType, int lightIndex, vec3 computedNormal, vec3 worldPositionComputed){

    if (lightType == 0){ // ambient-color
      vec3 ambientRGB = getVec3FromLightMatrix(currentIndex);
      ambient += ambientRGB * (getStaticStrength(lightIndex));
      currentIndex += 3;
    }else if (lightType == 1){ // ambient-strength
      float strength = getFloatFromLightMatrix(currentIndex);
      ambient += getStaticColor(lightIndex) * strength;
      currentIndex ++;
    }else if (lightType == 2){ // diffuse-direction
      vec3 staticDiffuseColor = getStaticColor(lightIndex);
      float staticDiffuseStrength = getStaticStrength(lightIndex);
      vec3 diffuseDir = getVec3FromLightMatrix(currentIndex);
      diffuse += diffuseLight(
        diffuseDir.x, diffuseDir.y, diffuseDir.z,
        staticDiffuseColor.x, staticDiffuseColor.y, staticDiffuseColor.z,
        staticDiffuseStrength, computedNormal
      );
      currentIndex += 3;
    }else if (lightType == 3){ // diffuse-color
      vec3 diffuseColor = getVec3FromLightMatrix(currentIndex);
      float staticDiffuseStrength = getStaticStrength(lightIndex);
      vec3 staticDiffuseDirection = getStaticDirection(lightIndex);
      diffuse += diffuseLight(
        staticDiffuseDirection.x, staticDiffuseDirection.y, staticDiffuseDirection.z,
        diffuseColor.x, diffuseColor.y, diffuseColor.z,
        staticDiffuseStrength, computedNormal
      );
      currentIndex +=3;
    }else if (lightType == 4){ // diffuse-strength
      vec3 staticDiffuseColor = getStaticColor(lightIndex);
      vec3 staticDiffuseDirection = getStaticDirection(lightIndex);
      float diffuseStrength = getFloatFromLightMatrix(currentIndex);
      diffuse += diffuseLight(
        staticDiffuseDirection.x, staticDiffuseDirection.y, staticDiffuseDirection.z,
        staticDiffuseColor.x, staticDiffuseColor.y, staticDiffuseColor.z,
        diffuseStrength, computedNormal
      );
      currentIndex ++;
    }else if (lightType == 5){ // point-position
      vec3 staticPointColor = getStaticColor(lightIndex);
      float staticPointStrength = getStaticStrength(lightIndex);
      vec3 pointPosition = getVec3FromLightMatrix(currentIndex);
      diffuse += pointLight(
        pointPosition.x, pointPosition.y, pointPosition.z,
        staticPointColor.x, staticPointColor.y, staticPointColor.z,
        staticPointStrength, worldPositionComputed, computedNormal
      );
      currentIndex += 3;
    }else if (lightType == 6){ // point-color
      vec3 staticPointPosition = getStaticPosition(lightIndex);
      float staticPointStrength = getStaticStrength(lightIndex);
      vec3 pointColor = getVec3FromLightMatrix(currentIndex);
      diffuse += pointLight(
        staticPointPosition.x, staticPointPosition.y, staticPointPosition.z,
        pointColor.x, pointColor.y, pointColor.z,
        staticPointStrength, worldPositionComputed, computedNormal
      );
      currentIndex += 3;
    }else if (lightType == 7){ // point-strength
      vec3 staticPointColor = getStaticColor(lightIndex);
      vec3 staticPointPosition = getStaticPosition(lightIndex);
      float pointStrength = getFloatFromLightMatrix(currentIndex);
      diffuse += pointLight(
        staticPointPosition.x, staticPointPosition.y, staticPointPosition.z,
        staticPointColor.x, staticPointColor.y, staticPointColor.z,
        pointStrength, worldPositionComputed, computedNormal
      );
      currentIndex ++;
    }else if (lightType == 8){ // diffuse-dir-color
      vec3 diffuseColor = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      vec3 diffuseDir = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float diffuseStrength = getStaticStrength(lightIndex);
      diffuse += diffuseLight(
        diffuseDir.x, diffuseDir.y, diffuseDir.z,
        diffuseColor.x, diffuseColor.y, diffuseColor.z,
        diffuseStrength, computedNormal
      );
    }else if (lightType == 9){ // diffuse-dir-strength
      vec3 diffuseColor = getStaticColor(lightIndex);
      vec3 diffuseDir = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float diffuseStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      diffuse += diffuseLight(
        diffuseDir.x, diffuseDir.y, diffuseDir.z,
        diffuseColor.x, diffuseColor.y, diffuseColor.z,
        diffuseStrength, computedNormal
      );
    }else if (lightType == 10){ // diffuse-color-strength
      vec3 diffuseColor = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      vec3 diffuseDir = getStaticDirection(lightIndex);
      float diffuseStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      diffuse += diffuseLight(
        diffuseDir.x, diffuseDir.y, diffuseDir.z,
        diffuseColor.x, diffuseColor.y, diffuseColor.z,
        diffuseStrength, computedNormal
      );
    }else if (lightType == 11){ // point-position-color
      vec3 pointColor = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      vec3 pointPosition = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float staticPointStrength = getStaticStrength(lightIndex);
      diffuse += pointLight(
        pointPosition.x, pointPosition.y, pointPosition.z,
        pointColor.x, pointColor.y, pointColor.z,
        staticPointStrength, worldPositionComputed, computedNormal
      );
    }else if (lightType == 12){ // point-position-strength
      vec3 staticPointColor = getStaticColor(lightIndex);
      vec3 pointPosition = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float pointStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      diffuse += pointLight(
        pointPosition.x, pointPosition.y, pointPosition.z,
        staticPointColor.x, staticPointColor.y, staticPointColor.z,
        pointStrength, worldPositionComputed, computedNormal
      );
    }else if (lightType == 13){ // point-color-strength
      vec3 pointColor = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float pointStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      vec3 staticPointPosition = getStaticPosition(lightIndex);
      diffuse += pointLight(
        staticPointPosition.x, staticPointPosition.y, staticPointPosition.z,
        pointColor.x, pointColor.y, pointColor.z,
        pointStrength, worldPositionComputed, computedNormal
      );
    }else if (lightType == 14){ // diffuse-dir-color-strength
      vec3 diffuseColor = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      vec3 diffuseDir = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float diffuseStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      diffuse += diffuseLight(
        diffuseDir.x, diffuseDir.y, diffuseDir.z,
        diffuseColor.x, diffuseColor.y, diffuseColor.z,
        diffuseStrength, computedNormal
      );
    }else if (lightType == 15){ // point-position-color-strength
      vec3 pointColor = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      vec3 pointPosition = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float pointStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      diffuse += pointLight(
        pointPosition.x, pointPosition.y, pointPosition.z,
        pointColor.x, pointColor.y, pointColor.z,
        pointStrength, worldPositionComputed, computedNormal
      );
    }else if (lightType == 16){ // ambient-color-strength
      vec3 ambientRGB = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float ambientStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      ambient += ambientRGB * ambientStrength;
    }
  }

  vec3 handleDynamicLights(vec3 computedNormal, vec3 worldPositionComputed){

    int currentIndex = 0;

    vec3 ambient = vec3(0.0, 0.0, 0.0);
    vec3 diffuse = vec3(0.0, 0.0, 0.0);

    // I know this looks horrible, but this is actually a pretty smart way to
    // handle dynamic lighting.
    #ifdef DYNAMIC_LIGHT_1_TYPE
      handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_1_TYPE, 1, computedNormal, worldPositionComputed);
      #ifdef DYNAMIC_LIGHT_2_TYPE
        handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_2_TYPE, 2, computedNormal, worldPositionComputed);
        #ifdef DYNAMIC_LIGHT_3_TYPE
          handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_3_TYPE, 3, computedNormal, worldPositionComputed);
          #ifdef DYNAMIC_LIGHT_4_TYPE
            handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_4_TYPE, 4, computedNormal, worldPositionComputed);
            #ifdef DYNAMIC_LIGHT_5_TYPE
              handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_5_TYPE, 5, computedNormal, worldPositionComputed);
              #ifdef DYNAMIC_LIGHT_6_TYPE
                handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_6_TYPE, 6, computedNormal, worldPositionComputed);
                #ifdef DYNAMIC_LIGHT_7_TYPE
                  handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_7_TYPE, 7, computedNormal, worldPositionComputed);
                  #ifdef DYNAMIC_LIGHT_8_TYPE
                    handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_8_TYPE, 8, computedNormal, worldPositionComputed);
                    #ifdef DYNAMIC_LIGHT_9_TYPE
                      handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_9_TYPE, 9, computedNormal, worldPositionComputed);
                      #ifdef DYNAMIC_LIGHT_10_TYPE
                        handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_10_TYPE, 10, computedNormal, worldPositionComputed);
                        #ifdef DYNAMIC_LIGHT_11_TYPE
                          handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_11_TYPE, 11, computedNormal, worldPositionComputed);
                          #ifdef DYNAMIC_LIGHT_12_TYPE
                            handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_12_TYPE, 12, computedNormal, worldPositionComputed);
                            #ifdef DYNAMIC_LIGHT_13_TYPE
                              handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_13_TYPE, 13, computedNormal, worldPositionComputed);
                              #ifdef DYNAMIC_LIGHT_14_TYPE
                                handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_14_TYPE, 14, computedNormal, worldPositionComputed);
                                #ifdef DYNAMIC_LIGHT_15_TYPE
                                  handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_15_TYPE, 15, computedNormal, worldPositionComputed);
                                  #ifdef DYNAMIC_LIGHT_16_TYPE
                                    handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_16_TYPE, 16, computedNormal, worldPositionComputed);
                                  #endif
                                #endif
                              #endif
                            #endif
                          #endif
                        #endif
                      #endif
                    #endif
                  #endif
                #endif
              #endif
            #endif
          #endif
        #endif
      #endif
    #endif

    return (ambient + diffuse);
  }

  void handleLighting(vec3 worldPositionComputed, mat4 worldInverseTranspose){

    vec3 computedNormal = normalize(mat3(worldInverseTranspose) * normal);

    #ifdef IS_LIGHT_BAKED
      lightDiffuse = handleDynamicLights(computedNormal, worldPositionComputed) + bakedColor;
    #else

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

      lightDiffuse = ((ambient + diffuse) + handleDynamicLights(computedNormal, worldPositionComputed));

    #endif
  }
#endif

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

  #if defined(AFFECTED_BY_LIGHT) || defined(HAS_ENVIRONMENT_MAP)
    vec3 worldPositionComputed = (selectedWorldMatrix * vec4(position, 1.0)).xyz;
  #endif

  #if defined(HAS_PHONG_LIGHTING) || defined(HAS_ENVIRONMENT_MAP)
    vWorldPosition = worldPositionComputed;
  #endif

  #ifdef HAS_ENVIRONMENT_MAP
    #ifdef HAS_NORMAL_MAP
      vSelectedWorldMatrix = selectedWorldMatrix;
    #else
      vWorldNormal = mat3(selectedWorldMatrix) * normal;
    #endif
  #endif

  #ifdef AFFECTED_BY_LIGHT
    lightDiffuse = vec3(0.0, 0.0, 0.0);
  #endif

  #if defined(AFFECTED_BY_LIGHT) && !defined(HAS_PHONG_LIGHTING)
    handleLighting(worldPositionComputed, selectedWorldInverseTranspose);
  #endif

  #ifdef HAS_PHONG_LIGHTING
    vNormal = normalize(mat3(selectedWorldInverseTranspose) * normal);
    #ifdef HAS_NORMAL_MAP
      vNormalUV = normalUV;
    #endif

    #ifdef HAS_SPECULAR_MAP
      vSpecularUV = specularUV;
    #endif
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

  #ifdef HAS_TEXTURE
    vUV = uv;
    vDiffuseUV = diffuseUV;
  #endif

  #ifdef HAS_CUSTOM_TEXTURE
    vDiffuseTextureIndex = diffuseTextureIndex;
    #ifdef HAS_NORMAL_MAP
      vNormalTextureIndex = normalTextureIndex;
    #endif
    #ifdef HAS_SPECULAR_MAP
      vSpecularTextureIndex = specularTextureIndex;
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
  #endif

  vLightDiffuse = lightDiffuse;

  #ifdef ENABLE_SPECULARITY
    vLightSpecular = lightSpecular;
  #endif
  vColor = color;

  #if defined(AFFECTED_BY_LIGHT) && defined(ENABLE_SPECULARITY)
    if (isSpecularityDisabledForMaterial() == 1){
      vLightSpecular = vec3(0.0, 0.0, 0.0);
    }
  #endif

  #ifdef HAS_ENVIRONMENT_MAP
    vMetalness = metalnessRoughness[0];
  #endif

  #if defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY)
    vMaterialIndex = materialIndex;
  #endif

  #if defined(HAS_ENVIRONMENT_MAP) || (defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY))
    vRoughness = metalnessRoughness[1];
  #endif

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
  #if defined(HAS_PHONG_LIGHTING)
    vViewPosition = -mvPosition.xyz;
  #endif

  gl_Position = projectionMatrix * mvPosition;
}
