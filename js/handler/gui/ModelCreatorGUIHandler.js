var ModelCreatorGUIHandler = function(){

}

ModelCreatorGUIHandler.prototype.show = function(modelName){
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
  activeControl = new OrbitControls({maxRadius: 2000, zoomDelta: 10});
  activeControl.onActivated();

  terminal.clear();
  terminal.disable();
  terminal.printInfo(Text.LOADING_MODELS);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/getModels", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function(){
    if (xhr.readyState == 4 && xhr.status == 200){
      var resp = JSON.parse(xhr.responseText);

      if (resp.length == 0){
        modelCreatorGUIHandler.close(Text.NO_VALID_MODELS_UNDER_MODELS_FOLDER, true);
        return;
      }

      modelCreatorGUIHandler.renderControls(resp, 0, modelName, true);
    }
  }
  xhr.send(JSON.stringify({acceptedTextureSize: ACCEPTED_TEXTURE_SIZE}));
}

ModelCreatorGUIHandler.prototype.close = function(message, isError){
  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }

  terminal.clear();
  terminal.enable();
  if (!isError){
    terminal.printInfo(message);
  }else{
    terminal.printError(message);
  }
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);

  if (this.modelMesh){
    scene.remove(this.modelMesh);
    delete this.modelMesh;
    delete this.model;
  }
}

ModelCreatorGUIHandler.prototype.renderControls = function(allModels, index, modelName, centerGeometry){
  terminal.clear();
  terminal.printInfo(Text.LOADING_MODEL);

  var modelToLoad = allModels[index];
  modelLoader.loadModel(modelToLoad.folder, modelToLoad.obj, modelToLoad.mtl, function(model, mtlMaterialNames){
    var allFolders = [];
    for (var i = 0; i < allModels.length; i ++){
      allFolders.push(allModels[i].folder);
    }

    var params = {
      "Folder": allFolders[index],
      "Enable custom textures": false,
      "Center geometry": centerGeometry,
      "Scale": 1,
      "Done": function(){
        var folderName = modelCreatorGUIHandler.model.info.folderName;
        for (var mName in models){
          if (models[mName].info.folderName == folderName){
            terminal.clear();
            terminal.printError(Text.ANOTHER_MODEL_OF_SAME_FOLDER_EXISTS.replace(Text.PARAM1, mName));
            return;
          }
        }
        models[modelName] = modelCreatorGUIHandler.model;
        delete modelCreatorGUIHandler.model;
        modelCreatorGUIHandler.close(Text.COMPRESSING_TEXTURE, false);
        terminal.disable();
        textureAtlasHandler.onTexturePackChange(function(){
          terminal.clear();
          terminal.printInfo(Text.MODEL_CREATED);
          terminal.enable();
        }, function(){
          terminal.clear();
          terminal.printError(Text.ERROR_HAPPENED_COMPRESSING_TEXTURE_ATLAS);
          delete models[modelName];
          terminal.enable();
        }, true);
      },
      "Cancel": function(){
        modelCreatorGUIHandler.close(Text.OPERATION_CANCELLED, false);
      }
    };

    modelCreatorGUIHandler.renderModel(model, mtlMaterialNames, modelName, allFolders[index], allModels[index].arModelNames, function(){
      terminal.clear();
      terminal.printInfo(Text.MODEL_LOADED);

      if (guiHandler.datGuiModelCreation){
        guiHandler.removeControllers(guiHandler.datGuiModelCreation);
      }else{
        guiHandler.datGuiModelCreation = new dat.GUI({hideable: false, width: 420});
      }

      var folderController, scaleController, customTextureController, centerGeometryController;

      folderController = guiHandler.datGuiModelCreation.add(params, "Folder", allFolders).onChange(function(val){
        guiHandler.disableController(folderController);
        guiHandler.disableController(scaleController);
        guiHandler.disableController(customTextureController);
        guiHandler.disableController(centerGeometryController);
        modelCreatorGUIHandler.renderControls(allModels, allFolders.indexOf(val), modelName, centerGeometry);
      });
      centerGeometryController = guiHandler.datGuiModelCreation.add(params, "Center geometry").onChange(function(val){
        centerGeometry = val;
        guiHandler.disableController(folderController);
        guiHandler.disableController(scaleController);
        guiHandler.disableController(customTextureController);
        guiHandler.disableController(centerGeometryController);
        modelCreatorGUIHandler.renderControls(allModels, allFolders.indexOf(params["Folder"]), modelName, centerGeometry);
      }).listen();
      customTextureController = guiHandler.datGuiModelCreation.add(params, "Enable custom textures").onChange(function(val){
        terminal.clear();
        if (!modelCreatorGUIHandler.model.supportsCustomTextures()){
          params["Enable custom textures"] = false;
          terminal.printError(Text.THIS_MODEL_DOES_NOT_SUPPORT_CUSTOM_TEXTURES);
          return;
        }
        if (val){
          modelCreatorGUIHandler.model.enableCustomTextures();
        }else{
          modelCreatorGUIHandler.model.disableCustomTextures();
        }

        terminal.printInfo(val? Text.CUSTOM_TEXTURES_ENABLED_FOR_THIS_MODEL: Text.CUSTOM_TEXTURES_DISABLED_FOR_THIS_MODEL);
      }).listen();
      scaleController = guiHandler.datGuiModelCreation.add(params, "Scale").min(0.1).max(100).step(0.1).onChange(function(val){
        modelCreatorGUIHandler.modelMesh.scale.set(val, val, val);
      });
      guiHandler.datGuiModelCreation.add(params, "Done");
      guiHandler.datGuiModelCreation.add(params, "Cancel");
    }, centerGeometry);
  }, function(){
    modelCreatorGUIHandler.close(Text.ERROR_HAPPENED_LOADING_MODEL_FROM_FOLDER.replace(Text.PARAM1, modelToLoad.folder), true);
  });
}

