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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  parameterLimit: 100000,
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
    var engineScriptsConcatted = readEngineScripts(JSON.stringify(req.body));
    fs.writeFileSync("deploy/"+req.body.projectName+"/js/roygbiv.js", engineScriptsConcatted);
    fs.writeFileSync("deploy/"+req.body.projectName+"/js/application.json", JSON.stringify(req.body));
    copyAssets(req.body);
  }catch (err){
    console.log("[*] Error building project: "+err.message);
    res.send(JSON.stringify({"error": "Build error: "+err.message}));
    return;
  }
  res.send(JSON.stringify({"path": __dirname+"/deploy/"+req.body.projectName+"/"}));
});

function copyAssets(application){
  var faCssContent = fs.readFileSync("css/font-awesome-4.7.0/css/font-awesome.min.css", "utf8");
  fs.writeFileSync("deploy/"+application.projectName+"/css/font-awesome.min.css", faCssContent);
  var jqueryTerminalCssContent = fs.readFileSync("css/jquery.terminal-1.11.3.min.css", "utf8");
  fs.writeFileSync("deploy/"+application.projectName+"/css/jquery.terminal-1.11.3.min.css", jqueryTerminalCssContent);
  copyFileSync("css/Hack-Bold.ttf", "deploy/"+application.projectName+"/css/");
  var htmlContent = fs.readFileSync("template/application.html", "utf8");
  htmlContent = htmlContent.replace(
    "@@1", application.projectName
  ).replace(
    "@@2", application.projectName
  ).replace(
    "@@3", application.author
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
  return true;
}

function readEngineScripts(){
  var content = "";
  var htmlContent = fs.readFileSync("roygbiv.html", "utf8");
  var htmlContentSplitted = htmlContent.split("\n");
  for (var i = 0; i<htmlContentSplitted.length; i++){
    if (htmlContentSplitted[i].includes("<script")){
      var scriptPath = extractFirstText(htmlContentSplitted[i]);
      var scriptContent = fs.readFileSync(scriptPath, "utf8");
      if (scriptPath.includes("globalVariables.js")){
        scriptContent = scriptContent.replace("var isDeployment = false;", "var isDeployment = true;");
        console.log("[*] isDeployment flag injected into globalVariables.");
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
