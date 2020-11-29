var ModuleHandler = function(){
  this.reset();
}

ModuleHandler.prototype.reset = function(){
  this.includedModules = {};
}

ModuleHandler.prototype.export = function(){
  return Object.keys(this.includedModules);
}

ModuleHandler.prototype.import = function(exportObj, onReady){
  var ctr = 0;

  if (exportObj.length == 0){
    onReady();
    return;
  }

  for (var i = 0; i < exportObj.length; i++){
    this.addModule(exportObj[i], function(){
      ctr ++;
      if (ctr == exportObj.length){
        onReady();
      }
    });
  }
}

ModuleHandler.prototype.addModule = function(fileName, onLoaded){
  var path = "./modules/" + fileName + ".js";

  var scriptTag = document.createElement('script');
  scriptTag.type = 'text/javascript';
  scriptTag.src = path;

  scriptTag.onload = function(){
    moduleHandler.includedModules[fileName] = scriptTag;
    onLoaded();
  }

  document.head.appendChild(scriptTag);
}

ModuleHandler.prototype.removeModule = function(fileName){
  var scriptTag = this.includedModules[fileName];
  document.head.removeChild(scriptTag);
  delete this.includedModules[fileName];
}

ModuleHandler.prototype.getFiles = function(callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/getModules", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function (){
    if (xhr.readyState == 4 && xhr.status == 200){
      callback(JSON.parse(xhr.responseText));
    }
  }
  xhr.send();
}
