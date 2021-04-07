var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");
var sizeOf = require("image-size");
var minify = require("minify");

console.log("*******************************************")
console.log( " ____   _____   ______ ____ _____     __ ");
console.log( "|  _ \\ / _ \\ \\ / / ___| __ )_ _\\ \\   / / ");
console.log( "| |_) | | | \\ V / |  _|  _ \\| | \\ \\ / /  ");
console.log( "|  _ <| |_| || || |_| | |_) | |  \\   /   ");
console.log( "|_| \\_\\\\___/ |_| \\____|____/___|  \\_/    ");
console.log("\n*******************************************");

app = express();

app.use(bodyParser.json({
  parameterLimit: 1000000,
  limit: '500mb',
  extended: true
}));
app.use(bodyParser.urlencoded({
  parameterLimit: 1000000,
  limit: '500mb',
  extended: true
}));
app.use(bodyParser.raw({type: 'application/octet-stream', limit : '500mb'}));

app.get("/", function(req, res){
  console.log("[*] A new request received.");
	res.sendFile(__dirname + "/roygbiv.html");
});

app.post("/build", function(req, res){
  console.log("[*] Building "+req.body.projectName);
  res.setHeader('Content-Type', 'application/json');
  try{
    if (!generateDeployDirectory(req.body.projectName, req.body)){
      res.send(JSON.stringify({ "error": "A project with the same name alreay exists under deploy folder."}));
      return;
    }

    var engineScriptsConcatted = readEngineScripts(req.body.projectName, req.body.author, req.body.ENABLE_ANTIALIAS, req.body.modules, req.body.bootscreenFolderName, req.body.disabledShaderInfo);
    var roygbivPath = "deploy/"+req.body.projectName+"/js/roygbiv.js";
    fs.writeFileSync(roygbivPath, handleScripts(req.body, engineScriptsConcatted));
    minify(roygbivPath).then(function(minified){
      fs.unlinkSync(roygbivPath);
      fs.writeFileSync(roygbivPath, minified);
      fs.writeFileSync("deploy/"+req.body.projectName+"/js/application.json", JSON.stringify(req.body));
      copyAssets(req.body);
      copyWorkers(req.body);
      copyProtocolDefinitionFile(req.body);
      cleanup(req.body.projectName);
      res.send(JSON.stringify({"path": __dirname+"/deploy/"+req.body.projectName+"/"}));
      return;
    }).catch(function(err){
      res.send(JSON.stringify({"error": "Build error: "+err.message}));
      throw new Error(err);
      return;
    });
  }catch (err){
    res.send(JSON.stringify({"error": "Build error: "+err.message}));
    throw new Error(err);
    return;
  }
});

app.post("/getTexturePackFolders", function(req, res){
  console.log("[*] Getting texture pack folders.");
  var acceptedTextureSize = req.body.acceptedTextureSize;
  res.setHeader('Content-Type', 'application/json');
  var folders = [];
  var dirs = fs.readdirSync("texture_packs").filter(f => {
    var joined = path.join("./texture_packs/", f);
    if (fs.existsSync(joined)){
      return fs.statSync(joined).isDirectory();
    }
  });
  for (var i = 0; i<dirs.length; i++){
    var texturePackFolder = path.join("./texture_packs/", dirs[i]);
    if (fs.readdirSync(texturePackFolder).indexOf("diffuse.png") > -1){
      var dimensions = sizeOf(path.join(texturePackFolder, "diffuse.png"));
      if (dimensions.width == acceptedTextureSize && dimensions.height == acceptedTextureSize){
        folders.push(dirs[i]);
      }
    }
  }
  console.log("[*] Found "+folders.length+" texture packs.");
  res.send(JSON.stringify(folders));
});

app.post("/getSkyboxFolders", function(req, res){
  console.log("[*] Getting skybox folders.");
  res.setHeader("Content-Type", "application/json");
  var textureNames = ["back.png", "down.png", "front.png", "left.png", "right.png", "up.png"];
  var hdrTextureNames = ["back.hdr", "down.hdr", "front.hdr", "left.hdr", "right.hdr", "back.hdr"];
  var folders = [];
  var dirs = fs.readdirSync("skybox").filter(f => {
    var joined = path.join("./skybox/", f);
    if (fs.existsSync(joined)){
      return fs.statSync(joined).isDirectory();
    }
  });
  for (var i = 0; i<dirs.length; i++){
    var skyboxFolder = path.join("./skybox/", dirs[i]);
    var files = fs.readdirSync(skyboxFolder);
    var put = true;
    var isHDR = false;
    for (var i2 = 0; i2<textureNames.length; i2++){
      if (files.indexOf(textureNames[i2]) <= -1){
        put = false;
      }
    }

    if (!put){
      put = true;
      for (var i2 = 0; i2<hdrTextureNames.length; i2++){
        if (files.indexOf(hdrTextureNames[i2]) <= -1){
          put = false;
        }
      }

      if (put){
        isHDR = true;
      }
    }
    if (put){
      folders.push({dirName: dirs[i], isHDR: isHDR});
    }
  }
  console.log("[*] Found "+folders.length+" skyboxes.");
  res.send(JSON.stringify(folders));
});

app.post("/getFonts", function(req, res){
  console.log("[*] Getting fonts.");
  res.setHeader("Content-Type", "application/json");
  var fonts = fs.readdirSync("fonts").filter(f => {
    return !fs.statSync(path.join("./fonts/", f)).isDirectory() && (f.toLowerCase().endsWith(".ttf"));
  });
  res.send(JSON.stringify(fonts));
});

app.post("/getScripts", function(req, res){
  console.log("[*] Getting scripts.");
  res.setHeader("Content-Type", "application/json");
  var scriptDescription = new Object();
  getScriptsInFolder("./scripts/", scriptDescription);
  res.send(JSON.stringify(scriptDescription));
});

