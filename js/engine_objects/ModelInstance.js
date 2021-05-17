var ModelInstance = function(name, model, mesh, physicsBody, destroyedGrids, gsName){
  this.isModelInstance = true;
  this.name = name;

  if (IS_WORKER_CONTEXT){
    return;
  }

  this.mesh = mesh;
  this.model = model;
  this.physicsBody = physicsBody;
  this.gsName = gsName;
  this.destroyedGrids = destroyedGrids;

  for (var gridName in this.destroyedGrids){
    this.destroyedGrids[gridName].destroyedModelInstance = this.name;
  }

  this.scale = this.mesh.scale.x;

  this.animationGroup1 = null;
  this.animationGroup2 = null;

  this.animations = new Object();

  this.matrixCache1 = new THREE.Matrix4();
  this.matrixCache2 = new THREE.Matrix4();

  mesh.updateMatrixWorld(true);
  var worldInverseTranspose = new THREE.Matrix4().getInverse(mesh.matrixWorld).transpose();

  macroHandler.injectMat4("worldMatrix", mesh.matrixWorld, mesh.material, true, false);
  macroHandler.injectMat4("worldInverseTranspose", worldInverseTranspose, mesh.material, true, false);

  this.alpha = 1;
  this.depthWrite = true;
  this.blending = NORMAL_BLENDING;
  this.specularColor = {r: 1, g: 1, b: 1};

  this.disabledSpecularityIndices = {};
  this.disabledEnvMappingIndices = {};
  this.envMapModeIndices = {};
  this.refreshDisabledSpecularities();
  this.refreshDisabledEnvMapping();
  this.refreshEnvMapMode();

  this.textureTransformsByMaterialIndex = {};

  this.doubleClickListeners = {};

  webglCallbackHandler.registerEngineObject(this);
}

ModelInstance.prototype.setSpecularColor = function(r, g, b){
  macroHandler.replaceVec3("SPECULAR_COLOR", {x: this.specularColor.r, y: this.specularColor.g, z: this.specularColor.b}, {x: r, y: g, z: b}, this.mesh.material, false, true);
  this.specularColor.r = r;
  this.specularColor.g = g;
  this.specularColor.b = b;
}

ModelInstance.prototype.updateWorldInverseTranspose = function(val){
  if (!projectLoaded){
    return;
  }
  this.mesh.updateMatrixWorld(true);
  val.getInverse(this.mesh.matrixWorld).transpose();
}

ModelInstance.prototype.onTextureAtlasRefreshed = function(){
  if (this.model.getUsedTextures().length == 0){
    return;
  }

  this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
}

ModelInstance.prototype.export = function(){
  var exportObj = {
    modelName: this.model.name,
    gsName: this.gsName,
    position: {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z
    },
    quaternion: {
      x: this.mesh.quaternion.x,
      y: this.mesh.quaternion.y,
      z: this.mesh.quaternion.z,
      w: this.mesh.quaternion.w
    },
    scale: this.mesh.scale.x,
    affectedByLight: !!this.affectedByLight,
    alpha: this.alpha,
    depthWrite: this.depthWrite,
    blending: this.blending,
    specularColor: this.specularColor,
    selectByChild: !!this.selectByChild,
    useOriginalGeometryForPicking: !!this.useOriginalGeometryForPicking
  };

  var destroyedGridsExport = {};
  for (var gridName in this.destroyedGrids){
    destroyedGridsExport[gridName] = this.destroyedGrids[gridName].export();
  }

  exportObj.destroyedGrids = destroyedGridsExport;
  exportObj.hiddenInDesignMode = !!this.hiddenInDesignMode;
  exportObj.noMass = !!this.noMass;
  exportObj.isIntersectable = !!this.isIntersectable;

  if (this.affectedByLight){
    exportObj.lightingType = this.lightingType;

    if (this.model.info.hasNormalMap && this.lightingType == lightHandler.lightTypes.PHONG){
      exportObj.normalScale = {
        x: this.mesh.material.uniforms.normalScale.value.x,
        y: this.mesh.material.uniforms.normalScale.value.y
      };
    }
  }

  if (this.hasEnvironmentMap()){
    exportObj.environmentMapInfo = this.environmentMapInfo;
  }

  exportObj.isSpecularityEnabled = !!this.isSpecularityEnabled;

  if (this.animationGroup1){
    exportObj.animationGroup1 = this.animationGroup1.export();
  }
  if (this.animationGroup2){
    exportObj.animationGroup2 = this.animationGroup2.export();
  }

  exportObj.animations = new Object();
  for (var animationName in this.animations){
    exportObj.animations[animationName] = this.animations[animationName].export();
  }

  exportObj.disabledSpecularityIndices = this.disabledSpecularityIndices;
  exportObj.disabledEnvMappingIndices = this.disabledEnvMappingIndices;
  exportObj.envMapModeIndices = this.envMapModeIndices;

  exportObj.hasPBR = this.hasPBR;
  exportObj.pbrLightAttenuationCoef = this.pbrLightAttenuationCoef;
  exportObj.toneMappingInfo = this.toneMappingInfo;

  exportObj.renderSide = this.mesh.material.side;

  if (this.fresnelFactor){
    exportObj.fresnelFactor = JSON.parse(JSON.stringify(this.fresnelFactor));
  }

  exportObj.isCompressed = this.isCompressed;

  exportObj.aoIntensity = this.aoIntensity;

  return exportObj;
}

ModelInstance.prototype.exportLightweight = function(){
  this.mesh.updateMatrixWorld(true);

  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }

  var exportObject = new Object();

  exportObject.vertices = [];
  exportObject.transformedVertices = [];
  exportObject.triangles = [];
  exportObject.pseudoFaces = [];

  for (var i = 0; i<this.vertices.length; i++){
    exportObject.vertices.push({x: this.vertices[i].x, y: this.vertices[i].y, z: this.vertices[i].z})
  }
  for (var i = 0; i<this.transformedVertices.length; i++){
    exportObject.transformedVertices.push({x: this.transformedVertices[i].x, y: this.transformedVertices[i].y, z: this.transformedVertices[i].z})
  }
  for (var i = 0; i<this.triangles.length; i++){
    exportObject.triangles.push({a: this.triangles[i].a, b: this.triangles[i].b, c: this.triangles[i].c})
  }
  for (var i = 0; i<this.pseudoFaces.length; i++){
    exportObject.pseudoFaces.push(this.pseudoFaces[i]);
  }

  if (this.hiddenInDesignMode){
    exportObject.hiddenInDesignMode = true;
  }

  var physicsXParam = (this.model.info.originalBoundingBox.max.x - this.model.info.originalBoundingBox.min.x) * this.scale;
  var physicsYParam = (this.model.info.originalBoundingBox.max.y - this.model.info.originalBoundingBox.min.y) * this.scale;
  var physicsZParam = (this.model.info.originalBoundingBox.max.z - this.model.info.originalBoundingBox.min.z) * this.scale;
  exportObject.physicsShapeParameters = {x: physicsXParam/2, y: physicsYParam/2, z: physicsZParam/2};
  exportObject.physicsPosition = {
    x: this.physicsBody.position.x,
    y: this.physicsBody.position.y,
    z: this.physicsBody.position.z
  };
  exportObject.physicsQuaternion = {
    x: this.physicsBody.quaternion.x,
    y: this.physicsBody.quaternion.y,
    z: this.physicsBody.quaternion.z,
    w: this.physicsBody.quaternion.w
  };

  exportObject.noMass = !!this.noMass;
  exportObject.isIntersectable = this.isIntersectable;

  return exportObject;
}

ModelInstance.prototype.correctBoundingBox = function(bb){
  if (bb.min.x >= bb.max.x){
    bb.max.x += 0.5;
    bb.min.x -= 0.5;
  }
  if (bb.min.y >= bb.max.y){
    bb.max.y += 0.5;
    bb.min.y -= 0.5;
  }
  if (bb.min.z >= bb.max.z){
    bb.max.z += 0.5;
    bb.min.z -= 0.5;
  }
}

