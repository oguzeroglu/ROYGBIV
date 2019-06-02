var textureCompressor = require("texture-compressor");
var fs = require("fs");

var type = process.argv[2];
var fileName = process.argv[3];
var mainPath = process.argv[4];
var flipY = process.argv[5];
var useJPG = process.argv[6];

if (typeof flipY == "string"){
  flipY = flipY.toLowerCase() == "true";
}
if (typeof useJPG == "string"){
  useJPG = useJPG.toLowerCase() == "true"
}

compressTexture(type, fileName, mainPath);

function compressTexture(type, fileName, mainPath){
  var quality, compression;
  var inputExtension;
  if (useJPG){
    if (fs.existsSync(mainPath+"/"+fileName+".jpg")){
      inputExtension = "jpg";
    }else if(fs.existsSync(mainPath+"/"+fileName+".jpeg")){
      inputExtension = "jpeg";
    }else{
      throw new Error("Fallback texture not provided.");
    }
  }else{
    inputExtension = "png";
  }
  var output = mainPath+"/"+fileName+"-"+type+".ktx";
  switch(type){
    case "astc":
      quality = "astcmedium";
      compression = "ASTC_4x4";
    break;
    case "pvrtc":
      quality = "pvrtcnormal";
      compression = "PVRTC1_4";
    break;
    case "s3tc":
      quality = "normal";
      compression = "DXT1A";
    break;
  }
  return textureCompressor.pack({
    type: type,
    input: mainPath+"/"+fileName+"."+inputExtension,
    output: output,
    compression: compression,
    quality: quality,
    verbose: true,
    flipY: flipY
  });
}
