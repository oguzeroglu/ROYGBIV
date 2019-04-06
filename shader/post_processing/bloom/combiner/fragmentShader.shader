precision lowp float;
precision lowp int;

uniform sampler2D sceneTexture;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform float bloomStrength;
uniform float exposure;
uniform float gamma;
varying vec2 vUV;

void main(){
  vec4 blurColor1 = texture2D(blurTexture1, vUV);
  vec4 blurColor2 = texture2D(blurTexture2, vUV);
  vec4 blurColor3 = texture2D(blurTexture3, vUV);
  vec4 blurColor4 = texture2D(blurTexture4, vUV);
  vec4 blurColor5 = texture2D(blurTexture5, vUV);
  vec4 sceneColor = texture2D(sceneTexture, vUV);
  vec4 hdrColor = sceneColor + (bloomStrength * (blurColor1 + blurColor2 + blurColor3 + blurColor4 + blurColor5));
  vec3 toneMappedColor = vec3(1.0) - exp(-hdrColor.rgb * exposure);
  toneMappedColor = pow(toneMappedColor, vec3(1.0 / gamma));
  gl_FragColor = vec4(toneMappedColor.rgb, hdrColor.a);
}