ModelInstance.prototype.generateBoundingBoxes = function(){
  this.boundingBoxes = [];
  this.transformedVertices = [];
  this.triangles = [];
  this.trianglePlanes = [];
  this.pseudoFaces = [];
  this.vertices = [];

  var bbs = this.getBBs();

  for (var x = 0; x < bbs.length; x ++){
    var center = bbs[x].center;
    var size = bbs[x].size;

    this.boundingBoxes.push(new THREE.Box3().setFromCenterAndSize(center, size));

    if (this.useOriginalGeometryForPicking){
      continue;
    }

    var pseudoGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    var pseudoObj = new THREE.Object3D();
    pseudoObj.position.copy(center);
    pseudoObj.updateMatrixWorld(true);
    var transformedVertices =[];
    for (var i = 0; i < pseudoGeometry.vertices.length; i ++){
      this.vertices.push(pseudoGeometry.vertices[i]);
      var vertex = pseudoGeometry.vertices[i].clone();
      vertex.applyMatrix4(pseudoObj.matrixWorld);
      this.transformedVertices.push(vertex);
      transformedVertices.push(vertex);
    }

    for (var i = 0; i < pseudoGeometry.faces.length; i ++){
      var face = pseudoGeometry.faces[i];
      var a = face.a;
      var b = face.b;
      var c = face.c;
      var triangle = new THREE.Triangle(
        transformedVertices[a], transformedVertices[b], transformedVertices[c]
      );
      this.triangles.push(triangle);
      var plane = new THREE.Plane();
      triangle.getPlane(plane);
      this.trianglePlanes.push(plane);
      this.pseudoFaces.push(face);
    }
  }

  if (this.useOriginalGeometryForPicking){
    this.mesh.updateMatrixWorld(true);
    var geom = (new THREE.Geometry()).fromBufferGeometry(this.mesh.geometry);
    var transformedVertices =[];
    for (var i = 0; i < geom.vertices.length; i ++){
      this.vertices.push(geom.vertices[i]);
      var vertex = geom.vertices[i].clone();
      vertex.applyMatrix4(this.mesh.matrixWorld);
      this.transformedVertices.push(vertex);
      transformedVertices.push(vertex);
    }

    for (var i = 0; i < geom.faces.length; i ++){
      var face = geom.faces[i];
      var a = face.a;
      var b = face.b;
      var c = face.c;
      var triangle = new THREE.Triangle(
        transformedVertices[a], transformedVertices[b], transformedVertices[c]
      );
      this.triangles.push(triangle);
      var plane = new THREE.Plane();
      triangle.getPlane(plane);
      this.trianglePlanes.push(plane);
      this.pseudoFaces.push(face);
    }
  }

  for (var i = 0; i < this.boundingBoxes.length; i ++){
    this.correctBoundingBox(this.boundingBoxes[i]);
  }
}

ModelInstance.prototype.visualiseBoundingBoxes = function(indices){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  if (this.bbHelpers){
    for (var i = 0; i<this.bbHelpers.length; i++){
      scene.remove(this.bbHelpers[i]);
    }
  }
  this.bbHelpers = [];
  for (var i = 0; i<this.boundingBoxes.length; i++){
    if (indices && indices.indexOf(i) < 0){
      continue;
    }
    var bbHelper = new THREE.Box3Helper(this.boundingBoxes[i], LIME_COLOR);
    scene.add(bbHelper);
    this.bbHelpers.push(bbHelper);
  }
}

ModelInstance.prototype.removeBoundingBoxesFromScene = function(){
  if (this.bbHelpers){
    for (var i = 0; i<this.bbHelpers.length; i++){
      scene.remove(this.bbHelpers[i]);
    }
  }
  this.bbHelpers = [];
}

ModelInstance.prototype.intersectsLine = function(line){
  for (var i = 0; i< this.trianglePlanes.length; i+=2){
    var plane = this.trianglePlanes[i];
    if (plane.intersectLine(line, REUSABLE_VECTOR)){
      var triangle1 = this.triangles[i];
      var triangle2 = this.triangles[i+1];
      if (triangle1 && triangle1.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }else if (triangle2 && triangle2.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }
    }
  }
  return false;
}

ModelInstance.prototype.hideVisually = function(){
  this.mesh.visible = false;
}

ModelInstance.prototype.showVisually = function(){
  this.mesh.visible = true;
}

ModelInstance.prototype.hideInDesignMode = function(skipRaycasterRefresh){
  if (isDeployment){
    return;
  }
  this.hideVisually();
  this.hiddenInDesignMode = true;

  if (!skipRaycasterRefresh){
    refreshRaycaster(Text.OBJECT_HIDDEN);
  }
}

ModelInstance.prototype.showInDesignMode = function(){
  if (isDeployment){
    return;
  }
  this.showVisually();
  this.hiddenInDesignMode = false;
  refreshRaycaster(Text.OBJECT_SHOWN);
}

ModelInstance.prototype.setNoMass = function(val){
  if (!val){
    physicsWorld.addBody(this.physicsBody);
  }else{
    physicsWorld.remove(this.physicsBody);
  }
  this.noMass = val;
}

ModelInstance.prototype.setIntersectableStatus = function(val){
  this.isIntersectable = val;
}

ModelInstance.prototype.destroy = function(){
  scene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  this.mesh.material.dispose();
  for (var gridName in this.destroyedGrids){
    this.destroyedGrids[gridName].destroyedModelInstance = 0;
  }
}

ModelInstance.prototype.setAffectedByLight = function(isAffectedByLight){

  macroHandler.removeMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);

  delete this.mesh.material.uniforms.dynamicLightsMatrix;

  if (isAffectedByLight){
    macroHandler.injectMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);

    this.mesh.material.uniforms.dynamicLightsMatrix = lightHandler.getUniform();
    this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;

    lightHandler.addLightToObject(this);
  }else{
    lightHandler.removeLightFromObject(this);
    if (this.lightingType == lightHandler.lightTypes.PHONG){
      macroHandler.removeMacro("HAS_PHONG_LIGHTING", this.mesh.material, true, true);
      if (this.model.info.hasNormalMap){
        macroHandler.removeMacro("HAS_NORMAL_MAP", this.mesh.material, true, true);
        delete this.mesh.material.uniforms.normalScale;
      }
      if (this.model.info.hasSpecularMap){
        macroHandler.removeMacro("HAS_SPECULAR_MAP", this.mesh.material, true, true);
      }
    }
    delete this.lightingType;

    if (!this.hasEnvironmentMap()){
      delete this.mesh.material.uniforms.cameraPosition;
    }

    this.disableSpecularity();
  }

  this.mesh.material.needsUpdate = true;

  this.affectedByLight = isAffectedByLight;
  this.lightingType = lightHandler.lightTypes.GOURAUD;
}

ModelInstance.prototype.setPhongLight = function(){
  macroHandler.injectMacro("HAS_PHONG_LIGHTING", this.mesh.material, true, true);
  this.lightingType = lightHandler.lightTypes.PHONG;

  if (this.model.info.hasNormalMap){
    macroHandler.injectMacro("HAS_NORMAL_MAP", this.mesh.material, true, true);
  }

  if (this.model.info.hasNormalMap && !this.mesh.material.uniforms.normalScale){
    this.mesh.material.uniforms.normalScale = new THREE.Uniform(new THREE.Vector2(1, 1));
  }

  if (this.model.info.hasSpecularMap && !this.hasPBR){
    macroHandler.injectMacro("HAS_SPECULAR_MAP", this.mesh.material, true, true);
  }
}

ModelInstance.prototype.unsetPhongLight = function(){
  macroHandler.removeMacro("HAS_PHONG_LIGHTING", this.mesh.material, true, true);
  this.lightingType = lightHandler.lightTypes.GOURAUD;

  if (this.model.info.hasNormalMap){
    macroHandler.removeMacro("HAS_NORMAL_MAP", this.mesh.material, true, true);
    delete this.mesh.material.uniforms.normalScale;
  }

  if (this.model.info.hasSpecularMap){
    macroHandler.removeMacro("HAS_SPECULAR_MAP", this.mesh.material, true, true);
  }
}