app.post("/getModules", function(req, res){
  console.log("[*] Getting modules.");
  res.setHeader("Content-Type", "application/json");
  var modules = [];
  fs.readdirSync("./modules/").forEach(file => {
    if (file.endsWith(".js")){
      modules.push(file.split(".").slice(0, -1).join("."));
    }
  });
  res.send(JSON.stringify(modules));
});

app.post("/getTexturePackInfo", async function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var mainPath = "./texture_packs/"+req.body.texturePackName;
  res.send(JSON.stringify({
    hasDiffuse: fs.existsSync(mainPath+"/diffuse.png"),
    hasAlpha: fs.existsSync(mainPath+"/alpha.png"),
    hasAO: fs.existsSync(mainPath+"/ao.png"),
    hasEmissive: fs.existsSync(mainPath+"/emissive.png"),
    hasHeight: fs.existsSync(mainPath+"/height.png")
  }));
});

app.post("/prepareDynamicTextures", async function(req, res){
  console.log("[*] Preparing dynamic textures");
  var folderName = req.body.folderName;
  var noCompress = req.body.noCompress;
  var path = "./dynamic_textures/"+folderName;
  if (!fs.existsSync(path)){
    res.send(JSON.stringify({folderDoesNotExist: true}));
    return;
  }

  if (noCompress){
    res.send(JSON.stringify({ok: true}));
    return;
  }

  var files = fs.readdirSync(path);
  var types = ["astc", "pvrtc", "s3tc"];
  for (var i = 0; i<files.length; i++){
    var lower = files[i].toLowerCase();
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")){
      var fileName = files[i].split(".")[0];
      for (var i2 = 0; i2<types.length; i2++){
        var result = await compressTexture(types[i2], fileName, path, true, false, false);
        if (result == "UNSUCC"){
          result = await compressTexture(types[i2], fileName, path, true, true, false);
          if (result == "UNSUCC"){
            res.send(JSON.stringify({errorFile: files[i]}));
            return;
          }
        }
      }
    }
  }
  res.send(JSON.stringify({ok: true}));
});

app.post("/prepareSkybox", async function(req, res){
  console.log("Preparing skybox: "+req.body.skyboxFolderName);
  res.setHeader('Content-Type', 'application/json');
  var mainPath = "./skybox/"+req.body.skyboxFolderName;
  var compressInfo = [
    ["astc", "back", mainPath], ["pvrtc", "back", mainPath], ["s3tc", "back", mainPath],
    ["astc", "down", mainPath], ["pvrtc", "down", mainPath], ["s3tc", "down", mainPath],
    ["astc", "front", mainPath], ["pvrtc", "front", mainPath], ["s3tc", "front", mainPath],
    ["astc", "left", mainPath], ["pvrtc", "left", mainPath], ["s3tc", "left", mainPath],
    ["astc", "right", mainPath], ["pvrtc", "right", mainPath], ["s3tc", "right", mainPath],
    ["astc", "up", mainPath], ["pvrtc", "up", mainPath], ["s3tc", "up", mainPath],
  ];
  for (var i = 0; i<compressInfo.length; i++){
    var result = await compressTexture(compressInfo[i][0], compressInfo[i][1], compressInfo[i][2], false, false, false);
    if (result == "UNSUCC"){
      console.log("[!] Error happened trying to compress: "+compressInfo[i][1]+" with "+compressInfo[i][0]);
      result = await compressTexture(compressInfo[i][0], compressInfo[i][1], compressInfo[i][2], false, true, false);
      if (result == "UNSUCC"){
        res.send(JSON.stringify({error: true, texture: compressInfo[i][1]}));
        return;
      }else{
        console.log("[*] Compressed "+compressInfo[i][1]+" texture using fallback format.");
      }
    }
  }
  res.send(JSON.stringify({error: false}));
});

app.post("/compressTextureAtlas", async function(req, res){
  console.log("[*] Compressing texture atlas.");
  var hasPNGBackup = false;
  var hasASTCBackup = false;
  var hasPVRTCBackup = false;
  var hasS3TCBackup = false;
  if (fs.existsSync("./texture_atlas/textureAtlas.png")){
    console.log("[*] Backing up PNG atlas.");
    fs.renameSync("./texture_atlas/textureAtlas.png", "./texture_atlas/textureAtlas-backup.png");
    hasPNGBackup = true;
  }
  if (fs.existsSync("./texture_atlas/textureAtlas-astc.ktx")){
    console.log("[*] Backing up ASTC atlas.");
    fs.renameSync("./texture_atlas/textureAtlas-astc.ktx", "./texture_atlas/textureAtlas-astc-backup.ktx");
    hasASTCBackup = true;
  }
  if (fs.existsSync("./texture_atlas/textureAtlas-pvrtc.ktx")){
    console.log("[*] Backing up PVRTC atlas.");
    fs.renameSync("./texture_atlas/textureAtlas-pvrtc.ktx", "./texture_atlas/textureAtlas-pvrtc-backup.ktx");
    hasPVRTCBackup = true;
  }
  if (fs.existsSync("./texture_atlas/textureAtlas-s3tc.ktx")){
    console.log("[*] Backing up S3TC atlas.");
    fs.renameSync("./texture_atlas/textureAtlas-s3tc.ktx", "./texture_atlas/textureAtlas-s3tc-backup.ktx");
    hasS3TCBackup = true;
  }
  try{
    var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("./texture_atlas/textureAtlas.png", base64Data, "base64");
    console.log("[*] PNG saved to disk.");
    res.setHeader('Content-Type', 'application/json');
    var compressInfo = [];
    compressInfo.push(["astc", "textureAtlas", "./texture_atlas"]);
    compressInfo.push(["pvrtc", "textureAtlas", "./texture_atlas"]);
    compressInfo.push(["s3tc", "textureAtlas", "./texture_atlas"]);
    for (var i = 0; i<compressInfo.length; i++){
      var result = await compressTexture(compressInfo[i][0], compressInfo[i][1], compressInfo[i][2], true, false, true);
      if (result == "UNSUCC"){
        res.send(JSON.stringify({error: true}));
        handleAtlasBackup(true, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup, false);
        return;
      }
    }
    handleAtlasBackup(false, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup, false);
    res.send(JSON.stringify({error: false}));
  }catch (err){
    console.log(err);
    res.send(JSON.stringify({error: true}));
    handleAtlasBackup(true, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup, false);
  }
});

