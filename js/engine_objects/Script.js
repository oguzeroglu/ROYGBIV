var Script = function(path){
  this.name = scriptsHandler.getScriptNameFromPath(path);
  this.path = path;
  this.status = SCRIPT_STATUS_STOPPED;
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
  if (cpuOperationsHandler.record){
    cpuOperationsHandler.scriptPerformances[this.name] = performance.now();
  }
  try{
    this.func();
  }catch (err){
    console.error("Error at "+this.name+": "+err);
    this.status = SCRIPT_STATUS_ERROR;
  }
  if (cpuOperationsHandler.record){
    cpuOperationsHandler.scriptPerformances[this.name] = performance.now() - cpuOperationsHandler.scriptPerformances[this.name];
  }
}

Script.prototype.load = function(onSuccess, onLoadError, onCompilationError){
  var that = this;
  $.ajax({
    url: "./scripts/" + this.path,
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

Script.prototype.stop = function(){
  if (isDeployment){
    deploymentScriptsStatus[this.deploymentStatusVariableName] = false;
    return;
  }
  this.status = SCRIPT_STATUS_STOPPED;
  scriptsToRun.delete(this.name);
}

Script.prototype.start = function(){
  if (isDeployment){
    deploymentScriptsStatus[this.deploymentStatusVariableName] = true;
    return;
  }
  this.status = SCRIPT_STATUS_STARTED;
  scriptsToRun.set(this.name, this);
}

Script.prototype.isRunning = function(){
  if (isDeployment){
    return deploymentScriptsStatus[this.deploymentStatusVariableName];
  }
  return (this.status == SCRIPT_STATUS_STARTED);
}

Script.prototype.shouldRunAutomatically = function(){
  return this.runAutomatically;
}

Script.prototype.setRunAutomaticallyStatus = function(val){
  this.runAutomatically = val;
}
