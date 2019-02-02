precision lowp float;
precision lowp int;

varying vec4 vUVRanges;

uniform float alpha;
uniform vec3 color;
uniform sampler2D glyphTexture;

void main(){
  float startU = vUVRanges[0];
  float endU = vUVRanges[1];
  float startV = vUVRanges[2];
  float endV = vUVRanges[3];
  float coordX = ((gl_PointCoord.x) * (endU - startU)) + startU;
  float coordY = ((1.0 - gl_PointCoord.y) * (endV - startV)) + startV;
  vec4 textureColor = texture2D(glyphTexture, vec2(coordX, coordY));

  if (textureColor.a < 0.5 || startU < -300.0 || startV < -300.0 || endU < -300.0 || endV < -300.0){
    discard;
  }

  gl_FragColor = vec4(color, 1.0) * vec4(textureColor.r, textureColor.g, textureColor.b, alpha);
}
