precision lowp float;
precision lowp int;

attribute vec3 position;
attribute vec3 positionOffset;
attribute vec3 normal;
attribute vec4 quaternion;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

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

  vec3 transformedPosition = applyQuaternionToVector(position, quaternion) + positionOffset;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);

}