ModelInstance.prototype.onBeforeRender = function(){
  if (renderer.bloomOn && bloom.configurations.isSelective){
    if (bloom.selectiveRenderingActive){
      this.mesh.material.uniforms.selectiveBloomFlag.value = -1000;
    }else{
      this.mesh.material.uniforms.selectiveBloomFlag.value = 0;
    }
  }
  if (this.animationGroup1){
    this.mesh.material.uniforms.animMatrix1.value.copy(this.animationGroup1.getWorldMatrix());
    this.mesh.material.uniforms.animModelViewMatrix1.value.multiplyMatrices(camera.matrixWorldInverse, this.mesh.material.uniforms.animMatrix1.value);
    if (this.affectedByLight){
      if (!this.matrixCache1.equals(this.mesh.material.uniforms.animMatrix1.value)){
        var matVal = this.mesh.material.uniforms.animWorldInverseTransposeMatrix1.value;
        matVal.getInverse(this.mesh.material.uniforms.animMatrix1.value).transpose();

        this.matrixCache1.copy(this.mesh.material.uniforms.animMatrix1.value);
      }
    }
  }
  if (this.animationGroup2){
    this.mesh.material.uniforms.animMatrix2.value.copy(this.animationGroup2.getWorldMatrix());
    this.mesh.material.uniforms.animModelViewMatrix2.value.multiplyMatrices(camera.matrixWorldInverse, this.mesh.material.uniforms.animMatrix2.value);
    if (this.affectedByLight){
      if (!this.matrixCache2.equals(this.mesh.material.uniforms.animMatrix2.value)){
        var matVal = this.mesh.material.uniforms.animWorldInverseTransposeMatrix2.value;
        matVal.getInverse(this.mesh.material.uniforms.animMatrix2.value).transpose();
        this.matrixCache2.copy(this.mesh.material.uniforms.animMatrix2.value);
      }
    }
  }
}

ModelInstance.prototype.visualiseNormals = function(){
  this.vertexNormalsHelper = new THREE.VertexNormalsHelper(this.mesh, 10, "lime", 1);
  scene.add(this.vertexNormalsHelper);
}

ModelInstance.prototype.unvisialiseNormals = function(){
  scene.remove(this.vertexNormalsHelper);
  delete this.vertexNormalsHelper;
}

