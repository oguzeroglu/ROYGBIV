var Script = function(name, script){
  this.name = name;
  this.script = script;
  this.status = SCRIPT_STATUS_STOPPED;
  try{
    this.func = new Function(this.script);
  }catch(err){
    this.status = SCRIPT_STATUS_ERROR;
  }
  this.counter1 = 0;
  this.counter2 = 0;
  this.lastExecutionPerformance = 0;
}

Script.prototype.execute = function(){
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

Script.prototype.reloadAndStart = function(){
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
          terminal.clear();
          terminal.printError(Text.INVALID_SCRIPT
            .replace(Text.PARAM1, err.message)
            .replace(Text.PARAM2, that.name));
          return;
        }
        that.start();
      }
    }).fail(function(){
      terminal.printError(Text.AN_UNEXPECTED_ERROR_HAPPENED);
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
  this.status = SCRIPT_STATUS_STOPPED;
  delete scriptsToRun[this.name];
}

Script.prototype.start = function(){
  this.status = SCRIPT_STATUS_STARTED;
  scriptsToRun[this.name] = this;
}

Script.prototype.isRunning = function(){
  return (this.status == SCRIPT_STATUS_STARTED);
}
