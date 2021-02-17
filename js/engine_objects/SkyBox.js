var SkyBox = function(name, directoryName, color, isHDR){
  this.name = name;
  this.directoryName = directoryName;
  this.color = color;

  this.isHDR = isHDR;

  this.hasBack = false;
  this.hasDown = false;
  this.hasFront = false;
  this.hasLeft = false;
  this.hasRight = false;
  this.hasUp = false;

  this.uniformCache = null;

  if (isHDR){
    this.toneMappingInfo = {exposure: 1};
  }
}

SkyBox.prototype.debugPMREM = function(){
  var testMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200), new THREE.MeshBasicMaterial({color: "white"}));
  scene.add(testMesh);

  testMesh.material.map = this.getPMREM();
}

SkyBox.prototype.getPMREM = function(){
  var hdrCubeMap = this.cubeTexture;
  var pmremGenerator = new THREE.PMREMGenerator(hdrCubeMap);
  pmremGenerator.update(renderer.webglRenderer);

  var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
  pmremCubeUVPacker.update(renderer.webglRenderer);

  var hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

  pmremGenerator.dispose();
  pmremCubeUVPacker.dispose();

  return hdrCubeRenderTarget.texture;
}

SkyBox.prototype.getUniform = function(){
  if (!this.uniformCache){
    if (this.isHDR){
      this.uniformCache = new THREE.Uniform(this.getPMREM());
    }else{
      this.uniformCache = new THREE.Uniform(this.cubeTexture);
    }
  }

  return this.uniformCache;
}

SkyBox.prototype.clone = function(){
  var skybox = new SkyBox(this.name, this.directoryName, this.color, this.isHDR);

  if (this.toneMappingInfo){
    skybox.toneMappingInfo = JSON.parse(JSON.stringify(this.toneMappingInfo));
  }

  return skybox;
}

SkyBox.prototype.dispose = function(){
  if (this.isHDR){
    return;
  }
  this.backTexture.dispose();
  this.downTexture.dispose();
  this.frontTexture.dispose();
  this.leftTexture.dispose();
  this.rightTexture.dispose();
  this.upTexture.dispose();
  this.cubeTexture.dispose();
}

SkyBox.prototype.export = function(isBuildingForDeploymentMode){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.directoryName = this.directoryName;
  exportObject.color = this.color;
  exportObject.isHDR = this.isHDR;

  if (this.isHDR){
    exportObject.toneMappingInfo = JSON.parse(JSON.stringify(this.toneMappingInfo));
  }

  if (isBuildingForDeploymentMode){
    if (this.isHDR){
      exportObject.noCompress = true;
    }else{
      for (var instanceName in modelInstances){
        var modelInstance = modelInstances[instanceName];
        if (modelInstance.environmentMapInfo && modelInstance.environmentMapInfo.skyboxName == this.name){
          exportObject.noCompress = true;
          break;
        }
      }
    }
  }

  return exportObject;
}

SkyBox.prototype.loadTexture = function(textureName, textureObjectName, textureAvailibilityObjectName, callback){
  var loader = (isDeployment && !this.noCompress)? textureLoaderFactory.get(): textureLoaderFactory.getDefault();
  var postfix = (isDeployment && !this.noCompress)? textureLoaderFactory.getFilePostfix(): textureLoaderFactory.getDefaultFilePostfix();
  var path = skyBoxRootDirectory + this.directoryName + "/" +textureName + postfix;
  var that = this;
  loader.load(path, function(textureData){
    that[textureObjectName] = textureData;
    that[textureAvailibilityObjectName] = true;
    that.callbackCheck(callback);
  }, function(xhr){

  }, function(xhr){
    that[textureAvailibilityObjectName] = false;
    that.callbackCheck(callback);
  });
}

SkyBox.prototype.loadHDR = function(callback){
  var that = this;
  var prefix = skyBoxRootDirectory + this.directoryName + "/";
  var paths = [prefix + "right.hdr", prefix + "left.hdr", prefix + "up.hdr", prefix + "down.hdr", prefix + "front.hdr", prefix + "back.hdr"];
  new THREE.HDRCubeTextureLoader().load(THREE.UnsignedByteType, paths, function(hdrCubeMap){
    that.cubeTexture = hdrCubeMap;
    that.cubeTexture.needsUpdate = true;
    that.imageSize = hdrCubeMap.image[0].image.width;
    callback();
  }, noop, noop);
}

SkyBox.prototype.loadTextures = function(callback){
  if (this.isHDR){
    this.loadHDR(callback);
    return;
  }

  var textureInfos = [
    ["back", "backTexture", "hasBack"],
    ["down", "downTexture", "hasDown"],
    ["front", "frontTexture", "hasFront"],
    ["left", "leftTexture", "hasLeft"],
    ["right", "rightTexture", "hasRight"],
    ["up", "upTexture", "hasUp"]
  ];
  for (var i = 0; i<textureInfos.length; i++){
    this.loadTexture(textureInfos[i][0], textureInfos[i][1], textureInfos[i][2], callback);
  }
}

SkyBox.prototype.isUsable = function(){
  return (
    this.hasBack &&
    this.hasDown &&
    this.hasFront &&
    this.hasLeft &&
    this.hasRight &&
    this.hasUp
  );
}

SkyBox.prototype.handleCompressedCubemap = function(cubemap){
  cubemap.format = cubemap.images[0].format;
  cubemap.generateMipmaps = false;
  cubemap.minFilter = THREE.LinearFilter;
  cubemap.needsUpdate = true;
}

SkyBox.prototype.callbackCheck = function(callback){
  if (this.isUsable()){
    if (textureLoaderFactory.isCompressionSupported() && isDeployment && !this.noCompress){
      this.cubeTexture = new THREE.CubeTexture([
        this.rightTexture, this.leftTexture,
        this.upTexture, this.downTexture,
        this.frontTexture, this.backTexture
      ]);
      this.handleCompressedCubemap(this.cubeTexture);
    }else{
      this.cubeTexture = new THREE.CubeTexture([
        this.rightTexture.image, this.leftTexture.image,
        this.upTexture.image, this.downTexture.image,
        this.frontTexture.image, this.backTexture.image
      ]);
    }
    this.cubeTexture.needsUpdate = true;
    if (callback){
      this.imageSize = this.rightTexture.image.width;
      callback();
    }
  }
}
