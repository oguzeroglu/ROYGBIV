precision lowp float;
precision lowp int;

#define INSERTION

#ifdef HAS_TEXTURE
  uniform sampler2D texture;
  varying vec2 vUV;
#endif

void main(){
  #ifdef HAS_TEXTURE
    gl_FragColor = texture2D(texture, vUV);
  #else
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  #endif
}
