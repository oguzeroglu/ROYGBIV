#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

#define PI 3.1415926
#define ALPHA 1
#define ALPHA_TEST 0.5

precision lowp float;
precision lowp int;

varying vec3 vColor;
varying float vMetalness;
varying float vRoughness;
varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform vec3 cameraPosition;
uniform mat4 dynamicLightsMatrix;

#define INSERTION

#define LIGHT_ATTENUATION_COEF 500000

#ifdef HAS_SELECTIVE_BLOOM
  uniform float selectiveBloomFlag;
#endif

#ifdef HAS_ENVIRONMENT_MAP
  #if !defined(HAS_NORMAL_MAP)
    varying vec3 vWorldNormal;
  #else
    varying mat4 vSelectedWorldMatrix;
  #endif
  #ifdef IS_HDR
    uniform sampler2D environmentMap;
  #else
    uniform samplerCube environmentMap;
  #endif
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

#ifdef HAS_NORMAL_MAP
  varying vec4 vNormalUV;
  uniform vec2 normalScale;
  varying vec3 vViewPosition;
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

#ifdef HAS_EMISSIVE_MAP
  varying vec4 vEmissiveUV;
#endif

#ifdef HAS_AO_MAP
  varying vec4 vAOUV;
#endif

#ifdef HAS_CUSTOM_TEXTURE
  varying float vDiffuseTextureIndex;
  #ifdef HAS_NORMAL_MAP
    varying float vNormalTextureIndex;
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
  #ifdef HAS_EMISSIVE_MAP
    varying float vEmissiveTextureIndex;
  #endif
  #ifdef HAS_AO_MAP
    varying float vAOTextureIndex;
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
  #ifdef CUSTOM_EMISSIVE_TEXTURE_0
    uniform sampler2D customEmissiveTexture0;
  #endif
  #ifdef CUSTOM_EMISSIVE_TEXTURE_1
    uniform sampler2D customEmissiveTexture1;
  #endif
  #ifdef CUSTOM_EMISSIVE_TEXTURE_2
    uniform sampler2D customEmissiveTexture2;
  #endif
  #ifdef CUSTOM_EMISSIVE_TEXTURE_3
    uniform sampler2D customEmissiveTexture3;
  #endif
  #ifdef CUSTOM_EMISSIVE_TEXTURE_4
    uniform sampler2D customEmissiveTexture4;
  #endif
  #ifdef CUSTOM_EMISSIVE_TEXTURE_5
    uniform sampler2D customEmissiveTexture5;
  #endif
  #ifdef CUSTOM_AO_TEXTURE_0
    uniform sampler2D customAOTexture0;
  #endif
  #ifdef CUSTOM_AO_TEXTURE_1
    uniform sampler2D customAOTexture1;
  #endif
  #ifdef CUSTOM_AO_TEXTURE_2
    uniform sampler2D customAOTexture2;
  #endif
  #ifdef CUSTOM_AO_TEXTURE_3
    uniform sampler2D customAOTexture3;
  #endif
  #ifdef CUSTOM_AO_TEXTURE_4
    uniform sampler2D customAOTexture4;
  #endif
  #ifdef CUSTOM_AO_TEXTURE_5
    uniform sampler2D customAOTexture5;
  #endif
#else
  uniform sampler2D texture;
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

float DistributionGGX(vec3 N, vec3 H, float roughness){
  float a = roughness*roughness;
  float a2 = a*a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH*NdotH;

  float nom   = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;

  return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness){
  float r = (roughness + 1.0);
  float k = (r*r) / 8.0;

  float nom   = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness){
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = GeometrySchlickGGX(NdotV, roughness);
  float ggx1 = GeometrySchlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0){
  return F0 + (1.0 - F0) * pow(max(1.0 - cosTheta, 0.0), 5.0);
}

vec3 pointLight(float pX, float pY, float pZ, float r, float g, float b, vec3 worldPosition, vec3 normal, vec3 V, vec3 F0, vec3 albedo, float selectedRoughness, float selectedMetalness){
  vec3 lightPosition = vec3(pX, pY, pZ);
  vec3 sub = lightPosition - worldPosition;
  vec3 L = normalize(sub);
  vec3 H = normalize(V + L);
  float distance = length(sub);
  float attenuation = float(LIGHT_ATTENUATION_COEF) / (distance * distance);
  vec3 radiance = vec3(r, g, b) * attenuation;

  float NDF = DistributionGGX(normal, H, selectedRoughness);
  float G = GeometrySmith(normal, V, L, selectedRoughness);
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

  vec3 nominator = NDF * G * F;
  float denominator = 4.0 * max(dot(normal, V), 0.0) * max(dot(normal, L), 0.0) + 0.001;
  vec3 specular = nominator / denominator;

  vec3 kS = F;
  vec3 kD = vec3(1.0, 1.0, 1.0) - kS;
  kD *= 1.0 - selectedMetalness;
  float NdotL = max(dot(normal, L), 0.0);

  return (kD * albedo / PI + specular) * radiance * NdotL;
}

