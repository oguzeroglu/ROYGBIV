// This good old class turned into a separate library:
// https://github.com/oguzeroglu/TextureMerger
var TextureMerger = function(texturesObj){
  if (!texturesObj){
    return;
  }

  this.dataURLs = new Object();
  for (var textureName in texturesObj){
    var txt = texturesObj[textureName];

    if (txt instanceof THREE.CompressedTexture){
      throw new Error("CompressedTextures are not supported.");
    }

    if (typeof txt.image.toDataURL == UNDEFINED){
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = txt.image.naturalWidth;
      tmpCanvas.height = txt.image.naturalHeight;
      tmpCanvas.getContext('2d').drawImage(txt.image, 0, 0);
      this.dataURLs[textureName] = tmpCanvas.toDataURL();
    }else{
      this.dataURLs[textureName] = txt.image.toDataURL();
    }
  }
  this.canvas = document.createElement("canvas");
  this.textureCount = 0;
  this.maxWidth = 0;
  this.maxHeight = 0;
  var explanationStr = "";
  for (textureName in texturesObj){
    this.textureCount ++;
    var texture = texturesObj[textureName];
    texture.area = texture.image.width * texture.image.height;
    if (texture.image.width > this.maxWidth){
      this.maxWidth = texture.image.width;
    }
    if (texture.image.height > this.maxHeight){
      this.maxHeight = texture.image.height;
    }
    explanationStr += textureName + ",";
  }
  explanationStr = explanationStr.substring(0, explanationStr.length - 1);
  this.textureCache = new Object();
  // node
  //  |___ children: Array(2) of node
  //  |___ rectangle: Rectangle
  //  |___ textureName: String
  //  |___ upperNode: node
  this.node = new Object();
  this.node.rectangle = new Rectangle(0, 0, this.maxWidth * this.textureCount,
                                              this.maxHeight * this.textureCount);
  this.textureOffsets = new Object();
  this.allNodes = [];
  this.insert(this.node, this.findNextTexture(texturesObj), texturesObj);

  this.ranges = new Object();
  var imgSize = this.calculateImageSize(texturesObj);
  this.canvas.width = imgSize.width;
  this.canvas.height = imgSize.height;
  var context = this.canvas.getContext("2d");
  this.context = context;
  for (textureName in this.textureOffsets){
    var texture = texturesObj[textureName];
    var offsetX = this.textureOffsets[textureName].x;
    var offsetY = this.textureOffsets[textureName].y;
    var imgWidth = texture.image.width;
    var imgHeight = texture.image.height;

    for (var y = offsetY; y<offsetY+imgHeight; y+=imgHeight){
      for (var x = offsetX; x<offsetX+imgWidth; x+=imgWidth){
        context.drawImage(texture.image, x, y, imgWidth, imgHeight);
      }
    }

    var range = new Object();
    range.startU = offsetX / imgSize.width;
    range.endU = (offsetX + imgWidth) / imgSize.width;
    range.startV = 1 - (offsetY / imgSize.height);
    range.endV = 1 - ((offsetY + imgHeight) / imgSize.height);
    this.ranges[textureName] = range;
  }

  if (this.canvas.width > MAX_TEXTURE_SIZE || this.canvas.height > MAX_TEXTURE_SIZE){
    throw new Error("TextureMerger error: Max texture size exceeded. ("+MAX_TEXTURE_SIZE+"x"+MAX_TEXTURE_SIZE+")");
    return;
  }
  this.makeCanvasPowerOfTwo();
  this.mergedTexture = new THREE.CanvasTexture(this.canvas);
  this.mergedTexture.wrapS = THREE.ClampToEdgeWrapping;
  this.mergedTexture.wrapT = THREE.ClampToEdgeWrapping;
  this.mergedTexture.minFilter = THREE.NearestFilter;
  this.mergedTexture.magFilter = THREE.NearestFilter;
  this.mergedTexture.needsUpdate = true;
}
TextureMerger.prototype.isTextureAlreadyInserted = function(textureName, texturesObj){
  var texture = texturesObj[textureName];
  var img = this.dataURLs[textureName];
  for (var tName in texturesObj){
    if (tName == textureName){
      continue;
    }
    var txt = texturesObj[tName];
    var tImg = this.dataURLs[tName];
    if (img == tImg && this.textureOffsets[tName]){
      return this.textureOffsets[tName];
    }
  }
  return false;
}

