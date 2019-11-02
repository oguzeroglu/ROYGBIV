var WorldBinHandler2D = function(floatingPointCount){
  this.bin = new Map();
  this.floatingPointCount = floatingPointCount; // number of digits after floating point
  this.segmentCount = Math.pow(10, this.floatingPointCount);
  this.cache = new Map();
  this.applyCaching = true;
  this.cacheHitCount = 0;
}

WorldBinHandler2D.prototype.query = function(webglX, webglY){
  var screenXConverted = this.convertFromWebGLRange(webglX);
  var screenYConverted = this.convertFromWebGLRange(webglY);
  var binIndexX = this.getBinIndex(screenXConverted);
  var binIndexY = this.getBinIndex(screenYConverted);
  var cacheKey;
  if (this.applyCaching){
    cacheKey = binIndexX + PIPE + binIndexY;
    var cached = this.cache.get(cacheKey);
    if (cached){
      this.cacheHitCount ++;
      if (this.cacheHitCount > 10000){
        this.cacheHitCount = 0;
      }
      return cached;
    }
  }
  if (this.bin.has(binIndexX)){
    if (this.bin.get(binIndexX).has(binIndexY)){
      var results = new Object();
      var keys = this.bin.get(binIndexX).get(binIndexY).keys();
      for (var name of keys){
        results[name] = true;
      }
      if (this.applyCaching){
        this.cache.set(cacheKey, results);
      }
      return results;
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
  return parseInt(result);
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