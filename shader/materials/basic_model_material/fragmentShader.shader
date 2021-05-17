#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

#define PI 3.1415926

#define ALPHA 1
#define ALPHA_TEST 0.5

precision lowp float;
precision lowp int;

varying vec3 vColor;

vec3 lightDiffuse = vec3(0.0, 0.0, 0.0);
vec3 lightSpecular = vec3(0.0, 0.0, 0.0);
varying vec3 vLightDiffuse;

#define INSERTION

#ifdef HAS_SELECTIVE_BLOOM
  uniform float selectiveBloomFlag;
#endif

#ifdef ENABLE_SPECULARITY
  varying vec3 vLightSpecular;
#else
  vec3 vLightSpecular = vec3(0.0, 0.0, 0.0);
#endif

#ifdef HAS_ENVIRONMENT_MAP
  varying float vMetalness;
#endif

#if defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY)
  varying float vMaterialIndex;
#endif

vec3 SPECULAR_COLOR = vec3(float(1), float(1), float(1));

#if defined(HAS_ENVIRONMENT_MAP) || (defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY))
  varying float vRoughness;
#endif

#ifdef HAS_ENVIRONMENT_MAP
  varying float vEnvMapDisabled;
  varying float vEnvMapModeRefraction;
#endif

#ifdef CHILDREN_HIDEABLE
  varying float vHiddenFlag;
#endif

#ifdef HAS_TEXTURE
  varying vec2 vUV;
  varying vec4 vDiffuseUV;
#endif

#if defined(HAS_PHONG_LIGHTING) || defined(HAS_ENVIRONMENT_MAP)
  varying vec3 vWorldPosition;
  uniform vec3 cameraPosition;
#endif

#ifdef HAS_ENVIRONMENT_MAP
  #ifdef HAS_NORMAL_MAP
    varying mat4 vSelectedWorldMatrix;
  #else
    varying vec3 vWorldNormal;
  #endif
  #ifdef IS_HDR
    uniform sampler2D environmentMap;
  #else
    uniform samplerCube environmentMap;
  #endif
#endif

#ifdef HAS_PHONG_LIGHTING
  varying vec3 vNormal;
  uniform mat4 dynamicLightsMatrix;
  #ifdef HAS_NORMAL_MAP
    varying vec4 vNormalUV;
    uniform vec2 normalScale;
    varying vec3 vViewPosition;
  #endif

  #ifdef HAS_SPECULAR_MAP
    varying vec4 vSpecularUV;
  #endif
#endif

#ifdef HAS_ALPHA_MAP
  varying vec4 vAlphaUV;
#endif

#ifdef HAS_ROUGHNESS_MAP
  varying vec4 vRoughnessUV;
#endif

#ifdef HAS_METALNESS_MAP
  varying vec4 vMetalnessUV;
#endif