app.post("/compressShadowAtlas", async function(req, res){
  console.log("[*] Compressing texture atlas.");
  var hasPNGBackup = false;
  var hasASTCBackup = false;
  var hasPVRTCBackup = false;
  var hasS3TCBackup = false;
  if (fs.existsSync("./texture_atlas/shadowAtlas.png")){
    console.log("[*] Backing up PNG shadow atlas.");
    fs.renameSync("./texture_atlas/shadowAtlas.png", "./texture_atlas/shadowAtlas-backup.png");
    hasPNGBackup = true;
  }
  if (fs.existsSync("./texture_atlas/shadowAtlas-astc.ktx")){
    console.log("[*] Backing up ASTC shadow atlas.");
    fs.renameSync("./texture_atlas/shadowAtlas-astc.ktx", "./texture_atlas/shadowAtlas-astc-backup.ktx");
    hasASTCBackup = true;
  }
  if (fs.existsSync("./texture_atlas/shadowAtlas-pvrtc.ktx")){
    console.log("[*] Backing up PVRTC shadow atlas.");
    fs.renameSync("./texture_atlas/shadowAtlas-pvrtc.ktx", "./texture_atlas/shadowAtlas-pvrtc-backup.ktx");
    hasPVRTCBackup = true;
  }
  if (fs.existsSync("./texture_atlas/shadowAtlas-s3tc.ktx")){
    console.log("[*] Backing up S3TC shadow atlas.");
    fs.renameSync("./texture_atlas/shadowAtlas-s3tc.ktx", "./texture_atlas/shadowAtlas-s3tc-backup.ktx");
    hasS3TCBackup = true;
  }
  try{
    var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("./texture_atlas/shadowAtlas.png", base64Data, "base64");
    console.log("[*] PNG saved to disk.");
    res.setHeader('Content-Type', 'application/json');
    var compressInfo = [];
    compressInfo.push(["astc", "shadowAtlas", "./texture_atlas"]);
    compressInfo.push(["pvrtc", "shadowAtlas", "./texture_atlas"]);
    compressInfo.push(["s3tc", "shadowAtlas", "./texture_atlas"]);
    for (var i = 0; i<compressInfo.length; i++){
      var result = await compressTexture(compressInfo[i][0], compressInfo[i][1], compressInfo[i][2], true, false, true);
      if (result == "UNSUCC"){
        res.send(JSON.stringify({error: true}));
        handleAtlasBackup(true, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup, true);
        return;
      }
    }
    handleAtlasBackup(false, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup, true);
    res.send(JSON.stringify({error: false}));
  }catch (err){
    console.log(err);
    res.send(JSON.stringify({error: true}));
    handleAtlasBackup(true, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup, true);
  }
});

app.post("/compressFont", async function(req, res){
  console.log("[*] Compressing font.");
  var fontName = req.body.name;
  var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
  if (!fs.existsSync("./texture_atlas/fonts/"+fontName)){
    fs.mkdirSync("./texture_atlas/fonts/"+fontName);
  }
  fs.writeFileSync("./texture_atlas/fonts/"+fontName+"/pack.png", base64Data, "base64");
  console.log("[*] PNG saved to disk.");
  var compressInfo = [];
  compressInfo.push(["astc", "pack", "./texture_atlas/fonts/"+fontName]);
  compressInfo.push(["pvrtc", "pack", "./texture_atlas/fonts/"+fontName]);
  compressInfo.push(["s3tc", "pack", "./texture_atlas/fonts/"+fontName]);
  for (var i = 0; i<compressInfo.length; i++){
    var result = await compressTexture(compressInfo[i][0], compressInfo[i][1], compressInfo[i][2], true, false, true);
    if (result == "UNSUCC"){
      res.send(JSON.stringify({error: true}));
      return;
    }
  }
  res.send(JSON.stringify({error: false}));
});

app.post("/checkBootscreenFolder", function(req, res){
  console.log("[*] Checking bootscren folder");
  var folderName = req.body.folderName;
  if (fs.existsSync("./bootscreens/" + folderName)){
    if (fs.existsSync("./bootscreens/" + folderName + "/component.html")){
      res.send(JSON.stringify({}));
    }else{
      res.send(JSON.stringify({
        error: {
          notValid: true
        }
      }));
    }
  }else{
    res.send(JSON.stringify({
      error: {
        noFolder: true
      }
    }));
  }
});

app.post("/checkProtocolDefinitionFile", function(req, res){
  console.log("[*] Checking protocol definition file.");
  var fileName = req.body.fileName;
  if (!fs.existsSync("./protocol_definitions/"+fileName)){
    res.send(JSON.stringify({error: true}));
  }else{
    res.send(JSON.stringify({error: false}));
  }
});

