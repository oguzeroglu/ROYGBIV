precision lowp float;
precision lowp int;

varying vec3 vNormal;

#define INSERTION

uniform vec3 color;
uniform samplerCube cubeTexture;

vec4 RGBEToLinear(vec4 value){
	return vec4(value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0);
}

void main(){
  vec4 skyboxColor = vec4(color, 1.0);

  #ifdef IS_HDR
    gl_FragColor = RGBEToLinear(textureCube(cubeTexture, vNormal)) * skyboxColor;
  #else
    gl_FragColor = textureCube(cubeTexture, vNormal) * skyboxColor;
  #endif
}
