var TextureMerger = function(texturesObj){
  if (!texturesObj){
    return;
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

  //this.debugOffsets(texturesObj);

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
    var repeatX = texture.repeat.x;
    var repeatY = texture.repeat.y;
    if (repeatX == 0){
      repeatX = 1;
    }
    if (repeatY == 0){
      repeatY = 1;
    }

    var mirrorS = false;
    var mirrorT = false;
    if (texture.wrapS == THREE.MirroredRepeatWrapping){
      mirrorS = true;
    }
    if (texture.wrapT == THREE.MirroredRepeatWrapping){
      mirrorT = true;
    }

    var ofX = texture.offset.x;
    var ofY = texture.offset.y;
    if (ofX == 0 && ofY == 0){
      if (textureName.indexOf(",emissive") !== -1){
        var tmpTexture = texturesObj[textureName.replace(",emissive", ",diffuse")];
        if (tmpTexture){
          ofX = tmpTexture.offset.x;
          ofY = tmpTexture.offset.y;
        }
      }
    }
    if (ofX > 0){
      ofX = ofX - Math.floor(ofX);
    }else{
      ofX = ofX + Math.floor(Math.abs(ofX));
    }
    if (ofY > 0){
      ofY = ofY - Math.floor(ofY);
    }else{
      ofY = ofY + Math.floor(Math.abs(ofY));
    }
    var isCustomCanvas = false;
    if ((ofX != 0 || ofY != 0)){
      var cnvs = document.createElement("canvas");
      var ctx = cnvs.getContext("2d");
      isCustomCanvas = true;
      cnvs.width = texture.image.width * 3;
      cnvs.height = texture.image.height * 3;
      for (var f1 = 0; f1 <= 2*imgWidth; f1 += imgWidth){
        for (var f2 = 0; f2 <= 2 * imgHeight; f2 += imgHeight){
          for (var y = f2; y<f2+imgHeight; y+=imgHeight){
            for (var x = f1; x<f1+imgWidth; x+=imgWidth){
                ctx.drawImage(texture.image, x, y, imgWidth, imgHeight);
            }
          }
        }
      }
      var newStartX = imgWidth;
      if (ofX != 0){
        newStartX = newStartX + (imgWidth * ofX);
      }
      var newStartY = imgHeight;
      if (ofY != 0){
        newStartY = newStartY - (imgHeight * ofY);
      }
      this.tmpCanvas = document.createElement("canvas");
      this.tmpCanvas.width = imgWidth;
      this.tmpCanvas.height = imgHeight;
      var tmpContext = this.tmpCanvas.getContext("2d");
      tmpContext.drawImage(
        cnvs, newStartX, newStartY, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight
      );
      //this.debugCanvas(this.tmpCanvas);
    }

    var mirrorStepX = 0;
    var mirrorStepY = 0;
    var flippedYOffsetX = 0;
    if (!isCustomCanvas && !(mirrorS || mirrorT)){
      for (var y = offsetY; y<offsetY+imgHeight; y+=imgHeight/repeatY){
        for (var x = offsetX; x<offsetX+imgWidth; x+=imgWidth/repeatX){
          context.drawImage(texture.image, x, y, imgWidth/repeatX, imgHeight/repeatY);
        }
      }
    }else if (!(mirrorS || mirrorT)){
      for (var y = offsetY; y<offsetY+imgHeight; y+=imgHeight/repeatY){
        for (var x = offsetX; x<offsetX+imgWidth; x+=imgWidth/repeatX){
            context.drawImage(this.tmpCanvas, 0, 0, imgWidth, imgHeight, x, y, imgWidth/repeatX, imgHeight/repeatY);
        }
      }
    }else{
      var foCanvas = document.createElement("canvas");
      foCanvas.width = imgWidth;
      foCanvas.height = imgHeight;
      var foContext = foCanvas.getContext("2d");
      var noy = 0;
      var nox = 0;
      for (var y = offsetY; y<offsetY+imgHeight; y+= imgHeight/repeatY){
        var selectedContext = foContext;
        var flippedYCanvas;
        if (mirrorT && (((mirrorStepY % 2 == 0) && (repeatY % 2 == 0)) || ((mirrorStepY % 2 == 1) && (repeatY % 2== 1)))){
          flippedYCanvas = document.createElement("canvas");
          flippedYCanvas.width = imgWidth;
          flippedYCanvas.height = imgHeight/repeatY;
          selectedContext = flippedYCanvas.getContext("2d");
          selectedContext.scale(1, -1);
        }else{
          flippedYCanvas = 0;
        }
        for (var x = offsetX; x<offsetX+imgWidth; x+= imgWidth/repeatX){
          if (mirrorStepX % 2 == 1 && mirrorS){
            var flippedCanvas = document.createElement("canvas");
            flippedCanvas.width = imgWidth/repeatX;
            flippedCanvas.height = imgHeight/repeatY;
            var flippedContext = flippedCanvas.getContext("2d");
            flippedContext.scale(-1, 1);
            flippedContext.drawImage(texture.image, 0, 0, -1*imgWidth/repeatX, imgHeight/repeatY);
            //this.debugCanvas(flippedCanvas);
            if (!flippedYCanvas){
              selectedContext.drawImage(flippedCanvas, 0, 0, imgWidth/repeatX, imgHeight/repeatY, nox, noy, imgWidth/repeatX, imgHeight/repeatY);
              nox += imgWidth/repeatX;
            }else{
              selectedContext.drawImage(flippedCanvas, 0, 0, imgWidth/repeatX, imgHeight/repeatY, flippedYOffsetX, 0, imgWidth/repeatX, -1*imgHeight/repeatY);
              flippedYOffsetX += imgWidth/repeatX;
              //this.debugCanvas(flippedYCanvas);
            }
          }else{
            if (!flippedYCanvas){
              selectedContext.drawImage(texture.image, nox, noy, imgWidth/repeatX, imgHeight/repeatY);
              nox += imgWidth/repeatX;
            }else{
              selectedContext.drawImage(texture.image, flippedYOffsetX, 0, imgWidth/repeatX, -1*imgHeight/repeatY);
              flippedYOffsetX += imgWidth/repeatX;
              //this.debugCanvas(flippedYCanvas);
            }
          }
          mirrorStepX ++;
        }
        mirrorStepX = 0;
        mirrorStepY ++;
        flippedYOffsetX = 0;
        nox = 0;
        noy += imgHeight/repeatY;
        if (flippedYCanvas){
          //this.debugCanvas(flippedYCanvas);
          foContext.drawImage(flippedYCanvas, 0, 0, imgWidth, imgHeight/repeatY, 0, y, imgWidth, imgHeight/repeatY);
          //this.debugCanvas(foCanvas);
        }
      }

      //this.debugCanvas(foCanvas);
      var layoutCanvas = document.createElement("canvas");
      layoutCanvas.width = 5 * imgWidth;
      layoutCanvas.height = 5 * imgHeight;
      var layoutContext = layoutCanvas.getContext("2d");
      var flCanvas = document.createElement("canvas");
      flCanvas.width = 5 * foCanvas.width;
      flCanvas.height = foCanvas.height;
      var flContext = flCanvas.getContext("2d");
      if (mirrorS){
        var mirrorXCanvasRight = document.createElement("canvas");
        mirrorXCanvasRight.width = foCanvas.width;
        mirrorXCanvasRight.height = foCanvas.height;
        var mirrorXContextRight = mirrorXCanvasRight.getContext("2d");
        mirrorXContextRight.scale(-1, 1);
        mirrorXContextRight.drawImage(foCanvas, 0, 0, -1 * imgWidth, imgHeight);
        //this.debugCanvas(mirrorXCanvasRight);
        //flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
        flContext.drawImage(mirrorXCanvasRight, 0, 0, imgWidth, imgHeight, imgWidth, 0, imgWidth, imgHeight);
        flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, 2 * imgWidth, 0, imgWidth, imgHeight);
        flContext.drawImage(mirrorXCanvasRight, 0, 0, imgWidth, imgHeight, 3 * imgWidth, 0, imgWidth, imgHeight);
        //flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, 4 * imgWidth, 0, imgWidth, imgHeight);
        //this.debugCanvas(flCanvas);
      }else{
        //flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
        flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, imgWidth, 0, imgWidth, imgHeight);
        flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, 2 * imgWidth, 0, imgWidth, imgHeight);
        flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, 3 * imgWidth, 0, imgWidth, imgHeight);
        //flContext.drawImage(foCanvas, 0, 0, imgWidth, imgHeight, 4 * imgWidth, 0, imgWidth, imgHeight);
        //this.debugCanvas(flCanvas);
      }
      if (mirrorT){
        var mirrorYCanvas1 = document.createElement("canvas");
        mirrorYCanvas1.width = flCanvas.width;
        mirrorYCanvas1.height = flCanvas.height;
        var mirrorYContext1 = mirrorYCanvas1.getContext("2d");
        mirrorYContext1.scale(1, -1);
        mirrorYContext1.drawImage(flCanvas, 0, 0, flCanvas.width, -1*flCanvas.height);
        //this.debugCanvas(flCanvas);
        //this.debugCanvas(mirrorYCanvas1);
        //layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, 0, 5 * imgWidth, imgHeight);
        layoutContext.drawImage(mirrorYCanvas1, 0, 0, 5 * imgWidth, imgHeight, 0, imgHeight, 5 * imgWidth, imgHeight);
        layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, 2 * imgHeight, 5 * imgWidth, imgHeight);
        layoutContext.drawImage(mirrorYCanvas1, 0, 0, 5 * imgWidth, imgHeight, 0, 3 * imgHeight, 5 * imgWidth, imgHeight);
        //layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, 4 * imgHeight, 5 * imgWidth, imgHeight);
        //this.debugCanvas(layoutCanvas);
      }else{
        //layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, 0, 5 * imgWidth, imgHeight);
        layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, imgHeight, 5 * imgWidth, imgHeight);
        layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, 2 * imgHeight, 5 * imgWidth, imgHeight);
        layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, 3 * imgHeight, 5 * imgWidth, imgHeight);
        //layoutContext.drawImage(flCanvas, 0, 0, 5 * imgWidth, imgHeight, 0, 4 * imgHeight, 5 * imgWidth, imgHeight);
        //this.debugCanvas(layoutCanvas);
      }
      var sx = 2 * imgWidth;
      var sy = 2 * imgHeight;
      var tx = texture.offset.x % 2;
      var ty = texture.offset.y % 2;
      if (texture.offset.x == 0 && texture.offset.y == 0){
        if (textureName.indexOf(",emissive") !== -1){
          var tmpTexture = texturesObj[textureName.replace(",emissive", ",diffuse")];
          if (tmpTexture){
            tx = tmpTexture.offset.x % 2;
            ty = tmpTexture.offset.y % 2;
          }
        }
      }
      // D E B U G
      //layoutContext.beginPath();
      //layoutContext.lineWidth="6";
      //layoutContext.strokeStyle="red";
      //layoutContext.rect(sx + (imgWidth * tx / repeatX), sy - (imgHeight * ty / repeatY), imgWidth, imgHeight);
      //layoutContext.stroke();
      //layoutContext.beginPath();
      //layoutContext.strokeStyle="green";
      //layoutContext.rect(sx, sy, imgWidth, imgHeight);
      //layoutContext.stroke();
      //this.debugCanvas(layoutCanvas);
      context.drawImage(layoutCanvas, sx + (imgWidth * tx / repeatX), sy - (imgHeight * ty / repeatY), imgWidth, imgHeight, offsetX, offsetY, imgWidth, imgHeight);

    }

    var range = new Object();
    range.startU = offsetX / imgSize.width;
    range.endU = (offsetX + imgWidth) / imgSize.width;
    range.startV = 1 - (offsetY / imgSize.height);
    range.endV = 1 - ((offsetY + imgHeight) / imgSize.height);
    this.ranges[textureName] = range;
  }

  //this.debugImages(imgSize);

  //this.mergedTexture = new THREE.CanvasTexture(this.canvas);

  this.mergedTexture = new THREE.CanvasTexture(this.canvas);
  this.mergedTexture.generateMipmaps = false;
  this.mergedTexture.magFilter = THREE.NearestFilter;
  this.mergedTexture.minFilter = THREE.LinearFilter;
  this.mergedTexture.mapping = THREE.UVMapping;
  this.mergedTexture.mipmaps[ 0 ] = this.canvas;
  var scale = 0.5;
  for (var i = 1; i<=7 ; i++){
    this.mergedTexture.mipmaps[i] = this.rescale(this.canvas, scale);
    //this.debugCanvas(this.mergedTexture.mipmaps[i]);
    scale = scale / 2;
  }

  //console.log("[*] Textures merged: "+explanationStr);

}

