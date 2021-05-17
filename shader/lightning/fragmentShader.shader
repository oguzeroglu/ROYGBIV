precision lowp float;
precision lowp int;

#define LOG2 1.442695
#define INSERTION

uniform vec3 color;

#ifdef HAS_SELECTIVE_BLOOM
  uniform float selectiveBloomFlag;
#endif

#ifdef HAS_SHADOW_MAP
  varying vec2 vShadowMapUV;
  uniform sampler2D shadowMap;
#endif

#ifdef HAS_SKYBOX_FOG
  uniform samplerCube cubeTexture;
  uniform vec3 cameraPosition;
  varying vec3 vWorldPosition;
#endif
#ifdef HAS_FOG
  uniform vec4 fogInfo;
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

  gl_FragColor = vec4(color, 1.0);

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
