#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

#define PI 3.1415926

#define ALPHA 1

precision lowp float;
precision lowp int;

varying vec3 vColor;
varying float vMetalness;
varying float vMaterialIndex;
varying float vRoughness;
varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform vec3 cameraPosition;
uniform mat4 dynamicLightsMatrix;

#define INSERTION

#ifdef HAS_ENVIRONMENT_MAP
  varying vec3 vWorldNormal;
  uniform samplerCube environmentMap;
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
  varying vec3 vTangent;
  varying vec3 vBitangent;
  varying vec4 vNormalUV;
  uniform vec2 normalScale;
#endif

#ifdef HAS_CUSTOM_TEXTURE
  varying float vDiffuseTextureIndex;
  #ifdef HAS_NORMAL_MAP
    varying float vNormalTextureIndex;
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

vec3 pointLight(float pX, float pY, float pZ, float r, float g, float b, vec3 worldPosition, vec3 normal, vec3 V, vec3 F0, vec3 albedo){
  vec3 lightPosition = vec3(pX, pY, pZ);
  vec3 sub = lightPosition - worldPosition;
  vec3 L = normalize(sub);
  vec3 H = normalize(V + L);
  float distance = length(sub);
  float attenuation = 100000.0 / (distance * distance);
  vec3 radiance = vec3(r, g, b) * attenuation;

  float NDF = DistributionGGX(normal, H, vRoughness);
  float G = GeometrySmith(normal, V, L, vRoughness);
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

  vec3 nominator = NDF * G * F;
  float denominator = 4.0 * max(dot(normal, V), 0.0) * max(dot(normal, L), 0.0) + 0.001;
  vec3 specular = nominator / denominator;

  vec3 kS = F;
  vec3 kD = vec3(1.0, 1.0, 1.0) - kS;
  kD *= 1.0 - vMetalness;
  float NdotL = max(dot(normal, L), 0.0);

  return (kD * albedo / PI + specular) * radiance * NdotL;
}

