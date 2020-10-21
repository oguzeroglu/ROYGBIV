precision lowp float;
precision lowp int;

#define LOG2 1.442695
#define ALPHA_TEST 0.5

uniform float alpha;

varying vec3 vColor;

#define INSERTION

#ifdef HAS_SHADOW_MAP
  varying vec2 vShadowMapUV;
  uniform sampler2D shadowMap;
#endif

#ifdef HAS_TEXTURE
  uniform sampler2D texture;
  varying vec2 vUV;
#endif
#ifdef HAS_EMISSIVE
  uniform float emissiveIntensity;
  uniform vec3 emissiveColor;
#endif
#ifdef HAS_AO
  uniform float aoIntensity;
#endif
#ifdef HAS_SKYBOX_FOG
  uniform samplerCube cubeTexture;
  varying vec3 vWorldPosition;
  uniform vec3 cameraPosition;
#endif
#ifdef HAS_FOG
  uniform vec4 fogInfo;
#endif
#ifdef HAS_FORCED_COLOR
  uniform vec4 forcedColor;
#endif

#ifdef HAS_TEXTURE

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
#endif

#ifdef HAS_SHADOW_MAP
  vec2 uvAffineTransformationShadow(vec2 original, float startU, float startV, float endU, float endV) {
    float coordX = (original.x * (endU - startU) + startU);
    float coordY = (original.y * (startV - endV) + endV);

    return vec2(coordX, coordY);
  }
#endif

void main(){

  #ifdef HAS_FORCED_COLOR
    if (forcedColor.x >= -10.0){
      gl_FragColor = vec4(forcedColor.y, forcedColor.z, forcedColor.w, forcedColor.x);
      return;
    }
  #endif

  #ifdef HAS_TEXTURE
    vec2 transformedUV = vUV;
    #ifdef HAS_DIFFUSE
      vec4 diffuseUVFixed = vec4(float(DIFFUSE_START_U), float(DIFFUSE_START_V), float(DIFFUSE_END_U), float(DIFFUSE_END_V));
      vec4 diffuseColor = texture2D(texture, uvAffineTransformation(transformedUV, diffuseUVFixed.x, diffuseUVFixed.y, diffuseUVFixed.z, diffuseUVFixed.w));
      gl_FragColor = vec4(vColor, alpha) * diffuseColor;
    #else
      gl_FragColor = vec4(vColor, alpha);
    #endif
    #ifdef HAS_ALPHA
      vec4 alphaUVFixed = vec4(float(ALPHA_START_U), float(ALPHA_START_V), float(ALPHA_END_U), float(ALPHA_END_V));
      float val = texture2D(texture, uvAffineTransformation(transformedUV, alphaUVFixed.x, alphaUVFixed.y, alphaUVFixed.z, alphaUVFixed.w)).g;
      gl_FragColor.a *= val;
      if (val <= ALPHA_TEST){
        discard;
      }
    #endif
    #ifdef HAS_AO
      vec4 aoUVFixed = vec4(float(AO_START_U), float(AO_START_V), float(AO_END_U), float(AO_END_V));
      float ao = (texture2D(texture, uvAffineTransformation(transformedUV, aoUVFixed.x, aoUVFixed.y, aoUVFixed.z, aoUVFixed.w)).r - 1.0) * aoIntensity + 1.0;
      gl_FragColor.rgb *= ao;
    #endif
    #ifdef HAS_EMISSIVE
      vec4 emissiveUVFixed = vec4(float(EMISSIVE_START_U), float(EMISSIVE_START_V), float(EMISSIVE_END_U), float(EMISSIVE_END_V));
      vec4 eColor = texture2D(texture, uvAffineTransformation(transformedUV, emissiveUVFixed.x, emissiveUVFixed.y, emissiveUVFixed.z, emissiveUVFixed.w));
      vec3 totalEmissiveRadiance = vec3(emissiveIntensity, emissiveIntensity, emissiveIntensity) * emissiveColor;
      totalEmissiveRadiance *= eColor.rgb;
      gl_FragColor.rgb += totalEmissiveRadiance;
    #endif
  #else
    gl_FragColor = vec4(vColor, alpha);
  #endif

  #ifdef HAS_SHADOW_MAP
    vec4 shadowUVFixed = vec4(float(SHADOW_MAP_START_U), float(SHADOW_MAP_START_V), float(SHADOW_MAP_END_U), float(SHADOW_MAP_END_V));
    float shadowCoef = (texture2D(shadowMap, uvAffineTransformationShadow(vShadowMapUV, shadowUVFixed.x, shadowUVFixed.y, shadowUVFixed.z, shadowUVFixed.w)).r - 1.0) * float(SHADOW_INTENSITY) + 1.0;
    gl_FragColor.rgb *= shadowCoef;
  #endif

  #ifdef HAS_FOG
    #ifdef HAS_SKYBOX_FOG
      vec3 coord = normalize(vWorldPosition - cameraPosition);
      vec4 cubeTextureColor = textureCube(cubeTexture, coord) * vec4(fogInfo[1], fogInfo[2], fogInfo[3], 1.0);
      float fogDensity = -fogInfo[0];
      float z = gl_FragCoord.z / gl_FragCoord.w;
      float fogFactor = exp2(-fogDensity * fogDensity * z * z * LOG2);
      gl_FragColor = vec4(mix(cubeTextureColor.rgb, gl_FragColor.rgb, fogFactor), gl_FragColor.a);
    #else
      float fogDensity = fogInfo[0];
      float fogR = fogInfo[1];
      float fogG = fogInfo[2];
      float fogB = fogInfo[3];
      float z = gl_FragCoord.z / gl_FragCoord.w;
      float fogFactor = exp2(-fogDensity * fogDensity * z * z * LOG2);
      fogFactor = clamp(fogFactor, 0.0, 1.0);
      gl_FragColor = vec4(mix(vec3(fogR, fogG, fogB), gl_FragColor.rgb, fogFactor), gl_FragColor.a);
    #endif
  #endif

}
