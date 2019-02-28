var Script = function(name, script){
  this.name = name;
  this.script = script;
  this.status = SCRIPT_STATUS_STOPPED;
  if (!isDeployment){
    try{
      this.func = new Function(this.script);
    }catch(err){
      this.status = SCRIPT_STATUS_ERROR;
    }
  }
  this.counter1 = 0;
  this.counter2 = 0;
  this.lastExecutionPerformance = 0;
  if (isDeployment){
    this.deploymentStatusVariableName = "SCRIPT_EXECUTION_STATUS_"+this.name;
  }
}

Script.prototype.execute = function(){
  if (isDeployment){
    deploymentScriptsStatus[this.deploymentStatusVariableName] = true;
    return;
  }
  if (this.status != SCRIPT_STATUS_STARTED){
    return ;
  }
  if (!this.func){
    terminal.clear();
    terminal.printError(Text.SCRIPT_IS_NOT_VALID);
    return;
  }
  this.counter1 = performance.now();
  try{
    this.func();
  }catch (err){
    console.error("Error at "+this.name+": "+err);
    this.status = SCRIPT_STATUS_ERROR;
  }
  this.counter2 = performance.now();
  this.lastExecutionPerformance = this.counter2 - this.counter1;
}

Script.prototype.reload = function(onSuccess, onLoadError, onCompilationError){
  if (this.localFilePath){
    var that = this;
    $.ajax({
      url: this.localFilePath,
      converters:{
        'text script': function(text){
          return text;
        }
      },
      success: function(data){
        that.script = data;
        try{
          that.func = new Function(that.script);
        }catch (err){
          onCompilationError(that.name, err.message);
          return;
        }
        onSuccess(that.name);
      }
    }).fail(function(){
      onLoadError(that.name, that.localFilePath);
    });
    return;
  }
}

Script.prototype.export = function(){
  var exportObject = new Object();
  exportObject["name"] = this.name;
  exportObject["script"] = this.script;
  exportObject["status"] = this.status;
  if (this.localFilePath){
    exportObject["localFilePath"] = this.localFilePath;
  }
  if (this.runAutomatically){
    exportObject["runAutomatically"] = true;
  }else{
    exportObject["runAutomatically"] = false;
  }
  return exportObject;
}

Script.prototype.stop = function(){
  if (isDeployment){
    deploymentScriptsStatus[this.deploymentStatusVariableName] = false;
    return;
  }
  this.status = SCRIPT_STATUS_STOPPED;
  delete scriptsToRun[this.name];
}

Script.prototype.start = function(){
  if (isDeployment){
    deploymentScriptsStatus[this.deploymentStatusVariableName] = true;
    return;
  }
  this.status = SCRIPT_STATUS_STARTED;
  scriptsToRun[this.name] = this;
}

Script.prototype.isRunning = function(){
  if (isDeployment){
    return deploymentScriptsStatus[this.deploymentStatusVariableName];
  }
  return (this.status == SCRIPT_STATUS_STARTED);
}
