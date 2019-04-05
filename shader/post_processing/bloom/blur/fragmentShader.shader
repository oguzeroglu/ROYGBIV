precision lowp float;
precision lowp int;

uniform sampler2D sceneTexture;
uniform sampler2D combineTexture;
uniform vec2 direction;
uniform vec2 resolution;
uniform float brightnessThreshold;
uniform float combineFlag;
uniform float exposure;
uniform float gamma;
uniform float bloomStrength;
varying vec2 vUV;

vec4 blur(vec4 color1) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += color1 * 0.1964825501511404;
  color += texture2D(sceneTexture, vUV + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(sceneTexture, vUV - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(sceneTexture, vUV + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(sceneTexture, vUV - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(sceneTexture, vUV + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(sceneTexture, vUV - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

void main(){
  vec4 color1 = texture2D(sceneTexture, vUV);
  float brightness = dot(color1.rgb, vec3(0.2126, 0.7152, 0.0722));
  if (brightness > brightnessThreshold){
    gl_FragColor = blur(color1);
  }else{
    gl_FragColor = vec4(0.0);
  }
  if (combineFlag > 0.0){
    vec4 sceneColor = texture2D(combineTexture, vUV);
    gl_FragColor = (bloomStrength * gl_FragColor) + sceneColor;
    vec3 result = vec3(1.0) - exp(-gl_FragColor.rgb * exposure);
    result = pow(result, vec3(1.0 / gamma));
    gl_FragColor = vec4(result, gl_FragColor.a);
  }
}