vec3 computedNormal;

vec3 handleLighting(vec3 worldPositionComputed, vec3 V, vec3 F0, vec3 albedo, float selectedRoughness, float selectedMetalness){

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
      computedNormal = perturbNormal2Arb(-vViewPosition, normalize(vNormal), normalTextureColor);
    }else{
      computedNormal = normalize(vNormal);
    }
  #else
    vec3 computedNormal = normalize(vNormal);
  #endif

  vec3 Lo = vec3(0.0, 0.0, 0.0);

  #ifdef HAS_STATIC_POINT_LIGHT_1
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_1_X), float(STATIC_POINT_LIGHT_1_Y), float(STATIC_POINT_LIGHT_1_Z),
      float(STATIC_POINT_LIGHT_1_R), float(STATIC_POINT_LIGHT_1_G), float(STATIC_POINT_LIGHT_1_B),
      worldPositionComputed, computedNormal, V, F0, albedo, selectedRoughness, selectedMetalness
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_2
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_2_X), float(STATIC_POINT_LIGHT_2_Y), float(STATIC_POINT_LIGHT_2_Z),
      float(STATIC_POINT_LIGHT_2_R), float(STATIC_POINT_LIGHT_2_G), float(STATIC_POINT_LIGHT_2_B),
      worldPositionComputed, computedNormal, V, F0, albedo, selectedRoughness, selectedMetalness
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_3
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_3_X), float(STATIC_POINT_LIGHT_3_Y), float(STATIC_POINT_LIGHT_3_Z),
      float(STATIC_POINT_LIGHT_3_R), float(STATIC_POINT_LIGHT_3_G), float(STATIC_POINT_LIGHT_3_B),
      worldPositionComputed, computedNormal, V, F0, albedo, selectedRoughness, selectedMetalness
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_4
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_4_X), float(STATIC_POINT_LIGHT_4_Y), float(STATIC_POINT_LIGHT_4_Z),
      float(STATIC_POINT_LIGHT_4_R), float(STATIC_POINT_LIGHT_4_G), float(STATIC_POINT_LIGHT_4_B),
      worldPositionComputed, computedNormal, V, F0, albedo, selectedRoughness, selectedMetalness
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_5
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_5_X), float(STATIC_POINT_LIGHT_5_Y), float(STATIC_POINT_LIGHT_5_Z),
      float(STATIC_POINT_LIGHT_5_R), float(STATIC_POINT_LIGHT_5_G), float(STATIC_POINT_LIGHT_5_B),
      worldPositionComputed, computedNormal, V, F0, albedo, selectedRoughness, selectedMetalness
    );
  #endif

  return Lo;
}

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

#ifdef HAS_EMISSIVE_MAP
  vec3 getEmissiveColor(){
    if (vEmissiveUV.x < 0.0) {
      return vec3(0.0, 0.0, 0.0);
    }

    #ifdef HAS_CUSTOM_TEXTURE
      int emissiveTextureIndexInt = int(vEmissiveTextureIndex + 0.5);
      #ifdef CUSTOM_EMISSIVE_TEXTURE_0
        if (emissiveTextureIndexInt == 0){
          return texture2D(customEmissiveTexture0, vUV).rgb;
        }
      #endif
      #ifdef CUSTOM_EMISSIVE_TEXTURE_1
        if (emissiveTextureIndexInt == 1){
          return texture2D(customEmissiveTexture1, vUV).rgb;
        }
      #endif
      #ifdef CUSTOM_EMISSIVE_TEXTURE_2
        if (emissiveTextureIndexInt == 2){
          return texture2D(customEmissiveTexture2, vUV).rgb;
        }
      #endif
      #ifdef CUSTOM_EMISSIVE_TEXTURE_3
        if (emissiveTextureIndexInt == 3){
          return texture2D(customEmissiveTexture3, vUV).rgb;
        }
      #endif
      #ifdef CUSTOM_EMISSIVE_TEXTURE_4
        if (emissiveTextureIndexInt == 4){
          return texture2D(customEmissiveTexture4, vUV).rgb;
        }
      #endif
      #ifdef CUSTOM_EMISSIVE_TEXTURE_5
        if (emissiveTextureIndexInt == 5){
          return texture2D(customEmissiveTexture5, vUV).rgb;
        }
      #endif
    #else
      return texture2D(texture, uvAffineTransformation(vUV, vEmissiveUV.x, vEmissiveUV.y, vEmissiveUV.z, vEmissiveUV.w)).rgb;
    #endif

    return vec3(0.0, 0.0, 0.0);
  }
