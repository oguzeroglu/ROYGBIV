precision lowp float;
precision lowp int;

#define INSERTION

uniform sampler2D sceneTexture;
uniform float bloomStrength;
uniform float exposure;
uniform float gamma;
uniform float bloomFactors[5];
uniform vec3 bloomTintColors[5];

#ifdef BLUR_STEP_1_ACTIVE
  uniform sampler2D blurTexture1;
#endif
#ifdef BLUR_STEP_2_ACTIVE
  uniform sampler2D blurTexture2;
#endif
#ifdef BLUR_STEP_3_ACTIVE
  uniform sampler2D blurTexture3;
#endif
#ifdef BLUR_STEP_4_ACTIVE
  uniform sampler2D blurTexture4;
#endif
#ifdef BLUR_STEP_5_ACTIVE
  uniform sampler2D blurTexture5;
#endif
varying vec2 vUV;

void main(){
  vec4 hdrColor = texture2D(sceneTexture, vUV);
  #ifdef BLUR_STEP_1_ACTIVE
    hdrColor = hdrColor + (bloomStrength * bloomFactors[0] * vec4(bloomTintColors[0].rgb, 1.0) * texture2D(blurTexture1, vUV));
  #endif
  #ifdef BLUR_STEP_2_ACTIVE
    hdrColor = hdrColor + (bloomStrength * bloomFactors[1] * vec4(bloomTintColors[1].rgb, 1.0) * texture2D(blurTexture2, vUV));
  #endif
  #ifdef BLUR_STEP_3_ACTIVE
    hdrColor = hdrColor + (bloomStrength * bloomFactors[2] * vec4(bloomTintColors[2].rgb, 1.0) * texture2D(blurTexture3, vUV));
  #endif
  #ifdef BLUR_STEP_4_ACTIVE
    hdrColor = hdrColor + (bloomStrength * bloomFactors[3] * vec4(bloomTintColors[3].rgb, 1.0) * texture2D(blurTexture4, vUV));
  #endif
  #ifdef BLUR_STEP_5_ACTIVE
    hdrColor = hdrColor + (bloomStrength * bloomFactors[4] * vec4(bloomTintColors[4].rgb, 1.0) * texture2D(blurTexture5, vUV));
  #endif
  vec3 toneMappedColor = vec3(1.0) - exp(-hdrColor.rgb * exposure);
  toneMappedColor = pow(toneMappedColor, vec3(1.0 / gamma));
  gl_FragColor = vec4(toneMappedColor.rgb, hdrColor.a);
}
