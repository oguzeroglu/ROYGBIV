var ModelLoader = function(){
  this.reset();
}

ModelLoader.prototype.reset = function(){
  this.cache = {};
}

ModelLoader.prototype.loadModel = function(directoryName, objFileName, mtlFileName, onLoaded, onError){
  if (this.cache[directoryName]){
    onLoaded(this.cache[directoryName]);
    return;
  }

  var rootPath = "./models/" + directoryName + "/";

  new THREE.MTLLoader().setPath(rootPath).load(mtlFileName, function(materials){
    materials.preload();

    new THREE.OBJLoader().setMaterials(materials).setPath(rootPath).load(objFileName, function(object){
      modelLoader.cache[directoryName] = object;
      for (var i = 0; i < object.children.length; i ++){
        var mat = object.children[i].material;
        if ((mat.map && !mat.map.image) || (mat.normalMap && !mat.normalMap.image)){
          var fn = function(){
            for (var i = 0; i < object.children.length; i ++){
              if ((mat.map && !mat.map.image) || (mat.normalMap && !mat.normalMap.image)){
                setTimeout(fn, 100);
                return;
              }
            }
            onLoaded(object);
          }
          setTimeout(fn, 100);
          return;
        }
      }
      onLoaded(object);
    }, noop, function(err){
      onError(false, err);
    });
  }, noop, function(err){
    onError(true, err);
  });
}
