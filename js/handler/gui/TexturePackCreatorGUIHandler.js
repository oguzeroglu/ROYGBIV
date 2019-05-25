var TexturePackCreatorGUIHandler = function(){
  this.testTypes = ["BOX", "SPHERE", "SURFACE", "CYLINDER"];
}

TexturePackCreatorGUIHandler.prototype.init = function(){
  this.configurations = {
    "Texture pack": "",
    "Test type": "BOX",
    "Done": function(){

    },
    "Cancel": function(){

    }
  }
}

TexturePackCreatorGUIHandler.prototype.disposeTestMesh = function(){
  this.testMesh.geometry.dispose();
  if (!(typeof this.testMesh.material.uniforms.diffuseMap == UNDEFINED)){
    this.testMesh.material.uniforms.diffuseMap.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.alphaMap == UNDEFINED)){
    this.testMesh.material.uniforms.alphaMap.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.aoMap == UNDEFINED)){
    this.testMesh.material.uniforms.aoMap.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.emissiveMap == UNDEFINED)){
    this.testMesh.material.uniforms.emissiveMap.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.displacementMap == UNDEFINED)){
    this.testMesh.material.uniforms.displacementMap.dispose();
  }
  this.testMesh.material.dispose();
}

TexturePackCreatorGUIHandler.prototype.handleTestMesh = function(){
  if (this.testMesh){
    scene.remove(this.testMesh);
    this.disposeTestMesh();
    this.testMesh = 0;
  }
  var geometry;
  switch(this.configurations["Test type"]){
    case "BOX": geometry = new THREE.BoxBufferGeometry(50, 50, 50); break;
    case "SPHERE": geometry = new THREE.SphereBufferGeometry(25); break;
    case "SURFACE": geometry = new THREE.PlaneBufferGeometry(50, 50); break;
    case "CYLINDER": geometry = new THREE.CylinderBufferGeometry(25, 25, 20); break;
    default: throw new Error("Type not supported."); break;
  }
  this.testMesh = new MeshGenerator(geometry, new BasicMaterial({name: "test", color: "#ffffff", alpha: 1})).generateMesh();
  scene.add(this.testMesh);
}

TexturePackCreatorGUIHandler.prototype.show = function(texturePackName, folders){
  this.init();
  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();
  this.hiddenEngineObjects = [];
  for (var i = 0; i<scene.children.length; i++){
    var child = scene.children[i];
    if (child.visible){
      child.visible = false;
      this.hiddenEngineObjects.push(child);
    }
  }
  activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
  activeControl.onActivated();
  guiHandler.datGuiTexturePack = new dat.GUI({hideable: false});
  guiHandler.datGuiTexturePack.add(this.configurations, "Texture pack", folders).onChange(function(val){

  }).listen();
  guiHandler.datGuiTexturePack.add(this.configurations, "Test type", this.testTypes).onChange(function(val){
    texturePackCreatorGUIHandler.handleTestMesh();
  }).listen();
  guiHandler.datGuiTexturePack.add(this.configurations, "Cancel");
  guiHandler.datGuiTexturePack.add(this.configurations, "Done");
  this.handleTestMesh();
}
