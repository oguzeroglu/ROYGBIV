var Model = function(modelInfo){
  this.name = modelInfo.name;

  var geomKey = "MODEL" + PIPE + modelInfo.folderName
  if (geometryCache[geomKey]){
    this.geometry = geometryCache[geomKey]
  }else{
    this.geometry = new THREE.BufferGeometry();
    geometryCache[geomKey] = this.geometry;

    var positionsTypedArray = new Float32Array(modelInfo.positionsAry);
    var colorsTypedArray = new Float32Array(modelInfo.colorsAry);
    var normalsTypedArray = new Float32Array(modelInfo.normalsAry);
    var uvsTypedArray = new Float32Array(modelInfo.uvsAry);

    var positionsBufferAttribute = new THREE.BufferAttribute(positionsTypedArray, 3);
    var colorsBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
    var normalsBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);
    var uvsBufferAttribute = new THREE.BufferAttribute(uvsTypedArray, 2);

    positionsBufferAttribute.setDynamic(false);
    colorsBufferAttribute.setDynamic(false);
    normalsBufferAttribute.setDynamic(false);
    uvsBufferAttribute.setDynamic(false);

    this.geometry.addAttribute('position', positionsBufferAttribute);
    this.geometry.addAttribute('color', colorsBufferAttribute);
    this.geometry.addAttribute('normal', normalsBufferAttribute);
    this.geometry.addAttribute('uv', uvsBufferAttribute);
  }

  this.info = modelInfo;
}
