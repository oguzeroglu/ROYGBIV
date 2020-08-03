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
  uniform vec2 displacementInfo;
  uniform sampler2D texture;
#endif
#ifdef HAS_TEXTURE
  varying vec2 vUV;
  uniform mat3 textureMatrix;
#endif
#ifdef DISPLACEMENT_SEPARATE_UV
  uniform mat3 displacementTextureMatrix;
#endif
#if defined(HAS_SKYBOX_FOG) || defined(AFFECTED_BY_LIGHT)
  uniform mat4 worldMatrix;
#endif
#ifdef HAS_SKYBOX_FOG
  varying vec3 vWorldPosition;
#endif

#ifdef AFFECTED_BY_LIGHT
  uniform mat4 worldInverseTranspose;
  uniform mat4 dynamicLightsMatrix;
#endif

#ifdef IS_LIGHT_BAKED
  attribute vec3 bakedColor;
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

  vec3 handleLighting(vec3 worldPositionComputed){

    vec3 computedNormal = mat3(worldInverseTranspose) * normal;

    #ifdef IS_LIGHT_BAKED
      vec3 totalColor = handleDynamicLights(computedNormal, worldPositionComputed) + bakedColor;
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

      vec3 totalColor = ((ambient + diffuse) + handleDynamicLights(computedNormal, worldPositionComputed)) * color;

    #endif

    return totalColor;
  }
#endif


#ifdef HAS_DISPLACEMENT

  float flipNumber(float num, float min, float max){
    return (max + min) - num;
  }

  vec2 uvAffineTransformation(vec2 original, float startU, float startV, float endU, float endV) {
    float coordX = (original.x * (endU - startU) + startU);
    float coordY = (original.y * (startV - endV) + endV);

    #ifdef PREVENT_IOS_TEXTURE_BLEEDING
      return vec2(coordX, coordY);
    #endif

    if (coordX > endU){
      #ifdef MIRROR_S
        coordX = endU - mod((coordX - endU), (endU - startU));
      #else
        coordX = flipNumber(endU - mod((coordX - endU), (endU - startU)), endU, startU);
      #endif
    }

    if (coordX < startU){
      #ifdef MIRROR_S
        coordX = startU + mod((startU - coordX), (endU - startU));
      #else
        coordX = flipNumber(startU + mod((startU - coordX), (endU - startU)), endU, startU);
      #endif
    }

    if (coordY > startV){
      #ifdef MIRROR_T
        coordY = startV - mod((coordY - startV), (startV - endV));
      #else
        coordY = flipNumber(startV - mod((coordY - startV), (startV - endV)), startV, endV);
      #endif
    }

    if (coordY < endV){
      #ifdef MIRROR_T
        coordY = endV + mod((endV - coordY), (startV - endV));
      #else
        coordY = flipNumber(endV + mod((endV - coordY), (startV - endV)), startV, endV);
      #endif
    }

    return vec2(coordX, coordY);
  }

  vec4 fixTextureBleeding(vec4 uvCoordinates){
    float offset = 0.5 / float(TEXTURE_SIZE);
    return vec4(uvCoordinates[0] + offset, uvCoordinates[1] - offset, uvCoordinates[2] - offset, uvCoordinates[3] + offset);
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

  #ifdef HAS_TEXTURE
    vUV = (textureMatrix * vec3(uv, 1.0)).xy;
  #endif

  #ifdef HAS_SKYBOX_FOG
    vWorldPosition = worldPositionComputed;
  #endif

  vec3 transformedPosition = position;
  #ifdef HAS_DISPLACEMENT
    vec2 displacementUV = vUV;
    #ifdef DISPLACEMENT_SEPARATE_UV
      displacementUV = (displacementTextureMatrix * vec3(uv, 1.0)).xy;
    #endif
    vec4 heightUVFixed = fixTextureBleeding(vec4(float(HEIGHT_START_U), float(HEIGHT_START_V), float(HEIGHT_END_U), float(HEIGHT_END_V)));
    vec3 objNormal = normalize(normal);
    transformedPosition += objNormal * (texture2D(texture, uvAffineTransformation(displacementUV, heightUVFixed.x, heightUVFixed.y, heightUVFixed.z, heightUVFixed.w)).r * displacementInfo.x + displacementInfo.y);
  #endif

  vec4 mvPosition = modelViewMatrix * vec4(transformedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
