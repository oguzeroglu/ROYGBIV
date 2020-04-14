precision lowp float;
precision lowp int;

#define LOG2 1.442695
#define ALPHA_TEST 0.5

varying float vDiscardFlag;
varying vec3 vColor;
uniform float alpha;

#define INSERTION

#ifdef HAS_TEXTURE
  varying vec2 vFaceVertexUV;
  varying vec3 vTextureFlags;
  uniform sampler2D texture;
#endif
#ifdef HAS_EMISSIVE
  varying vec3 vEmissiveColor;
  varying float vEmissiveIntensity;
  varying vec4 vEmissiveUV;
#endif
#ifdef HAS_DIFFUSE
  varying vec4 vDiffuseUV;
#endif
#ifdef HAS_ALPHA
  varying vec4 vAlphaUV;
#endif
#ifdef HAS_SKYBOX_FOG
  varying vec3 vWorldPosition;
  uniform samplerCube cubeTexture;
  uniform vec3 cameraPosition;
#endif
#ifdef HAS_FOG
  uniform vec4 fogInfo;
#endif

#ifdef HAS_TEXTURE
  vec2 uvAffineTransformation(vec2 original, float startU, float startV, float endU, float endV) {
    float coordX = (original.x * (endU - startU) + startU);
    float coordY = (original.y * (startV - endV) + endV);

    if (coordX > endU){
      coordX = endU - mod((coordX - endU), (endU - startU));
    }

    if (coordX < startU){
      coordX = startU + mod((startU - coordX), (endU - startU));
    }

    if (coordY > startV){
      coordY = startV - mod((coordY - startV), (startV - endV));
    }

    if (coordY < endV){
      coordY = endV + mod((endV - coordY), (startV - endV));
    }

    return vec2(coordX, coordY);
  }

  vec4 fixTextureBleeding(vec4 uvCoordinates){
    float offset = 0.5 / float(TEXTURE_SIZE);
    return vec4(uvCoordinates[0] + offset, uvCoordinates[1] - offset, uvCoordinates[2] - offset, uvCoordinates[3] + offset);
  }
#endif

void main(){
  if (vDiscardFlag >= 5.0){
    discard;
  }

  vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
  #ifdef HAS_TEXTURE
    float hasDiffuse  = vTextureFlags[0];
    float hasEmissive = vTextureFlags[1];
    float hasAlpha    = vTextureFlags[2];
    #ifdef HAS_DIFFUSE
      if (hasDiffuse > 0.0){
        vec4 diffuseUVsFixed = fixTextureBleeding(vDiffuseUV);
        diffuseColor = texture2D(texture, uvAffineTransformation(vFaceVertexUV, diffuseUVsFixed.x, diffuseUVsFixed.y, diffuseUVsFixed.z, diffuseUVsFixed.w));
      }
    #endif
    gl_FragColor = vec4(vColor, alpha) * diffuseColor;
    #ifdef HAS_ALPHA
      if (hasAlpha > 0.0){
        vec4 alphaUVsFixed = fixTextureBleeding(vAlphaUV);
        float val = texture2D(texture, uvAffineTransformation(vFaceVertexUV, alphaUVsFixed.x, alphaUVsFixed.y, alphaUVsFixed.z, alphaUVsFixed.w)).g;
        gl_FragColor.a *= val;
        if (val <= ALPHA_TEST){
          discard;
        }
      }
    #endif
    #ifdef HAS_EMISSIVE
      if (hasEmissive > 0.0){
        vec4 emissiveUVsFixed = fixTextureBleeding(vEmissiveUV);
        vec4 eColor = texture2D(texture, uvAffineTransformation(vFaceVertexUV, emissiveUVsFixed.x, emissiveUVsFixed.y, emissiveUVsFixed.z, emissiveUVsFixed.w));
        vec3 totalEmissiveRadiance = vec3(vEmissiveIntensity, vEmissiveIntensity, vEmissiveIntensity) * vEmissiveColor;
        totalEmissiveRadiance *= eColor.rgb;
        gl_FragColor.rgb += totalEmissiveRadiance;
      }
    #endif
  #else
    gl_FragColor = vec4(vColor, alpha) * diffuseColor;
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