TextureMerger.prototype.insert = function(node, textureName, texturesObj){
  var texture = texturesObj[textureName];
  var tw = texture.image.width;
  var th = texture.image.height;
  if (node.upperNode){
    var minArea = (this.maxWidth * this.textureCount * this.maxHeight * this.textureCount);
    var minAreaNode = 0;
    var inserted = false;
    for (var i = 0; i<this.allNodes.length; i++){
      var curNode = this.allNodes[i];
      if (!curNode.textureName && curNode.rectangle.fits(texture)){
        this.textureOffsets[textureName] = {x: curNode.rectangle.x, y: curNode.rectangle.y};
        var calculatedSize = this.calculateImageSize(texturesObj);
        var calculatedArea = calculatedSize.width * calculatedSize.height;
        if (calculatedArea < minArea){
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
      console.error("TextureMerger error: Texture not inserted: "+textureName);
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

TextureMerger.prototype.debugImages = function(imgSize){
  var newTab = window.open();
  var img = new Image(imgSize.width, imgSize.height);
  img.src = this.canvas.toDataURL();
  newTab.document.body.appendChild(img);
}

TextureMerger.prototype.debugCanvas = function(canvas){
  var context = canvas.getContext("2d");
  var newTab = window.open();
  var img = new Image(canvas.width, canvas.height);
  img.src = canvas.toDataURL();
  newTab.document.body.appendChild(img);
}

TextureMerger.prototype.debugOffsets = function(texturesObj){
  var canvas = document.createElement("canvas");
  canvas.width = this.maxWidth * this.textureCount;
  canvas.height = this.maxHeight * this.textureCount;
  var context = canvas.getContext("2d");
  context.font = "20px Arial";
  for (textureName in this.textureOffsets){
    var texture = texturesObj[textureName];
    var tw = texture.image.width;
    var th = texture.image.height;
    var x = this.textureOffsets[textureName].x;
    var y = this.textureOffsets[textureName].y;
    context.rect(x, y, tw, th);
    context.fillText(textureName, x+(tw/2), y+(th/2));
    context.stroke();
  }
  var newTab = window.open();
  var img = new Image(this.maxWidth * this.textureCount, this.maxHeight * this.textureCount);
  img.src = canvas.toDataURL();
  newTab.document.body.appendChild(img);
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
