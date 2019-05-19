var express = require("express");
var http = require("http");
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

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
  }catch (err){
    console.log("[*] Error building project: "+err.message);
    res.send(JSON.stringify({"error": "Build error: "+err.message}));
    return;
  }
  res.send(JSON.stringify({"path": __dirname+"/deploy/"+req.body.projectName+"/"}));
});

function copyWorkers(application){
  fs.mkdirSync("deploy/"+application.projectName+"/js/worker/");
  var raycasterWorkerContent = fs.readFileSync("./js/worker/RaycasterWorker.js", "utf8");
  var physicsWorkerContent = fs.readFileSync("./js/worker/PhysicsWorker.js", "utf8");
  var raycasterWorkerContentSplitted = raycasterWorkerContent.split("\n");
  var physicsWorkerContentSplitted = physicsWorkerContent.split("\n");
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
  raycasterWorkerContent = "importScripts(\"./WorkerImport.js\");\n" + raycasterWorkerContent.trim();
  physicsWorkerContent = "importScripts(\"./WorkerImport.js\");\n" + physicsWorkerContent.trim();
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/RaycasterWorker.js", raycasterWorkerContent);
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/PhysicsWorker.js", physicsWorkerContent);
  fs.writeFileSync("deploy/"+application.projectName+"/js/worker/WorkerImport.js", workerImportContent);
}

function handleScripts(application, engineScriptsConcatted){
  var statusText = "";
  var scriptsText = "";
  var len = Object.keys(application.scripts).length;
  var i = 0;
  for (var scriptName in application.scripts){
    var script = application.scripts[scriptName].script.replace("this.stop()", "deploymentScriptsStatus.SCRIPT_EXECUTION_STATUS_"+scriptName+" = false")
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
  copyFileSync("css/Hack-Bold.ttf", "deploy/"+application.projectName+"/css/");
  var htmlContent = fs.readFileSync("template/application.html", "utf8");
  htmlContent = htmlContent.replace(
    "@@1", application.projectName
  );
  fs.writeFileSync("deploy/"+application.projectName+"/application.html", htmlContent);
  var readmeContent = fs.readFileSync("template/README", "utf8");
  fs.writeFileSync("deploy/"+application.projectName+"/README", readmeContent);
  for (var textureName in application.textureURLs){
    var splitted = application.textureURLs[textureName].split("/");
    var textureFileName = splitted[splitted.length -1];
    var texturePrefix = textureFileName.split(".")[0];
    fs.readdirSync("textures").forEach(file => {
      var prefix = file.split(".")[0];
      if (texturePrefix == prefix){
        copyFileSync("textures/"+file, "deploy/"+application.projectName+"/textures/");
        console.log("[*] Copied a texture: "+file);
      }
    });
  }
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
  var hasTextures = (Object.keys(application.textureURLs).length != 0);
  var hasTexturePacks = (Object.keys(application.texturePacks).length != 0);
  var hasSkyBoxes = (Object.keys(application.skyBoxes).length != 0);
  var hasFonts = (Object.keys(application.fonts).length != 0);
  if (hasTextures){
    fs.mkdirSync("deploy/"+projectName+"/textures");
    console.log("[*] Project has textures to load.");
  }else{
    console.log("[*] Project has no textures to load.");
  }
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
  if (hasFonts){
    fs.mkdirSync("deploy/"+projectName+"/fonts");
    console.log("[*] Project has fonts to load.");
  }else{
    console.log("[*] Project has no fonts to load.")
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
      }else if (scriptPath.includes("jquery.terminal-1.11.3.min.js")){
        console.log("[*] Skipping jquery terminal plugin");
        continue;
      }else if (scriptPath.includes("Terminal.js")){
        console.log("[*] Skipping Terminal.");
        continue;
      }else if (scriptPath.includes("SelectionHandler.js")){
        console.log("[*] Skipping SelectionHandler.");
        continue;
      }else if (scriptPath.includes("GUIHandler.js")){
        console.log("[*] Skipping GUIHandler.");
        console.log("[*] Skipping ParticleSystemCreatorGUIHandler.");
        console.log("[*] Skipping MuzzleFlashCreatorGUIHandler.");
        console.log("[*] Skipping FPSWeaponGUIHandler.");
        continue;
      }else if (scriptPath.includes("dat.gui.min.js")){
        console.log("[*] Skipping DAT gui.");
        continue;
      }else if (scriptPath.includes("Preconditions.js")){
        console.log("[*] Skipping Preconditions");
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

app.use(express.static('./'));
server = http.Server(app);
server.listen(8085);
