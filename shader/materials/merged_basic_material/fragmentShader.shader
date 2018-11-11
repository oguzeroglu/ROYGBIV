precision lowp float;
precision lowp int;

#define ALPHA_TEST 0.5
#define LOG2 1.442695

uniform sampler2D diffuseMap;
uniform sampler2D emissiveMap;
uniform sampler2D alphaMap;
uniform sampler2D aoMap;
uniform vec4 fogInfo;
uniform vec4 forcedColor;

varying float vEmissiveIntensity;
varying float vAOIntensity;
varying float vAlpha;
varying vec3 vColor;
varying vec2 vUV;

varying float hasDiffuseMap;
varying float hasEmissiveMap;
varying float hasAlphaMap;
varying float hasAOMap;

void main(){

  if (forcedColor.x >= -10.0){
    gl_FragColor = vec4(forcedColor.y, forcedColor.z, forcedColor.w, forcedColor.x);
    return;
  }

  vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);

  if (hasDiffuseMap > 0.0){
    diffuseColor = texture2D(diffuseMap, vUV);
  }

  gl_FragColor = vec4(vColor, vAlpha) * diffuseColor;

  if (hasAlphaMap > 0.0){
    float val = texture2D(alphaMap, vUV).g;
    gl_FragColor.a *= val;
    if (val <= ALPHA_TEST){
      discard;
    }
  }

  if (hasAOMap > 0.0){
    float ao = (texture2D(aoMap, vUV).r - 1.0) * vAOIntensity + 1.0;
    gl_FragColor.rgb *= ao;
  }

  if (hasEmissiveMap > 0.0){
    vec4 emissiveColor = texture2D(emissiveMap, vUV);
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
