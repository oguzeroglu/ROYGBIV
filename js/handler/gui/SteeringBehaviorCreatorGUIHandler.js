var SteeringBehaviorCreatorGUIHandler = function(){
  this.types = [];

  for (var behaviorKey in steeringHandler.steeringBehaviorTypes){
    this.types.push(steeringHandler.steeringBehaviorTypes[behaviorKey]);
  }

  this.defaultControls = {
    "Type": this.types[0],
    "Name": "",
    "Create": function(){
      var name = this["Name"];
      terminal.clear();

      if (!name){
        terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
        return;
      }

      var behaviorsByID = steeringHandler.usedBehaviorIDs;
      if (behaviorsByID[name]){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }

      var behavior = steeringBehaviorCreatorGUIHandler.createBehavior(name, this["Type"]);
      if (!(behavior instanceof PreconfiguredSteeringBehavior)){
        terminal.printError(behavior);
        return;
      }

      steeringHandler.addBehavior(name, behavior);
      steeringBehaviorCreatorGUIHandler.addBehaviorFolder(behavior);
      terminal.printInfo(Text.STEERING_BEHAVIOR_CREATED);
    },
    "Done": function(){
      terminal.clear();
      terminal.enable();
      guiHandler.hide(guiHandler.guiTypes.STEERING_BEHAVIOR_CREATION);
      terminal.printInfo(Text.GUI_CLOSED);
    }
  };
}

SteeringBehaviorCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_STEERING_BEHAVIORS);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiSteeringBehaviorCreation = new dat.GUI({hideable: false});

  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Type", this.types);
  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Name");
  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Create");
  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Done");

  var existingBehaviors = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()];
  for (var behaviorID in existingBehaviors){
    var behavior = existingBehaviors[behaviorID];
    this.addBehaviorFolder(behavior);
  }
}

SteeringBehaviorCreatorGUIHandler.prototype.createBehavior = function(name, type){
  var params = {name: name, type: type};

  switch(type){
    case steeringHandler.steeringBehaviorTypes.ALIGN: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.ARRIVE:
      params.satisfactionRadius = 50;
      params.slowDownRadius = 100;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.AVOID:
      params.maxSeeAhead = 50;
      params.maxAvoidForce = 100;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.BLENDED:
      params.list = [];
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.COHESIION: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.EVADE:
      params.maxPredictionTime = 10;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.FLEE: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.HIDE:
      params.arriveSatisfactionRadius = 50;
      params.arriveSlowDownRadius = 100;
      params.hideDistance = 150;
      params.threatDistance = 500;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.LOOK_WHERE_YOU_ARE_GOING: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.PATH_FOLLOWING:
      var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};
      var pathIDs = Object.keys(paths);
      var aStars = steeringHandler.astarsBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var asid in aStars){
        pathIDs.push(asid);
      }
      if (pathIDs.length == 0){
        return Text.NO_PATHS_IN_THIS_SCENE;
      }
      params.pathID = pathIDs[0];
      params.satisfactionRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.PRIORITY:
      params.threshold = 1;
      params.list = [];
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.PURSUE:
      params.maxPredictionTime = 10;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.RANDOM_PATH:
      var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};
      var graphIDs = Object.keys(graphs);
      if (graphIDs.length == 0){
        return Text.NO_GRAPHS_IN_THIS_SCENE;
      }
      params.satisfactionRadius = 50;
      params.graphID = graphIDs[0];
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.RANDOM_WAYPOINT:
      var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};
      var pathIDs = Object.keys(paths);
      if (pathIDs.length == 0){
        return Text.NO_PATHS_IN_THIS_SCENE;
      }
      params.pathID = pathIDs[0];
      params.satisfactionRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.SEEK: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.SEPARATION:
      params.strength = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.WANDER_TWO:
      params.angleChange = 0.03;
      params.normalX = 0;
      params.normalY = 1;
      params.normalZ = 0;
      params.wanderCircleDistance = 100;
      params.wanderCircleRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.WANDER_THREE:
      params.angleChange = 0.03;
      params.wanderSphereDistance = 100;
      params.wanderSphereRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
  }
}

