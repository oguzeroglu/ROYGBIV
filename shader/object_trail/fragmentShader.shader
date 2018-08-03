precision lowp float;
precision lowp int;

varying float vDiscardFlag;
varying vec2 vFaceVertexUV;
varying vec2 vFaceVertexUVEmissive;
varying vec3 vColor;
varying float vTextureFlag;

uniform sampler2D texture;
uniform float alpha;

void main(){
  if (vDiscardFlag >= 5.0){
    discard;
  }
  if (vTextureFlag > 5.0){
    vec4 textureColor = texture2D(texture, vec2(vFaceVertexUV.x, vFaceVertexUV.y));
    vec4 emissiveColor = vec4(0.0, 0.0, 0.0, 0.0);
    if (vFaceVertexUVEmissive.x >= -5.0 && vFaceVertexUVEmissive.y >= -5.0){
      emissiveColor = texture2D(texture, vec2(vFaceVertexUVEmissive.x, vFaceVertexUVEmissive.y));
    }
    gl_FragColor = vec4(vColor.r, vColor.g, vColor.b, alpha) * textureColor;
    gl_FragColor += emissiveColor;
    gl_FragColor.a = alpha;
  }else{
    gl_FragColor = vec4(vColor.r, vColor.g, vColor.b, alpha);
  }
}
