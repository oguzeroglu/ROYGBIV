precision lowp float;
precision lowp int;

#define INSERTION

uniform vec3 color;
uniform float alpha;

#ifdef HAS_TEXTURE
  uniform sampler2D texture;
  varying vec2 vUV;
#endif

void main(){
  gl_FragColor = vec4(color.r, color.g, color.b, alpha);
  #ifdef HAS_TEXTURE
    gl_FragColor *= texture2D(texture, vUV);
  #endif
}