SteeringBehaviorCreatorGUIHandler.prototype.addBehaviorFolder = function(behavior){
  var params = behavior.parameters;

  var commonFolderFunc = function(params){
    var folder = guiHandler.datGuiSteeringBehaviorCreation.addFolder(params.name);
    var controller = folder.add(params, "type");
    guiHandler.disableController(controller);
    folder.add({"Delete": function(){
      for (var objName in sceneHandler.getAddedObjects()){
        var obj = addedObjects[objName];
        if (obj.steerableInfo && obj.steerableInfo.behaviorsByID[behavior.parameters.name]){
          terminal.clear();
          terminal.printError(Text.BEHAVIOR_ASSIGNED_TO_OBJECT.replace(Text.PARAM1, objName));
          return;
        }
      }
      for (var objName in sceneHandler.getObjectGroups()){
        var obj = objectGroups[objName];
        if (obj.steerableInfo && obj.steerableInfo.behaviorsByID[behavior.parameters.name]){
          terminal.clear();
          terminal.printError(Text.BEHAVIOR_ASSIGNED_TO_OBJECT.replace(Text.PARAM1, objName));
          return;
        }
      }
      var allBehaviors = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var behaviorName in allBehaviors){
        var curBehavior = allBehaviors[behaviorName];
        if (curBehavior.parameters.type == steeringHandler.steeringBehaviorTypes.BLENDED){
          var list = curBehavior.parameters.list;
          for (var i = 0; i < list.length; i ++){
            if (list[i].behavior.parameters.name == behavior.parameters.name){
              terminal.clear();
              terminal.printError(Text.BEHAVIOR_USED_IN_COMBINED_STEERING_BEHAVIOR);
              return;
            }
          }
        }else if (curBehavior.parameters.type == steeringHandler.steeringBehaviorTypes.PRIORITY){
          var list = curBehavior.parameters.list;
          for (var i = 0; i < list.length; i ++){
            if (list[i].parameters.name == behavior.parameters.name){
              terminal.clear();
              terminal.printError(Text.BEHAVIOR_USED_IN_COMBINED_STEERING_BEHAVIOR);
              return;
            }
          }
        }
      }
      steeringHandler.removeBehavior(behavior.parameters.name);
      guiHandler.datGuiSteeringBehaviorCreation.removeFolder(folder);
      terminal.clear();
      terminal.printInfo(Text.BEHAVIOR_REMOVED);
    }}, "Delete");
    folder.add({"Documentation": function(){
      window.open("https://github.com/oguzeroglu/Kompute/wiki/" + behavior.parameters.type, '_blank').focus();
    }}, "Documentation");
    return folder;
  };

  switch (params.type){
    case steeringHandler.steeringBehaviorTypes.ALIGN:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.ARRIVE:
      var folder = commonFolderFunc(params);
      var confs = {satisfactionRadius: "" + params.satisfactionRadius, slowDownRadius: "" + params.slowDownRadius};
      this.addNumericalController(folder, confs, "satisfactionRadius", behavior);
      this.addNumericalController(folder, confs, "slowDownRadius", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.AVOID:
      var folder = commonFolderFunc(params);
      var confs = {maxSeeAhead: "" + params.maxSeeAhead, maxAvoidForce: "" + params.maxAvoidForce};
      this.addNumericalController(folder, confs, "maxSeeAhead", behavior);
      this.addNumericalController(folder, confs, "maxAvoidForce", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.BLENDED:
      var folder = commonFolderFunc(params);
      var confs = {"Behavior name": "", "Add": function(){
        var name = this["Behavior name"];
        terminal.clear();
        var existingBehaviors = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
        if (!existingBehaviors[name] || name == behavior.parameters.name){
          terminal.printError(Text.NO_SUCH_BEHAVIOR);
          return;
        }
        for (var i = 0; i < params.list.length; i ++){
          var curBehavior = params.list[i].behavior;
          if (curBehavior.parameters.name == name){
            terminal.printError(Text.BEHAVIOR_ALREADY_ADDED);
            return;
          }
        }
        var newInfo = { behavior: existingBehaviors[name], weight: 1 };
        params.list.push(newInfo);
        steeringBehaviorCreatorGUIHandler.addBlendedBehaviorFolder(folder, newInfo, behavior);
        terminal.printInfo(Text.BEHAVIOR_ADDED);
      }};
      folder.add(confs, "Behavior name");
      folder.add(confs, "Add");
      for (var i = 0; i < params.list.length; i ++){
        this.addBlendedBehaviorFolder(folder, params.list[i], behavior);
      }
    return;
    case steeringHandler.steeringBehaviorTypes.COHESIION:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.EVADE:
      var folder = commonFolderFunc(params);
      var confs = {maxPredictionTime: "" + params.maxPredictionTime};
      this.addNumericalController(folder, confs, "maxPredictionTime", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.FLEE:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.HIDE:
      var folder = commonFolderFunc(params);
      var confs = {
        arriveSatisfactionRadius: "" + params.arriveSatisfactionRadius,
        arriveSlowDownRadius: "" + params.arriveSlowDownRadius,
        hideDistance: "" + params.hideDistance,
        threatDistance: "" + params.threatDistance
      };
      this.addNumericalController(folder, confs, "arriveSatisfactionRadius", behavior);
      this.addNumericalController(folder, confs, "arriveSlowDownRadius", behavior);
      this.addNumericalController(folder, confs, "hideDistance", behavior);
      this.addNumericalController(folder, confs, "threatDistance", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.LOOK_WHERE_YOU_ARE_GOING:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.PATH_FOLLOWING:
      var folder = commonFolderFunc(params);
      var confs = {pathID: params.pathID, satisfactionRadius: "" + params.satisfactionRadius};
      var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};
      var pathIDs = Object.keys(paths);
      var astars = steeringHandler.astarsBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var asid in astars){
        pathIDs.push(asid);
      }
      folder.add(confs, "pathID", pathIDs).onChange(function(val){
        behavior.parameters.pathID = val;
        terminal.clear();
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      this.addNumericalController(folder, confs, "satisfactionRadius", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.PRIORITY:
      var folder = commonFolderFunc(params);
      var confs = {"Behavior name": "", threshold: "" + params.threshold, "Add": function(){
        var name = this["Behavior name"];
        terminal.clear();
        var existingBehaviors = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
        if (!existingBehaviors[name] || name == behavior.parameters.name){
          terminal.printError(Text.NO_SUCH_BEHAVIOR);
          return;
        }
        for (var i = 0; i < params.list.length; i ++){
          var curBehavior = params.list[i];
          if (curBehavior.parameters.name == name){
            terminal.printError(Text.BEHAVIOR_ALREADY_ADDED);
            return;
          }
        }
        var newFolder = folder.addFolder(name);
        params.list.push(existingBehaviors[name]);
        newFolder.add({"Remove": function(){
          folder.removeFolder(newFolder);
          params.list.splice(params.list.indexOf(existingBehaviors[name]), 1);
          terminal.clear();
          terminal.printInfo(Text.BEHAVIOR_REMOVED);
        }}, "Remove");
        terminal.printInfo(Text.BEHAVIOR_ADDED);
      }};
      this.addNumericalController(folder, confs, "threshold", behavior);
      folder.add(confs, "Behavior name");
      folder.add(confs, "Add");
      for (var i = 0; i < params.list.length; i ++){
        this.addPriorityBehaviorFolder(folder, params.list[i], behavior);
      }
    return;
    case steeringHandler.steeringBehaviorTypes.PURSUE:
      var folder = commonFolderFunc(params);
      var confs = {maxPredictionTime: "" + params.maxPredictionTime};
      this.addNumericalController(folder, confs, "maxPredictionTime", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.RANDOM_PATH:
      var folder = commonFolderFunc(params);
      var confs = {graphID: params.graphID, satisfactionRadius: "" + params.satisfactionRadius};
      var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()];
      var graphIDs = Object.keys(graphs);
      folder.add(confs, "graphID", graphIDs).onChange(function(val){
        behavior.parameters.graphID = val;
        terminal.clear();
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      this.addNumericalController(folder, confs, "satisfactionRadius", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.RANDOM_WAYPOINT:
      var folder = commonFolderFunc(params);
      var confs = {pathID: params.pathID, satisfactionRadius: "" + params.satisfactionRadius};
      var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()];
      var pathIDs = Object.keys(paths);
      folder.add(confs, "pathID", pathIDs).onChange(function(val){
        behavior.parameters.pathID = val;
        terminal.clear();
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      this.addNumericalController(folder, confs, "satisfactionRadius", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.SEEK:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.SEPARATION:
      var folder = commonFolderFunc(params);
      var confs = {strength: "" + params.strength};
      this.addNumericalController(folder, confs, "strength", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.WANDER_TWO:
      var folder = commonFolderFunc(params);
      var confs = {
        angleChange: "" + params.angleChange,
        normalX: "" + params.normalX,
        normalY: "" + params.normalY,
        normalZ: "" + params.normalZ,
        wanderCircleDistance: "" + params.wanderCircleDistance,
        wanderCircleRadius: "" + params.wanderCircleRadius
      };
      this.addNumericalController(folder, confs, "angleChange", behavior);
      this.addNumericalController(folder, confs, "normalX", behavior);
      this.addNumericalController(folder, confs, "normalY", behavior);
      this.addNumericalController(folder, confs, "normalZ", behavior);
      this.addNumericalController(folder, confs, "wanderCircleDistance", behavior);
      this.addNumericalController(folder, confs, "wanderCircleRadius", behavior);
    return;
    case steeringHandler.steeringBehaviorTypes.WANDER_THREE:
      var folder = commonFolderFunc(params);
      var confs = {
        angleChange: "" + params.angleChange,
        wanderSphereDistance: "" + params.wanderSphereDistance,
        wanderSphereRadius: "" + params.wanderSphereRadius
      };
      this.addNumericalController(folder, confs, "angleChange", behavior);
      this.addNumericalController(folder, confs, "wanderSphereDistance", behavior);
      this.addNumericalController(folder, confs, "wanderSphereRadius", behavior);
    return;
  }
}

SteeringBehaviorCreatorGUIHandler.prototype.addNumericalController = function(parentContainer, confs, confName, behavior){
  parentContainer.add(confs, confName).onFinishChange(function(val){
    terminal.clear();
    var parsed = parseFloat(val);
    if (isNaN(parsed)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, confName));
      return;
    }
    if (behavior instanceof PreconfiguredSteeringBehavior){
      behavior.parameters[confName] = parsed;
    }else{
      behavior(parsed);
    }
    terminal.printInfo(Text.BEHAVIOR_UPDATED);
  });
}

SteeringBehaviorCreatorGUIHandler.prototype.addPriorityBehaviorFolder = function(parentContainer, info, behavior){
  var folder = parentContainer.addFolder(info.parameters.name);
  folder.add({
    "Remove": function(){
      parentContainer.removeFolder(folder);
      behavior.parameters.list.splice(behavior.parameters.list.indexOf(info), 1);
      terminal.clear();
      terminal.printInfo(Text.BEHAVIOR_REMOVED);
    }
  }, "Remove");
}

SteeringBehaviorCreatorGUIHandler.prototype.addBlendedBehaviorFolder = function(parentContainer, info, behavior){
  var folder = parentContainer.addFolder(info.behavior.parameters.name);
  var confs = {weight: "" + info.weight};
  this.addNumericalController(folder, confs, "weight", function(val){
    info.weight = val;
  });
  folder.add({
    "Remove": function(){
      parentContainer.removeFolder(folder);
      behavior.parameters.list.splice(behavior.parameters.list.indexOf(info), 1);
      terminal.clear();
      terminal.printInfo(Text.BEHAVIOR_REMOVED);
    }
  }, "Remove");
}
