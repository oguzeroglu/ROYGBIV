precision lowp float;
precision lowp int;

attribute float alpha;
attribute vec3 color;
attribute vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vColor;
varying float vAlpha;

#define INSERTION

#ifdef IS_AUTO_INSTANCED
  attribute float orientationIndex;
  uniform vec4 autoInstanceOrientationArray[AUTO_INSTANCE_ORIENTATION_ARRAY_SIZE];
  varying float vDiscardFlag;
  #ifdef AUTO_INSTANCE_HAS_COLORIZABLE_MEMBER
    attribute float forcedColorIndex;
    uniform vec4 autoInstanceForcedColorArray[AUTO_INSTANCE_FORCED_COLOR_ARRAY_SIZE];
    varying vec4 vAutoInstancedForcedColorInfo;
  #endif
#else
  attribute vec3 positionOffset;
  attribute vec4 quaternion;
#endif

#ifdef HAS_EMISSIVE
  attribute float emissiveIntensity;
  attribute vec3 emissiveColor;
  varying float vEmissiveIntensity;
  varying vec3 vEmissiveColor;
#endif
#ifdef HAS_AO
  attribute float aoIntensity;
  varying float vAOIntensity;
#endif
#ifdef HAS_TEXTURE
  attribute vec2 uv;
  attribute vec4 textureInfo;
  attribute vec4 textureMatrixInfo;
  varying vec2 vUV;
  #ifdef HAS_DIFFUSE
    varying float hasDiffuseMap;
  #endif
  #ifdef HAS_EMISSIVE
    varying float hasEmissiveMap;
  #endif
  #ifdef HAS_ALPHA
    varying float hasAlphaMap;
  #endif
  #ifdef HAS_AO
    varying float hasAOMap;
  #endif
#endif
#ifdef HAS_DISPLACEMENT
  attribute vec2 displacementInfo;
  attribute vec3 normal;
  uniform sampler2D displacementMap;
#endif
#ifdef HAS_SKYBOX_FOG
  uniform mat4 worldMatrix;
  varying vec3 vWorldPosition;
#endif

vec3 applyQuaternionToVector(vec3 vector, vec4 quaternion){
  float x = vector.x;
  float y = vector.y;
  float z = vector.z;
  float qx = quaternion.x;
  float qy = quaternion.y;
  float qz = quaternion.z;
  float qw = quaternion.w;
  float ix = (qw * x) + (qy * z) - (qz * y);
  float iy = (qw * y) + (qz * x) - (qx * z);
  float iz = (qw * z) + (qx * y) - (qy * x);
  float iw = (-1.0 * qx * x) - (qy * y) - (qz * z);
  float calculatedX = (ix * qw) + (iw * -1.0 * qx) + (iy * -1.0 * qz) - (iz * -1.0 * qy);
  float calculatedY = (iy * qw) + (iw * -1.0 * qy) + (iz * -1.0 * qx) - (ix * -1.0 * qz);
  float calculatedZ = (iz * qw) + (iw * -1.0 * qz) + (ix * -1.0 * qy) - (iy * -1.0 * qx);
  return vec3(calculatedX, calculatedY, calculatedZ);
}

void main(){

  #ifdef IS_AUTO_INSTANCED
    int oi = int(orientationIndex);
    if (autoInstanceOrientationArray[oi].x < 0.0){
      vDiscardFlag = 50.0;
      return;
    }
    vDiscardFlag = -50.0;
    #ifdef AUTO_INSTANCE_HAS_COLORIZABLE_MEMBER
      int fi = int(forcedColorIndex);
      vAutoInstancedForcedColorInfo = autoInstanceForcedColorArray[fi];
    #endif
  #endif

  vAlpha = alpha;
  vColor = color;
  #ifdef HAS_TEXTURE
    vUV = (
      mat3(
        textureMatrixInfo.z, 0.0, 0.0,
        0.0, textureMatrixInfo.w, 0.0,
        textureMatrixInfo.x, textureMatrixInfo.y, 1.0
      ) * vec3(uv, 1.0)
    ).xy;
    #ifdef HAS_DIFFUSE
      hasDiffuseMap = -10.0;
      if (textureInfo[0] > 0.0){
        hasDiffuseMap = 10.0;
      }
    #endif
    #ifdef HAS_EMISSIVE
      hasEmissiveMap = -10.0;
      if (textureInfo[1] > 0.0){
        hasEmissiveMap = 10.0;
      }
    #endif
    #ifdef HAS_ALPHA
      hasAlphaMap = -10.0;
      if (textureInfo[2] > 0.0){
        hasAlphaMap = 10.0;
      }
    #endif
    #ifdef HAS_AO
      hasAOMap = -10.0;
      if (textureInfo[3] > 0.0){
        hasAOMap = 10.0;
      }
    #endif
  #endif
  #ifdef HAS_EMISSIVE
    vEmissiveIntensity = emissiveIntensity;
    vEmissiveColor = emissiveColor;
  #endif
  #ifdef HAS_AO
    vAOIntensity = aoIntensity;
  #endif

  vec3 transformedPosition = position;
  #ifdef HAS_DISPLACEMENT
    if (displacementInfo.x > -60.0 && displacementInfo.y > -60.0){
      vec3 objNormal = normalize(normal);
      transformedPosition += objNormal * (texture2D(displacementMap, vUV).r * displacementInfo.x + displacementInfo.y);
    }
  #endif
  #ifdef IS_AUTO_INSTANCED
    #ifdef FPS_WEAPON_SCALE
      transformedPosition *= FPS_WEAPON_SCALE;
    #endif
    vec3 positionOffset = autoInstanceOrientationArray[oi].yzw;
    vec4 quaternion = autoInstanceOrientationArray[oi+1];
  #endif
  transformedPosition = applyQuaternionToVector(transformedPosition, quaternion) + positionOffset;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
  #ifdef HAS_SKYBOX_FOG
    #ifdef IS_AUTO_INSTANCED
      vWorldPosition = transformedPosition;
    #else
      vWorldPosition = (worldMatrix * vec4(transformedPosition, 1.0)).xyz;
    #endif
  #endif
}
