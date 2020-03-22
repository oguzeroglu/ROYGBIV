var VectorPool = function(vectorConstructor, size){
  this.isVectorPool = true;

  this.index = 0;
  this.pool = [];

  for (var i = 0; i < size; i ++){
    this.pool.push(vectorConstructor());
  }
}

VectorPool.prototype.get = function(){
  var vect = this.pool[this.index ++];
  if (this.index == this.pool.length){
    this.index = 0;
  }
  return vect;
}
