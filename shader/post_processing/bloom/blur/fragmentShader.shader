precision lowp float;
precision lowp int;

uniform sampler2D sceneTexture;
varying vec2 vUV;

void main(){
  gl_FragColor = texture2D(sceneTexture, vUV);
}
