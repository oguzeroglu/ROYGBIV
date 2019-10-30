var WorldBinHandler2D = function(floatingPointCount){
  this.bin = new Map();
  this.floatingPointCount = floatingPointCount; // number of digits after floating point
  this.segmentCount = Math.pow(10, this.floatingPointCount);
}

WorldBinHandler2D.prototype.query = function(screenX, screenY){
  var screenXConverted = this.convertFromWebGLRange(screenX);
  var binIndexX = this.getBinIndex(screenXConverted);
  if (this.bin.has(binIndexX)){
    var screenYConverted = this.convertFromWebGLRange(screenY);
    var binIndexY = this.getBinIndex(screenYConverted);
    if (this.bin.get(binIndexX).has(binIndexY)){
      // return results here
    }
  }
}

WorldBinHandler2D.prototype.convertFromWebGLRange = function(value){
  return (value + 1) / 2;
}

WorldBinHandler2D.prototype.getBinIndex = function(float){
  var result = (float.toFixed(this.floatingPointCount) * this.segmentCount) - 1;
  if (result < 0){
    result = 0;
  }
  return result;
}

WorldBinHandler2D.prototype.insertAddedText = function(obj){
  if (!obj.twoDimensionalSize){
    obj.handleResize();
  }
  var minXIndex = this.getBinIndex(this.convertFromWebGLRange(obj.twoDimensionalSize.x));
  var maxYIndex = this.getBinIndex(this.convertFromWebGLRange(obj.twoDimensionalSize.y));
  var maxXIndex = this.getBinIndex(this.convertFromWebGLRange(obj.twoDimensionalSize.z));
  var minYIndex = this.getBinIndex(this.convertFromWebGLRange(obj.twoDimensionalSize.w));
  for (var x = minXIndex; x<= maxXIndex; x++){
    for (var y = minYIndex; y<= maxYIndex; y++){
      if (!this.bin.has(x)){
        this.bin.set(x, new Map());
      }
      if (!this.bin.get(x).has(y)){
        this.bin.get(x).set(y, new Map());
      }
      this.bin.get(x).get(y).set(obj.name, true);
    }
  }
}

WorldBinHandler2D.prototype.insert = function(obj){
  if (obj.isAddedText){
    this.insertAddedText(obj);
    return;
  }
}
