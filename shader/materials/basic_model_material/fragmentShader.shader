precision lowp float;
precision lowp int;

varying vec3 vColor;

#define INSERTION

void main(){

  gl_FragColor = vec4(vColor, 1.0);
}
