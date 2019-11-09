precision lowp float;
precision lowp int;

uniform float spriteSize;
uniform float screenResolution;
uniform vec4 currentViewport;
uniform vec2 margin2D;

void main(){
  float oldPosX = ((currentViewport.z - currentViewport.x) / 2.0) + currentViewport.x;
  float oldPosY = ((currentViewport.w - currentViewport.y) / 2.0) + currentViewport.y;
  float x = (((oldPosX - currentViewport.x) * 2.0) / currentViewport.z) - 1.0;
  float y = (((oldPosY - currentViewport.y) * 2.0) / currentViewport.w) - 1.0;
  gl_Position = vec4(x + float(margin2D.x), y + float(margin2D.y), 0.0, 1.0);
  gl_PointSize = spriteSize * screenResolution;
}