#ifdef HAS_CUSTOM_TEXTURE
  varying float vDiffuseTextureIndex;
  #ifdef HAS_NORMAL_MAP
    varying float vNormalTextureIndex;
  #endif
  #ifdef HAS_SPECULAR_MAP
    varying float vSpecularTextureIndex;
  #endif
  #ifdef HAS_ALPHA_MAP
    varying float vAlphaTextureIndex;
  #endif
  #ifdef HAS_ROUGHNESS_MAP
    varying float vRoughnessTextureIndex;
  #endif
  #ifdef HAS_METALNESS_MAP
    varying float vMetalnessTextureIndex;
  #endif
  #ifdef CUSTOM_TEXTURE_0
    uniform sampler2D customDiffuseTexture0;
  #endif
  #ifdef CUSTOM_TEXTURE_1
    uniform sampler2D customDiffuseTexture1;
  #endif
  #ifdef CUSTOM_TEXTURE_2
    uniform sampler2D customDiffuseTexture2;
  #endif
  #ifdef CUSTOM_TEXTURE_3
    uniform sampler2D customDiffuseTexture3;
  #endif
  #ifdef CUSTOM_TEXTURE_4
    uniform sampler2D customDiffuseTexture4;
  #endif
  #ifdef CUSTOM_TEXTURE_5
    uniform sampler2D customDiffuseTexture5;
  #endif
  #ifdef CUSTOM_NORMAL_TEXTURE_0
    uniform sampler2D customNormalTexture0;
  #endif
  #ifdef CUSTOM_NORMAL_TEXTURE_1
    uniform sampler2D customNormalTexture1;
  #endif
  #ifdef CUSTOM_NORMAL_TEXTURE_2
    uniform sampler2D customNormalTexture2;
  #endif
  #ifdef CUSTOM_NORMAL_TEXTURE_3
    uniform sampler2D customNormalTexture3;
  #endif
  #ifdef CUSTOM_NORMAL_TEXTURE_4
    uniform sampler2D customNormalTexture4;
  #endif
  #ifdef CUSTOM_NORMAL_TEXTURE_5
    uniform sampler2D customNormalTexture5;
  #endif
  #ifdef CUSTOM_SPECULAR_TEXTURE_0
    uniform sampler2D customSpecularTexture0;
  #endif
  #ifdef CUSTOM_SPECULAR_TEXTURE_1
    uniform sampler2D customSpecularTexture1;
  #endif
  #ifdef CUSTOM_SPECULAR_TEXTURE_2
    uniform sampler2D customSpecularTexture2;
  #endif
  #ifdef CUSTOM_SPECULAR_TEXTURE_3
    uniform sampler2D customSpecularTexture3;
  #endif
  #ifdef CUSTOM_SPECULAR_TEXTURE_4
    uniform sampler2D customSpecularTexture4;
  #endif
  #ifdef CUSTOM_SPECULAR_TEXTURE_5
    uniform sampler2D customSpecularTexture5;
  #endif
  #ifdef CUSTOM_ALPHA_TEXTURE_0
    uniform sampler2D customAlphaTexture0;
  #endif
  #ifdef CUSTOM_ALPHA_TEXTURE_1
    uniform sampler2D customAlphaTexture1;
  #endif
  #ifdef CUSTOM_ALPHA_TEXTURE_2
    uniform sampler2D customAlphaTexture2;
  #endif
  #ifdef CUSTOM_ALPHA_TEXTURE_3
    uniform sampler2D customAlphaTexture3;
  #endif
  #ifdef CUSTOM_ALPHA_TEXTURE_4
    uniform sampler2D customAlphaTexture4;
  #endif
  #ifdef CUSTOM_ALPHA_TEXTURE_5
    uniform sampler2D customAlphaTexture5;
  #endif
  #ifdef CUSTOM_ROUGHNESS_TEXTURE_0
    uniform sampler2D customRoughnessTexture0;
  #endif
  #ifdef CUSTOM_ROUGHNESS_TEXTURE_1
    uniform sampler2D customRoughnessTexture1;
  #endif
  #ifdef CUSTOM_ROUGHNESS_TEXTURE_2
    uniform sampler2D customRoughnessTexture2;
  #endif
  #ifdef CUSTOM_ROUGHNESS_TEXTURE_3
    uniform sampler2D customRoughnessTexture3;
  #endif
  #ifdef CUSTOM_ROUGHNESS_TEXTURE_4
    uniform sampler2D customRoughnessTexture4;
  #endif
  #ifdef CUSTOM_ROUGHNESS_TEXTURE_5
    uniform sampler2D customRoughnessTexture5;
  #endif
  #ifdef CUSTOM_METALNESS_TEXTURE_0
    uniform sampler2D customMetalnessTexture0;
  #endif
  #ifdef CUSTOM_METALNESS_TEXTURE_1
    uniform sampler2D customMetalnessTexture1;
  #endif
  #ifdef CUSTOM_METALNESS_TEXTURE_2
    uniform sampler2D customMetalnessTexture2;
  #endif
  #ifdef CUSTOM_METALNESS_TEXTURE_3
    uniform sampler2D customMetalnessTexture3;
  #endif
  #ifdef CUSTOM_METALNESS_TEXTURE_4
    uniform sampler2D customMetalnessTexture4;
  #endif
  #ifdef CUSTOM_METALNESS_TEXTURE_5
    uniform sampler2D customMetalnessTexture5;
  #endif
#else
  uniform sampler2D texture;
#endif

float flipNumber(float num, float min, float max){
  return (max + min) - num;
}

vec2 uvAffineTransformation(vec2 original, float startU, float startV, float endU, float endV) {
  float coordX = (original.x * (endU - startU) + startU);
  float coordY = (original.y * (startV - endV) + endV);

  if (coordX > endU){
    coordX = flipNumber(endU - mod((coordX - endU), (endU - startU)), endU, startU);
  }

  if (coordX < startU){
    coordX = flipNumber(startU + mod((startU - coordX), (endU - startU)), endU, startU);
  }

  if (coordY > startV){
    coordY = flipNumber(startV - mod((coordY - startV), (startV - endV)), startV, endV);
  }

  if (coordY < endV){
    coordY = flipNumber(endV + mod((endV - coordY), (startV - endV)), startV, endV);
  }

  return vec2(coordX, coordY);
}

