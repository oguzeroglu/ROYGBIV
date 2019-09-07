var TextureLoaderFactory = function(){
  this.textureLoader = new THREE.TextureLoader();
  this.ktxLoader = new THREE.KTXLoader();
}

TextureLoaderFactory.prototype.isCompressionSupported = function(){
  return ASTC_SUPPORTED || PVRTC_SUPPORTED || S3TC_SUPPORTED;
}

TextureLoaderFactory.prototype.getFilePostfix = function(){
  if (ASTC_SUPPORTED){
    return "-astc.ktx";
  }
  if (PVRTC_SUPPORTED){
    return "-pvrtc.ktx";
  }
  if (S3TC_SUPPORTED){
    return "-s3tc.ktx";
  }
  return ".png";
}

TextureLoaderFactory.prototype.get = function(){
  if (ASTC_SUPPORTED || S3TC_SUPPORTED || PVRTC_SUPPORTED){
    return this.ktxLoader;
  }
  return this.textureLoader;
}

TextureLoaderFactory.prototype.getDefault = function(){
  return this.textureLoader;
}
