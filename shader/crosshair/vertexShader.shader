precision lowp float;
precision lowp int;

attribute vec4 color;
attribute float size;

varying vec4 vColor;

void main(){
  vColor = color;

  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = size;
}