#ifdef HAS_PHONG_LIGHTING
  vec3 pointLight(float pX, float pY, float pZ, float r, float g, float b, float strength, vec3 worldPosition, vec3 normal, float selectedRoughness){
    vec3 pointLightPosition = vec3(pX, pY, pZ);
    vec3 toLight = normalize(pointLightPosition - worldPosition);
    float diffuseFactor = dot(normal, toLight);

    if (diffuseFactor > 0.0){
      vec3 lightColor = vec3(r, g, b);

      #ifdef ENABLE_SPECULARITY
        vec3 toCamera = normalize(cameraPosition - worldPosition);
        vec3 halfVector = normalize(toLight + toCamera);
        float shininess = 4.0 / pow(selectedRoughness, 4.0) - 2.0;
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

#ifdef HAS_PHONG_LIGHTING

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

  void handleDynamicLight(inout vec3 ambient, inout vec3 diffuse, inout int currentIndex, int lightType, int lightIndex, vec3 computedNormal, vec3 worldPositionComputed, float selectedRoughness){

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
        staticPointStrength, worldPositionComputed, computedNormal, selectedRoughness
      );
      currentIndex += 3;
    }else if (lightType == 6){ // point-color
      vec3 staticPointPosition = getStaticPosition(lightIndex);
      float staticPointStrength = getStaticStrength(lightIndex);
      vec3 pointColor = getVec3FromLightMatrix(currentIndex);
      diffuse += pointLight(
        staticPointPosition.x, staticPointPosition.y, staticPointPosition.z,
        pointColor.x, pointColor.y, pointColor.z,
        staticPointStrength, worldPositionComputed, computedNormal, selectedRoughness
      );
      currentIndex += 3;
    }else if (lightType == 7){ // point-strength
      vec3 staticPointColor = getStaticColor(lightIndex);
      vec3 staticPointPosition = getStaticPosition(lightIndex);
      float pointStrength = getFloatFromLightMatrix(currentIndex);
      diffuse += pointLight(
        staticPointPosition.x, staticPointPosition.y, staticPointPosition.z,
        staticPointColor.x, staticPointColor.y, staticPointColor.z,
        pointStrength, worldPositionComputed, computedNormal, selectedRoughness
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
        staticPointStrength, worldPositionComputed, computedNormal, selectedRoughness
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
        pointStrength, worldPositionComputed, computedNormal, selectedRoughness
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
        pointStrength, worldPositionComputed, computedNormal, selectedRoughness
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
        pointStrength, worldPositionComputed, computedNormal, selectedRoughness
      );
    }else if (lightType == 16){ // ambient-color-strength
      vec3 ambientRGB = getVec3FromLightMatrix(currentIndex);
      currentIndex += 3;
      float ambientStrength = getFloatFromLightMatrix(currentIndex);
      currentIndex ++;
      ambient += ambientRGB * ambientStrength;
    }
  }

  vec3 handleDynamicLights(vec3 computedNormal, vec3 worldPositionComputed, float selectedRoughness){

    int currentIndex = 0;

    vec3 ambient = vec3(0.0, 0.0, 0.0);
    vec3 diffuse = vec3(0.0, 0.0, 0.0);

    // I know this looks horrible, but this is actually a pretty smart way to
    // handle dynamic lighting.
    #ifdef DYNAMIC_LIGHT_1_TYPE
      handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_1_TYPE, 1, computedNormal, worldPositionComputed, selectedRoughness);
      #ifdef DYNAMIC_LIGHT_2_TYPE
        handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_2_TYPE, 2, computedNormal, worldPositionComputed, selectedRoughness);
        #ifdef DYNAMIC_LIGHT_3_TYPE
          handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_3_TYPE, 3, computedNormal, worldPositionComputed, selectedRoughness);
          #ifdef DYNAMIC_LIGHT_4_TYPE
            handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_4_TYPE, 4, computedNormal, worldPositionComputed, selectedRoughness);
            #ifdef DYNAMIC_LIGHT_5_TYPE
              handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_5_TYPE, 5, computedNormal, worldPositionComputed, selectedRoughness);
              #ifdef DYNAMIC_LIGHT_6_TYPE
                handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_6_TYPE, 6, computedNormal, worldPositionComputed, selectedRoughness);
                #ifdef DYNAMIC_LIGHT_7_TYPE
                  handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_7_TYPE, 7, computedNormal, worldPositionComputed, selectedRoughness);
                  #ifdef DYNAMIC_LIGHT_8_TYPE
                    handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_8_TYPE, 8, computedNormal, worldPositionComputed, selectedRoughness);
                    #ifdef DYNAMIC_LIGHT_9_TYPE
                      handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_9_TYPE, 9, computedNormal, worldPositionComputed, selectedRoughness);
                      #ifdef DYNAMIC_LIGHT_10_TYPE
                        handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_10_TYPE, 10, computedNormal, worldPositionComputed, selectedRoughness);
                        #ifdef DYNAMIC_LIGHT_11_TYPE
                          handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_11_TYPE, 11, computedNormal, worldPositionComputed, selectedRoughness);
                          #ifdef DYNAMIC_LIGHT_12_TYPE
                            handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_12_TYPE, 12, computedNormal, worldPositionComputed, selectedRoughness);
                            #ifdef DYNAMIC_LIGHT_13_TYPE
                              handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_13_TYPE, 13, computedNormal, worldPositionComputed, selectedRoughness);
                              #ifdef DYNAMIC_LIGHT_14_TYPE
                                handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_14_TYPE, 14, computedNormal, worldPositionComputed, selectedRoughness);
                                #ifdef DYNAMIC_LIGHT_15_TYPE
                                  handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_15_TYPE, 15, computedNormal, worldPositionComputed, selectedRoughness);
                                  #ifdef DYNAMIC_LIGHT_16_TYPE
                                    handleDynamicLight(ambient, diffuse, currentIndex, DYNAMIC_LIGHT_16_TYPE, 16, computedNormal, worldPositionComputed, selectedRoughness);
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

  #if defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY)
    int isSpecularityDisabledForMaterial(){
      int mi = int(vMaterialIndex);
      //LIGHT_DISABLE_SPECULARITY_CODE
      return 0;
    }
  #endif

  #if defined(HAS_TEXTURE) && defined(HAS_NORMAL_MAP)
  vec3 perturbNormal2Arb(vec3 eye_pos, vec3 surf_norm, vec3 mapN) {
    vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
    vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
    vec2 st0 = dFdx( vUV.st );
    vec2 st1 = dFdy( vUV.st );
    float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude
    vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );
    vec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );
    vec3 N = normalize( surf_norm );
    #ifdef DOUBLE_SIDED
      // Workaround for Adreno GPUs gl_FrontFacing bug. See #15850 and #10331
      if ( dot( cross( S, T ), N ) < 0.0 ) mapN.xy *= - 1.0;
    #else
      mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    #endif
    mat3 tsn = mat3( S, T, N );
    return normalize( tsn * mapN );
  }
  #endif

  vec3 computedNormal;

  void handleLighting(vec3 worldPositionComputed, float selectedRoughness){

    #ifdef HAS_NORMAL_MAP

      if (vNormalUV.x >= 0.0){
        #ifdef HAS_CUSTOM_TEXTURE
          int normalTextureIndexInt = int(vNormalTextureIndex + 0.5);
          vec3 normalTextureColor;

          #ifdef CUSTOM_NORMAL_TEXTURE_0
            if (normalTextureIndexInt == 0){
              normalTextureColor = texture2D(customNormalTexture0, vUV).rgb;
            }
          #endif
          #ifdef CUSTOM_NORMAL_TEXTURE_1
            if (normalTextureIndexInt == 1){
              normalTextureColor = texture2D(customNormalTexture1, vUV).rgb;
            }
          #endif
          #ifdef CUSTOM_NORMAL_TEXTURE_2
            if (normalTextureIndexInt == 2){
              normalTextureColor = texture2D(customNormalTexture2, vUV).rgb;
            }
          #endif
          #ifdef CUSTOM_NORMAL_TEXTURE_3
            if (normalTextureIndexInt == 3){
              normalTextureColor = texture2D(customNormalTexture3, vUV).rgb;
            }
          #endif
          #ifdef CUSTOM_NORMAL_TEXTURE_4
            if (normalTextureIndexInt == 4){
              normalTextureColor = texture2D(customNormalTexture4, vUV).rgb;
            }
          #endif
          #ifdef CUSTOM_NORMAL_TEXTURE_5
            if (normalTextureIndexInt == 5){
              normalTextureColor = texture2D(customNormalTexture5, vUV).rgb;
            }
          #endif
        #else
          vec3 normalTextureColor = texture2D(texture, uvAffineTransformation(vUV, vNormalUV.x, vNormalUV.y, vNormalUV.z, vNormalUV.w)).rgb;
        #endif

        normalTextureColor = normalTextureColor * 2.0 - 1.0;
        normalTextureColor.xy *= normalScale;
        float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
        computedNormal = perturbNormal2Arb(-vViewPosition, normalize(vNormal), normalTextureColor);
      }else{
        computedNormal = normalize(vNormal);
      }
    #else
      vec3 computedNormal = normalize(vNormal);
    #endif

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
        float(STATIC_POINT_LIGHT_1_STRENGTH), worldPositionComputed, computedNormal, selectedRoughness
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_2
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_2_X), float(STATIC_POINT_LIGHT_2_Y), float(STATIC_POINT_LIGHT_2_Z),
        float(STATIC_POINT_LIGHT_2_R), float(STATIC_POINT_LIGHT_2_G), float(STATIC_POINT_LIGHT_2_B),
        float(STATIC_POINT_LIGHT_2_STRENGTH), worldPositionComputed, computedNormal, selectedRoughness
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_3
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_3_X), float(STATIC_POINT_LIGHT_3_Y), float(STATIC_POINT_LIGHT_3_Z),
        float(STATIC_POINT_LIGHT_3_R), float(STATIC_POINT_LIGHT_3_G), float(STATIC_POINT_LIGHT_3_B),
        float(STATIC_POINT_LIGHT_3_STRENGTH), worldPositionComputed, computedNormal, selectedRoughness
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_4
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_4_X), float(STATIC_POINT_LIGHT_4_Y), float(STATIC_POINT_LIGHT_4_Z),
        float(STATIC_POINT_LIGHT_4_R), float(STATIC_POINT_LIGHT_4_G), float(STATIC_POINT_LIGHT_4_B),
        float(STATIC_POINT_LIGHT_4_STRENGTH), worldPositionComputed, computedNormal, selectedRoughness
      );
    #endif
    #ifdef HAS_STATIC_POINT_LIGHT_5
      diffuse += pointLight(
        float(STATIC_POINT_LIGHT_5_X), float(STATIC_POINT_LIGHT_5_Y), float(STATIC_POINT_LIGHT_5_Z),
        float(STATIC_POINT_LIGHT_5_R), float(STATIC_POINT_LIGHT_5_G), float(STATIC_POINT_LIGHT_5_B),
        float(STATIC_POINT_LIGHT_5_STRENGTH), worldPositionComputed, computedNormal, selectedRoughness
      );
    #endif

    lightDiffuse = ((ambient + diffuse) + handleDynamicLights(computedNormal, worldPositionComputed, selectedRoughness));
  }