app.post("/getModels", function(req, res){
  var modelFolders = [];

  var acceptedTextureSize = req.body.acceptedTextureSize;

  var getAllImagePaths = function(path){
    var result = [];

    fs.readdirSync(path).forEach(childFileName => {
      if (fs.lstatSync(path + "/" + childFileName).isDirectory()){
        result = result.concat(getAllImagePaths(path + "/" + childFileName));
      }

      var lowerCase = childFileName.toLowerCase();
      if (lowerCase.endsWith(".png") || lowerCase.endsWith(".jpg") || lowerCase.endsWith(".jpeg")){
        result.push(path + "/" + childFileName);
      }
    });

    return result;
  }

  fs.readdirSync("./models/").forEach(fileName => {
    var path = "./models/" + fileName;
    if (!fs.lstatSync(path).isDirectory()){
      return;
    }

    const allImagePaths = getAllImagePaths(path);
    for (var i = 0; i < allImagePaths.length; i ++){
      var dimensions = sizeOf(allImagePaths[i]);
      if (dimensions.width != acceptedTextureSize || dimensions.height != acceptedTextureSize){
        return;
      }
    }

    var mtlFileName = null;
    var objFileName = null;
    var arModelNames = [];
    fs.readdirSync(path + "/").forEach(childFileName => {
      if (childFileName.toLowerCase().endsWith(".mtl")){
        mtlFileName = childFileName;
      }else if (childFileName.toLowerCase().endsWith(".obj")){
        objFileName = childFileName;
      }
    });

    if (fs.existsSync(path + "/ar/")){
      var arModelsMap = {};
      fs.readdirSync(path + "/ar/").forEach(childFileName => {
        if (childFileName.toLowerCase().endsWith(".usdz")){
          var arModelName = childFileName.split(".")[0];
          if (arModelsMap[arModelName]){
            arModelsMap[arModelName].hasUSDZ = true;
          }else{
            arModelsMap[arModelName] = {hasUSDZ: true};
          }
        }else if (childFileName.toLowerCase().endsWith(".glb")){
          var arModelName = childFileName.split(".")[0];
          if (arModelsMap[arModelName]){
            arModelsMap[arModelName].hasGLB = true;
          }else{
            arModelsMap[arModelName] = {hasGLB: true};
          }
        }
      });

      for (var key in arModelsMap){
        if (arModelsMap[key].hasUSDZ && arModelsMap[key].hasGLB){
          arModelNames.push(key);
        }
      }
    }

    if (mtlFileName != null && objFileName != null){
      modelFolders.push({
        folder: fileName,
        obj: objFileName,
        mtl: mtlFileName,
        arModelNames: arModelNames
      });
    }
  });

  res.send(JSON.stringify(modelFolders));
});

app.post("/createRMIFFile", function(req, res){
  var folderName = req.query.folderName;
  var buffers = [];
  req.on("data", function(chunk) {
    buffers.push(chunk);
  });

  req.on("end", function(){
    var data = Buffer.concat(buffers);
    fs.writeFileSync("./models/" + folderName + "/model.rmif", data);
    res.send({});
  });
});

app.post("/createRMFFile", function(req, res){
  var folderName = req.query.folderName;
  var buffers = [];
  req.on("data", function(chunk) {
    buffers.push(chunk);
  });

  req.on("end", function(){
    var data = Buffer.concat(buffers);
    fs.writeFileSync("./models/" + folderName + "/model.rmf", data);
    res.send({});
  });
});

function getScriptsInFolder(curPath, obj){
  var files = fs.readdirSync(curPath);
  for (var i = 0; i<files.length; i++){
    var f = files[i];
    var joined = path.join(curPath, f);
    var key = joined.substr(8);
    if (fs.statSync(joined).isDirectory()){
      if (!obj[key]){
        obj[key] = new Object();
      }
      getScriptsInFolder(joined, obj[key]);
    }else if (f.toLowerCase().endsWith(".js")){
      obj[f] = false;
    }
  }
}

function handleBackup(restore, filePath, backupFilePath){
  if (restore){
    if (fs.existsSync(filePath)){
      fs.unlinkSync(filePath);
    }
    fs.renameSync(backupFilePath, filePath);
  }else{
    fs.unlinkSync(backupFilePath);
  }
}

function handleAtlasBackup(restore, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup, isShadow){
  var fileName = isShadow? "shadowAtlas": "textureAtlas";
  if (hasPNGBackup){
    handleBackup(restore, "./texture_atlas/" + fileName + ".png", "./texture_atlas/" + fileName + "-backup.png");
  }
  if (hasASTCBackup){
    handleBackup(restore, "./texture_atlas/" + fileName + "-astc.ktx", "./texture_atlas/" + fileName + "-astc-backup.ktx");
  }
  if (hasPVRTCBackup){
    handleBackup(restore, "./texture_atlas/" + fileName + "-pvrtc.ktx", "./texture_atlas/" + fileName + "-pvrtc-backup.ktx");
  }
  if (hasS3TCBackup){
    handleBackup(restore, "./texture_atlas/" + fileName + "-s3tc.ktx", "./texture_atlas/" + fileName + "-s3tc-backup.ktx");
  }
}

function compressTexture(type, fileName, mainPath, flipY, useJPG, overwrite){
  var output = mainPath+"/"+fileName+"-"+type+".ktx";
  if (fs.existsSync(output) && !overwrite){
    return new Promise(function(resolve, reject){resolve("SUCC");});
  }
  return new Promise(function(resolve, reject){
    console.log("[*] Running textureCompressor script for: "+type+", "+fileName);
    runScript("./textureCompressor.js", [type, fileName, mainPath, flipY, useJPG], function(err){
      if (err){
        resolve("UNSUCC");
      }else{
        resolve("SUCC");
      }
    })
  });
}

function copyProtocolDefinitionFile(application){
  if (!application.protocolDefinitionFileName){
    return;
  }
  fs.mkdirSync("deploy/"+application.projectName+"/protocol_definitions/");
  var protocolDefinition = fs.readFileSync("./protocol_definitions/"+application.protocolDefinitionFileName, "utf8");
  fs.writeFileSync("deploy/"+application.projectName+"/protocol_definitions/" + application.protocolDefinitionFileName, protocolDefinition);
}

