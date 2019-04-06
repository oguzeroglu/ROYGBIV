precision lowp float;
precision lowp int;

uniform sampler2D sceneTexture;
uniform sampler2D blurTexture;
varying vec2 vUV;

void main(){
  vec4 sceneColor = texture2D(sceneTexture, vUV);
  vec4 blurColor = texture2D(blurTexture, vUV);
  gl_FragColor = sceneColor + blurColor;
}
