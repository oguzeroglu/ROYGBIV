precision lowp float;
precision lowp int;

#define LOG2 1.442695
#define ALPHA_TEST 0.5

uniform float alpha;

varying vec3 vColor;

#define INSERTION

#ifdef HAS_TEXTURE
  uniform sampler2D texture;
  varying vec2 vUV;
#endif
#ifdef HAS_EMISSIVE
  uniform float emissiveIntensity;
  uniform vec3 emissiveColor;
#endif
#ifdef HAS_ALPHA
  uniform sampler2D alphaMap;
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

  float modulate(float x, float y){
    return x - (y * floor(x/y));
  }

  vec2 uvAffineTransformation(vec2 original, float startU, float startV, float endU, float endV) {
    float coordX = (original.x * (endU - startU) + startU);
    float coordY = (original.y * (startV - endV) + endV);

    if (coordX > endU){
      for (float i = 0.0; i<5000.0; i += 0.0001){
        float diff = coordX - endU;
        coordX = startU + diff;
        if (coordX <= endU){
          break;
        }
      }
    }

    if (coordX < startU){
      for (float i = 0.0; i<5000.0; i += 0.0001){
        float diff = startU - coordX;
        coordX = endU - diff;
        if (coordX >= startU){
          break;
        }
      }
    }

    if (coordY > startV){
      for (float i = 0.0; i<5000.0; i += 0.0001){
        float diff = coordY - startV;
        coordY = endV + diff;
        if (coordY <= startV){
          break;
        }
      }
    }

    if (coordY < endV){
      for (float i = 0.0; i<5000.0; i += 0.0001){
        float diff = endV - coordY;
        coordY = startV - diff;
        if (coordY >= endV){
          break;
        }
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

  #ifdef HAS_FORCED_COLOR
    if (forcedColor.x >= -10.0){
      gl_FragColor = vec4(forcedColor.y, forcedColor.z, forcedColor.w, forcedColor.x);
      return;
    }
  #endif

  #ifdef HAS_TEXTURE
    vec2 transformedUV = vUV;
    #ifdef HAS_DIFFUSE
      vec4 diffuseUVFixed = fixTextureBleeding(vec4(float(DIFFUSE_START_U), float(DIFFUSE_START_V), float(DIFFUSE_END_U), float(DIFFUSE_END_V)));
      vec4 diffuseColor = texture2D(texture, uvAffineTransformation(transformedUV, diffuseUVFixed.x, diffuseUVFixed.y, diffuseUVFixed.z, diffuseUVFixed.w));
      gl_FragColor = vec4(vColor, alpha) * diffuseColor;
    #else
      gl_FragColor = vec4(vColor, alpha);
    #endif
    #ifdef HAS_ALPHA
      vec4 alphaUVFixed = fixTextureBleeding(vec4(float(ALPHA_START_U), float(ALPHA_START_V), float(ALPHA_END_U), float(ALPHA_END_V)));
      float val = texture2D(texture, uvAffineTransformation(transformedUV, alphaUVFixed.x, alphaUVFixed.y, alphaUVFixed.z, alphaUVFixed.w)).g;
      gl_FragColor.a *= val;
      if (val <= ALPHA_TEST){
        discard;
      }
    #endif
    #ifdef HAS_AO
      vec4 aoUVFixed = fixTextureBleeding(vec4(float(AO_START_U), float(AO_START_V), float(AO_END_U), float(AO_END_V)));
      float ao = (texture2D(texture, uvAffineTransformation(transformedUV, aoUVFixed.x, aoUVFixed.y, aoUVFixed.z, aoUVFixed.w)).r - 1.0) * aoIntensity + 1.0;
      gl_FragColor.rgb *= ao;
    #endif
    #ifdef HAS_EMISSIVE
      vec4 emissiveUVFixed = fixTextureBleeding(vec4(float(EMISSIVE_START_U), float(EMISSIVE_START_V), float(EMISSIVE_END_U), float(EMISSIVE_END_V)));
      vec4 eColor = texture2D(texture, uvAffineTransformation(transformedUV, emissiveUVFixed.x, emissiveUVFixed.y, emissiveUVFixed.z, emissiveUVFixed.w));
      vec3 totalEmissiveRadiance = vec3(emissiveIntensity, emissiveIntensity, emissiveIntensity) * emissiveColor;
      totalEmissiveRadiance *= eColor.rgb;
      gl_FragColor.rgb += totalEmissiveRadiance;
    #endif
  #else
    gl_FragColor = vec4(vColor, alpha);
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
