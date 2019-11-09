precision lowp float;
precision lowp int;

#define INSERTION

#ifdef HAS_TEXTURE
  uniform sampler2D texture;
#endif

void main(){
  #ifdef HAS_TEXTURE
    gl_FragColor = texture2D(texture, gl_PointCoord);
  #else
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  #endif
}
