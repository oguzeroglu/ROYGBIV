var MacroHandler = function(){
  this.isMacroHandler = true;
}

MacroHandler.prototype.injectMacro = function(macro, material, insertVertexShader, insertFragmentShader){
  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace(
      "#define INSERTION", "#define INSERTION\n#define "+macro
    )
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace(
      "#define INSERTION", "#define INSERTION\n#define "+macro
    )
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