TextureMerger.prototype.insert = function(node, textureName, texturesObj){
  var texture = texturesObj[textureName];
  var res = this.isTextureAlreadyInserted(textureName, texturesObj);
  if (res){
    this.textureOffsets[textureName] = res;
    var newTextureName = this.findNextTexture(texturesObj);
    if (!(newTextureName == null)){
      this.insert(node, newTextureName, texturesObj);
    }
    return;
  }
  var tw = texture.image.width;
  var th = texture.image.height;
  if (node.upperNode){
    var minArea = ((this.maxWidth * this.textureCount) + (this.maxHeight * this.textureCount));
    var minAreaNode = 0;
    var inserted = false;
    for (var i = 0; i<this.allNodes.length; i++){
      var curNode = this.allNodes[i];
      if (!curNode.textureName && curNode.rectangle.fits(texture)){
        this.textureOffsets[textureName] = {x: curNode.rectangle.x, y: curNode.rectangle.y};
        var calculatedSize = this.calculateImageSize(texturesObj);
        var calculatedArea = calculatedSize.width + calculatedSize.height;
        if (calculatedArea < minArea && calculatedSize.width <= MAX_TEXTURE_SIZE && calculatedSize.height <= MAX_TEXTURE_SIZE){
          var overlaps = false;
          for (var tName in this.textureOffsets){
            if (tName == textureName){
              continue;
            }
            var cr = curNode.rectangle;
            var ox = this.textureOffsets[tName].x;
            var oy = this.textureOffsets[tName].y;
            var oimg = texturesObj[tName].image;
            var rect1 = new Rectangle(cr.x, cr.y, tw, th);
            var rect2 = new Rectangle(ox, oy, oimg.width, oimg.height);
            if (rect1.overlaps(rect2)){
              overlaps = true;
            }
          }
          if (!overlaps){
            minArea = calculatedArea;
            minAreaNode = this.allNodes[i];
            inserted = true;
          }
        }
        delete this.textureOffsets[textureName];
      }
    }
    if (inserted){
      this.textureOffsets[textureName] = {x: minAreaNode.rectangle.x, y: minAreaNode.rectangle.y};
      minAreaNode.textureName = textureName;
      if (!minAreaNode.children){
        var childNode1 = new Object();
        var childNode2 = new Object();
        childNode1.upperNode = minAreaNode;
        childNode2.upperNode = minAreaNode;
        minAreaNode.children = [childNode1, childNode2];
        var rx = minAreaNode.rectangle.x;
        var ry = minAreaNode.rectangle.y;
        var maxW = this.maxWidth * this.textureCount;
        var maxH = this.maxHeight * this.textureCount;
        childNode1.rectangle = new Rectangle(rx+tw, ry, maxW - (rx+tw), maxH - ry);
        childNode2.rectangle = new Rectangle(rx, ry+th, maxW - rx, maxH - (ry+th));
        this.allNodes.push(childNode1);
        this.allNodes.push(childNode2);
      }
      var newTextureName = this.findNextTexture(texturesObj);
      if (!(newTextureName == null)){
        this.insert(node, newTextureName, texturesObj);
      }
    }else{
      throw new Error("Error: Try to use smaller textures.");
    }
  }else{
    // First node
    var recW = node.rectangle.width;
    var recH = node.rectangle.height;
    node.textureName = textureName;
    var childNode1 = new Object();
    var childNode2 = new Object();
    childNode1.upperNode = node;
    childNode2.upperNode = node;
    node.children = [childNode1, childNode2];
    childNode1.rectangle = new Rectangle(tw, 0, recW - tw, th);
    childNode2.rectangle = new Rectangle(0, th, recW, recH - th);
    this.textureOffsets[textureName] = {x: node.rectangle.x, y: node.rectangle.y};
    var newNode = node.children[0];
    this.allNodes = [node, childNode1, childNode2];
    var newTextureName = this.findNextTexture(texturesObj);
    if (!(newTextureName == null)){
      this.insert(newNode, newTextureName, texturesObj);
    }
  }
}

TextureMerger.prototype.makeCanvasPowerOfTwo = function(canvas){
  var setCanvas = false;
  if (!canvas){
    canvas = this.canvas;
    setCanvas = true;
  }
  var oldWidth = canvas.width;
  var oldHeight = canvas.height;
  var newWidth = Math.pow(2, Math.round(Math.log(oldWidth) / Math.log(2)));
  var newHeight = Math.pow(2, Math.round(Math.log(oldHeight) / Math.log(2)));
  var newCanvas = document.createElement("canvas");
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  newCanvas.getContext("2d").drawImage(canvas, 0, 0, newWidth, newHeight);
  if (setCanvas){
    this.canvas = newCanvas;
  }
}

TextureMerger.prototype.calculateImageSize = function(texturesObj){
  var width = 0;
  var height = 0;
  for (var textureName in this.textureOffsets){
    var texture = texturesObj[textureName];
    var tw = texture.image.width;
    var th = texture.image.height;
    var x = this.textureOffsets[textureName].x;
    var y = this.textureOffsets[textureName].y;
    if (x + tw > width){
      width = x + tw;
    }
    if (y + th > height){
      height = y + th;
    }
  }
  return {"width": width, "height": height};
}

TextureMerger.prototype.findNextTexture = function(texturesObj){
  var maxArea = -1;
  var foundTexture;
  for (textureName in texturesObj){
    var texture = texturesObj[textureName];
    if (!this.textureCache[textureName]){
      if (texture.area > maxArea){
        maxArea = texture.area;
        foundTexture = textureName;
      }
    }
  }
  if (maxArea == -1){
    return null;
  }
  this.textureCache[foundTexture] = true;
  return foundTexture;
}

TextureMerger.prototype.rescale = function(canvas, scale){
  var resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = canvas.width * scale;
  resizedCanvas.height = canvas.height * scale;
  var resizedContext = resizedCanvas.getContext("2d");
  resizedContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, resizedCanvas.width, resizedCanvas.height);
  //this.debugCanvas(resizedCanvas);
  return resizedCanvas;
}
