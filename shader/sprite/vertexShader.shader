precision lowp float;
precision lowp int;

attribute vec3 position;
uniform vec4 currentViewport;
uniform vec2 scale;

#define INSERTION

void main(){
  float scaledX = scale.x * position.x;
  float scaledY = scale.y * position.y;
  float oldPosX = ((currentViewport.z - currentViewport.x) / 2.0) + currentViewport.x + scaledX;
  float oldPosY = ((currentViewport.w - currentViewport.y) / 2.0) + currentViewport.y + scaledY;
  float x = (((oldPosX - currentViewport.x) * 2.0) / currentViewport.z) - 1.0;
  float y = (((oldPosY - currentViewport.y) * 2.0) / currentViewport.w) - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