#endif

#ifdef HAS_ENVIRONMENT_MAP
  float mipMapLevel(vec2 textureCoord){
    #ifdef GL_OES_standard_derivatives
      vec2 dx = dFdx(textureCoord);
      vec2 dy = dFdy(textureCoord);
      float deltaMaxSqr = max(dot(dx, dx), dot(dy, dy));
      float mml = 0.5 * log2(deltaMaxSqr);
      return max(0.0, mml);
    #else
      return 3.0;
    #endif
  }
#endif

#ifdef HAS_SPECULAR_MAP
  float getSpecularStrength(){
    #ifdef HAS_CUSTOM_TEXTURE
      int specularTextureIndexInt = int(vSpecularTextureIndex + 0.5);
      #ifdef CUSTOM_SPECULAR_TEXTURE_0
        if (specularTextureIndexInt == 0){
          return texture2D(customSpecularTexture0, vUV).r;
        }
      #endif
      #ifdef CUSTOM_SPECULAR_TEXTURE_1
        if (specularTextureIndexInt == 1){
          return texture2D(customSpecularTexture1, vUV).r;
        }
      #endif
      #ifdef CUSTOM_SPECULAR_TEXTURE_2
        if (specularTextureIndexInt == 2){
          return texture2D(customSpecularTexture2, vUV).r;
        }
      #endif
      #ifdef CUSTOM_SPECULAR_TEXTURE_3
        if (specularTextureIndexInt == 3){
          return texture2D(customSpecularTexture3, vUV).r;
        }
      #endif
      #ifdef CUSTOM_SPECULAR_TEXTURE_4
        if (specularTextureIndexInt == 4){
          return texture2D(customSpecularTexture4, vUV).r;
        }
      #endif
      #ifdef CUSTOM_SPECULAR_TEXTURE_5
        if (specularTextureIndexInt == 5){
          return texture2D(customSpecularTexture5, vUV).r;
        }
      #endif
    #else
      return texture2D(texture, uvAffineTransformation(vUV, vSpecularUV.x, vSpecularUV.y, vSpecularUV.z, vSpecularUV.w)).r;
    #endif

    return 0.0;
  }
