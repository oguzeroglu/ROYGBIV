precision lowp float;
precision lowp int;

attribute float size;

void main(){
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 5.0 * size;
}
