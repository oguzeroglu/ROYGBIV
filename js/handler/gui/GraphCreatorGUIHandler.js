var GraphCreatorGUIHandler = function(){

}

GraphCreatorGUIHandler.prototype.show = function(graphID, markedPoints){

  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_ADD_EDGES);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  var graph = new Kompute.Graph();

  var debugModeOriginallyOn = false;

  if (steeringHandler.debugHelper){
    debugModeOriginallyOn = true;
    steeringHandler.switchDebugMode();
  }

  var verticesByMarkedPointName = {};

  for (var i = 0; i < markedPoints.length; i ++){
    var markedPoint = markedPoints[i];
    var vertex = new Kompute.Vector3D(markedPoint.x, markedPoint.y, markedPoint.z);
    graph.addVertex(vertex);
    verticesByMarkedPointName[markedPoint.name] = vertex;
  }

  var limitBBSize = LIMIT_BOUNDING_BOX.getSize(REUSABLE_VECTOR);
  var world = new Kompute.World(limitBBSize.x, limitBBSize.y, limitBBSize.z, BIN_SIZE);

  var debugHelper = new Kompute.DebugHelper(world, THREE, scene);

  guiHandler.datGuiGraphCreation = new dat.GUI({hideable: false});

  var markedPointNames = Object.keys(verticesByMarkedPointName);

  var addEdge = function(vertex1, vertex2, fromName, toName){
    if (!graph.addEdge(vertex1, vertex2)){
      terminal.printError(Text.EDGE_ALREADY_EXISTS);
    }else{
      terminal.printInfo(Text.EDGE_ADDED.replace(Text.PARAM1, fromName).replace(Text.PARAM2, toName));
      debugHelper.deactivate();
      debugHelper = new Kompute.DebugHelper(world, THREE, scene);
      debugHelper.visualiseGraph(graph);
    }
  }

  var removeEdge = function(vertex1, vertex2, fromName, toName){
    if (!graph.removeEdge(vertex1, vertex2)){
      terminal.printError(Text.EDGE_DOES_NOT_EXIST);
    }else{
      terminal.printInfo(Text.EDGE_REMOVED.replace(Text.PARAM1, fromName).replace(Text.PARAM2, toName));
      debugHelper.deactivate();
      debugHelper = new Kompute.DebugHelper(world, THREE, scene);
      debugHelper.visualiseGraph(graph);
    }
  }

  var onExit = function(isDone){
    terminal.clear();
    terminal.enable();
    terminal.printInfo(isDone? Text.GRAPH_CREATED: Text.OPERATION_CANCELLED);
    debugHelper.deactivate();

    if (debugModeOriginallyOn){
      steeringHandler.switchDebugMode();
    }

    guiHandler.hide(guiHandler.guiTypes.GRAPH_CREATOR);
  }

  var config = {
    "From": markedPointNames[0],
    "To": markedPointNames[0],
    "Direction": "Two ways",
    "Create edge": function(){
      terminal.clear();

      if (this["From"] == this["To"]){
        terminal.printError(Text.EDGE_MUST_CONTAIN_DIFFERENT_VERTICES);
        return;
      }

      var vertex1 = verticesByMarkedPointName[this["From"]];
      var vertex2 = verticesByMarkedPointName[this["To"]];
      addEdge(vertex1, vertex2, this["From"], this["To"]);

      if (this["Direction"] == "Two ways"){
        addEdge(vertex2, vertex1, this["To"], this["From"]);
      }
    },
    "Remove edge": function(){
      terminal.clear();

      var vertex1 = verticesByMarkedPointName[this["From"]];
      var vertex2 = verticesByMarkedPointName[this["To"]];

      removeEdge(vertex1, vertex2, this["From"], this["To"]);

      if (this["Direction"] == "Two ways"){
        removeEdge(vertex2, vertex1, this["To"], this["From"]);
      }
    },
    "Done": function(){

      var edgeCount = 0;
      graph.forEachEdge(function(){edgeCount ++;});

      if (edgeCount == 0){
        terminal.clear();
        terminal.printError(Text.NO_EDGE_ADDED);
        return;
      }

      steeringHandler.registerGraph(graphID, graph);
      onExit(true);
    },
    "Cancel": function(){
      onExit(false);
    }
  };

  guiHandler.datGuiGraphCreation.add(config, "From", markedPointNames).listen();
  guiHandler.datGuiGraphCreation.add(config, "To", markedPointNames).listen();
  guiHandler.datGuiGraphCreation.add(config, "Direction", ["One way", "Two ways"]).listen();
  guiHandler.datGuiGraphCreation.add(config, "Create edge").listen();
  guiHandler.datGuiGraphCreation.add(config, "Remove edge").listen();
  guiHandler.datGuiGraphCreation.add(config, "Done").listen();
  guiHandler.datGuiGraphCreation.add(config, "Cancel").listen();
}
