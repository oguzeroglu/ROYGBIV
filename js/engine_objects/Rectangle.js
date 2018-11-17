var Rectangle = function(x, y, width, height){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.finalX = x + width;
  this.finalY = y + height;
}
Rectangle.prototype.fits = function(texture){
  var tw = texture.image.width;
  var th = texture.image.height;
  if (tw <= this.width && th <= this.height){
    return true;
  }
  return false;
}
Rectangle.prototype.fitsPerfectly = function(texture){
  var tw = texture.image.width;
  var th = texture.image.height;
  return (tw == this.width) && (th == this.height);
}
Rectangle.prototype.overlaps = function(rect){
  return this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y;
}
