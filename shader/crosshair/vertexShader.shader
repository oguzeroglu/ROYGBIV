precision lowp float;
precision lowp int;

attribute vec4 color;
attribute float size;

uniform mat4 viewMatrix;

varying vec4 vColor;

void main(){
  vColor = color;

  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = size;
}
