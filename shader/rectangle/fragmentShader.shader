precision lowp float;
precision lowp int;

uniform vec3 color;
uniform float alpha;

#define INSERTION

#ifdef HAS_SELECTIVE_BLOOM
  uniform float selectiveBloomFlag;
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
  
  gl_FragColor = vec4(color, alpha);
}
