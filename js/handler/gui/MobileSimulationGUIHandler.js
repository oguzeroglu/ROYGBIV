var MobileSimulationGUIHandler = function(){

}

MobileSimulationGUIHandler.prototype.show = function(){
  terminal.clear();
  terminal.printInfo(Text.MOBILE_SIMULATION_GUI_OPENED);
  guiHandler.datGuiMobileSimulation = new dat.GUI({hideable: false});

  var params = {
    "Active": mobileSimulation.isActive,
    "Is IOS": mobileSimulation.isIOS,
    "Orientation": mobileSimulation.orientation,
    "Done": function(){
      terminal.clear();
      guiHandler.hide(guiHandler.guiTypes.MOBILE_SIMULATION);
      terminal.printInfo(Text.GUI_CLOSED);
    }
  };

  guiHandler.datGuiMobileSimulation.add(params, "Active").onChange(function(val){
    mobileSimulation.isActive = val;
  });
  guiHandler.datGuiMobileSimulation.add(params, "Is IOS").onChange(function(val){
    mobileSimulation.isIOS = val;
  });
  guiHandler.datGuiMobileSimulation.add(params, "Orientation", ["landscape", "portrait"]).onChange(function(val){
    mobileSimulation.orientation = val;
    if (mobileSimulation.isActive && screenOrientationChangeCallbackFunction){
      screenOrientationChangeCallbackFunction(val == "landscape")
    }
  });
  guiHandler.datGuiMobileSimulation.add(params, "Done");
}
