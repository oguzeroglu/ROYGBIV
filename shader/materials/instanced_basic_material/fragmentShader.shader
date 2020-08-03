precision lowp float;
precision lowp int;

#define ALPHA_TEST 0.5
#define LOG2 1.442695

varying float vAlpha;
varying vec3 vColor;

#define INSERTION

#ifdef IS_AUTO_INSTANCED
  float totalAlpha = 1.0;
#else
  uniform float totalAlpha;
#endif

#ifdef IS_AUTO_INSTANCED
  varying float vDiscardFlag;
  #ifdef AUTO_INSTANCE_HAS_COLORIZABLE_MEMBER
    varying vec4 vAutoInstancedForcedColorInfo;
  #endif
#endif

#ifdef HAS_TEXTURE
  uniform sampler2D texture;
  varying vec2 vUV;
  varying vec2 vTextureMirrorInfo;
  #ifdef HAS_DIFFUSE
    varying float hasDiffuseMap;
    varying vec4 vDiffuseUV;
  #endif
  #ifdef HAS_EMISSIVE
    varying float hasEmissiveMap;
    varying vec4 vEmissiveUV;
  #endif
  #ifdef HAS_ALPHA
    varying float hasAlphaMap;
    varying vec4 vAlphaUV;
  #endif
  #ifdef HAS_AO
    varying float hasAOMap;
    varying vec4 vAOUV;
  #endif
#endif
#ifdef HAS_AO
  #ifdef IS_AUTO_INSTANCED
    float totalAOIntensity = 1.0;
  #else
    uniform float totalAOIntensity;
  #endif
  varying float vAOIntensity;
#endif
#ifdef HAS_EMISSIVE
  #ifdef IS_AUTO_INSTANCED
    float totalEmissiveIntensity = 1.0;
    vec3 totalEmissiveColor = vec3(1.0, 1.0, 1.0);
  #else
    uniform float totalEmissiveIntensity;
    uniform vec3 totalEmissiveColor;
  #endif
  varying float vEmissiveIntensity;
  varying vec3 vEmissiveColor;
#endif
#ifdef HAS_SKYBOX_FOG
  uniform vec3 cameraPosition;
  uniform samplerCube cubeTexture;
  varying vec3 vWorldPosition;
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
      if (vTextureMirrorInfo.x < 0.0){
        coordX = flipNumber(endU - mod((coordX - endU), (endU - startU)), endU, startU);
      }else{
        coordX = endU - mod((coordX - endU), (endU - startU));
      }
    }

    if (coordX < startU){
      if (vTextureMirrorInfo.x < 0.0){
        coordX = flipNumber(startU + mod((startU - coordX), (endU - startU)), endU, startU);
      }else{
        coordX = startU + mod((startU - coordX), (endU - startU));
      }
    }

    if (coordY > startV){
      if (vTextureMirrorInfo.y < 0.0){
        coordY = flipNumber(startV - mod((coordY - startV), (startV - endV)), startV, endV);
      }else{
        coordY = startV - mod((coordY - startV), (startV - endV));
      }
    }

    if (coordY < endV){
      if (vTextureMirrorInfo.y < 0.0){
        coordY = flipNumber(endV + mod((endV - coordY), (startV - endV)), startV, endV);
      }else{
        coordY = endV + mod((endV - coordY), (startV - endV));
      }
    }

    return vec2(coordX, coordY);
  }

  vec4 fixTextureBleeding(vec4 uvCoordinates){
    float offset = 0.5 / float(TEXTURE_SIZE);
    return vec4(uvCoordinates[0] + offset, uvCoordinates[1] - offset, uvCoordinates[2] - offset, uvCoordinates[3] + offset);
  }
#endif

void main(){

  #ifdef IS_AUTO_INSTANCED
    if (vDiscardFlag > 0.0){
      discard;
      return;
    }
    #ifdef AUTO_INSTANCE_HAS_COLORIZABLE_MEMBER
      if (vAutoInstancedForcedColorInfo.x >= -10.0){
        gl_FragColor = vec4(vAutoInstancedForcedColorInfo.y, vAutoInstancedForcedColorInfo.z, vAutoInstancedForcedColorInfo.w, vAutoInstancedForcedColorInfo.x);
        return;
      }
    #endif
  #endif

  #ifdef HAS_FORCED_COLOR
    if (forcedColor.x >= -10.0){
      gl_FragColor = vec4(forcedColor.y, forcedColor.z, forcedColor.w, forcedColor.x);
      return;
    }
  #endif

  vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);

  #ifdef HAS_DIFFUSE
    if (hasDiffuseMap > 0.0){
      vec4 diffuseUVFixed = fixTextureBleeding(vDiffuseUV);
      diffuseColor = texture2D(texture, uvAffineTransformation(vUV, diffuseUVFixed.x, diffuseUVFixed.y, diffuseUVFixed.z, diffuseUVFixed.w));
    }
  #endif

  gl_FragColor = vec4(vColor, vAlpha) * diffuseColor;

  #ifdef HAS_ALPHA
    if (hasAlphaMap > 0.0){
      vec4 alphaUVFixed = fixTextureBleeding(vAlphaUV);
      float val = texture2D(texture, uvAffineTransformation(vUV, alphaUVFixed.x, alphaUVFixed.y, alphaUVFixed.z, alphaUVFixed.w)).g;
      gl_FragColor.a *= val;
      if (val <= ALPHA_TEST){
        discard;
      }
    }
  #endif

  #ifdef HAS_AO
    if (hasAOMap > 0.0){
      float aoIntensityCoef = vAOIntensity * totalAOIntensity;
      vec4 alphaUVFixed = fixTextureBleeding(vAOUV);
      float ao = (texture2D(texture, uvAffineTransformation(vUV, alphaUVFixed.x, alphaUVFixed.y, alphaUVFixed.z, alphaUVFixed.w)).r - 1.0) * aoIntensityCoef + 1.0;
      gl_FragColor.rgb *= ao;
    }
  #endif

  #ifdef HAS_EMISSIVE
     if (hasEmissiveMap > 0.0){
      vec4 emissiveUVFixed = fixTextureBleeding(vEmissiveUV);
      vec4 eColor = texture2D(texture, uvAffineTransformation(vUV, emissiveUVFixed.x, emissiveUVFixed.y, emissiveUVFixed.z, emissiveUVFixed.w));
      float ei = vEmissiveIntensity * totalEmissiveIntensity;
      vec3 totalEmissiveRadiance = vec3(ei, ei, ei) * vEmissiveColor * totalEmissiveColor;
      totalEmissiveRadiance *= eColor.rgb;
      gl_FragColor.rgb += totalEmissiveRadiance;
    }
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

  gl_FragColor.a *= totalAlpha;
}
