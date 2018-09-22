var JobHandler = function(splitted){
  this.splitted = splitted;
}

JobHandler.prototype.handle = function(){
  jobHandlerWorking = true;
  try{
    if (this.splitted[0] == "newSurface"){
      this.handleNewSurfaceCommand();
    }else if (this.splitted[0] == "newBox"){
      this.handleNewBoxCommand();
    }else if (this.splitted[0] == "newSphere"){
      this.handleNewSphereCommand();
    }
    undoRedoHandler.push();
  }catch (err){
    console.error("Job handler error: ", err);
  }
  jobHandlerWorking = false;
}

JobHandler.prototype.handleNewSphereCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newSphere "+objNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  terminal.printInfo(Text.CREATED_X_SPHERES.replace(Text.PARAM1, ctr));
}

JobHandler.prototype.handleNewBoxCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newBox "+objNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  terminal.printInfo(Text.CREATED_X_BOXES.replace(Text.PARAM1, ctr));
}

JobHandler.prototype.handleNewSurfaceCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newSurface "+objNamePrefix+"_"+ctr+" "+this.splitted[2]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  terminal.printInfo(Text.CREATED_X_SURFACES.replace(Text.PARAM1, ctr));
}
