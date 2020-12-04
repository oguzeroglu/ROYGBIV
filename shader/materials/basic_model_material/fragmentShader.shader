precision lowp float;
precision lowp int;

varying vec2 vUV;
varying vec3 vColor;
varying vec4 vDiffuseUV;

uniform sampler2D texture;

#define INSERTION

vec2 uvAffineTransformation(vec2 original, float startU, float startV, float endU, float endV) {
  float coordX = (original.x * (endU - startU) + startU);
  float coordY = (original.y * (startV - endV) + endV);

  return vec2(coordX, coordY);
}

void main(){

  vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);

  if (vDiffuseUV.x >= 0.0) {
    diffuseColor = texture2D(texture, uvAffineTransformation(vUV, vDiffuseUV.x, vDiffuseUV.y, vDiffuseUV.z, vDiffuseUV.w));
  }

  gl_FragColor = vec4(vColor, 1.0) * diffuseColor;
}