#endif

#ifdef HAS_ALPHA_MAP
  float getAlphaCoef(){
    if (vAlphaUV.x < 0.0) {
      return 1.0;
    }

    #ifdef HAS_CUSTOM_TEXTURE
      int alphaTextureIndexInt = int(vAlphaTextureIndex + 0.5);
      #ifdef CUSTOM_ALPHA_TEXTURE_0
        if (alphaTextureIndexInt == 0){
          return texture2D(customAlphaTexture0, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ALPHA_TEXTURE_1
        if (alphaTextureIndexInt == 1){
          return texture2D(customAlphaTexture1, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ALPHA_TEXTURE_2
        if (alphaTextureIndexInt == 2){
          return texture2D(customAlphaTexture2, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ALPHA_TEXTURE_3
        if (alphaTextureIndexInt == 3){
          return texture2D(customAlphaTexture3, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ALPHA_TEXTURE_4
        if (alphaTextureIndexInt == 4){
          return texture2D(customAlphaTexture4, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ALPHA_TEXTURE_5
        if (alphaTextureIndexInt == 5){
          return texture2D(customAlphaTexture5, vUV).g;
        }
      #endif
    #else
      return texture2D(texture, uvAffineTransformation(vUV, vAlphaUV.x, vAlphaUV.y, vAlphaUV.z, vAlphaUV.w)).g;
    #endif

    return 1.0;
  }
#endif

#ifdef HAS_ROUGHNESS_MAP
  float getRoughnessCoef(){
    if (vRoughnessUV.x < 0.0) {
      return 1.0;
    }

    #ifdef HAS_CUSTOM_TEXTURE
      int roughnessTextureIndexInt = int(vRoughnessTextureIndex + 0.5);
      #ifdef CUSTOM_ROUGHNESS_TEXTURE_0
        if (roughnessTextureIndexInt == 0){
          return texture2D(customRoughnessTexture0, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ROUGHNESS_TEXTURE_1
        if (roughnessTextureIndexInt == 1){
          return texture2D(customRoughnessTexture1, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ROUGHNESS_TEXTURE_2
        if (roughnessTextureIndexInt == 2){
          return texture2D(customRoughnessTexture2, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ROUGHNESS_TEXTURE_3
        if (roughnessTextureIndexInt == 3){
          return texture2D(customRoughnessTexture3, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ROUGHNESS_TEXTURE_4
        if (roughnessTextureIndexInt == 4){
          return texture2D(customRoughnessTexture4, vUV).g;
        }
      #endif
      #ifdef CUSTOM_ROUGHNESS_TEXTURE_5
        if (roughnessTextureIndexInt == 5){
          return texture2D(customRoughnessTexture5, vUV).g;
        }
      #endif
    #else
      return texture2D(texture, uvAffineTransformation(vUV, vRoughnessUV.x, vRoughnessUV.y, vRoughnessUV.z, vRoughnessUV.w)).g;
    #endif

    return 1.0;
  }
#endif

#ifdef HAS_METALNESS_MAP
  float getMetalnessCoef(){
    if (vMetalnessUV.x < 0.0) {
      return 1.0;
    }

    #ifdef HAS_CUSTOM_TEXTURE
      int metalnessTextureIndexInt = int(vMetalnessTextureIndex + 0.5);
      #ifdef CUSTOM_METALNESS_TEXTURE_0
        if (metalnessTextureIndexInt == 0){
          return texture2D(customMetalnessTexture0, vUV).b;
        }
      #endif
      #ifdef CUSTOM_METALNESS_TEXTURE_1
        if (metalnessTextureIndexInt == 1){
          return texture2D(customMetalnessTexture1, vUV).b;
        }
      #endif
      #ifdef CUSTOM_METALNESS_TEXTURE_2
        if (metalnessTextureIndexInt == 2){
          return texture2D(customMetalnessTexture2, vUV).b;
        }
      #endif
      #ifdef CUSTOM_METALNESS_TEXTURE_3
        if (metalnessTextureIndexInt == 3){
          return texture2D(customMetalnessTexture3, vUV).b;
        }
      #endif
      #ifdef CUSTOM_METALNESS_TEXTURE_4
        if (metalnessTextureIndexInt == 4){
          return texture2D(customMetalnessTexture4, vUV).b;
        }
      #endif
      #ifdef CUSTOM_METALNESS_TEXTURE_5
        if (metalnessTextureIndexInt == 5){
          return texture2D(customMetalnessTexture5, vUV).b;
        }
      #endif
    #else
      return texture2D(texture, uvAffineTransformation(vUV, vMetalnessUV.x, vMetalnessUV.y, vMetalnessUV.z, vMetalnessUV.w)).b;
    #endif

    return 1.0;
  }
#endif

#ifdef IS_HDR
  #define cubeUV_textureSize (1024.0)
  #define cubeUV_maxLods1  (log2(cubeUV_textureSize*0.25) - 1.0)
  #define cubeUV_rangeClamp (exp2((6.0 - 1.0) * 2.0))
  #define cubeUV_maxLods2 (log2(cubeUV_textureSize*0.25) - 2.0)
  #define cubeUV_rcpTextureSize (1.0 / cubeUV_textureSize)
  #define cubeUV_maxLods3 (log2(cubeUV_textureSize*0.25) - 3.0)

  vec4 RGBMToLinear( in vec4 value, in float maxRange ) {
  	return vec4( value.xyz * value.w * maxRange, 1.0 );
  }

  vec4 envMapTexelToLinear( vec4 value ) { return RGBMToLinear( value, 16.0 ); }

  int getFaceFromDirection(vec3 direction) {
  	vec3 absDirection = abs(direction);
  	int face = -1;
  	if( absDirection.x > absDirection.z ) {
  		if(absDirection.x > absDirection.y )
  			face = direction.x > 0.0 ? 0 : 3;
  		else
  			face = direction.y > 0.0 ? 1 : 4;
  	}
  	else {
  		if(absDirection.z > absDirection.y )
  			face = direction.z > 0.0 ? 2 : 5;
  		else
  			face = direction.y > 0.0 ? 1 : 4;
  	}
  	return face;
  }

  vec2 MipLevelInfo( vec3 vec, float roughnessLevel, float roughness ) {
  	float scale = exp2(cubeUV_maxLods1 - roughnessLevel);
  	float dxRoughness = dFdx(roughness);
  	float dyRoughness = dFdy(roughness);
  	vec3 dx = dFdx( vec * scale * dxRoughness );
  	vec3 dy = dFdy( vec * scale * dyRoughness );
  	float d = max( dot( dx, dx ), dot( dy, dy ) );
  	// Clamp the value to the max mip level counts. hard coded to 6 mips
  	d = clamp(d, 1.0, cubeUV_rangeClamp);
  	float mipLevel = 0.5 * log2(d);
  	return vec2(floor(mipLevel), fract(mipLevel));
  }

  vec2 getCubeUV(vec3 direction, float roughnessLevel, float mipLevel) {
  	mipLevel = roughnessLevel > cubeUV_maxLods2 - 3.0 ? 0.0 : mipLevel;
  	float a = 16.0 * cubeUV_rcpTextureSize;

  	vec2 exp2_packed = exp2( vec2( roughnessLevel, mipLevel ) );
  	vec2 rcp_exp2_packed = vec2( 1.0 ) / exp2_packed;
  	// float powScale = exp2(roughnessLevel + mipLevel);
  	float powScale = exp2_packed.x * exp2_packed.y;
  	// float scale =  1.0 / exp2(roughnessLevel + 2.0 + mipLevel);
  	float scale = rcp_exp2_packed.x * rcp_exp2_packed.y * 0.25;
  	// float mipOffset = 0.75*(1.0 - 1.0/exp2(mipLevel))/exp2(roughnessLevel);
  	float mipOffset = 0.75*(1.0 - rcp_exp2_packed.y) * rcp_exp2_packed.x;

  	bool bRes = mipLevel == 0.0;
  	scale =  bRes && (scale < a) ? a : scale;

  	vec3 r;
  	vec2 offset;
  	int face = getFaceFromDirection(direction);

  	float rcpPowScale = 1.0 / powScale;

  	if( face == 0) {
  		r = vec3(direction.x, -direction.z, direction.y);
  		offset = vec2(0.0+mipOffset,0.75 * rcpPowScale);
  		offset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;
  	}
  	else if( face == 1) {
  		r = vec3(direction.y, direction.x, direction.z);
  		offset = vec2(scale+mipOffset, 0.75 * rcpPowScale);
  		offset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;
  	}
  	else if( face == 2) {
  		r = vec3(direction.z, direction.x, direction.y);
  		offset = vec2(2.0*scale+mipOffset, 0.75 * rcpPowScale);
  		offset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;
  	}
  	else if( face == 3) {
  		r = vec3(direction.x, direction.z, direction.y);
  		offset = vec2(0.0+mipOffset,0.5 * rcpPowScale);
  		offset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;
  	}
  	else if( face == 4) {
  		r = vec3(direction.y, direction.x, -direction.z);
  		offset = vec2(scale+mipOffset, 0.5 * rcpPowScale);
  		offset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;
  	}
  	else {
  		r = vec3(direction.z, -direction.x, direction.y);
  		offset = vec2(2.0*scale+mipOffset, 0.5 * rcpPowScale);
  		offset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;
  	}
  	r = normalize(r);
  	float texelOffset = 0.5 * cubeUV_rcpTextureSize;
  	vec2 s = ( r.yz / abs( r.x ) + vec2( 1.0 ) ) * 0.5;
  	vec2 base = offset + vec2( texelOffset );
  	return base + s * ( scale - 2.0 * texelOffset );
  }

  vec4 textureCubeUV(vec3 reflectedDirection, float roughness ) {
  	float roughnessVal = roughness* cubeUV_maxLods3;
  	float r1 = floor(roughnessVal);
  	float r2 = r1 + 1.0;
  	float t = fract(roughnessVal);
  	vec2 mipInfo = MipLevelInfo(reflectedDirection, r1, roughness);
  	float s = mipInfo.y;
  	float level0 = mipInfo.x;
  	float level1 = level0 + 1.0;
  	level1 = level1 > 5.0 ? 5.0 : level1;

  	// round to nearest mipmap if we are not interpolating.
  	level0 += min( floor( s + 0.5 ), 5.0 );

  	// Tri linear interpolation.
  	vec2 uv_10 = getCubeUV(reflectedDirection, r1, level0);
  	vec4 color10 = envMapTexelToLinear(texture2D(environmentMap, uv_10));

  	vec2 uv_20 = getCubeUV(reflectedDirection, r2, level0);
  	vec4 color20 = envMapTexelToLinear(texture2D(environmentMap, uv_20));

  	vec4 result = mix(color10, color20, t);

  	return vec4(result.rgb, 1.0);
  }

#endif

#ifdef TONE_MAPPING_ENABLED
  vec3 OptimizedCineonToneMapping( vec3 color ) {
    color *= float(TONE_MAPPING_EXPOSURE);
    color = max( vec3( 0.0 ), color - 0.004 );
    return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
  }
#endif

void main(){

  #ifdef HAS_SELECTIVE_BLOOM
    if (selectiveBloomFlag <= -100.0){
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }else if (selectiveBloomFlag >= 100.0){
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      return;
    }
  #endif

  #ifdef CHILDREN_HIDEABLE
    if (vHiddenFlag > 0.0){
      discard;
      return;
    }
  #endif

  float alphaCoef = 1.0;
  #ifdef HAS_ALPHA_MAP
    alphaCoef = getAlphaCoef();
    if (alphaCoef <= ALPHA_TEST){
      discard;
      return;
    }
  #endif

  float roughnessCoef = 1.0;
  #ifdef HAS_ROUGHNESS_MAP
    roughnessCoef = getRoughnessCoef();
  #endif

  #ifdef HAS_ENVIRONMENT_MAP
    float selectedMetalness = vMetalness;
    #ifdef HAS_METALNESS_MAP
      selectedMetalness = vMetalness * getMetalnessCoef();
    #endif
  #endif

  float selectedRoughness = 1.0;
  #if defined(HAS_ENVIRONMENT_MAP) || (defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY))
    selectedRoughness = vRoughness * roughnessCoef;
  #endif

  vec3 color = vColor;
  #ifdef HAS_PHONG_LIGHTING
    lightDiffuse = vec3(0.0, 0.0, 0.0);
    handleLighting(vWorldPosition, selectedRoughness);
  #endif

  vec3 diffuseTotal = vLightDiffuse + lightDiffuse;
  vec3 specularTotal = vLightSpecular + lightSpecular;

  #ifdef HAS_ENVIRONMENT_MAP
    #ifdef HAS_NORMAL_MAP
      #ifdef HAS_PHONG_LIGHTING
        vec3 selectedWorldNormal = mat3(vSelectedWorldMatrix) * computedNormal;
      #else
        vec3 selectedWorldNormal = mat3(vSelectedWorldMatrix) * vNormal;
      #endif
    #else
      vec3 selectedWorldNormal = vWorldNormal;
    #endif
  #endif

  #ifdef HAS_ENVIRONMENT_MAP
    if (vEnvMapDisabled < 0.0){
      vec3 worldNormal = normalize(selectedWorldNormal);
      vec3 eyeToSurfaceDir = normalize(vWorldPosition - cameraPosition);
      vec3 envVec;


      if (vEnvMapModeRefraction < 0.0){
        envVec = reflect(eyeToSurfaceDir, worldNormal);
      }else{
        envVec = refract(eyeToSurfaceDir, worldNormal, 1.0);
        envVec = vec3(envVec.z, envVec.y, envVec.x);
      }

      float exponent = pow(2.0, (1.0 - selectedRoughness) * 18.0 + 2.0);
      float maxMIPLevel = log2(float(ENVIRONMENT_MAP_SIZE));
      float minMIPLevel = mipMapLevel(vec2(envVec.z, envVec.x) * float(ENVIRONMENT_MAP_SIZE));
      float MIPLevel = max(minMIPLevel, log2(float(ENVIRONMENT_MAP_SIZE) * sqrt(3.0)) - 0.5 * log2(exponent + 1.0));
      vec3 N2 = vec3(selectedWorldNormal.z, selectedWorldNormal.y, selectedWorldNormal.x);
      vec3 f0 = mix(vec3(0.04, 0.04, 0.04), color, selectedMetalness);
      vec3 fresnelCoef = vec3(float(FRESNEL_COEF_R), float(FRESNEL_COEF_G), float(FRESNEL_COEF_B));
      vec3 fresnel = f0 + (vec3(1.0, 1.0, 1.0) + f0) * pow(1.0 - dot(worldNormal, -eyeToSurfaceDir), 5.0) * fresnelCoef;

      #ifdef IS_HDR
        vec3 envDiffuseColor = textureCubeUV(N2, 1.0).rgb;
        vec3 envSpecularColor = textureCubeUV(vec3(envVec.z, envVec.y, envVec.x), selectedRoughness).rgb * fresnel;
      #else
        #ifdef GL_EXT_shader_texture_lod
          vec3 envDiffuseColor = textureCubeLodEXT(environmentMap, N2, maxMIPLevel).rgb;
          vec3 envSpecularColor = textureCubeLodEXT(environmentMap, vec3(envVec.z, envVec.y, envVec.x), MIPLevel).rgb * fresnel;
        #else
          float fallbackMIPLevel = maxMIPLevel;
          if (selectedRoughness < 0.4){
            fallbackMIPLevel = 0.0;
          }
          vec3 envDiffuseColor = vec3(float(ENV_DIFFUSE_FALLBACK_R), float(ENV_DIFFUSE_FALLBACK_G), float(ENV_DIFFUSE_FALLBACK_B));
          vec3 envSpecularColor = textureCube(environmentMap, vec3(envVec.z, envVec.y, envVec.x), fallbackMIPLevel).rgb * fresnel;
        #endif
      #endif

      specularTotal += envSpecularColor;
      diffuseTotal += envDiffuseColor * (1.0 / PI);
    }
  #endif

  vec3 textureColor = vec3(1.0, 1.0, 1.0);

  #ifdef HAS_TEXTURE
    if (vDiffuseUV.x >= 0.0) {
      #ifdef HAS_CUSTOM_TEXTURE
        int diffuseTextureIndexInt = int(vDiffuseTextureIndex + 0.5);
        #ifdef CUSTOM_TEXTURE_0
          if (diffuseTextureIndexInt == 0){
            textureColor = texture2D(customDiffuseTexture0, vUV).rgb;
          }
        #endif
        #ifdef CUSTOM_TEXTURE_1
          if (diffuseTextureIndexInt == 1){
            textureColor = texture2D(customDiffuseTexture1, vUV).rgb;
          }
        #endif
        #ifdef CUSTOM_TEXTURE_2
          if (diffuseTextureIndexInt == 2){
            textureColor = texture2D(customDiffuseTexture2, vUV).rgb;
          }
        #endif
        #ifdef CUSTOM_TEXTURE_3
          if (diffuseTextureIndexInt == 3){
            textureColor = texture2D(customDiffuseTexture3, vUV).rgb;
          }
        #endif
        #ifdef CUSTOM_TEXTURE_4
          if (diffuseTextureIndexInt == 4){
            textureColor = texture2D(customDiffuseTexture4, vUV).rgb;
          }
        #endif
        #ifdef CUSTOM_TEXTURE_5
          if (diffuseTextureIndexInt == 5){
            textureColor = texture2D(customDiffuseTexture5, vUV).rgb;
          }
        #endif
      #else
        textureColor = texture2D(texture, uvAffineTransformation(vUV, vDiffuseUV.x, vDiffuseUV.y, vDiffuseUV.z, vDiffuseUV.w)).rgb;
      #endif
    }
  #endif

  #if defined(HAS_PHONG_LIGHTING) && defined(ENABLE_SPECULARITY)
    if (isSpecularityDisabledForMaterial() == 1){
      specularTotal = vec3(0.0, 0.0, 0.0);
    }else{
      #ifdef HAS_SPECULAR_MAP
        specularTotal *= getSpecularStrength();
      #endif
    }
  #endif

  gl_FragColor.rgb = (diffuseTotal * color * textureColor) + (SPECULAR_COLOR * specularTotal);
  gl_FragColor.a = float(ALPHA) * alphaCoef;

  #if defined(IS_HDR) && defined(TONE_MAPPING_ENABLED)
    gl_FragColor.rgb = OptimizedCineonToneMapping(gl_FragColor.rgb);
  #endif
}
