precision lowp float;
precision lowp int;

attribute vec3 position;
attribute vec3 color;
attribute vec3 normal;
attribute float coordIndex;
attribute float quatIndex;
attribute vec2 faceVertexUV;
attribute vec2 faceVertexUVEmissive;
attribute vec2 faceVertexUVHeight;
attribute vec2 displacementInfo;
attribute float textureFlag;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float objectCoordinates[45];
uniform float objectQuaternions[60];
uniform vec3 currentPosition;
uniform vec4 currentQuaternion;
uniform float alpha;
uniform sampler2D texture;

varying float vDiscardFlag;
varying vec2 vFaceVertexUV;
varying vec2 vFaceVertexUVEmissive;
varying vec3 vColor;
varying float vTextureFlag;

vec3 applyQuaternionToVector(vec3 vector, vec4 quaternion){
  float x = vector.x;
  float y = vector.y;
  float z = vector.z;
  float qx = quaternion.x;
  float qy = quaternion.y;
  float qz = quaternion.z;
  float qw = quaternion.w;
  float ix = (qw * x) + (qy * z) - (qz * y);
  float iy = (qw * y) + (qz * x) - (qx * z);
  float iz = (qw * z) + (qx * y) - (qy * x);
  float iw = (-1.0 * qx * x) - (qy * y) - (qz * z);
  float calculatedX = (ix * qw) + (iw * -1.0 * qx) + (iy * -1.0 * qz) - (iz * -1.0 * qy);
  float calculatedY = (iy * qw) + (iw * -1.0 * qy) + (iz * -1.0 * qx) - (ix * -1.0 * qz);
  float calculatedZ = (iz * qw) + (iw * -1.0 * qz) + (ix * -1.0 * qy) - (iy * -1.0 * qx);
  return vec3(calculatedX, calculatedY, calculatedZ);
}

void main(){

  vColor = color;
  vDiscardFlag = -10.0;
  vFaceVertexUV = faceVertexUV;
  vFaceVertexUVEmissive = faceVertexUVEmissive;
  vTextureFlag = textureFlag;

  int indexX = int(coordIndex);
  int indexY = indexX + 1;
  int indexZ = indexY + 1;

  int qIndexX = int(quatIndex);
  int qIndexY = qIndexX + 1;
  int qIndexZ = qIndexY + 1;
  int qIndexW = qIndexZ + 1;

  vec4 quat = vec4(objectQuaternions[qIndexX], objectQuaternions[qIndexY], objectQuaternions[qIndexZ], objectQuaternions[qIndexW]);
  vec3 coord = vec3(objectCoordinates[indexX], objectCoordinates[indexY], objectCoordinates[indexZ]);

  float cDiffX = coord.x - currentPosition.x;
  float cDiffY = coord.y - currentPosition.y;
  float cDiffZ = coord.z - currentPosition.z;
  if (cDiffX < 1.0 && cDiffY < 1.0 && cDiffZ < 1.0){
    float qDiffX = quat.x - currentQuaternion.x;
    float qDiffY = quat.y - currentQuaternion.y;
    float qDiffZ = quat.z - currentQuaternion.z;
    float qDiffW = quat.w - currentQuaternion.w;
    if (qDiffX < 0.005 && qDiffY < 0.005 && qDiffZ < 0.005 && qDiffW < 0.005){
      vDiscardFlag = 10.0;
    }
  }

  vec3 displacedPosition = position;
  if (faceVertexUVHeight.x >= -5.0 && faceVertexUVHeight.y >= -5.0){
    vec4 displacementData = texture2D(texture, faceVertexUVHeight);
    float displacement = (displacementInfo.x * displacementData.x) + displacementInfo.y;
    displacedPosition = normal * displacement + position;
  }

  if (vDiscardFlag < 5.0){
    vec3 rotatedPos = applyQuaternionToVector(displacedPosition, quat);
    vec3 newPosition = coord + rotatedPos;
    gl_Position = gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
  }

}
