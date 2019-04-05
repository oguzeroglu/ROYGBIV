precision lowp float;
precision lowp int;

uniform sampler2D sceneTexture;
uniform vec2 direction;
uniform vec2 resolution;
varying vec2 vUV;

vec4 blur() {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(sceneTexture, vUV) * 0.1964825501511404;
  color += texture2D(sceneTexture, vUV + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(sceneTexture, vUV - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(sceneTexture, vUV + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(sceneTexture, vUV - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(sceneTexture, vUV + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(sceneTexture, vUV - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

void main(){
  gl_FragColor = blur();
}
