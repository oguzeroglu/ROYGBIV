precision lowp float;
precision lowp int;

#define INSERTION

uniform sampler2D texture;
uniform vec4 color;
uniform mat3 uvTransform;
uniform vec4 uvRanges;

#ifdef HAS_SELECTIVE_BLOOM
  uniform float selectiveBloomFlag;
#endif

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

  vec2 uv = (uvTransform * vec3(gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1.0)).xy;
  vec4 textureColor = texture2D(texture, uvAffineTransformation(uv, uvRanges.x, uvRanges.y, uvRanges.z, uvRanges.w));
  if (textureColor.a < 0.5){
    discard;
  }else{
    gl_FragColor = color * textureColor;
  }
}
