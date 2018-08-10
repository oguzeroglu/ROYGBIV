precision lowp float;
precision lowp int;

#define LOG2 1.442695
#define ALPHA_TEST 0.5

varying float vDiscardFlag;
varying vec2 vFaceVertexUV;
varying vec2 vFaceVertexUVEmissive;
varying vec2 vFaceVertexUVAlpha;
varying vec3 vColor;
varying float vTextureFlag;

uniform sampler2D texture;
uniform float alpha;
uniform vec4 fogInfo;

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

  if (vFaceVertexUVAlpha.x >= -5.0 && vFaceVertexUVAlpha.y >= -5.0){
    float val = texture2D(texture, vec2(vFaceVertexUVAlpha.x, vFaceVertexUVAlpha.y)).g;
    gl_FragColor.a *= val;
    if (val <= ALPHA_TEST){
      discard;
    }
  }

  if (fogInfo[0] >= -50.0){
    float fogDensity = fogInfo[0];
    float fogR = fogInfo[1];
    float fogG = fogInfo[2];
    float fogB = fogInfo[3];
    float z = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = exp2(-fogDensity * fogDensity * z * z * LOG2);
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    gl_FragColor = vec4(mix(vec3(fogR, fogG, fogB), gl_FragColor.rgb, fogFactor), gl_FragColor.a);
  }

}
