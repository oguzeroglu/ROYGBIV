var MacroHandler = function(){
  this.isMacroHandler = true;
}

MacroHandler.prototype.injectMacro = function(macro, material, insertVertexShader, insertFragmentShader){
  var macroText = "#define "+macro;
  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.removeMacro = function(macro, material, removeVertexShader, removeFragmentShader){
  if (removeVertexShader){
    material.vertexShader = material.vertexShader.replace("\n#define "+macro, "");
  }
  if (removeFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n#define "+macro, "");
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.getMacroValue = function(macro, material, fromVertexShader){
  var shaderCode = fromVertexShader? material.vertexShader: material.fragmentShader;
  var splitted = shaderCode.split("\n");
  for (var i = 0; i < splitted.length; i ++){
    if (splitted[i].startsWith("#define " + macro)){
      var lineSplitted = splitted[i].split(" ");
      return lineSplitted[lineSplitted.length - 1];
    }
  }
  return null;
}
