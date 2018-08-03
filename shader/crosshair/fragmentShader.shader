precision lowp float;
precision lowp int;

uniform sampler2D texture;

varying vec4 vColor;

void main(){
  gl_FragColor = vColor * texture2D(texture, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
}
