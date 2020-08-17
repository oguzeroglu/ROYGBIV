var ScriptsHandler = function(){
  this.configurations = {};
  this.includedScripts = [];
}

ScriptsHandler.prototype.onModeSwitch = function(){
  for (var scriptName in scripts){
    if (scripts[scriptName].shouldRunAutomatically()){
      scripts[scriptName].start();
    }
  }
}

ScriptsHandler.prototype.import = function(obj){
  this.configurations = JSON.parse(JSON.stringify(obj.scripts.configurations));
  this.onConfigurationsRefreshed();
  if (isDeployment){
    this.loadScripts();
  }
}

ScriptsHandler.prototype.export = function(){
  var exportObj = new Object();
  exportObj.configurations = JSON.parse(JSON.stringify(this.configurations));
  exportObj.scripts = new Object();
  exportObj.totalCount = this.getTotalScriptsToLoadCount();
  for (var scriptName in scripts){
    exportObj.scripts[scriptName] = scripts[scriptName].script;
  }
  return exportObj;
}

ScriptsHandler.prototype.resetNode = function(parent){
  parent.listen = false;
  for (var key in parent){
    if (!key.startsWith("/")){
      continue;
    }
    var node = parent[key];
    if (node.isFolder){
      node.listen = false;
      this.resetNode(node);
    }else{
      node.include = false;
      node.runAutomatically = false;
    }
  }
}

ScriptsHandler.prototype.reset = function(){
  this.resetNode(this.configurations["/"]);
  this.onConfigurationsRefreshed();
}

ScriptsHandler.prototype.includeAllSubScripts = function(node){
  for (var key in node){
    if (!key.startsWith("/")){
      continue;
    }
    var child = node[key];
    if (child.isFolder){
      this.includeAllSubScripts(child);
    }else{
      child.include = true;
      this.includedScripts.push(key);
    }
  }
}

ScriptsHandler.prototype.refreshFolder = function(parent){
  for (var key in parent){
    if (!key.startsWith("/")){
      continue;
    }
    var node = parent[key];
    if (node.isFolder){
      if (node.listen){
        this.includeAllSubScripts(node);
      }else{
        this.refreshFolder(node);
      }
    }else if (node.include){
      this.includedScripts.push(key);
    }
  }
}

ScriptsHandler.prototype.onConfigurationsRefreshed = function(){
  this.includedScripts = [];
  this.refreshFolder(this.configurations);
}

ScriptsHandler.prototype.handleScript = function(node, parentName, scriptName){
  var key ;
  if (parentName){
    key = "/" + parentName + "/" + scriptName;
  }else{
    key = "/" + scriptName;
  }
  if (!node[key]){
    node[key] = {include: false, runAutomatically: false, isFolder: false};
  }
}

ScriptsHandler.prototype.handleFolder = function(node, folderName, children){
  var folderKey = "/" + folderName;
  if (!node[folderKey]){
    node[folderKey] = {listen: false, isFolder: true}
  }
  for (var key in children){
    if (children[key]){
      this.handleFolder(node[folderKey], key, children[key]);
    }else{
      this.handleScript(node[folderKey], folderName, key);
    }
  }
}

ScriptsHandler.prototype.updateConfigurations = function(scriptDescriptions){
  if (!this.configurations["/"]){
    this.configurations["/"] = {listen: false, isFolder: true};
  }
  for (var key in scriptDescriptions){
    if (scriptDescriptions[key]){
      this.handleFolder(this.configurations["/"], key, scriptDescriptions[key])
    }else{
      this.handleScript(this.configurations["/"], "", key);
    }
  }
}

ScriptsHandler.prototype.getFiles = function(callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/getScripts", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function (){
    if (xhr.readyState == 4 && xhr.status == 200){
      scriptsHandler.updateConfigurations(JSON.parse(xhr.responseText));
      scriptsHandler.onConfigurationsRefreshed();
      callback(scriptsHandler.configurations);
    }
  }
  xhr.send();
}

ScriptsHandler.prototype.loadNode = function(parent, successCallback, errorCallback, compilationErrorCallback){
  for (var key in parent){
    if (!key.startsWith("/")){
      continue;
    }
    var node = parent[key];
    if (!node.isFolder && node.include){
      var script = new Script(key);
      script.setRunAutomaticallyStatus(node.runAutomatically);
      scripts[this.getScriptNameFromPath(key)] = script;
      if (!isDeployment){
        script.load(successCallback, errorCallback, compilationErrorCallback);
      }
    }else if (node.isFolder){
      this.loadNode(node, successCallback, errorCallback, compilationErrorCallback);
    }
  }
}

ScriptsHandler.prototype.loadScripts = function(successCallback, errorCallback, compilationErrorCallback){
  scripts = new Object();
  this.loadNode(this.configurations["/"], successCallback, errorCallback, compilationErrorCallback);
}

ScriptsHandler.prototype.getTotalScriptsToLoadCount = function(){
  if (isDeployment){
    return 0;
  }
  return this.includedScripts.length;
}

ScriptsHandler.prototype.getScriptNameFromPath = function(path){
  var splitted = path.split("/");
  var name = "";
  for (var i = 1; i<splitted.length; i++){
    if (i == splitted.length -1){
      name += splitted[i];
    }else{
      name += splitted[i] + "_"
    }
  }
  return name.replace(".js", "").replace(/-/g, "");
}