#endif

#ifdef HAS_AO_MAP
  float getAOCoef(){
    if (vAOUV.x < 0.0) {
      return 1.0;
    }

    #ifdef HAS_CUSTOM_TEXTURE
      int aoTextureIndexInt = int(vAOTextureIndex + 0.5);
      #ifdef CUSTOM_AO_TEXTURE_0
        if (aoTextureIndexInt == 0){
          return (texture2D(customAOTexture0, vUV).r - 1.0) * float(AO_INTENSITY) + 1.0;
        }
      #endif
      #ifdef CUSTOM_AO_TEXTURE_1
        if (aoTextureIndexInt == 1){
          return (texture2D(customAOTexture1, vUV).r - 1.0) * float(AO_INTENSITY) + 1.0;
        }
      #endif
      #ifdef CUSTOM_AO_TEXTURE_2
        if (aoTextureIndexInt == 2){
          return (texture2D(customAOTexture2, vUV).r - 1.0) * float(AO_INTENSITY) + 1.0;
        }
      #endif
      #ifdef CUSTOM_AO_TEXTURE_3
        if (aoTextureIndexInt == 3){
          return (texture2D(customAOTexture3, vUV).r - 1.0) * float(AO_INTENSITY) + 1.0;
        }
      #endif
      #ifdef CUSTOM_AO_TEXTURE_4
        if (aoTextureIndexInt == 4){
          return (texture2D(customAOTexture4, vUV).r - 1.0) * float(AO_INTENSITY) + 1.0;
        }
      #endif
      #ifdef CUSTOM_AO_TEXTURE_5
        if (aoTextureIndexInt == 5){
          return (texture2D(customAOTexture5, vUV).r - 1.0) * float(AO_INTENSITY) + 1.0;
        }
      #endif
    #else
      return (texture2D(texture, uvAffineTransformation(vUV, vAOUV.x, vAOUV.y, vAOUV.z, vAOUV.w)).r - 1.0) * float(AO_INTENSITY) + 1.0;
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

  float selectedRoughness = vRoughness;
  #ifdef HAS_ROUGHNESS_MAP
    selectedRoughness = vRoughness * getRoughnessCoef();
  #endif

  float selectedMetalness = vMetalness;
  #ifdef HAS_METALNESS_MAP
    selectedMetalness = vMetalness * getMetalnessCoef();
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

  vec3 albedo = textureColor * vColor;

  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 F0 = vec3(0.04, 0.04, 0.04);
  F0 = mix(F0, albedo, selectedMetalness);
  vec3 Lo = handleLighting(vWorldPosition, V, F0, albedo, selectedRoughness, selectedMetalness);

  #ifdef HAS_ENVIRONMENT_MAP
    #ifdef HAS_NORMAL_MAP
      vec3 selectedWorldNormal = mat3(vSelectedWorldMatrix) * computedNormal;
    #else
      vec3 selectedWorldNormal = vWorldNormal;
    #endif
  #endif

  #ifdef HAS_ENVIRONMENT_MAP
    vec3 ambient;
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
      vec3 fresnelCoef = vec3(float(FRESNEL_COEF_R), float(FRESNEL_COEF_G), float(FRESNEL_COEF_B));
      vec3 fresnel = F0 + (vec3(1.0, 1.0, 1.0) + F0) * pow(1.0 - dot(worldNormal, -eyeToSurfaceDir), 5.0) * fresnelCoef;

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

      vec3 kD = 1.0 - fresnel;
      kD *= 1.0 - selectedMetalness;
      ambient = kD * albedo * envDiffuseColor + envSpecularColor;
    }else{
      ambient = vec3(0.03, 0.03, 0.03) * albedo;
    }
  #else
    vec3 ambient = vec3(0.03, 0.03, 0.03) * albedo;
  #endif

  vec3 color = ambient + Lo;

  gl_FragColor = vec4(color, float(ALPHA) * alphaCoef);

  #ifdef HAS_AO_MAP
    gl_FragColor.rgb *= getAOCoef();
  #endif

  #ifdef HAS_EMISSIVE_MAP
    gl_FragColor.rgb += getEmissiveColor();
  #endif

  #if defined(IS_HDR) && defined(TONE_MAPPING_ENABLED)
    gl_FragColor.rgb = OptimizedCineonToneMapping(gl_FragColor.rgb);
  #endif
}