function copyWorkers(application){
  fs.mkdirSync("deploy/"+application.projectName+"/js/worker/");
  var raycasterWorkerContent = fs.readFileSync("./js/worker/RaycasterWorker.js", "utf8");
  var physicsWorkerContent = fs.readFileSync("./js/worker/PhysicsWorker.js", "utf8");
  var lightningWorkerContent = fs.readFileSync("./js/worker/LightningWorker.js", "utf8");
  var raycasterWorkerContentSplitted = raycasterWorkerContent.split("\n");
  var physicsWorkerContentSplitted = physicsWorkerContent.split("\n");
  var lightningWorkerContentSplitted = lightningWorkerContent.split("\n");
  var workerImportContent = "";
  var imports = new Object();
  for (var i = 0; i<raycasterWorkerContentSplitted.length; i++){
    if (raycasterWorkerContentSplitted[i].startsWith("importScripts")){
      raycasterWorkerContent = raycasterWorkerContent.replace(raycasterWorkerContentSplitted[i], "");
      var path = extractFirstText(raycasterWorkerContentSplitted[i]).replace("..", "js");
      if (!imports[path]){
        workerImportContent += fs.readFileSync(path, "utf8");
        imports[path] = true;
      }
    }
  }
  for (var i = 0; i<physicsWorkerContentSplitted.length; i++){
    if (physicsWorkerContentSplitted[i].startsWith("importScripts")){
      physicsWorkerContent = physicsWorkerContent.replace(physicsWorkerContentSplitted[i], "");
      var path = extractFirstText(physicsWorkerContentSplitted[i]).replace("..", "js");
      if (!imports[path]){
        workerImportContent += fs.readFileSync(path, "utf8");
        imports[path] = true;
      }
    }
  }
  for (var i = 0; i<lightningWorkerContentSplitted.length; i++){
    if (lightningWorkerContentSplitted[i].startsWith("importScripts")){
      lightningWorkerContent = lightningWorkerContent.replace(lightningWorkerContentSplitted[i], "");
      var path = extractFirstText(lightningWorkerContentSplitted[i]).replace("..", "js");
      if (!imports[path]){
        workerImportContent += fs.readFileSync(path, "utf8");
        imports[path] = true;
      }
    }
  }
  raycasterWorkerContent = "importScripts(\"./WorkerImport.js\");\n" + raycasterWorkerContent.trim();
  physicsWorkerContent = "importScripts(\"./WorkerImport.js\");\n" + physicsWorkerContent.trim();
  lightningWorkerContent = "importScripts(\"./WorkerImport.js\");\n" + lightningWorkerContent.trim();
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/RaycasterWorker.js", raycasterWorkerContent);
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/PhysicsWorker.js", physicsWorkerContent);
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/LightningWorker.js", lightningWorkerContent);
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/WorkerImport.js", workerImportContent);

  var rhubarbWorkerContent = fs.readFileSync("./js/third_party/RhubarbWorker.min.js", "utf8");
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/RhubarbWorker.min.js", rhubarbWorkerContent);
}

function handleScripts(application, engineScriptsConcatted){
  var statusText = "";
  var scriptsText = "";
  var len = application.scripts.totalCount;
  var i = 0;
  for (var scriptName in application.scripts.scripts){
    var script = application.scripts.scripts[scriptName];
    if (i != len -1){
      statusText += "SCRIPT_EXECUTION_STATUS_"+scriptName+": false,\n";
    }else{
      statusText += "SCRIPT_EXECUTION_STATUS_"+scriptName+": false\n";
    }
    scriptsText += "if(deploymentScriptsStatus.SCRIPT_EXECUTION_STATUS_"+scriptName+"){"+
      "if (cpuOperationsHandler.record){"+
      "cpuOperationsHandler.scriptPerformances."+scriptName+" = performance.now()" +
      "}" +
      script +
      "if (cpuOperationsHandler.record){" +
      "cpuOperationsHandler.scriptPerformances."+scriptName+" = performance.now() - cpuOperationsHandler.scriptPerformances."+scriptName +
      "}"+
    "}\n"
    i ++;
  }
  engineScriptsConcatted = engineScriptsConcatted.replace("//@DEPLOYMENT_SCRIPTS_STATUS", statusText).replace("//@DEPLOYMENT_SCRIPTS", scriptsText);
  return engineScriptsConcatted;
}

