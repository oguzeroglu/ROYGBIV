var ScriptsHandler = function(){
  this.configurations = {};
}

ScriptsHandler.prototype.export = function(){
  return JSON.parse(JSON.stringify(this.configurations));
}

ScriptsHandler.prototype.import = function(obj){
  this.configurations = JSON.parse(JSON.stringify(obj));
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
