precision lowp float;
precision lowp int;

#define PI 3.141592653589793

attribute vec3 position;
uniform vec4 currentViewport;
uniform vec2 scale;
uniform float rotationAngle;

#define INSERTION

vec2 rotate2D(vec2 pos, vec2 rot) {
  return vec2(pos.x * rot.y + pos.y * rot.x, pos.y * rot.y - pos.x * rot.x);
}

vec2 applyRotationAngle(float angleInDegrees, vec2 pos){
  angleInDegrees = 360.0 - angleInDegrees;
  float angleInRadians = angleInDegrees * PI / 180.0;
  return rotate2D(pos, vec2(sin(angleInRadians), cos(angleInRadians)));
}

void main(){
  float scaledX = scale.x * position.x;
  float scaledY = scale.y * position.y;
  vec2 rotated = applyRotationAngle(rotationAngle, vec2(scaledX, scaledY));
  float oldPosX = ((currentViewport.z - currentViewport.x) / 2.0) + currentViewport.x + rotated.x;
  float oldPosY = ((currentViewport.w - currentViewport.y) / 2.0) + currentViewport.y + rotated.y;
  float x = (((oldPosX - currentViewport.x) * 2.0) / currentViewport.z) - 1.0;
  float y = (((oldPosY - currentViewport.y) * 2.0) / currentViewport.w) - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