function copyAssets(application){
  copyFileSync("css/FiraMono-Bold.ttf", "deploy/"+application.projectName+"/css/");
  var htmlContent = fs.readFileSync("template/application.html", "utf8");

  if (application.bodyBGColor){
    htmlContent = htmlContent.replace('<body style="background-color:black;">', '<body style="background-color:' + application.bodyBGColor + ';">');
  }

  if (application.bootscreenFolderName){
    var customBootscreenHTML = fs.readFileSync("./bootscreens/" + application.bootscreenFolderName + "/component.html", "utf8");
    var customBootscreenDIV = "<div id='customBootscreen'>@@1</div>".replace("@@1", customBootscreenHTML);
    htmlContent = htmlContent.replace('<textarea id="cliDiv" class="noselect" readonly></textarea>', customBootscreenDIV);

    if (fs.existsSync("./bootscreens/" + application.bootscreenFolderName + "/component.css")){
      var customCSSContent = fs.readFileSync("./bootscreens/" + application.bootscreenFolderName + "/component.css", "utf8");
      htmlContent = htmlContent.replace("/* CSS_INJECTION */", customCSSContent);
    }

    if (fs.existsSync("./bootscreens/" + application.bootscreenFolderName + "/component.ttf")){
      var fontFaceContent = "@font-face {\n" + "font-family: bootscreen;\n" + "src: url(./bootscreens/" + application.bootscreenFolderName + "/component.ttf);\n}";
      htmlContent = htmlContent.replace("/* FONT_INJECTION */", fontFaceContent)
    }

    copyFolderRecursiveSync("./bootscreens/" + application.bootscreenFolderName, "deploy/" + application.projectName + "/bootscreens");
  }

  htmlContent = htmlContent.replace(
    "@@1", application.projectName
  );
  fs.writeFileSync("deploy/"+application.projectName+"/application.html", htmlContent);
  var readmeContent = fs.readFileSync("template/README", "utf8");
  fs.writeFileSync("deploy/"+application.projectName+"/README", readmeContent);
  copyFolderRecursiveSync("third_party_licenses", "deploy/"+application.projectName+"/");
  fs.unlinkSync("deploy/"+application.projectName+"/third_party_licenses/LICENSE_JQUERY_TERMINAL");
  fs.unlinkSync("deploy/"+application.projectName+"/third_party_licenses/LICENSE_DATGUI");
  console.log("[*] Copied third party licenses.");
  copyFileSync("LICENSE", "deploy/"+application.projectName+"/");
  console.log("[*] Copied ROYGBIV license.");
  for (var texturePackName in application.texturePacks){
    var dirName = application.texturePacks[texturePackName].directoryName;
    fs.readdirSync("texture_packs").forEach(file => {
      if (file == dirName){
        copyFolderRecursiveSync("texture_packs/"+file, "deploy/"+application.projectName+"/texture_packs/");
        console.log("[*] Copied a texture pack: "+file);
      }
    });
  }
  if (application.textureAtlas.hasTextureAtlas){
    copyFileSync("texture_atlas/textureAtlas.png", "deploy/"+application.projectName+"/texture_atlas/");
    copyFileSync("texture_atlas/textureAtlas-astc.ktx", "deploy/"+application.projectName+"/texture_atlas/");
    copyFileSync("texture_atlas/textureAtlas-pvrtc.ktx", "deploy/"+application.projectName+"/texture_atlas/");
    copyFileSync("texture_atlas/textureAtlas-s3tc.ktx", "deploy/"+application.projectName+"/texture_atlas/");
    console.log("[*] Copied texture atlas.");
  }
  if (Object.keys(application.shadowBaker.textureRangesByObjectName).length > 0){
    copyFileSync("texture_atlas/shadowAtlas.png", "deploy/"+application.projectName+"/texture_atlas/");
    copyFileSync("texture_atlas/shadowAtlas-astc.ktx", "deploy/"+application.projectName+"/texture_atlas/");
    copyFileSync("texture_atlas/shadowAtlas-pvrtc.ktx", "deploy/"+application.projectName+"/texture_atlas/");
    copyFileSync("texture_atlas/shadowAtlas-s3tc.ktx", "deploy/"+application.projectName+"/texture_atlas/");
    console.log("[*] Copied shadow atlas.");
  }
  for (var skyboxName in application.skyBoxes){
    var dirName = application.skyBoxes[skyboxName].directoryName;
    fs.readdirSync("skybox").forEach(file => {
      if (file == dirName){
        copyFolderRecursiveSync("skybox/"+file, "deploy/"+application.projectName+"/skybox/");
        console.log("[*] Copied a skybox: "+file);
      }
    });
  }
  for (var fontName in application.fonts){
    copyFolderRecursiveSync("texture_atlas/fonts/"+fontName, "deploy/"+application.projectName+"/texture_atlas/fonts/");
    var dirName = "fonts/"+application.fonts[fontName].path;
    fs.readdirSync("fonts").forEach(file => {
      var dirFileName = file.split(".")[0];
      var dirFileExtension = file.split(".")[1];
      if (dirFileExtension){
        dirFileExtension = dirFileExtension.toLowerCase();
      }
      var fileName = application.fonts[fontName].path.split("/")[1].split(".")[0];
      var fileExtension = application.fonts[fontName].path.split("/")[1].split(".")[1];
      if (fileExtension){
        fileExtension = fileExtension.toLowerCase();
      }
      if (dirFileExtension == fileExtension && dirFileName == fileName){
        copyFileSync(application.fonts[fontName].path, "deploy/"+application.projectName+"/fonts/");
        console.log("[*] Copied a font: "+application.fonts[fontName].path);
      }
    });
    console.log("[*] Copied a font: "+fontName);
  }
  for (var folderName in application.dynamicTextureFolders){
    copyFolderRecursiveSync("dynamic_textures/"+folderName, "deploy/"+application.projectName+"/dynamic_textures/");
  }
  for (var modelName in application.models){
    var folderName = application.models[modelName].folderName;
    fs.readdirSync("models").forEach(file => {
      if (file == folderName){
        copyFolderRecursiveSync("models/"+file, "deploy/"+application.projectName+"/models/");
        console.log("[*] Copied a model: " + file);
      }
    });
  }
}

