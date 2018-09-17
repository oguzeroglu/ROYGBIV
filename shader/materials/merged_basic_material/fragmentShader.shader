precision lowp float;
precision lowp int;

#define ALPHA_TEST 0.5
#define LOG2 1.442695

uniform vec4 fogInfo;
uniform sampler2D texture;

varying float hasDiffuseFlag;
varying float hasEmissiveFlag;
varying float hasAlphaFlag;
varying float hasAOFlag;
varying float vAlpha;
varying float vEmissiveIntensity;
varying float vAOIntensity;
varying vec2 vDiffuseUV;
varying vec2 vEmissiveUV;
varying vec2 vAlphaUV;
varying vec2 vAOUV;
varying vec3 vColor;

void main(){

  vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);

  if (hasDiffuseFlag > 0.0){
    diffuseColor = texture2D(texture, vDiffuseUV);
  }

  gl_FragColor = vec4(vColor, vAlpha) * diffuseColor;

  if (hasAlphaFlag > 0.0){
    float val = texture2D(texture, vAlphaUV).g;
    gl_FragColor.a *= val;
    if (val <= ALPHA_TEST){
      discard;
    }
  }

  if (hasAOFlag > 0.0){
    float ao = (texture2D(texture, vAOUV).r - 1.0) * vAOIntensity + 1.0;
    gl_FragColor.rgb *= ao;
  }

  if (hasEmissiveFlag > 0.0){
    vec4 emissiveColor = texture2D(texture, vEmissiveUV);
    vec3 totalEmissiveRadiance = vec3(vEmissiveIntensity, vEmissiveIntensity, vEmissiveIntensity);
    totalEmissiveRadiance *= emissiveColor.rgb;
    gl_FragColor.rgb += totalEmissiveRadiance;
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