ModelInstance.prototype.mapCustomTextures = function(texturesObj){
  var material = this.mesh.material;
  var uniforms = material.uniforms;
  if (!this.customTextureMapped){
    macroHandler.injectMacro("HAS_CUSTOM_TEXTURE", material, true, true);
    delete uniforms.texture;
  }

  var model = this.model;
  var usedTextures = model.getUsedTextures();
  var diffuseTextureIndexByTextureID = model.diffuseTextureIndexByTextureID;
  var normalTextureIndexByTextureID = model.normalTextureIndexByTextureID;
  var specularTextureIndexByTextureID = model.specularTextureIndexByTextureID;
  var alphaTextureIndexByTextureID = model.alphaTextureIndexByTextureID;
  var roughnessTextureIndexByTextureID = model.roughnessTextureIndexByTextureID;
  var metalnessTextureIndexByTextureID = model.metalnessTextureIndexByTextureID;
  var emissiveTextureIndexByTextureID = model.emissiveTextureIndexByTextureID;
  var aoTextureIndexByTextureID = model.aoTextureIndexByTextureID;

  for (var i = 0; i < usedTextures.length; i ++){
    var textureID = usedTextures[i].id;
    var diffuseTextureIndex = diffuseTextureIndexByTextureID[textureID];
    var normalTextureIndex = normalTextureIndexByTextureID[textureID];
    var specularTextureIndex = specularTextureIndexByTextureID[textureID];
    var alphaTextureIndex = alphaTextureIndexByTextureID[textureID];
    var roughnessTextureIndex = roughnessTextureIndexByTextureID[textureID];
    var metalnessTextureIndex = metalnessTextureIndexByTextureID[textureID];
    var emissiveTextureIndex = emissiveTextureIndexByTextureID[textureID];
    var aoTextureIndex = aoTextureIndexByTextureID[textureID];

    if (!(typeof diffuseTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customDiffuseTexture" + diffuseTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_TEXTURE_" + diffuseTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }else if (!(typeof normalTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customNormalTexture" + normalTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_NORMAL_TEXTURE_" + normalTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }else if (!(typeof specularTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customSpecularTexture" + specularTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_SPECULAR_TEXTURE_" + specularTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }else if (!(typeof alphaTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customAlphaTexture" + alphaTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_ALPHA_TEXTURE_" + alphaTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }else if (!(typeof roughnessTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customRoughnessTexture" + roughnessTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_ROUGHNESS_TEXTURE_" + roughnessTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }else if (!(typeof metalnessTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customMetalnessTexture" + metalnessTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_METALNESS_TEXTURE_" + metalnessTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }else if (!(typeof emissiveTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customEmissiveTexture" + emissiveTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_EMISSIVE_TEXTURE_" + emissiveTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }else if (!(typeof aoTextureIndex == UNDEFINED)){
      var texture = texturesObj[textureID].diffuseTexture;
      var key = "customAOTexture" + aoTextureIndex;
      if (!uniforms[key]){
        uniforms[key] = new THREE.Uniform(texture);
        macroHandler.injectMacro("CUSTOM_AO_TEXTURE_" + aoTextureIndex, material, false, true);
      }else{
        uniforms[key].value = texture;
      }
    }
  }

  this.customTextureMapped = true;
}

ModelInstance.prototype.unmapCustomTextures = function(){
  var material = this.mesh.material;
  var uniforms = material.uniforms;

  macroHandler.removeMacro("HAS_CUSTOM_TEXTURE", material, true, true);

  var model = this.model;
  var usedTextures = model.getUsedTextures();
  var diffuseTextureIndexByTextureID = model.diffuseTextureIndexByTextureID;
  var normalTextureIndexByTextureID = model.normalTextureIndexByTextureID;
  var specularTextureIndexByTextureID = model.specularTextureIndexByTextureID;
  var alphaTextureIndexByTextureID = model.alphaTextureIndexByTextureID;
  var roughnessTextureIndexByTextureID = model.roughnessTextureIndexByTextureID;
  var metalnessTextureIndexByTextureID = model.metalnessTextureIndexByTextureID;
  var emissiveTextureIndexByTextureID = model.emissiveTextureIndexByTextureID;
  var aoTextureIndexByTextureID = model.aoTextureIndexByTextureID;

  for (var i = 0; i < usedTextures.length; i ++){
    var textureID = usedTextures[i].id;
    var diffuseTextureIndex = diffuseTextureIndexByTextureID[textureID];
    var normalTextureIndex = normalTextureIndexByTextureID[textureID];
    var specularTextureIndex = specularTextureIndexByTextureID[textureID];
    var alphaTextureIndex = alphaTextureIndexByTextureID[textureID];
    var roughnessTextureIndex = roughnessTextureIndexByTextureID[textureID];
    var metalnessTextureIndex = metalnessTextureIndexByTextureID[textureID];
    var emissiveTextureIndex = emissiveTextureIndexByTextureID[textureID];
    var aoTextureIndex = aoTextureIndexByTextureID[textureID];

    if (!(typeof diffuseTextureIndex == UNDEFINED)){
      var key = "customDiffuseTexture" + diffuseTextureIndex;
      macroHandler.removeMacro("CUSTOM_TEXTURE_" + diffuseTextureIndex, material, false, true);
      delete uniforms[key];
    }else if (!(typeof normalTextureIndex == UNDEFINED)){
      var key = "customNormalTexture" + normalTextureIndex;
      macroHandler.removeMacro("CUSTOM_NORMAL_TEXTURE_" + normalTextureIndex, material, false, true);
      delete uniforms[key];
    }else if (!(typeof specularTextureIndex == UNDEFINED)){
      var key = "customSpecularTexture" + specularTextureIndex;
      macroHandler.removeMacro("CUSTOM_SPECULAR_TEXTURE_" + specularTextureIndex, material, false, true);
      delete uniforms[key];
    }else if (!(typeof alphaTextureIndex == UNDEFINED)){
      var key = "customAlphaTexture" + alphaTextureIndex;
      macroHandler.removeMacro("CUSTOM_ALPHA_TEXTURE_" + alphaTextureIndex, material, false, true);
      delete uniforms[key];
    }else if (!(typeof roughnessTextureIndex == UNDEFINED)){
      var key = "customRoughnessTexture" + roughnessTextureIndex;
      macroHandler.removeMacro("CUSTOM_ROUGHNESS_TEXTURE_" + roughnessTextureIndex, material, false, true);
      delete uniforms[key];
    }else if (!(typeof metalnessTextureIndex == UNDEFINED)){
      var key = "customMetalnessTexture" + metalnessTextureIndex;
      macroHandler.removeMacro("CUSTOM_METALNESS_TEXTURE_" + metalnessTextureIndex, material, false, true);
      delete uniforms[key];
    }else if (!(typeof emissiveTextureIndex == UNDEFINED)){
      var key = "customEmissiveTexture" + emissiveTextureIndex;
      macroHandler.removeMacro("CUSTOM_EMISSIVE_TEXTURE_" + emissiveTextureIndex, material, false, true);
      delete uniforms[key];
    }else if (!(typeof aoTextureIndex == UNDEFINED)){
      var key = "customAOTexture" + aoTextureIndex;
      macroHandler.removeMacro("CUSTOM_AO_TEXTURE_" + aoTextureIndex, material, false, true);
      delete uniforms[key];
    }
  }

  uniforms.texture = textureAtlasHandler.getTextureUniform();

  this.customTextureMapped = false;
}

ModelInstance.prototype.getBBs = function(){
  var totalBB = new THREE.Box3();
  this.model.group.position.copy(this.mesh.position);
  this.model.group.quaternion.copy(this.mesh.quaternion);
  this.model.group.scale.set(this.scale, this.scale, this.scale);
  this.model.group.updateMatrixWorld(true);
  this.model.group.updateMatrix(true);

  var bbs = [];
  for (var i = 0; i < this.model.group.children.length; i ++){
    this.model.group.children[i].updateMatrixWorld(true);
    this.model.group.children[i].updateMatrix(true);
    var curMatrixWorld = this.model.group.children[i].matrixWorld;
    var curBB = this.model.info.childInfos[i].bb;
    var bb = new THREE.Box3(new THREE.Vector3(curBB.minX, curBB.minY, curBB.minZ), new THREE.Vector3(curBB.maxX, curBB.maxY, curBB.maxZ));
    bb.applyMatrix4(curMatrixWorld);
    totalBB.expandByPoint(bb.min);
    totalBB.expandByPoint(bb.max);
    bbs.push(bb);
  }

  var origBB = new THREE.Box3().setFromObject(this.mesh);
  var diff = totalBB.getCenter(new THREE.Vector3()).sub(origBB.getCenter(new THREE.Vector3()));
  for (var i = 0; i < bbs.length; i ++){
    var bb = bbs[i];
    var size = bb.getSize(new THREE.Vector3());
    var center = bb.getCenter(new THREE.Vector3());
    center.sub(diff);
    bbs[i] = {center: center, size: size}
  }

  return bbs;
}

ModelInstance.prototype.hasEnvironmentMap = function(){
  return !!this.mesh.material.uniforms.environmentMap;
}

ModelInstance.prototype.updateEnvironmentMap = function(skybox){
  if (!this.hasEnvironmentMap()){
    return;
  }

  this.mesh.material.uniforms.environmentMap = skybox.getUniform();
  this.environmentMapInfo.skyboxName = skybox.name;

  var macroVal = macroHandler.getMacroValue("ENVIRONMENT_MAP_SIZE", this.mesh.material, false);

  macroHandler.removeMacro("ENVIRONMENT_MAP_SIZE " + macroVal, this.mesh.material, false, true);
  macroHandler.injectMacro("ENVIRONMENT_MAP_SIZE " + skybox.imageSize, this.mesh.material, false, true);

  if (this.isHDR && !skybox.isHDR){
    macroHandler.removeMacro("IS_HDR", this.mesh.material, false, true);
    this.isHDR = false;
  }else if (!this.isHDR && skybox.isHDR){
    macroHandler.injectMacro("IS_HDR", this.mesh.material, false, true);
    this.isHDR = true;
  }
}

ModelInstance.prototype.setEnvMapFallbackDiffuseValue = function(fallbackDiffuse){
  var macroValR = macroHandler.getMacroValue("ENV_DIFFUSE_FALLBACK_R", this.mesh.material, false);
  var macroValG = macroHandler.getMacroValue("ENV_DIFFUSE_FALLBACK_G", this.mesh.material, false);
  var macroValB = macroHandler.getMacroValue("ENV_DIFFUSE_FALLBACK_B", this.mesh.material, false);

  if (macroValR != null){
    macroHandler.removeMacro("ENV_DIFFUSE_FALLBACK_R " + macroValR, this.mesh.material, false, true);
    macroHandler.removeMacro("ENV_DIFFUSE_FALLBACK_G " + macroValG, this.mesh.material, false, true);
    macroHandler.removeMacro("ENV_DIFFUSE_FALLBACK_B " + macroValB, this.mesh.material, false, true);
  }

  if (!fallbackDiffuse){
    return;
  }

  macroHandler.injectMacro("ENV_DIFFUSE_FALLBACK_R " + fallbackDiffuse.r, this.mesh.material, false, true);
  macroHandler.injectMacro("ENV_DIFFUSE_FALLBACK_G " + fallbackDiffuse.g, this.mesh.material, false, true);
  macroHandler.injectMacro("ENV_DIFFUSE_FALLBACK_B " + fallbackDiffuse.b, this.mesh.material, false, true);

  this.environmentMapInfo.fallbackDiffuse = fallbackDiffuse;
}

ModelInstance.prototype.mapEnvironment = function(skybox, fallbackDiffuse){
  if (this.hasEnvironmentMap()){
    this.unmapEnvironment();
  }

  this.mesh.material.uniforms.environmentMap = skybox.getUniform();
  this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;

  var environmentInfoArray = new Float32Array(this.mesh.geometry.attributes.position.array.length);
  var i2 = 0;
  for (var i = 0; i < environmentInfoArray.length; i += 3){
    environmentInfoArray[i] = 100;
    environmentInfoArray[i + 1] = 1;
  }

  macroHandler.injectMacro("HAS_ENVIRONMENT_MAP", this.mesh.material, true, true);
  macroHandler.injectMacro("ENVIRONMENT_MAP_SIZE " + skybox.imageSize, this.mesh.material, false, true);

  this.fresnelFactor = {r: 1, g: 1, b: 1};
  macroHandler.injectMacro("FRESNEL_COEF_R 1", this.mesh.material, false, true);
  macroHandler.injectMacro("FRESNEL_COEF_G 1", this.mesh.material, false, true);
  macroHandler.injectMacro("FRESNEL_COEF_B 1", this.mesh.material, false, true);

  this.environmentMapInfo = {
    skyboxName: skybox.name
  };

  this.setEnvMapFallbackDiffuseValue(fallbackDiffuse);

  if (skybox.isHDR){
    macroHandler.injectMacro("IS_HDR", this.mesh.material, false, true);
    this.isHDR = true;
  }
}

ModelInstance.prototype.unmapEnvironment = function(){
  if (!this.hasEnvironmentMap()){
    return;
  }

  delete this.mesh.material.uniforms.environmentMap;
  if (!this.affectedByLight){
    delete this.mesh.material.uniforms.cameraPosition;
  }

  macroHandler.removeMacro("HAS_ENVIRONMENT_MAP", this.mesh.material, true, true);

  var macroVal = macroHandler.getMacroValue("ENVIRONMENT_MAP_SIZE", this.mesh.material, false);
  macroHandler.removeMacro("ENVIRONMENT_MAP_SIZE " + macroVal, this.mesh.material, false, true);

  this.setEnvMapFallbackDiffuseValue(null);

  macroHandler.removeMacro("FRESNEL_COEF_R " + this.fresnelFactor.r, this.mesh.material, false, true);
  macroHandler.removeMacro("FRESNEL_COEF_G " + this.fresnelFactor.g, this.mesh.material, false, true);
  macroHandler.removeMacro("FRESNEL_COEF_B " + this.fresnelFactor.b, this.mesh.material, false, true);
  delete this.fresnelFactor;

  if (this.isHDR){
    macroHandler.removeMacro("IS_HDR", this.mesh.material, false, true);
    this.isHDR = false;
  }
}

ModelInstance.prototype.modifyFresnelFactor = function(r, g, b){
  if (!this.fresnelFactor){
    return;
  }

  macroHandler.removeMacro("FRESNEL_COEF_R " + this.fresnelFactor.r, this.mesh.material, false, true);
  macroHandler.removeMacro("FRESNEL_COEF_G " + this.fresnelFactor.g, this.mesh.material, false, true);
  macroHandler.removeMacro("FRESNEL_COEF_B " + this.fresnelFactor.b, this.mesh.material, false, true);

  this.fresnelFactor.r = r;
  this.fresnelFactor.g = g;
  this.fresnelFactor.b = b;

  macroHandler.injectMacro("FRESNEL_COEF_R " + this.fresnelFactor.r, this.mesh.material, false, true);
  macroHandler.injectMacro("FRESNEL_COEF_G " + this.fresnelFactor.g, this.mesh.material, false, true);
  macroHandler.injectMacro("FRESNEL_COEF_B " + this.fresnelFactor.b, this.mesh.material, false, true);
}

ModelInstance.prototype.disableSpecularity = function(){
  if (!this.isSpecularityEnabled){
    return;
  }

  macroHandler.removeMacro("ENABLE_SPECULARITY", this.mesh.material, true, true);
  this.isSpecularityEnabled = false;
}

ModelInstance.prototype.enableSpecularity = function(){
  if (this.isSpecularityEnabled){
    return;
  }

  macroHandler.injectMacro("ENABLE_SPECULARITY", this.mesh.material, true, true);
  this.isSpecularityEnabled = true;
}

ModelInstance.prototype.isChildVisible = function(childIndex){
  if (isDeployment){
    return;
  }

  var ary = this.mesh.geometry.attributes.hiddenFlag.array;

  for (var i = 0; i < this.model.indexedMaterialIndices.length; i ++){
    if (this.model.indexedMaterialIndices[i] == childIndex){
      return ary[i] != 100;
    }
  }

  return false;
}

ModelInstance.prototype.hideChild = function(childIndex){
  if (isDeployment){
    return;
  }

  var ary = this.mesh.geometry.attributes.hiddenFlag.array;

  for (var i = 0; i < this.model.indexedMaterialIndices.length; i ++){
    if (this.model.indexedMaterialIndices[i] == childIndex){
      ary[i] = 100;
    }
  }

  this.mesh.geometry.attributes.hiddenFlag.updateRange.set(0, ary.length);
  this.mesh.geometry.attributes.hiddenFlag.needsUpdate = true;
}

ModelInstance.prototype.showChild = function(childIndex){
  if (isDeployment){
    return;
  }

  var ary = this.mesh.geometry.attributes.hiddenFlag.array;

  for (var i = 0; i < this.model.indexedMaterialIndices.length; i ++){
    if (typeof childIndex == UNDEFINED || childIndex == null || this.model.indexedMaterialIndices[i] == childIndex){
      ary[i] = -100;
    }
  }

  this.mesh.geometry.attributes.hiddenFlag.updateRange.set(0, ary.length);
  this.mesh.geometry.attributes.hiddenFlag.needsUpdate = true;
}

ModelInstance.prototype.hasAnimationGroup = function(animationGroup){
  return (this.animationGroup1 === animationGroup || this.animationGroup2 === animationGroup);
}

ModelInstance.prototype.removeAnimationGroup = function(animationGroup){
  if (!this.hasAnimationGroup(animationGroup)){
    return false;
  }

  macroHandler.replaceText(this.animationVertexShaderCode, "#ANIMATION_MATRIX_CODE" + "\n", this.mesh.material, true, false);
  macroHandler.removeMacro("HAS_ANIMATION", this.mesh.material, true, false);
  this.animationVertexShaderCode = null;

  if (animationGroup == this.animationGroup1){
    this.animationGroup1 = null;
    if (this.animationGroup2){
      var group2 = this.animationGroup2;
      this.animationGroup2 = null;
      this.addAnimationGroup(group2);
    }else{
      this.mesh.frustumCulled = true;
    }
  }else{
    this.animationGroup2 = null;
    var group1 = this.animationGroup1;
    this.animationGroup1 = null;
    this.addAnimationGroup(group1);
  }

  if (!this.animationGroup1){
    delete this.mesh.material.uniforms.animMatrix1;
    delete this.mesh.material.uniforms.animWorldInverseTransposeMatrix1;
  }
  if (!this.animationGroup2){
    delete this.mesh.material.uniforms.animMatrix2;
    delete this.mesh.material.uniforms.animWorldInverseTransposeMatrix2;
  }
}

ModelInstance.prototype.addAnimationGroup = function(animationGroup){
  if (this.hasAnimationGroup(animationGroup) || (this.animationGroup1 && this.animationGroup2)){
    return false;
  }

  if (this.animationGroup1){
    this.animationGroup2 = animationGroup;
    this.mesh.material.uniforms.animMatrix2 = new THREE.Uniform(new THREE.Matrix4());
    this.mesh.material.uniforms.animWorldInverseTransposeMatrix2 = new THREE.Uniform(new THREE.Matrix4());
    this.mesh.material.uniforms.animModelViewMatrix2 = new THREE.Uniform(new THREE.Matrix4());
  }else{
    this.animationGroup1 = animationGroup;
    this.mesh.material.uniforms.animMatrix1 = new THREE.Uniform(new THREE.Matrix4());
    this.mesh.material.uniforms.animWorldInverseTransposeMatrix1 = new THREE.Uniform(new THREE.Matrix4());
    this.mesh.material.uniforms.animModelViewMatrix1 = new THREE.Uniform(new THREE.Matrix4());
  }

  if (this.animationVertexShaderCode){
    macroHandler.replaceText(this.animationVertexShaderCode, "#ANIMATION_MATRIX_CODE" + "\n", this.mesh.material, true, false);
    macroHandler.removeMacro("HAS_ANIMATION", this.mesh.material, true, false);
  }

  var ifText1 = "";
  var ifText2 = "";
  for (var i = 0; i < this.animationGroup1.childrenIndices.length; i ++){
    var index = this.animationGroup1.childrenIndices[i];
    if (i != this.animationGroup1.childrenIndices.length - 1){
      ifText1 += "mi == " + index + " || ";
    }else{
      ifText1 += "mi == " + index;
    }
  }

  if (this.animationGroup2){
    for (var i = 0; i < this.animationGroup2.childrenIndices.length; i ++){
      var index = this.animationGroup2.childrenIndices[i];
      if (i != this.animationGroup2.childrenIndices.length - 1){
        ifText2 += "mi == " + index + " || ";
      }else{
        ifText2 += "mi == " + index;
      }
    }
  }else{
    ifText2 = "mi == -100";
  }

  ifText1 = ifText1 || "mi == -200";
  ifText2 = ifText2 || "mi == -100";

  this.animationVertexShaderCode = "if(@@1){ @@3 }else if(@@2){ @@4 }else{ @@5 }\n";
  this.animationVertexShaderCode = this.animationVertexShaderCode.replace("@@1", ifText1);
  this.animationVertexShaderCode = this.animationVertexShaderCode.replace("@@2", ifText2);
  this.animationVertexShaderCode = this.animationVertexShaderCode.replace("@@3", "selectedWorldMatrix = animMatrix1;\nselectedWorldInverseTranspose = animWorldInverseTransposeMatrix1;\nselectedMVMatrix = animModelViewMatrix1;");
  this.animationVertexShaderCode = this.animationVertexShaderCode.replace("@@4", "selectedWorldMatrix = animMatrix2;\nselectedWorldInverseTranspose = animWorldInverseTransposeMatrix2;\nselectedMVMatrix = animModelViewMatrix2;");
  this.animationVertexShaderCode = this.animationVertexShaderCode.replace("@@5", "selectedWorldMatrix = worldMatrix;\nselectedWorldInverseTranspose = worldInverseTranspose;\nselectedMVMatrix = modelViewMatrix;");

  macroHandler.replaceText("#ANIMATION_MATRIX_CODE", this.animationVertexShaderCode, this.mesh.material, true, false);
  macroHandler.injectMacro("HAS_ANIMATION", this.mesh.material, true, false);
  this.mesh.frustumCulled = false;
  return true;
}

ModelInstance.prototype.getAnimationGroupOfChild = function(childIndex){
  if (this.animationGroup1){
    if (this.animationGroup1.childrenIndices.indexOf(childIndex) >= 0){
      return this.animationGroup1;
    }
  }
  if (this.animationGroup2){
    if (this.animationGroup2.childrenIndices.indexOf(childIndex) >= 0){
      return this.animationGroup2;
    }
  }
  return null;
}

ModelInstance.prototype.getAnimationGroupByName = function(agName){
  if (this.animationGroup1 && this.animationGroup1.name == agName){
    return this.animationGroup1;
  }
  if (this.animationGroup2 && this.animationGroup2.name == agName){
    return this.animationGroup2;
  }
  return null;
}

ModelInstance.prototype.addAnimation = function(animation){
  this.animations[animation.name] = animation;
}

ModelInstance.prototype.removeAnimation = function(animation){
  delete this.animations[animation.name];
}

ModelInstance.prototype.refreshAnimationGroups = function(){
  var ag1 = this.animationGroup1;
  var ag2 = this.animationGroup2;
  if (ag1){
    this.removeAnimationGroup(ag1);
  }
  if (ag2){
    this.removeAnimationGroup(ag2);
  }
  if (ag1){
    this.addAnimationGroup(ag1);
  }
  if (ag2){
    this.addAnimationGroup(ag2);
  }
}

ModelInstance.prototype.setAlpha = function(alpha){
  macroHandler.replaceText("#define ALPHA " + this.alpha, "#define ALPHA " + alpha, this.mesh.material, false, true);
  this.alpha = alpha;
  if (alpha != 1){
    this.mesh.material.transparent = true;
  }else{
    this.mesh.material.transparent = false;
  }
}

ModelInstance.prototype.setDepthWrite = function(depthWrite){
  this.mesh.material.depthWrite = depthWrite;
  this.depthWrite = depthWrite;
}

ModelInstance.prototype.setBlending = function(blending){
  this.mesh.material.blending = blending;
  this.blending = blending;
}

ModelInstance.prototype.syncOrientation = function(targetModelInstance){
  this.mesh.updateMatrixWorld(true);
  targetModelInstance.mesh.updateMatrixWorld(true);

  var oldWorldInverseTranspose = new THREE.Matrix4().getInverse(this.mesh.matrixWorld).transpose();
  var newWorldInverseTranspose = new THREE.Matrix4().getInverse(targetModelInstance.mesh.matrixWorld).transpose();

  macroHandler.replaceMat4("worldMatrix", this.mesh.matrixWorld, targetModelInstance.mesh.matrixWorld, this.mesh.material, true, false);
  macroHandler.replaceMat4("worldInverseTranspose", oldWorldInverseTranspose, newWorldInverseTranspose, this.mesh.material, true, false);

  this.mesh.position.copy(targetModelInstance.mesh.position);
  this.mesh.quaternion.copy(targetModelInstance.mesh.quaternion);
  this.mesh.scale.copy(targetModelInstance.mesh.scale);
  this.mesh.updateMatrixWorld(true);

  this.scale = targetModelInstance.scale;
  this.generateBoundingBoxes();

  if (!this.noMass){
    physicsWorld.remove(this.physicsBody);
  }

  var physicsXParam = (this.model.info.originalBoundingBox.max.x - this.model.info.originalBoundingBox.min.x) * this.scale;
  var physicsYParam = (this.model.info.originalBoundingBox.max.y - this.model.info.originalBoundingBox.min.y) * this.scale;
  var physicsZParam = (this.model.info.originalBoundingBox.max.z - this.model.info.originalBoundingBox.min.z) * this.scale;
  var physicsShapeParameters = {x: physicsXParam/2, y: physicsYParam/2, z: physicsZParam/2};
  var boxPhysicsBody = physicsBodyGenerator.generateBoxBody(physicsShapeParameters);
  boxPhysicsBody.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
  boxPhysicsBody.quaternion.copy(this.mesh.quaternion);

  if (!this.noMass){
    physicsWorld.addBody(boxPhysicsBody);
  }

  this.physicsBody = boxPhysicsBody;

  if (this.animationGroup1){
    this.animationGroup1.group.scale.copy(this.mesh.scale);
    this.animationGroup1.group.position.copy(this.mesh.position);
    this.animationGroup1.group.quaternion.copy(this.mesh.quaternion);
    this.animationGroup1.group.updateMatrixWorld(true);
  }
  if (this.animationGroup2){
    this.animationGroup2.group.scale.copy(this.mesh.scale);
    this.animationGroup2.group.position.copy(this.mesh.position);
    this.animationGroup2.group.quaternion.copy(this.mesh.quaternion);
    this.animationGroup2.group.updateMatrixWorld(true);
  }
}

ModelInstance.prototype.refreshDisabledSpecularities = function(){
  if (this.disableLightSpecularityCode){
    macroHandler.replaceText("//LIGHT_DISABLE_SPECULARITY_CODE\n" + this.disableLightSpecularityCode, "//LIGHT_DISABLE_SPECULARITY_CODE\n", this.mesh.material, true, true);
  }

  var indices = Object.keys(this.disabledSpecularityIndices);
  if (indices.length == 0){
    return;
  }

  var text = "if(@@1){ return 1; }\n";
  var insideText = "";

  for (var i = 0; i < indices.length; i ++){
    if (i != indices.length -1){
      insideText += "mi == " + indices[i] + " || ";
    }else{
      insideText += "mi == " + indices[i];
    }
  }

  text = text.replace("@@1", insideText);
  macroHandler.replaceText("//LIGHT_DISABLE_SPECULARITY_CODE\n", "//LIGHT_DISABLE_SPECULARITY_CODE\n" + text, this.mesh.material, true, true);
  this.disableLightSpecularityCode = text;
}

ModelInstance.prototype.refreshDisabledEnvMapping = function(){
  if (this.disabledEnvMappingCode){
    macroHandler.replaceText("//DISABLE_ENV_MAPPING_CODE\n" + this.disabledEnvMappingCode, "//DISABLE_ENV_MAPPING_CODE\n", this.mesh.material, true, false);
  }

  var indices = Object.keys(this.disabledEnvMappingIndices);
  if (indices.length == 0){
    return;
  }

  var text = "if(@@1){ return 1; }\n";
  var insideText = "";

  for (var i = 0; i < indices.length; i ++){
    if (i != indices.length -1){
      insideText += "mi == " + indices[i] + " || ";
    }else{
      insideText += "mi == " + indices[i];
    }
  }

  text = text.replace("@@1", insideText);
  macroHandler.replaceText("//DISABLE_ENV_MAPPING_CODE\n", "//DISABLE_ENV_MAPPING_CODE\n" + text, this.mesh.material, true, false);
  this.disabledEnvMappingCode = text;
}

ModelInstance.prototype.refreshEnvMapMode = function(){
  if (this.envMapModeCode){
    macroHandler.replaceText("//ENV_MODE_GETTER_CODE\n" + this.envMapModeCode, "//ENV_MODE_GETTER_CODE\n", this.mesh.material, true, false);
  }

  var indices = Object.keys(this.envMapModeIndices);
  if (indices.length == 0){
    return;
  }

  var text = "if(@@1){ return 1; }\n";
  var insideText = "";

  for (var i = 0; i < indices.length; i ++){
    if (i != indices.length -1){
      insideText += "mi == " + indices[i] + " || ";
    }else{
      insideText += "mi == " + indices[i];
    }
  }

  text = text.replace("@@1", insideText);
  macroHandler.replaceText("//ENV_MODE_GETTER_CODE\n", "//ENV_MODE_GETTER_CODE\n" + text, this.mesh.material, true, false);
  this.envMapModeCode = text;
}

ModelInstance.prototype.setColor = function(r, g, b, childIndex, fromScript){
  var colorAry = this.mesh.geometry.attributes.color.array;

  var i2 = 0;
  for (var i = 0; i < colorAry.length; i += 3){
    var index = this.model.indexedMaterialIndices[i2];
    if (childIndex == null || index == childIndex){
      colorAry[i] = r;
      colorAry[i + 1] = g;
      colorAry[i + 2] = b;
    }
    i2 ++;
  }

  if (!fromScript){
    this.model.info.childInfos[childIndex].colorR = r;
    this.model.info.childInfos[childIndex].colorG = g;
    this.model.info.childInfos[childIndex].colorB = b;
  }

  this.mesh.geometry.attributes.color.updateRange.set(0, colorAry.length);
  this.mesh.geometry.attributes.color.needsUpdate = true;
}

ModelInstance.prototype.getIndexByChildName = function(childName){
  return this.model.indicesByChildName[childName];
}

ModelInstance.prototype.makePBR = function(){
  this.mesh.material.vertexShader = "" + ShaderContent.pbrModelMaterialVertexShader;
  this.mesh.material.fragmentShader = "" + ShaderContent.pbrModelMaterialFragmentShader;
  this.setAffectedByLight(true);
  this.setPhongLight();

  this.envMapModeCode = null;
  this.disabledEnvMappingCode = null;

  this.refreshDisabledEnvMapping();
  this.refreshEnvMapMode();

  this.mesh.updateMatrixWorld(true);
  var worldInverseTranspose = new THREE.Matrix4().getInverse(this.mesh.matrixWorld).transpose();

  macroHandler.injectMat4("worldMatrix", this.mesh.matrixWorld, this.mesh.material, true, false);
  macroHandler.injectMat4("worldInverseTranspose", worldInverseTranspose, this.mesh.material, true, false);

  macroHandler.injectMacro("CHILDREN_HIDEABLE", this.mesh.material, true, true);

  if (this.hasEnvironmentMap()){
    var skybox = skyBoxes[this.environmentMapInfo.skyboxName];
    this.unmapEnvironment();
    this.mapEnvironment(skybox, this.environmentMapInfo.fallbackDiffuse);
  }

  if (this.mesh.material.uniforms.texture){
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
  }
  if (this.model.info.hasAlphaMap){
    macroHandler.injectMacro("HAS_ALPHA_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasRoughnessMap){
    macroHandler.injectMacro("HAS_ROUGHNESS_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasMetalnessMap){
    macroHandler.injectMacro("HAS_METALNESS_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasEmissiveMap){
    macroHandler.injectMacro("HAS_EMISSIVE_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasAOMap){
    macroHandler.injectMacro("HAS_AO_MAP", this.mesh.material, true, true);
    var aoIntensity = (typeof this.aoIntensity === UNDEFINED)? 1: this.aoIntensity;
    this.setAOIntensity(aoIntensity);
  }

  this.refreshAnimationGroups();

  this.pbrLightAttenuationCoef = 500000;
  this.hasPBR = true;

  if (this.toneMappingInfo){
    var exposure = this.toneMappingInfo.exposure;
    this.disableToneMapping();
    this.enableToneMapping();
    this.replaceToneMappingExposure(exposure);
  }

  var alpha = this.alpha;
  this.alpha = 1;
  this.setAlpha(alpha);

  if (bloom.configurations.isSelective){
    bloom.makeObjectSelective(this);
  }
}

ModelInstance.prototype.unmakePBR = function(){
  this.mesh.material.vertexShader = "" + ShaderContent.basicModelMaterialVertexShader;
  this.mesh.material.fragmentShader = "" + ShaderContent.basicModelMaterialFragmentShader;
  this.unsetPhongLight();
  this.setAffectedByLight(false);

  this.envMapModeCode = null;
  this.disabledEnvMappingCode = null;

  this.refreshDisabledEnvMapping();
  this.refreshEnvMapMode();

  this.mesh.updateMatrixWorld(true);
  var worldInverseTranspose = new THREE.Matrix4().getInverse(this.mesh.matrixWorld).transpose();

  macroHandler.injectMat4("worldMatrix", this.mesh.matrixWorld, this.mesh.material, true, false);
  macroHandler.injectMat4("worldInverseTranspose", worldInverseTranspose, this.mesh.material, true, false);

  macroHandler.injectMacro("CHILDREN_HIDEABLE", this.mesh.material, true, true);

  if (this.hasEnvironmentMap()){
    var skybox = skyBoxes[this.environmentMapInfo.skyboxName];
    this.unmapEnvironment();
    this.mapEnvironment(skybox, this.environmentMapInfo.fallbackDiffuse);
  }

  if (this.mesh.material.uniforms.texture){
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
  }
  if (this.model.info.hasAlphaMap){
    macroHandler.injectMacro("HAS_ALPHA_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasRoughnessMap){
    macroHandler.injectMacro("HAS_ROUGHNESS_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasMetalnessMap){
    macroHandler.injectMacro("HAS_METALNESS_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasEmissiveMap){
    macroHandler.injectMacro("HAS_EMISSIVE_MAP", this.mesh.material, true, true);
  }
  if (this.model.info.hasAOMap){
    macroHandler.injectMacro("HAS_AO_MAP", this.mesh.material, true, true);
  }

  this.refreshAnimationGroups();

  delete this.pbrLightAttenuationCoef;
  this.hasPBR = false;

  if (this.toneMappingInfo){
    var exposure = this.toneMappingInfo.exposure;
    this.disableToneMapping();
    this.enableToneMapping();
    this.replaceToneMappingExposure(exposure);
  }

  var alpha = this.alpha;
  this.alpha = 1;
  this.setAlpha(alpha);

  if (bloom.configurations.isSelective){
    bloom.makeObjectSelective(this);
  }
}

ModelInstance.prototype.setPBRLightAttenuationCoef = function(lightAttenuationCoef){
  macroHandler.removeMacro("LIGHT_ATTENUATION_COEF " + this.pbrLightAttenuationCoef, this.mesh.material, false, true);
  macroHandler.injectMacro("LIGHT_ATTENUATION_COEF " + lightAttenuationCoef, this.mesh.material, false, true);
  this.pbrLightAttenuationCoef = lightAttenuationCoef;
}

ModelInstance.prototype.compressGeometry = function(){
  var diffuseUV = null, normalUV = null, specularUV = null, alphaUV = null, roughnessUV = null, metalnessUV = null, emissiveUV = null, aoUV = null;
  var diffuseTextureIndex = null, normalTextureIndex = null, specularTextureIndex = null, alphaTextureIndex = null, roughnessTextureIndex = null, metalnessTextureIndex = null, emissiveTextureIndex = null, aoTextureIndex = null;

  if (this.mesh.geometry.attributes.diffuseUV){
    var ary = this.mesh.geometry.attributes.diffuseUV.array;
    diffuseUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.normalUV){
    var ary = this.mesh.geometry.attributes.normalUV.array;
    normalUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.specularUV){
    var ary = this.mesh.geometry.attributes.specularUV.array;
    specularUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.alphaUV){
    var ary = this.mesh.geometry.attributes.alphaUV.array;
    alphaUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.roughnessUV){
    var ary = this.mesh.geometry.attributes.roughnessUV.array;
    roughnessUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.metalnessUV){
    var ary = this.mesh.geometry.attributes.metalnessUV.array;
    metalnessUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.emissiveUV){
    var ary = this.mesh.geometry.attributes.emissiveUV.array;
    emissiveUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.aoUV){
    var ary = this.mesh.geometry.attributes.aoUV.array;
    aoUV = new THREE.Vector4(ary[0], ary[1], ary[2], ary[3]);
  }

  if (this.mesh.geometry.attributes.diffuseTextureIndex){
    diffuseTextureIndex = this.mesh.geometry.attributes.diffuseTextureIndex.array[0];
  }

  if (this.mesh.geometry.attributes.normalTextureIndex){
    normalTextureIndex = this.mesh.geometry.attributes.normalTextureIndex.array[0];
  }

  if (this.mesh.geometry.attributes.specularTextureIndex){
    specularTextureIndex = this.mesh.geometry.attributes.specularTextureIndex.array[0];
  }

  if (this.mesh.geometry.attributes.alphaTextureIndex){
    alphaTextureIndex = this.mesh.geometry.attributes.alphaTextureIndex.array[0];
  }

  if (this.mesh.geometry.attributes.roughnessTextureIndex){
    roughnessTextureIndex = this.mesh.geometry.attributes.roughnessTextureIndex.array[0];
  }

  if (this.mesh.geometry.attributes.metalnessTextureIndex){
    metalnessTextureIndex = this.mesh.geometry.attributes.metalnessTextureIndex.array[0];
  }

  if (this.mesh.geometry.attributes.emissiveTextureIndex){
    emissiveTextureIndex = this.mesh.geometry.attributes.emissiveTextureIndex.array[0];
  }

  if (this.mesh.geometry.attributes.aoTextureIndex){
    aoTextureIndex = this.mesh.geometry.attributes.aoTextureIndex.array[0];
  }

  var compressableAttributes = [
    "diffuseUV", "metalnessRoughness", "materialIndex", "normalUV",
    "specularUV", "alphaUV", "roughnessUV", "diffuseTextureIndex",
    "normalTextureIndex", "specularTextureIndex", "alphaTextureIndex",
    "roughnessTextureIndex", "metalnessUV", "metalnessTextureIndex",
    "emissiveUV", "emissiveTextureIndex", "aoUV", "aoTextureIndex"
  ];

  this.compressedAttributes = macroHandler.compressAttributes(this.mesh, compressableAttributes);

  if (this.compressedAttributes.indexOf("color") >= 0){
    var colorR = this.model.info.childInfos[0].colorR;
    var colorG = this.model.info.childInfos[0].colorG;
    var colorB = this.model.info.childInfos[0].colorB;
    macroHandler.compressVaryingVec3(this.mesh.material, "vColor", colorR, colorG, colorB);
  }

  if (this.compressedAttributes.indexOf("metalnessRoughness") >= 0){
    var metalness = this.model.info.childInfos[0].metalness;
    var roughness = this.model.info.childInfos[0].roughness;
    macroHandler.compressVaryingFloat(this.mesh.material, "vMetalness", metalness);
    macroHandler.compressVaryingFloat(this.mesh.material, "vRoughness", roughness);
  }

  if (this.compressedAttributes.indexOf("diffuseUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vDiffuseUV", diffuseUV.x, diffuseUV.y, diffuseUV.z, diffuseUV.w);
  }

  if (this.compressedAttributes.indexOf("normalUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vNormalUV", normalUV.x, normalUV.y, normalUV.z, normalUV.w);
  }

  if (this.compressedAttributes.indexOf("specularUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vSpecularUV", specularUV.x, specularUV.y, specularUV.z, specularUV.w);
  }

  if (this.compressedAttributes.indexOf("alphaUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vAlphaUV", alphaUV.x, alphaUV.y, alphaUV.z, alphaUV.w);
  }

  if (this.compressedAttributes.indexOf("roughnessUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vRoughnessUV", roughnessUV.x, roughnessUV.y, roughnessUV.z, roughnessUV.w);
  }

  if (this.compressedAttributes.indexOf("metalnessUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vMetalnessUV", metalnessUV.x, metalnessUV.y, metalnessUV.z, metalnessUV.w);
  }

  if (this.compressedAttributes.indexOf("aoUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vAOUV", aoUV.x, aoUV.y, aoUV.z, aoUV.w);
  }

  if (this.compressedAttributes.indexOf("emissiveUV") >= 0){
    macroHandler.compressVaryingVec4(this.mesh.material, "vEmissiveUV", emissiveUV.x, emissiveUV.y, emissiveUV.z, emissiveUV.w);
  }

  if (this.compressedAttributes.indexOf("diffuseTextureIndex") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vDiffuseTextureIndex", diffuseTextureIndex);
  }

  if (this.compressedAttributes.indexOf("normalTextureIndex") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vNormalTextureIndex", normalTextureIndex);
  }

  if (this.compressedAttributes.indexOf("specularTextureIndex") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vSpecularTextureIndex", specularTextureIndex);
  }

  if (this.compressedAttributes.indexOf("alphaTextureIndex") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vAlphaTextureIndex", alphaTextureIndex);
  }

  if (this.compressedAttributes.indexOf("roughnessTextureIndex") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vRoughnessTextureIndex", roughnessTextureIndex);
  }

  if (this.compressedAttributes.indexOf("metalnessTextureIndex") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vMetalnessTextureIndex", metalnessTextureIndex);
  }

  if (this.compressedAttributes.indexOf("aoTextureIndexByTextureID") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vAOTextureIndex", aoTextureIndex);
  }

  if (this.compressedAttributes.indexOf("emissiveTextureIndex") >= 0){
    macroHandler.compressVaryingFloat(this.mesh.material, "vEmissiveTextureIndex", emissiveTextureIndex);
  }

  var allTrue = true, allFalse = true;
  var allRefract = true, allReflect = true;
  for (var index = 0; index < this.model.info.childInfos.length; index ++){
    if (this.disabledEnvMappingIndices[index]){
      allFalse = false;
    }else{
      allTrue = false;
    }
    if (this.envMapModeIndices[index]){
      allReflect = false;
    }else{
      allRefract = false;
    }
  }

  if (allTrue || allFalse){
    macroHandler.compressVaryingFloat(this.mesh.material, "vEnvMapDisabled", allTrue? 100: -100);
  }

  if (allRefract || allReflect){
    macroHandler.compressVaryingFloat(this.mesh.material, "vEnvMapModeRefraction", allRefract? 100: -100);
  }

  this.isCompressed = true;
}

ModelInstance.prototype.enableToneMapping = function(){
  if (!this.isHDR || this.toneMappingInfo){
    return;
  }

  macroHandler.injectMacro("TONE_MAPPING_ENABLED", this.mesh.material, false, true);
  macroHandler.injectMacro("TONE_MAPPING_EXPOSURE 1", this.mesh.material, false, true);

  this.toneMappingInfo = {exposure: 1};
}

ModelInstance.prototype.disableToneMapping = function(){
  if (!this.isHDR || !this.toneMappingInfo){
    return;
  }

  macroHandler.removeMacro("TONE_MAPPING_ENABLED", this.mesh.material, false, true);
  macroHandler.removeMacro("TONE_MAPPING_EXPOSURE " + this.toneMappingInfo.exposure, this.mesh.material, false, true);

  delete this.toneMappingInfo;
}

ModelInstance.prototype.replaceToneMappingExposure = function(newExposure){
  if (!this.toneMappingInfo){
    return;
  }
  macroHandler.removeMacro("TONE_MAPPING_EXPOSURE " + this.toneMappingInfo.exposure, this.mesh.material, false, true);
  macroHandler.injectMacro("TONE_MAPPING_EXPOSURE " + newExposure, this.mesh.material, false, true);

  this.toneMappingInfo.exposure = newExposure;
}

ModelInstance.prototype.setRenderSide = function(side){
  this.mesh.material.side = side;
}

ModelInstance.prototype.isCompressable = function(){
  for (var miName in modelInstances){
    if (miName == this.name){
      continue;
    }
    if (this.model.name == modelInstances[miName].model.name){
      return false;
    }
  }

  return true;
}

ModelInstance.prototype.setAOIntensity = function(aoIntensity){
  if (!this.model.info.hasAOMap){
    return;
  }

  var oldAO = (typeof this.aoIntensity === UNDEFINED)? 1: this.aoIntensity;
  macroHandler.removeMacro("AO_INTENSITY " + oldAO, this.mesh.material, false, true);
  macroHandler.injectMacro("AO_INTENSITY " + aoIntensity, this.mesh.material, false, true);

  this.aoIntensity = aoIntensity;
}

ModelInstance.prototype.findChildIndexByPoint = function(x, y, z){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }

  var minDistance = Infinity;
  var minIndex = null;

  REUSABLE_VECTOR.set(x, y, z);
  for (var i = 0; i < this.boundingBoxes.length; i ++){
    var dist = this.boundingBoxes[i].distanceToPoint(REUSABLE_VECTOR);
    if (dist < minDistance){
      minDistance = dist;
      minIndex = i;
    }
  }

  return minIndex;
}

ModelInstance.prototype.setSelectByChild = function(selectByChild){
  this.selectByChild = selectByChild;
}

ModelInstance.prototype.setTextureTransformForChild = function(index, offsetX, offsetY, repeatX, repeatY){
  if (this.textureTransformCode){
    macroHandler.replaceText("//TEXTURE_TRANSFORM_CODE\n" + this.textureTransformCode, "//TEXTURE_TRANSFORM_CODE\n", this.mesh.material, true, false);
    this.textureTransformCode = null;
  }

  this.textureTransformsByMaterialIndex[index] = {offsetX: offsetX, offsetY: offsetY, repeatX: repeatX, repeatY: repeatY};

  var totalText = "";
  var template = "if(mi == @@1){ return vec4(@@2, @@3, @@4, @@5); };"
  for (var key in this.textureTransformsByMaterialIndex){
    var info = this.textureTransformsByMaterialIndex[key];
    totalText += template.replace("@@1", key).replace("@@2", info.offsetX).replace("@@3", info.offsetY).replace("@@4", info.repeatX).replace("@@5", info.repeatY) + "\n";
  }

  this.textureTransformCode = totalText;

  macroHandler.replaceText("//TEXTURE_TRANSFORM_CODE\n", "//TEXTURE_TRANSFORM_CODE\n" + totalText, this.mesh.material, true, false);
}

ModelInstance.prototype.resetTextureTransform = function(){
  if (this.textureTransformCode){
    macroHandler.replaceText("//TEXTURE_TRANSFORM_CODE\n" + this.textureTransformCode, "//TEXTURE_TRANSFORM_CODE\n", this.mesh.material, true, false);
    this.textureTransformCode = null;
  }

  this.textureTransformsByMaterialIndex = {};
}

ModelInstance.prototype.unlistenDoubleClick = function(listenerID){
  if (mode == 0){
    return;
  }

  delete this.doubleClickListeners[listenerID];
}

ModelInstance.prototype.listenForDoubleClick = function(callback){
  if (mode == 0){
    return;
  }
  var id = generateUUID();
  this.doubleClickListeners[id] = callback;

  if (!this.clickCallbackFunction){
    this.clickCallbackFunction = noop;
    modelInstancesWithClickListeners.set(this.name, this);
  }

  return id;
}

ModelInstance.prototype.onDoubleClicked = function(x, y, z){
  for (var id in this.doubleClickListeners){
    this.doubleClickListeners[id](x, y, z);
  }
}

ModelInstance.prototype.onClicked = function(x, y, z){
  if (mode == 0){
    return;
  }

  var now = performance.now();

  if (this.lastClickTime && now - this.lastClickTime <= 300){
    this.onDoubleClicked(x, y, z);
  }

  this.lastClickTime = now;
}