function generateDeployDirectory(projectName, application){
  if (!fs.existsSync("deploy")){
    fs.mkdirSync("deploy");
  }
  if (fs.existsSync("deploy/"+projectName)){
    return false;
  }
  fs.mkdirSync("deploy/"+projectName);
  fs.mkdirSync("deploy/"+projectName+"/js");
  fs.mkdirSync("deploy/"+projectName+"/css");
  fs.mkdirSync("deploy/"+projectName+"/shader");
  var hasTexturePacks = (Object.keys(application.texturePacks).length != 0);
  var hasSkyBoxes = (Object.keys(application.skyBoxes).length != 0);
  var hasFonts = (Object.keys(application.fonts).length != 0);
  var hasDynamicTextureFolders = (Object.keys(application.dynamicTextureFolders) != 0);
  var hasTextureAtlas = application.textureAtlas.hasTextureAtlas;
  var hasShadowAtlas = Object.keys(application.shadowBaker.textureRangesByObjectName).length > 0;
  var hasModels = Object.keys(application.models.length != 0);
  var hasCustomBootScreen = !!application.bootscreenFolderName;
  if (hasTexturePacks){
    fs.mkdirSync("deploy/"+projectName+"/texture_packs");
    console.log("[*] Project has texture packs to load.");
  }else{
    console.log("[*] Project has no texture packs to load.");
  }
  if (hasSkyBoxes){
    fs.mkdirSync("deploy/"+projectName+"/skybox");
    console.log("[*] Project has skyboxes to load.");
  }else{
    console.log("[*] Project has no skyboxes to load.");
  }
  if (hasModels){
    fs.mkdirSync("deploy/" + projectName + "/models");
    console.log("[*] Project has models to load.");
  }else{
    console.log("[*] Project has no models to load.");
  }
  if (hasFonts || hasTextureAtlas || hasShadowAtlas){
    fs.mkdirSync("deploy/"+projectName+"/fonts");
    fs.mkdirSync("deploy/"+projectName+"/texture_atlas");
    if (hasFonts){
      fs.mkdirSync("deploy/"+projectName+"/texture_atlas/fonts");
    }
    console.log("[*] Project has merged textures to load.");
  }else{
    console.log("[*] Project has no fonts or texture atlas.");
  }
  if (hasDynamicTextureFolders){
    fs.mkdirSync("deploy/"+projectName+"/dynamic_textures");
    console.log("[*] Project has dynamic textures to load.");
  }else{
    console.log("[*] Project has no dynamic textures.");
  }
  if (hasCustomBootScreen){
    fs.mkdirSync("deploy/" + projectName + "/bootscreens");
    console.log("[*] Project has custom bootscreen.");
  }else{
    console.log("[*] Project has no custom bootscreen.");
  }
  return true;
}

function readEngineScripts(projectName, author, enableAntialias, modules, bootscreenFolderName, disabledShaderInfo){
  var content = "";
  var htmlContent = fs.readFileSync("roygbiv.html", "utf8");
  htmlContent = htmlContent.replace("three.js", "three.min.js");
  var htmlContentSplitted = htmlContent.split("\n");

  var totalShaderContent = "";

  for (var i = 0; i<htmlContentSplitted.length; i++){
    if (htmlContentSplitted[i].includes("<script")){
      var scriptPath = extractFirstText(htmlContentSplitted[i]);
      var scriptContent = fs.readFileSync(scriptPath, "utf8");
      if (scriptPath.includes("globalVariables.js")){
        scriptContent = scriptContent.replace("var isDeployment = false;", "var isDeployment = true;");
        if (bootscreenFolderName) {
          scriptContent = scriptContent.replace("var hasCustomBootScreen = false;", "var hasCustomBootScreen = true;");
        }
        scriptContent = scriptContent.replace("var projectName = \"@@1\"", "var projectName = \""+projectName+"\"");
        scriptContent = scriptContent.replace("var author = \"@@2\"", "var author = \""+author+"\"");
        scriptContent = scriptContent.replace("var ENABLE_ANTIALIAS = false;", "var ENABLE_ANTIALIAS = @@1;".replace("@@1", enableAntialias));

        if (disabledShaderInfo.DISABLE_PARTICLE_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_PARTICLE_SHADERS = false;", "var DISABLE_PARTICLE_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("particle");
        }
        if (disabledShaderInfo.DISABLE_OBJECT_TRAIL_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_OBJECT_TRAIL_SHADERS = false;", "var DISABLE_OBJECT_TRAIL_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("object_trail");
        }
        if (disabledShaderInfo.DISABLE_CROSSHAIR_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_CROSSHAIR_SHADERS = false;", "var DISABLE_CROSSHAIR_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("crosshair");
        }
        if (disabledShaderInfo.DISABLE_OBJECT_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_OBJECT_SHADERS = false;", "var DISABLE_OBJECT_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("materials/basic_material");
          totalShaderContent += generateRSFChunk("materials/merged_basic_material");
          totalShaderContent += generateRSFChunk("materials/instanced_basic_material");
        }
        if (disabledShaderInfo.DISABLE_SKYBOX_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_SKYBOX_SHADERS = false;", "var DISABLE_SKYBOX_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("skybox");
        }
        if (disabledShaderInfo.DISABLE_TEXT_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_TEXT_SHADERS = false;", "var DISABLE_TEXT_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("text");
        }
        if (disabledShaderInfo.DISABLE_RECTANGLE_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_RECTANGLE_SHADERS = false;", "var DISABLE_RECTANGLE_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("rectangle");
        }
        if (disabledShaderInfo.DISABLE_BLOOM_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_BLOOM_SHADERS = false;", "var DISABLE_BLOOM_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("post_processing/bloom/bright_pass");
          totalShaderContent += generateRSFChunk("post_processing/bloom/blur_pass");
          totalShaderContent += generateRSFChunk("post_processing/bloom/combiner");
        }
        if (disabledShaderInfo.DISABLE_LIGHTNING_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_LIGHTNING_SHADERS = false;", "var DISABLE_LIGHTNING_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("lightning");
        }
        if (disabledShaderInfo.DISABLE_SPRITE_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_SPRITE_SHADERS = false;", "var DISABLE_SPRITE_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("sprite");
        }
        if (disabledShaderInfo.DISABLE_MODEL_SHADERS){
          scriptContent = scriptContent.replace("var DISABLE_MODEL_SHADERS = false;", "var DISABLE_MODEL_SHADERS = true;");
        }else{
          totalShaderContent += generateRSFChunk("materials/basic_model_material");
          totalShaderContent += generateRSFChunk("materials/pbr_model_material");
        }

        writeRSFFile(projectName, totalShaderContent);

        console.log("[*] isDeployment flag injected into globalVariables.");
      }
      if (scriptPath.includes("Roygbiv.js")){
        var roygbivJSSplitted = scriptContent.split("\n");
        var commentsFiltered = "";
        for (var i2 = 0; i2<roygbivJSSplitted.length; i2++){
          if (!roygbivJSSplitted[i2].startsWith("//") && !roygbivJSSplitted[i2].trim().startsWith("preConditions")){
            commentsFiltered += roygbivJSSplitted[i2] + "\n";
          }
        }
        scriptContent = commentsFiltered;
      }
      if (scriptPath.includes("draggableCLI.js")){
        console.log("[*] Skipping draggableCLI");
        continue;
      }else if (scriptPath.includes("cliParser.js")){
        console.log("[*] Skipping cliParser");
        continue;
      }else if (scriptPath.includes("CommandDescriptor.js")){
        console.log("[*] Skipping CommandDescriptor");
        continue;
      }else if (scriptPath.includes("Text.js") && !scriptPath.includes("AddedText.js")){
        console.log("[*] Skipping Text");
        continue;
      }else if (scriptPath.includes("JobHandler.js")){
        console.log("[*] Skipping JobHandler");
        continue;
      }else if (scriptPath.includes("jquery")){
        console.log("[*] Skipping jquery");
        continue;
      }else if (scriptPath.includes("Terminal.js")){
        console.log("[*] Skipping Terminal.");
        continue;
      }else if (scriptPath.includes("SelectionHandler.js")){
        console.log("[*] Skipping SelectionHandler.");
        continue;
      }else if (scriptPath.includes("GUIHandler.js")){
        console.log("[*] Skipping a GUI handler.");
        continue;
      }else if (scriptPath.includes("dat.gui.min.js")){
        console.log("[*] Skipping DAT gui.");
        continue;
      }else if (scriptPath.includes("Preconditions.js")){
        console.log("[*] Skipping Preconditions");
        continue;
      }else if (scriptPath.includes("ObjectExportImportHandler.js")){
        console.log("[*] Skipping ObjectExportImportHandler.");
        continue;
      }else if (scriptPath.includes("mermaid.min.js")){
        console.log("[*] Skipping mermaid.");
        continue;
      }else if (scriptPath.includes("ModuleHandler.js")){
        console.log("[*] Skipping ModuleHandler");
        continue;
      }else if (scriptPath.includes("OBJLoader.js")){
        console.log("[*] Skipping OBJLoader.js");
        continue;
      }else if (scriptPath.includes("MTLLoader.js")){
        console.log("[*] Skipping MTLLOader.js");
        continue;
      }
      content += scriptContent +"\n";
    }
  }
  for (var i = 0; i < modules.length; i ++){
    var modulePath = "./modules/" + modules[i] + ".js";
    var moduleContent = fs.readFileSync(modulePath, "utf8");
    content += moduleContent + "\n";
  }
  return content;
}

