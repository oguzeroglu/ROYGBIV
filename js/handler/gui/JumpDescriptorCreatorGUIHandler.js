var JumpDescriptorCreatorGUIHandler = function(){
  this.defaultControls = {
    "Name": "",
    "Takeoff point": "",
    "Landing point": "",
    "Create": function(){
      var id = this["Name"];

      terminal.clear();

      if (jumpDescriptorCreatorGUIHandler.markedPointNames.length < 2){
        terminal.printError(Text.MUST_HAVE_AT_LEAST_TWO_MARKED_POINTS_INSIDE_SCENE);
        return;
      }

      if (!id){
        terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (steeringHandler.usedJumpDescriptorIDs[id]){
        terminal.printError(Text.ID_MUST_BE_UNIQUE);
        return;
      }

      var pt1 = markedPoints[this["Takeoff point"]];
      var pt2 = markedPoints[this["Landing point"]];

      jumpDescriptorCreatorGUIHandler.addJumpDescriptorFolder(id, steeringHandler.addJumpDescriptor(id, pt1, pt2, 100));

      terminal.printInfo(Text.JUMP_DESCRIPTOR_CREATED);

      if (steeringHandler.debugHelper){
        steeringHandler.switchDebugMode();
        steeringHandler.switchDebugMode();
      }
    },
    "Done": function(){
      terminal.clear();
      terminal.enable();
      guiHandler.hide(guiHandler.guiTypes.JUMP_DESCRIPTOR_CREATION);
      terminal.printInfo(Text.GUI_CLOSED);
    }
  };
}

JumpDescriptorCreatorGUIHandler.prototype.addJumpDescriptorFolder = function(id, jumpDescriptor){
  var folder = guiHandler.datGuiJumpDescriptorCreation.addFolder(id);

  var takeoffPosition = jumpDescriptor.takeoffPosition;
  var landingPosition = jumpDescriptor.landingPosition;

  var params = {
    takeoffPosition: takeoffPosition.x + "," + takeoffPosition.y + "," + takeoffPosition.z,
    landingPosition: landingPosition.x + "," + landingPosition.y + "," + landingPosition.z,
    takeoffPositionSatisfactionRadius: "" + jumpDescriptor.takeoffPositionSatisfactionRadius,
    "Destroy": function(){
      terminal.clear();

      if (steeringHandler.pathsByJumpDescriptors[id]){
        if (Object.keys(steeringHandler.pathsByJumpDescriptors[id]).length > 0){
          terminal.printError(Text.JUMP_DESCRIPTOR_INSERTED_TO_A_PATH);
          return true;
        }
      }

      if (steeringHandler.graphsByJumpDescriptors[id]){
        if (Object.keys(steeringHandler.graphsByJumpDescriptors[id]).length > 0){
          terminal.printError(Text.JUMP_DESCRIPTOR_INSERTED_TO_A_GRAPH);
          return true;
        }
      }

      steeringHandler.removeJumpDescriptor(id);

      guiHandler.datGuiJumpDescriptorCreation.removeFolder(folder);
      terminal.printInfo(Text.JUMPDESCRIPTOR_DESTROYED);

      if (steeringHandler.debugHelper){
        steeringHandler.switchDebugMode();
        steeringHandler.switchDebugMode();
      }
    }
  };

  guiHandler.disableController(folder.add(params, "takeoffPosition"));
  guiHandler.disableController(folder.add(params, "landingPosition"));

  var props = ["takeoffPositionSatisfactionRadius"];

  for (var i = 0; i < props.length; i ++){
    this.addNumericalController(params, props[i], folder, jumpDescriptor);
  }

  folder.add(params, "Destroy");

  var steerables = steeringHandler.steerablesBySceneName[sceneHandler.getActiveSceneName()];

  if (steerables){
    var eqTestFolder = folder.addFolder("Equation Test");

    var allSteerableIDs = Object.keys(steerables);

    var eqTestParams = {
      "Steerable": allSteerableIDs[0],
      "Test": function(){
        terminal.clear();
        var steerable = steeringHandler.steerablesBySceneName[sceneHandler.getActiveSceneName()][this["Steerable"]];
        var result = jumpDescriptor.solveQuadraticEquation(steerable);
        if (result.isAchievable){
          terminal.printInfo(Text.JUMP_IS_ACHIEVABLE_FOR_STEERABLE.replace(Text.PARAM1, this["Steerable"]));
        }else{
          terminal.printError(Text.JUMP_IS_UNACHIEVABLE_FOR_STEERABLE.replace(Text.PARAM1, this["Steerable"]));
        }
      }
    }

    eqTestFolder.add(eqTestParams, "Steerable", allSteerableIDs);
    eqTestFolder.add(eqTestParams, "Test");
  }
}

JumpDescriptorCreatorGUIHandler.prototype.addNumericalController = function(params, propName, folder, jumpDescriptor){
  folder.add(params, propName).onFinishChange(function(val){

    terminal.clear();

    var parsed = parseFloat(val);

    if (isNaN(parsed)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, propName));
      return;
    }

    jumpDescriptor[propName] = parsed;
    jumpDescriptor.cache = {};

    terminal.printInfo(Text.JUMP_DESCRIPTOR_UPDATED);
  });
}

JumpDescriptorCreatorGUIHandler.prototype.show = function(){

  this.markedPointNames = [];

  for (var mpName in sceneHandler.getMarkedPoints()){
    this.markedPointNames.push(mpName);
  }

  this.defaultControls["Takeoff point"] = this.markedPointNames.length >= 1? this.markedPointNames[0]: "";
  this.defaultControls["Landing point"] = this.markedPointNames.length >= 2? this.markedPointNames[1]: "";

  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_JUMP_DESCRIPTORS);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiJumpDescriptorCreation = new dat.GUI({hideable: false});

  guiHandler.datGuiJumpDescriptorCreation.add(this.defaultControls, "Name");
  guiHandler.datGuiJumpDescriptorCreation.add(this.defaultControls, "Takeoff point", this.markedPointNames);
  guiHandler.datGuiJumpDescriptorCreation.add(this.defaultControls, "Landing point", this.markedPointNames);
  guiHandler.datGuiJumpDescriptorCreation.add(this.defaultControls, "Create");
  guiHandler.datGuiJumpDescriptorCreation.add(this.defaultControls, "Done");

  var jdsInScene = steeringHandler.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()];
  if (jdsInScene){
    for (var jdID in jdsInScene){
      this.addJumpDescriptorFolder(jdID, jdsInScene[jdID]);
    }
  }
}
