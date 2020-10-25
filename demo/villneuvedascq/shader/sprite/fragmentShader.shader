precision lowp float;
precision lowp int;

#define INSERTION

uniform vec3 color;
uniform float alpha;

#ifdef HAS_TEXTURE
  uniform sampler2D texture;
  uniform vec4 uvRanges;
  varying vec2 vUV;
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
#endif

void main(){
  gl_FragColor = vec4(color.r, color.g, color.b, alpha);
  #ifdef HAS_TEXTURE
    vec4 textureColor = texture2D(texture, uvAffineTransformation(vUV, uvRanges.x, uvRanges.y, uvRanges.z, uvRanges.w));
    if (textureColor.a <= 0.5){
      discard;
    }else{
      gl_FragColor *= textureColor;
    }
  #endif
}
