precision lowp float;
precision lowp int;

#define INSERTION

uniform sampler2D texture;
uniform vec4 color;
uniform mat3 uvTransform;
uniform vec4 uvRanges;

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

vec4 fixTextureBleeding(vec4 uvCoordinates){
  float offset = 0.5 / float(TEXTURE_SIZE);
  return vec4(uvCoordinates[0] + offset, uvCoordinates[1] - offset, uvCoordinates[2] - offset, uvCoordinates[3] + offset);
}

void main(){
  vec4 uvRangesFixed = fixTextureBleeding(uvRanges);
  vec2 uv = (uvTransform * vec3(gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1.0)).xy;
  vec4 textureColor = texture2D(texture, uvAffineTransformation(uv, uvRangesFixed.x, uvRangesFixed.y, uvRangesFixed.z, uvRangesFixed.w));
  if (textureColor.a < 0.5){
    discard;
  }else{
    gl_FragColor = color * textureColor;
  }
}
