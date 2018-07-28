precision lowp float;
precision lowp int;

varying vec4 vCalculatedColor;
varying float vDiscardFlag;
varying float vTextureFlag;
varying vec3 vRgbThreshold;
varying vec4 vUVCoordinates;

uniform float time;
uniform sampler2D texture;

float discardDueToTextureColor;

vec4 getTexturedColor(){
  vec4 textureColor;
  if (vTextureFlag > 0.0){
    float startU = vUVCoordinates[0];
    float startV = vUVCoordinates[1];
    float endU = vUVCoordinates[2];
    float endV = vUVCoordinates[3];
    float coordX = ((gl_PointCoord.x) * (endU - startU)) + startU;
    float coordY = ((1.0 - gl_PointCoord.y) * (endV - startV)) + startV;
    textureColor = texture2D(texture, vec2(coordX, coordY));
  }else{
    textureColor = vec4(1, 1, 1, 1);
  }
  if (textureColor.a < 0.5 || textureColor.r < vRgbThreshold.r ||
            textureColor.g < vRgbThreshold.g || textureColor.b < vRgbThreshold.b){
    discardDueToTextureColor = 10.0;
  }
  return vCalculatedColor * textureColor;
}

void main(){
  discardDueToTextureColor = 0.0;
  if (vDiscardFlag > 2.0){
    discard;
  }
  gl_FragColor = getTexturedColor();
  if (discardDueToTextureColor > 5.0){
    discard;
  }
}