vec3 handleLighting(vec3 worldPositionComputed, vec3 V, vec3 F0, vec3 albedo){

  #ifdef HAS_NORMAL_MAP
    vec3 computedNormal;

    if (vNormalUV.x >= 0.0){
      #ifdef HAS_CUSTOM_TEXTURE
        int normalTextureIndexInt = int(vNormalTextureIndex);
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
      #else
        vec3 normalTextureColor = texture2D(texture, uvAffineTransformation(vUV, vNormalUV.x, vNormalUV.y, vNormalUV.z, vNormalUV.w)).rgb;
      #endif

      normalTextureColor = normalTextureColor * 2.0 - 1.0;
      normalTextureColor.xy *= normalScale;
      mat3 TBN = mat3(normalize(vTangent), normalize(vBitangent), normalize(vNormal));
      computedNormal = normalize(TBN * normalTextureColor);
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
      worldPositionComputed, computedNormal, V, F0, albedo
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_2
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_2_X), float(STATIC_POINT_LIGHT_2_Y), float(STATIC_POINT_LIGHT_2_Z),
      float(STATIC_POINT_LIGHT_2_R), float(STATIC_POINT_LIGHT_2_G), float(STATIC_POINT_LIGHT_2_B),
      worldPositionComputed, computedNormal, V, F0, albedo
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_3
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_3_X), float(STATIC_POINT_LIGHT_3_Y), float(STATIC_POINT_LIGHT_3_Z),
      float(STATIC_POINT_LIGHT_3_R), float(STATIC_POINT_LIGHT_3_G), float(STATIC_POINT_LIGHT_3_B),
      worldPositionComputed, computedNormal, V, F0, albedo
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_4
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_4_X), float(STATIC_POINT_LIGHT_4_Y), float(STATIC_POINT_LIGHT_4_Z),
      float(STATIC_POINT_LIGHT_4_R), float(STATIC_POINT_LIGHT_4_G), float(STATIC_POINT_LIGHT_4_B),
      worldPositionComputed, computedNormal, V, F0, albedo
    );
  #endif
  #ifdef HAS_STATIC_POINT_LIGHT_5
    Lo += pointLight(
      float(STATIC_POINT_LIGHT_5_X), float(STATIC_POINT_LIGHT_5_Y), float(STATIC_POINT_LIGHT_5_Z),
      float(STATIC_POINT_LIGHT_5_R), float(STATIC_POINT_LIGHT_5_G), float(STATIC_POINT_LIGHT_5_B),
      worldPositionComputed, computedNormal, V, F0, albedo
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

void main(){
  #ifdef CHILDREN_HIDEABLE
    if (vHiddenFlag > 0.0){
      discard;
      return;
    }
  #endif

  vec3 textureColor = vec3(1.0, 1.0, 1.0);

  #ifdef HAS_TEXTURE
    if (vDiffuseUV.x >= 0.0) {
      #ifdef HAS_CUSTOM_TEXTURE
        int diffuseTextureIndexInt = int(vDiffuseTextureIndex);
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
      #else
        textureColor = texture2D(texture, uvAffineTransformation(vUV, vDiffuseUV.x, vDiffuseUV.y, vDiffuseUV.z, vDiffuseUV.w)).rgb;
      #endif
    }
  #endif

  vec3 albedo = textureColor * vColor;

  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 F0 = vec3(0.04, 0.04, 0.04);
  F0 = mix(F0, albedo, vMetalness);
  vec3 Lo = handleLighting(vWorldPosition, V, F0, albedo);

  #ifdef HAS_ENVIRONMENT_MAP
    vec3 ambient;
    if (vEnvMapDisabled < 0.0){
      vec3 worldNormal = normalize(vWorldNormal);
      vec3 eyeToSurfaceDir = normalize(vWorldPosition - cameraPosition);
      vec3 envVec;

      if (vEnvMapModeRefraction < 0.0){
        envVec = reflect(eyeToSurfaceDir, worldNormal);
      }else{
        envVec = refract(eyeToSurfaceDir, worldNormal, 1.0);
        envVec = vec3(envVec.z, envVec.y, envVec.x);
      }

      float exponent = pow(2.0, (1.0 - vRoughness) * 18.0 + 2.0);
      float maxMIPLevel = log2(float(ENVIRONMENT_MAP_SIZE));
      float minMIPLevel = mipMapLevel(vec2(envVec.z, envVec.x) * float(ENVIRONMENT_MAP_SIZE));
      float MIPLevel = max(minMIPLevel, log2(float(ENVIRONMENT_MAP_SIZE) * sqrt(3.0)) - 0.5 * log2(exponent + 1.0));
      vec3 N2 = vec3(vWorldNormal.z, vWorldNormal.y, vWorldNormal.x);
      vec3 fresnel = F0 + (vec3(1.0, 1.0, 1.0) + F0) * pow(1.0 - dot(worldNormal, -eyeToSurfaceDir), 5.0);

      #ifdef GL_EXT_shader_texture_lod
        vec3 envDiffuseColor = textureCubeLodEXT(environmentMap, N2, maxMIPLevel).rgb;
        vec3 envSpecularColor = textureCubeLodEXT(environmentMap, vec3(envVec.z, envVec.y, envVec.x), MIPLevel).rgb * fresnel;
      #else
        vec3 envDiffuseColor = textureCube(environmentMap, N2, maxMIPLevel).rgb;
        vec3 envSpecularColor = textureCube(environmentMap, vec3(envVec.z, envVec.y, envVec.x)).rgb;
      #endif

      vec3 kD = 1.0 - fresnel;
      kD *= 1.0 - vMetalness;
      ambient = (kD * (envDiffuseColor * (1.0 / PI)) + envSpecularColor);
    }else{
      ambient = vec3(0.03, 0.03, 0.03) * albedo;
    }
  #else
    vec3 ambient = vec3(0.03, 0.03, 0.03) * albedo;
  #endif

  vec3 color = ambient + Lo;

  color = color / (color + vec3(1.0, 1.0, 1.0));
  float coef = 1.0/2.2;
  color = pow(color, vec3(coef, coef, coef));

  gl_FragColor = vec4(color, float(ALPHA));
}
