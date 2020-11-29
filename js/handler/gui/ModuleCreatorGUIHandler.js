var ModuleCreatorGUIHandler = function(){

}

ModuleCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.LOADING_MODULES);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  moduleHandler.getFiles(function(files){
    if (files.length == 0 && Object.keys(moduleHandler.includedModules).length == 0){
      terminal.enable();
      terminal.clear();
      terminal.printError(Text.NO_MODULES_UNDER_MODULES_FOLDER);
      return;
    }

    guiHandler.datGuiModuleCreation = new dat.GUI({hideable: false});

    moduleCreatorGUIHandler.isBlocked = false;
    terminal.printInfo(Text.USE_GUI_TO_ADD_REMOVE_MODULES);

    var added = {};
    for (var i = 0; i < files.length; i ++){
      moduleCreatorGUIHandler.addModuleFolder(files[i]);
      added[files[i]] = true;
    }
    for (var fileName in moduleHandler.includedModules){
      if (!added[fileName]){
        moduleCreatorGUIHandler.addModuleFolder(fileName);
      }
    }

    guiHandler.datGuiModuleCreation.add({
      "Done": function(){
        if (moduleCreatorGUIHandler.isBlocked){
          return;
        }

        moduleCreatorGUIHandler.hide();
      }
    }, "Done");
  });
}

ModuleCreatorGUIHandler.prototype.addModuleFolder = function(fileName){
  var folder = guiHandler.datGuiModuleCreation.addFolder(fileName);

  var params = {
    "Included": !!moduleHandler.includedModules[fileName]
  };

  folder.add(params, "Included").onChange(function(val){
    if (moduleCreatorGUIHandler.isBlocked){
      params["Included"] = !val;
      return;
    }

    if (val){
      terminal.clear();
      terminal.printInfo(Text.ADDING_MODULE);
      moduleCreatorGUIHandler.isBlocked = true;
      moduleHandler.addModule(fileName, function(){
        terminal.clear();
        terminal.printInfo(Text.MODULE_ADDED);
        moduleCreatorGUIHandler.isBlocked = false;
      });
    }else{
      moduleHandler.removeModule(fileName);
      terminal.clear();
      terminal.printInfo(Text.MODULE_REMOVED);
    }
  }).listen();
}

ModuleCreatorGUIHandler.prototype.hide = function(){
  terminal.clear();
  terminal.enable();
  guiHandler.hide(guiHandler.guiTypes.MODULE_CREATION);
  terminal.printInfo(Text.GUI_CLOSED);
}