function extractFirstText(str){
  const matches = str.match(/"(.*?)"/);
  return matches
    ? matches[1]
    : str;
}

function copyFileSync( source, target ) {
  var targetFile = target;
  if ( fs.existsSync( target ) ) {
    if ( fs.lstatSync( target ).isDirectory() ) {
      targetFile = path.join( target, path.basename( source ) );
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
  var files = [];
  var targetFolder = path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
    fs.mkdirSync( targetFolder );
  }
  if ( fs.lstatSync( source ).isDirectory() ) {
    files = fs.readdirSync( source );
    files.forEach( function ( file ) {
      var curSource = path.join( source, file );
      if ( fs.lstatSync( curSource ).isDirectory() ) {
        copyFolderRecursiveSync( curSource, targetFolder );
      } else {
        copyFileSync( curSource, targetFolder );
      }
    } );
  }
}

function runScript(scriptPath, params, callback) {
  var invoked = false;
  var process = childProcess.fork(scriptPath, params);
  process.on('error', function (err) {
      if (invoked) return;
      invoked = true;
      callback(err);
  });
  process.on('exit', function (code) {
      if (invoked) return;
      invoked = true;
      var err = code === 0 ? null : new Error('exit code ' + code);
      callback(err);
  });
}

function generateRSFChunk(folderName){
  var chunk = "#RSF " + folderName + " v\n";
  chunk += fs.readFileSync("./shader/" + folderName + "/vertexShader.shader", "utf8");
  chunk += "\n";
  chunk += "#RSF " + folderName + " f\n";
  chunk += fs.readFileSync("./shader/" + folderName + "/fragmentShader.shader", "utf8");
  chunk += "\n";
  return chunk;
}

function writeRSFFile(projectName, totalShaderContent){
  fs.writeFileSync("./deploy/"+projectName+"/shader/shader.rsf", totalShaderContent);
}

function cleanup(projectName){
  var folder = "./deploy/" + projectName + "/";
  var modelsFolder = folder + "models/";
  fs.readdirSync(modelsFolder).filter(item => fs.lstatSync(modelsFolder + item).isDirectory()).forEach(item => {
    fs.readdirSync(modelsFolder + item + "/").forEach(childItem => {
      if (childItem.toLowerCase().endsWith(".obj") || childItem.toLowerCase().endsWith(".mtl")){
        fs.unlinkSync(modelsFolder + item + "/" + childItem);
        console.log("Removed a model file:", childItem)
      }else if (childItem.toLowerCase().endsWith(".jpg") || childItem.toLowerCase().endsWith(".jpeg") || childItem.toLowerCase().endsWith(".png")){
        fs.unlinkSync(modelsFolder + item + "/" + childItem);
        console.log("Removed an image file:", childItem)
      }
    });
  });
}

app.use(express.static('./'));
server = http.Server(app);
server.listen(8085);
