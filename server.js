var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");
var sizeOf = require('image-size');

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
    var engineScriptsConcatted = readEngineScripts(req.body.projectName, req.body.author, req.body.noMobile);
    fs.writeFileSync("deploy/"+req.body.projectName+"/js/roygbiv.js", handleScripts(req.body, engineScriptsConcatted));
    fs.writeFileSync("deploy/"+req.body.projectName+"/js/application.json", JSON.stringify(req.body));
    copyAssets(req.body);
    copyWorkers(req.body);
    copyProtocolDefinitionFile(req.body);
  }catch (err){
    res.send(JSON.stringify({"error": "Build error: "+err.message}));
    throw new Error(err);
    return;
  }
  res.send(JSON.stringify({"path": __dirname+"/deploy/"+req.body.projectName+"/"}));
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
    for (var i2 = 0; i2<textureNames.length; i2++){
      if (files.indexOf(textureNames[i2]) <= -1){
        put = false;
      }
    }
    if (put){
      folders.push(dirs[i]);
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
  var path = "./dynamic_textures/"+folderName;
  if (!fs.existsSync(path)){
    res.send(JSON.stringify({folderDoesNotExist: true}));
    return;
  }
  var files = fs.readdirSync(path);
  var types = ["astc", "pvrtc", "s3tc"];
  for (var i = 0; i<files.length; i++){
    if (files[i].toLowerCase().endsWith(".png")){
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
        handleAtlasBackup(true, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup);
        return;
      }
    }
    handleAtlasBackup(false, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup);
    res.send(JSON.stringify({error: false}));
  }catch (err){
    console.log(err);
    res.send(JSON.stringify({error: true}));
    handleAtlasBackup(true, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup);
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

app.post("/checkProtocolDefinitionFile", function(req, res){
  console.log("[*] Checking protocol definition file.");
  var fileName = req.body.fileName;
  if (!fs.existsSync("./protocol_definitions/"+fileName)){
    res.send(JSON.stringify({error: true}));
  }else{
    res.send(JSON.stringify({error: false}));
  }
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

function handleAtlasBackup(restore, hasPNGBackup, hasASTCBackup, hasPVRTCBackup, hasS3TCBackup){
  if (hasPNGBackup){
    handleBackup(restore, "./texture_atlas/textureAtlas.png", "./texture_atlas/textureAtlas-backup.png");
  }
  if (hasASTCBackup){
    handleBackup(restore, "./texture_atlas/textureAtlas-astc.ktx", "./texture_atlas/textureAtlas-astc-backup.ktx");
  }
  if (hasPVRTCBackup){
    handleBackup(restore, "./texture_atlas/textureAtlas-pvrtc.ktx", "./texture_atlas/textureAtlas-pvrtc-backup.ktx");
  }
  if (hasS3TCBackup){
    handleBackup(restore, "./texture_atlas/textureAtlas-s3tc.ktx", "./texture_atlas/textureAtlas-s3tc-backup.ktx");
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
  copyFolderRecursiveSync("shader", "deploy/"+projectName);
  var hasTexturePacks = (Object.keys(application.texturePacks).length != 0);
  var hasSkyBoxes = (Object.keys(application.skyBoxes).length != 0);
  var hasFonts = (Object.keys(application.fonts).length != 0);
  var hasDynamicTextureFolders = (Object.keys(application.dynamicTextureFolders) != 0);
  var hasTextureAtlas = application.textureAtlas.hasTextureAtlas;
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
  if (hasFonts || hasTextureAtlas){
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
  return true;
}

function readEngineScripts(projectName, author, noMobile){
  var content = "";
  var htmlContent = fs.readFileSync("roygbiv.html", "utf8");
  htmlContent = htmlContent.replace("three.js", "three.min.js");
  var htmlContentSplitted = htmlContent.split("\n");
  for (var i = 0; i<htmlContentSplitted.length; i++){
    if (htmlContentSplitted[i].includes("<script")){
      var scriptPath = extractFirstText(htmlContentSplitted[i]);
      var scriptContent = fs.readFileSync(scriptPath, "utf8");
      if (scriptPath.includes("globalVariables.js")){
        scriptContent = scriptContent.replace("var isDeployment = false;", "var isDeployment = true;");
        scriptContent = scriptContent.replace("var projectName = \"@@1\"", "var projectName = \""+projectName+"\"");
        scriptContent = scriptContent.replace("var author = \"@@2\"", "var author = \""+author+"\"");
        if (noMobile){
          scriptContent = scriptContent.replace("var NO_MOBILE = false;", "var NO_MOBILE = true;");
          console.log("[*] NO_MOBILE is: "+noMobile);
        }
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
        console.log("[*] Skipping GUI handlers.");
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
      }
      content += scriptContent +"\n";
    }
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

app.use(express.static('./'));
server = http.Server(app);
server.listen(8085);
