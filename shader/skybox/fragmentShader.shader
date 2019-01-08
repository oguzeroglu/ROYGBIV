precision lowp float;
precision lowp int;

varying float vMaterialIndex;
varying vec2 vUV;

uniform sampler2D rightTexture;
uniform sampler2D leftTexture;
uniform sampler2D topTexture;
uniform sampler2D bottomTexture;
uniform sampler2D behindTexture;
uniform sampler2D frontTexture;

void main(){

  if (vMaterialIndex > 0.0 && vMaterialIndex < 10.0){
    // right
    gl_FragColor = texture2D(rightTexture, vUV);
  }else if (vMaterialIndex > 10.0 && vMaterialIndex < 20.0){
    // left
    gl_FragColor = texture2D(leftTexture, vUV);
  }else if (vMaterialIndex > 20.0 && vMaterialIndex < 40.0){
    // top
    gl_FragColor = texture2D(topTexture, vUV);
  }else if (vMaterialIndex > 40.0 && vMaterialIndex < 50.0){
    // bottom
    gl_FragColor = texture2D(bottomTexture, vUV);
  }else if (vMaterialIndex > 50.0 && vMaterialIndex < 70.0){
    // behind
    gl_FragColor = texture2D(behindTexture, vUV);
  }else{
    // front
    gl_FragColor = texture2D(frontTexture, vUV);
  }
}