ModelCreatorGUIHandler.prototype.renderModel = function(model, mtlMaterialNames, name, folderName, arModelNames, onReady, centerGeometry){
  if (this.modelMesh){
    scene.remove(this.modelMesh);
  }

  var pseudoGeometry = new THREE.Geometry();

  var texturesObj = {};
  var childInfos = [];

  var boundingBox = new THREE.Box3();

  var hasNormalMap = false;
  var hasSpecularMap = false;
  var hasAlphaMap = false;
  var hasRoughnessMap = false;
  var hasMetalnessMap = false;
  var hasEmissiveMap = false;
  var hasAOMap = false;

  var flatInfo = [];
  for (var i = 0; i < model.children.length; i ++){
    var mesh = model.children[i];
    var geometry = mesh.geometry;
    var mat = mesh.material;
    if (mat instanceof Array){
      var groups = geometry.groups;
      for (var i2 = 0; i2 < groups.length; i2 ++){
        var curGroupInfo = groups[i2];
        var start = curGroupInfo.start;
        var count = curGroupInfo.count;
        var curMat = mat[curGroupInfo.materialIndex];
        if (mtlMaterialNames.indexOf(curMat.name) >= 0){
          flatInfo.push({
            geometry: this.splitGeometry(geometry, start, count),
            material: curMat,
            name: mesh.name + "_" + i2,
            mesh: mesh
          });
        }
      }
    }else if (mtlMaterialNames.indexOf(mat.name) >= 0){
      flatInfo.push({geometry: geometry, material: mat, name: mesh.name, mesh: mesh});
    }
  }

  for (var i = 0; i < flatInfo.length; i ++){
    var childGeom = flatInfo[i].geometry;
    var childMat = flatInfo[i].material;
    var childName = flatInfo[i].name;
    var childMesh = flatInfo[i].mesh;

    var childInfo = {
      name: childName,
      colorR: childMat.color.r,
      colorG: childMat.color.g,
      colorB: childMat.color.b,
      metalness: 0,
      roughness: 0
    };

    childGeom.computeBoundingBox();
    var childBB = childGeom.boundingBox;
    childInfo.bb = {
      minX: childBB.min.x,
      minY: childBB.min.y,
      minZ: childBB.min.z,
      maxX: childBB.max.x,
      maxY: childBB.max.y,
      maxZ: childBB.max.z
    };

    var normalGeometry = new THREE.Geometry().fromBufferGeometry(childGeom);
    for (var i2 = 0; i2 < normalGeometry.faces.length; i2++){
      normalGeometry.faces[i2].materialIndex = i;
    }
    childMesh.updateMatrix(true);
    pseudoGeometry.merge(normalGeometry, childMesh.matrix);

    if (childMat.map){
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.map.image.width;
      tmpCanvas.height = childMat.map.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.map.image, 0, 0);
      texturesObj[childMat.map.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.diffuseTextureURL = childMat.map.image.src;
      var diffuseTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].diffuseTextureURL == childMat.map.image.src){
          diffuseTextureID = childInfos[i2].diffuseTextureID;
          break;
        }
      }
      if (!diffuseTextureID){
        childInfo.diffuseTextureID = generateUUID();
      }else{
        childInfo.diffuseTextureID = diffuseTextureID;
      }
    }

    if (childMat.normalMap){
      hasNormalMap = true;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.normalMap.image.width;
      tmpCanvas.height = childMat.normalMap.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.normalMap.image, 0, 0);
      texturesObj[childMat.normalMap.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.normalTextureURL = childMat.normalMap.image.src;
      var normalTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].normalTextureURL == childMat.normalMap.image.src){
          normalTextureID = childInfos[i2].normalTextureID;
          break;
        }
      }
      if (!normalTextureID){
        childInfo.normalTextureID = generateUUID();
      }else{
        childInfo.normalTextureID = normalTextureID;
      }
    }

    if (childMat.specularMap){
      hasSpecularMap = true;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.specularMap.image.width;
      tmpCanvas.height = childMat.specularMap.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.specularMap.image, 0, 0);
      texturesObj[childMat.specularMap.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.specularTextureURL = childMat.specularMap.image.src;
      var specularTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].specularTextureURL == childMat.specularMap.image.src){
          specularTextureID = childInfos[i2].specularTextureID;
          break;
        }
      }
      if (!specularTextureID){
        childInfo.specularTextureID = generateUUID();
      }else{
        childInfo.specularTextureID = specularTextureID;
      }
    }

    if (childMat.alphaMap){
      hasAlphaMap = true;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.alphaMap.image.width;
      tmpCanvas.height = childMat.alphaMap.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.alphaMap.image, 0, 0);
      texturesObj[childMat.alphaMap.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.alphaTextureURL = childMat.alphaMap.image.src;
      var alphaTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].alphaTextureURL == childMat.alphaMap.image.src){
          alphaTextureID = childInfos[i2].alphaTextureID;
          break;
        }
      }
      if (!alphaTextureID){
        childInfo.alphaTextureID = generateUUID();
      }else{
        childInfo.alphaTextureID = alphaTextureID;
      }
    }

    if (childMat.roughnessMap){
      hasRoughnessMap = true;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.roughnessMap.image.width;
      tmpCanvas.height = childMat.roughnessMap.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.roughnessMap.image, 0, 0);
      texturesObj[childMat.roughnessMap.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.roughnessTextureURL = childMat.roughnessMap.image.src;
      var roughnessTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].roughnessTextureURL == childMat.roughnessMap.image.src){
          roughnessTextureID = childInfos[i2].roughnessTextureID;
          break;
        }
      }
      if (!roughnessTextureID){
        childInfo.roughnessTextureID = generateUUID();
      }else{
        childInfo.roughnessTextureID = roughnessTextureID;
      }
    }

    if (childMat.metalnessMap){
      hasMetalnessMap = true;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.metalnessMap.image.width;
      tmpCanvas.height = childMat.metalnessMap.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.metalnessMap.image, 0, 0);
      texturesObj[childMat.metalnessMap.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.metalnessTextureURL = childMat.metalnessMap.image.src;
      var metalnessTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].metalnessTextureURL == childMat.metalnessMap.image.src){
          metalnessTextureID = childInfos[i2].metalnessTextureID;
          break;
        }
      }
      if (!metalnessTextureID){
        childInfo.metalnessTextureID = generateUUID();
      }else{
        childInfo.metalnessTextureID = metalnessTextureID;
      }
    }

    if (childMat.emissiveMap){
      hasEmissiveMap = true;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.emissiveMap.image.width;
      tmpCanvas.height = childMat.emissiveMap.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.emissiveMap.image, 0, 0);
      texturesObj[childMat.emissiveMap.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.emissiveTextureURL = childMat.emissiveMap.image.src;
      var emissiveTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].emissiveTextureURL == childMat.emissiveMap.image.src){
          emissiveTextureID = childInfos[i2].emissiveTextureID;
          break;
        }
      }
      if (!emissiveTextureID){
        childInfo.emissiveTextureID = generateUUID();
      }else{
        childInfo.emissiveTextureID = emissiveTextureID;
      }
    }

    if (childMat.aoMap){
      hasAOMap = true;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = childMat.aoMap.image.width;
      tmpCanvas.height = childMat.aoMap.image.height;
      tmpCanvas.getContext("2d").drawImage(childMat.aoMap.image, 0, 0);
      texturesObj[childMat.aoMap.image.src] = new THREE.CanvasTexture(tmpCanvas);
      childInfo.aoTextureURL = childMat.aoMap.image.src;
      var aoTextureID = null;
      for (var i2 = 0; i2 < childInfos.length; i2 ++){
        if (childInfos[i2].aoTextureURL == childMat.aoMap.image.src){
          aoTextureID = childInfos[i2].aoTextureID;
          break;
        }
      }
      if (!aoTextureID){
        childInfo.aoTextureID = generateUUID();
      }else{
        childInfo.aoTextureID = aoTextureID;
      }
    }

    childInfos.push(childInfo);
  }

  var textureMerger = null;
  if (Object.keys(texturesObj).length > 0){
    textureMerger = new TextureMerger(texturesObj);
  }

  var vertices = pseudoGeometry.vertices;
  var faceVertexUVs = pseudoGeometry.faceVertexUvs[0];

  var positions = [];
  var normals = [];
  var colors = [];
  var uvs = [];
  var diffuseUVs = [];
  var normalUVs = [];
  var specularUVs = [];
  var alphaUVs = [];
  var roughnessUVs = [];
  var metalnessUVs = [];
  var emissiveUVs = [];
  var aoUVs = [];

  var materialIndices = [];

  for (var i = 0; i<pseudoGeometry.faces.length; i++){
    var face = pseudoGeometry.faces[i];
    var curFlatInfo = flatInfo[face.materialIndex];

    materialIndices.push(face.materialIndex);
    materialIndices.push(face.materialIndex);
    materialIndices.push(face.materialIndex);

    var a = face.a;
    var b = face.b;
    var c = face.c;

    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];

    boundingBox.expandByPoint(vertex1);
    boundingBox.expandByPoint(vertex2);
    boundingBox.expandByPoint(vertex3);

    var vertexNormals = face.vertexNormals;
    var vertexNormal1 = vertexNormals[0];
    var vertexNormal2 = vertexNormals[1];
    var vertexNormal3 = vertexNormals[2];

    var color = curFlatInfo.material.color;

    var uv1 = null;
    var uv2 = null;
    var uv3 = null;

    if (textureMerger){
      uv1 = faceVertexUVs[i][0];
      uv2 = faceVertexUVs[i][1];
      uv3 = faceVertexUVs[i][2];
    }else{
      REUSABLE_2_VECTOR.set(0, 0);
      uv1 = REUSABLE_2_VECTOR;
      uv2 = REUSABLE_2_VECTOR;
      uv3 = REUSABLE_2_VECTOR;
    }

    this.triplePush(positions, vertex1, vertex2, vertex3, "xyz");
    this.triplePush(normals, vertexNormal1, vertexNormal2, vertexNormal3, "xyz");
    this.triplePush(colors, color, color, color, "rgb");
    this.triplePush(uvs, uv1, uv2, uv3, "xy");

    if (curFlatInfo.material.map){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.map.image.src];
      this.quadruplePush(diffuseUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else{
      this.quadruplePush(diffuseUVs, -100, -100, -100, -100, "number");
    }

    if (curFlatInfo.material.normalMap){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.normalMap.image.src];
      this.quadruplePush(normalUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else if (hasNormalMap){
      this.quadruplePush(normalUVs, -100, -100, -100, -100, "number");
    }

    if (curFlatInfo.material.specularMap){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.specularMap.image.src];
      this.quadruplePush(specularUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else if (hasSpecularMap){
      this.quadruplePush(specularUVs, -100, -100, -100, -100, "number");
    }

    if (curFlatInfo.material.alphaMap){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.alphaMap.image.src];
      this.quadruplePush(alphaUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else if (hasAlphaMap){
      this.quadruplePush(alphaUVs, -100, -100, -100, -100, "number");
    }

    if (curFlatInfo.material.roughnessMap){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.roughnessMap.image.src];
      this.quadruplePush(roughnessUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else if (hasRoughnessMap){
      this.quadruplePush(roughnessUVs, -100, -100, -100, -100, "number");
    }

    if (curFlatInfo.material.metalnessMap){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.metalnessMap.image.src];
      this.quadruplePush(metalnessUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else if (hasMetalnessMap){
      this.quadruplePush(metalnessUVs, -100, -100, -100, -100, "number");
    }

    if (curFlatInfo.material.emissiveMap){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.emissiveMap.image.src];
      this.quadruplePush(emissiveUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else if (hasEmissiveMap){
      this.quadruplePush(emissiveUVs, -100, -100, -100, -100, "number");
    }

    if (curFlatInfo.material.aoMap){
      var uvInfo = textureMerger.ranges[curFlatInfo.material.aoMap.image.src];
      this.quadruplePush(aoUVs, uvInfo.startU, uvInfo.startV, uvInfo.endU, uvInfo.endV, "number");
    }else if (hasAOMap){
      this.quadruplePush(aoUVs, -100, -100, -100, -100, "number");
    }
  }

  modelCreatorGUIHandler.model = new Model({
    name: name,
    folderName: folderName,
    childInfos: childInfos,
    originalBoundingBox: boundingBox,
    hasNormalMap: hasNormalMap,
    hasSpecularMap: hasSpecularMap,
    hasAlphaMap: hasAlphaMap,
    hasRoughnessMap: hasRoughnessMap,
    hasMetalnessMap: hasMetalnessMap,
    hasEmissiveMap: hasEmissiveMap,
    hasAOMap: hasAOMap,
    centerGeometry: centerGeometry
  }, texturesObj, positions, normals, uvs, colors, diffuseUVs, normalUVs, specularUVs, alphaUVs, roughnessUVs, metalnessUVs, aoUVs, emissiveUVs, materialIndices);

  modelCreatorGUIHandler.model.setARModelNames(arModelNames);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/createRMFFile?folderName=" + folderName, true);
  xhr.overrideMimeType("application/octet-stream");
  xhr.onreadystatechange = function(){
    if (xhr.readyState == 4 && xhr.status == 200){
      modelCreatorGUIHandler.modelMesh = new MeshGenerator(modelCreatorGUIHandler.model.geometry).generateModelMesh(modelCreatorGUIHandler.model, textureMerger? textureMerger.mergedTexture: null);
      modelCreatorGUIHandler.modelMesh.updateMatrixWorld(true);
      macroHandler.injectMat4("worldMatrix", modelCreatorGUIHandler.modelMesh.matrixWorld, modelCreatorGUIHandler.modelMesh.material, true, false);
      var worldInverseTranspose = new THREE.Matrix4().getInverse(modelCreatorGUIHandler.modelMesh.matrixWorld).transpose();
      macroHandler.injectMat4("worldInverseTranspose", worldInverseTranspose, modelCreatorGUIHandler.modelMesh.material, true, false);
      scene.add(modelCreatorGUIHandler.modelMesh);
      onReady();
    }
  }

  var generated = rmfHandler.generate(modelCreatorGUIHandler.model);
  xhr.send(generated.rmf);

  var xhr2 = new XMLHttpRequest();
  xhr2.open("POST", "/createRMIFFile?folderName=" + folderName, true);
  xhr2.overrideMimeType("application/octet-stream");
  xhr2.send(generated.rmif);
}

ModelCreatorGUIHandler.prototype.triplePush = function(ary, obj1, obj2, obj3, type){
  if (type == "xyz"){
    ary.push(obj1.x);
    ary.push(obj1.y);
    ary.push(obj1.z);

    ary.push(obj2.x);
    ary.push(obj2.y);
    ary.push(obj2.z);

    ary.push(obj3.x);
    ary.push(obj3.y);
    ary.push(obj3.z);
  }else if (type === "rgb"){
    ary.push(obj1.r);
    ary.push(obj1.g);
    ary.push(obj1.b);

    ary.push(obj2.r);
    ary.push(obj2.g);
    ary.push(obj2.b);

    ary.push(obj3.r);
    ary.push(obj3.g);
    ary.push(obj3.b);
  }else if (type === "xy"){
    ary.push(obj1.x);
    ary.push(obj1.y);

    ary.push(obj2.x);
    ary.push(obj2.y);

    ary.push(obj3.x);
    ary.push(obj3.y);
  }
}

ModelCreatorGUIHandler.prototype.quadruplePush = function(ary, obj1, obj2, obj3, obj4, type){
  if (type == "number"){
    ary.push(obj1);
    ary.push(obj2);
    ary.push(obj3);
    ary.push(obj4);

    ary.push(obj1);
    ary.push(obj2);
    ary.push(obj3);
    ary.push(obj4);

    ary.push(obj1);
    ary.push(obj2);
    ary.push(obj3);
    ary.push(obj4);
  }
}

ModelCreatorGUIHandler.prototype.splitGeometry = function(geometry, start, count){
  var positionAry = new Float32Array(count * 3);
  var normalAry = new Float32Array(count * 3);
  var uvAry = new Float32Array(count * 2);

  var pos = geometry.attributes.position.array;
  var norm = geometry.attributes.normal.array;
  var uv = geometry.attributes.uv? geometry.attributes.uv.array: null;

  var x = 0;
  var y = 0;
  var z = 0;
  for (var i = start; i < pos.length / 3 ; i ++){
    var cs = 3 * i;
    var cs2 = 2 * i;

    positionAry[x ++] = pos[cs];
    positionAry[x ++] = pos[cs + 1];
    positionAry[x ++] = pos[cs + 2];

    normalAry[y ++] = norm[cs];
    normalAry[y ++] = norm[cs + 1];
    normalAry[y ++] = norm[cs + 2];

    uvAry[z ++] = uv? uv[cs2]: 0;
    uvAry[z ++] = uv? uv[cs2 + 1]: 0;
  }

  var geom = new THREE.BufferGeometry();
  geom.addAttribute("position", new THREE.BufferAttribute(positionAry, 3));
  geom.addAttribute("normal", new THREE.BufferAttribute(normalAry, 3));
  geom.addAttribute("uv", new THREE.BufferAttribute(uvAry, 2));

  return geom;
}
