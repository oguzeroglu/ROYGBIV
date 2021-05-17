precision lowp float;
precision lowp int;

#define INSERTION

uniform sampler2D sceneTexture;
uniform float threshold;
varying vec2 vUV;

#ifdef IS_SELECTIVE
  uniform sampler2D selectiveTexture;
#endif

void main(){
  vec4 sceneColor = texture2D(sceneTexture, vUV);
  vec3 grayScale = vec3(0.21, 0.72, 0.07);
  float brightness = dot(sceneColor.rgb, grayScale);
  if (brightness > threshold){
    gl_FragColor = sceneColor;
  }else{
    gl_FragColor = vec4(0.0);
  }

  #ifdef IS_SELECTIVE
    vec4 selectiveColor = texture2D(selectiveTexture, vUV);
    if (selectiveColor.r < 0.2){
      gl_FragColor = vec4(0.0);
    }
  #endif
}
