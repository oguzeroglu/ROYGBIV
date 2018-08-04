precision lowp float;
precision lowp int;

uniform sampler2D texture;
uniform vec4 color;

void main(){
  vec4 textureColor = texture2D(texture, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
  if (textureColor.a < 0.5){
    discard;
  }else{
    gl_FragColor = color * textureColor;
  }
}
