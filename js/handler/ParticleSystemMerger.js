var ParticleSystemMerger = function(psObj, name){
  this.name = name;
  this.psObj = new Object();
  for (var psName in psObj){
    this.psObj[psName] = psObj[psName];
  }
  this.geometry = new THREE.BufferGeometry();

  this.activePSMap = new Map();

  this.size = Object.keys(this.psObj).length;

  var texturesObj = new Object();
  var textureCount = 0;
  var len = 0;
  var noTargetColor = true;
  for (var psName in this.psObj){
    var ps = this.psObj[psName];
    ps.psMerger = this;
    if (!ps.noTargetColor){
      noTargetColor = false;
    }
    len += ps.particles.length;
    if (!(typeof ps.textureName == UNDEFINED)){
      texturesObj[ps.textureName] = texturePacks[ps.textureName];
      textureCount ++;
    }
  }
  this.noTargetColor = noTargetColor;
  var textureMerger = 0;
  if (textureCount > 0){
    textureMerger = textureAtlasHandler.textureMerger;
  }
  var mvMatrixArray = [];
  var worldMatrixArray = [];
  var timeArray = [];
  var motionMatrixArray = [];
  var hiddenArray = [];
  var dissapearCoefArray = [];
  var stopInfoArray = [];

  this.mergedIndices = new Float32Array(len);
  this.positions = new Float32Array(len * 3);
  if (textureCount > 0){
    this.rgbThresholds = new Float32Array(len * 3);
    this.uvCoordinates = new Float32Array(len * 4);
  }
  this.velocities = new Float32Array(len * 3);
  this.accelerations = new Float32Array(len * 3);
  this.flags1 = new Float32Array(len * 4);
  this.flags3 = new Float32Array(len * 4);
  this.flags4 = new Float32Array(len * 4);
  if (!this.noTargetColor){
    this.targetColors = new Float32Array(len * 4);
  }
  this.angularQuaternions = new Float32Array(len * 4);
  this.expiredFlags = new Float32Array(len);
  this.flags2 = new Float32Array(len * 4);

  var offset1 = 0;
  var offset2 = 0;
  var offset3 = 0;
  var ctr = 0;
  var index = 0;
  var uvCounter = 0;
  for (var psName in this.psObj){
    var ps = this.psObj[psName];
    mvMatrixArray.push(ps.mesh.modelViewMatrix);
    worldMatrixArray.push(ps.mesh.matrixWorld);
    dissapearCoefArray.push(ps.material.uniforms.dissapearCoef.value);
    stopInfoArray.push(ps.material.uniforms.stopInfo.value);
    timeArray.push(ps.tick);
    if (ps.mesh.visible){
      hiddenArray.push(-20.0);
      this.activePSMap.set(ps.name, ps);
    }else{
      hiddenArray.push(20.0);
    }
    motionMatrixArray.push(new THREE.Matrix3());
    scene.remove(ps.mesh);
    this.positions.set(ps.positions, offset1);
    if (this.rgbThresholds){
      if (ps.rgbThresholds){
        this.rgbThresholds.set(ps.rgbThresholds, offset1);
      }else{
        var lim = ax + (ps.particles.length * 3);
        for (var ax = offset1; ax < lim; ax ++){
          this.rgbThresholds[ax] = -50;
        }
      }
    }
    this.velocities.set(ps.velocities, offset1);
    this.accelerations.set(ps.accelerations, offset1);
    this.flags1.set(ps.flags1, offset2);
    this.flags3.set(ps.flags3, offset2);
    this.flags4.set(ps.flags4, offset2);
    if (!this.noTargetColor){
      if (ps.noTargetColor){
        var lim = ax + (ps.particles.length * 4);
        for (var ax = offset2; ax<lim; ax++){
          this.targetColors[ax] = -50;
        }
      }else{
        this.targetColors.set(ps.targetColors, offset2);
      }
    }
    this.angularQuaternions.set(ps.angularQuaternions, offset2);
    this.expiredFlags.set(ps.expiredFlags, offset3);
    this.flags2.set(ps.flags2, offset2);

    ps.flags2Offset = offset2;
    ps.expiredFlagOffset = offset3;

    for (var i = 0; i<ps.particles.length; i++){
      var particle = ps.particles[i];
      this.mergedIndices[ctr] = index;
      ctr ++;
      if (textureCount > 0){
        if (particle.material.texture){
          var range = textureMerger.ranges[particle.material.texture + "#diffuse"];
          this.uvCoordinates[uvCounter++] = range.startU;
          this.uvCoordinates[uvCounter++] = range.startV;
          this.uvCoordinates[uvCounter++] = range.endU;
          this.uvCoordinates[uvCounter++] = range.endV;
        }else{
          this.uvCoordinates[uvCounter++] = -10;
          this.uvCoordinates[uvCounter++] = -10;
          this.uvCoordinates[uvCounter++] = -10;
          this.uvCoordinates[uvCounter++] = -10;
        }
      }
    }
    ps.mergedIndex = index;
    index ++;
    offset1 += ps.positions.length;
    offset2 += ps.flags2.length;
    offset3 += ps.expiredFlags.length;
    particleSystems.delete(psName);
    mergedParticleSystems[this.name] = this;
  }

  var texture;
  if (textureMerger){
    texture = textureAtlasHandler.atlas.diffuseTexture;
  }

  this.mergedIndicesBufferAttribute = new THREE.BufferAttribute(this.mergedIndices, 1);
  this.positionBufferAttribute = new THREE.BufferAttribute(this.positions, 3);
  if (this.rgbThresholds){
    this.rgbThresholdBufferAttribute = new THREE.BufferAttribute(this.rgbThresholds, 3);
  }
  this.expiredFlagBufferAttribute = new THREE.BufferAttribute(this.expiredFlags, 1);
  this.velocityBufferAttribute = new THREE.BufferAttribute(this.velocities, 3);
  this.accelerationBufferAttribute = new THREE.BufferAttribute(this.accelerations, 3);
  if (this.targetColors){
    this.targetColorBufferAttribute = new THREE.BufferAttribute(this.targetColors, 4);
  }
  this.flags1BufferAttribute = new THREE.BufferAttribute(this.flags1, 4);
  this.flags2BufferAttribute = new THREE.BufferAttribute(this.flags2, 4);
  this.flags3BufferAttribute = new THREE.BufferAttribute(this.flags3, 4);
  this.flags4BufferAttribute = new THREE.BufferAttribute(this.flags4, 4);
  this.angularQuaternionsBufferAttribute = new THREE.BufferAttribute(this.angularQuaternions, 4);
  if (this.uvCoordinates){
    this.uvCoordinatesBufferAttribute = new THREE.BufferAttribute(this.uvCoordinates, 4);
  }

  this.mergedIndicesBufferAttribute.setDynamic(false);
  this.positionBufferAttribute.setDynamic(false);
  if (this.rgbThresholdBufferAttribute){
    this.rgbThresholdBufferAttribute.setDynamic(false);
  }
  this.expiredFlagBufferAttribute.setDynamic(true);
  this.velocityBufferAttribute.setDynamic(false);
  this.accelerationBufferAttribute.setDynamic(false);
  if (this.targetColorBufferAttribute){
    this.targetColorBufferAttribute.setDynamic(false);
  }
  this.flags1BufferAttribute.setDynamic(false);
  this.flags2BufferAttribute.setDynamic(true);
  this.flags3BufferAttribute.setDynamic(false);
  this.flags4BufferAttribute.setDynamic(false);
  this.angularQuaternionsBufferAttribute.setDynamic(false);
  if (this.uvCoordinatesBufferAttribute){
    this.uvCoordinatesBufferAttribute.setDynamic(false);
  }

  this.geometry.addAttribute('mergedIndex', this.mergedIndicesBufferAttribute);
  this.geometry.addAttribute('position', this.positionBufferAttribute);
  if (this.rgbThresholdBufferAttribute){
    this.geometry.addAttribute('rgbThreshold', this.rgbThresholdBufferAttribute);
  }
  this.geometry.addAttribute('expiredFlag', this.expiredFlagBufferAttribute);
  this.geometry.addAttribute('velocity', this.velocityBufferAttribute);
  this.geometry.addAttribute('acceleration', this.accelerationBufferAttribute);
  if (this.targetColorBufferAttribute){
    this.geometry.addAttribute('targetColor', this.targetColorBufferAttribute);
  }
  this.geometry.addAttribute('flags1', this.flags1BufferAttribute);
  this.geometry.addAttribute('flags2', this.flags2BufferAttribute);
  this.geometry.addAttribute('flags3', this.flags3BufferAttribute);
  this.geometry.addAttribute('flags4', this.flags4BufferAttribute);
  this.geometry.addAttribute('angularQuaternion', this.angularQuaternionsBufferAttribute);
  if (this.uvCoordinatesBufferAttribute){
    this.geometry.addAttribute('uvCoordinates', this.uvCoordinatesBufferAttribute);
  }
  this.geometry.setDrawRange(0, len);

  this.mesh = new MeshGenerator().generateMergedParticleSystemMesh({
    geometry: this.geometry,
    size: this.size,
    mvMatrixArray: mvMatrixArray,
    worldMatrixArray: worldMatrixArray,
    timeArray: timeArray,
    hiddenArray: hiddenArray,
    dissapearCoefArray: dissapearCoefArray,
    stopInfoArray: stopInfoArray,
    motionMatrixArray: motionMatrixArray,
    texture: texture,
    noTargetColor: this.noTargetColor
  });

  this.material = this.mesh.material;

  this.compressGeometry();

  this.clean();
  webglCallbackHandler.registerEngineObject(this);
}

ParticleSystemMerger.prototype.compressGeometry = function(){
  macroHandler.compressAttributes(this.mesh, [
    "position", "velocity", "acceleration", "flags1", "flags3", "flags4", "angularQuaternion",
    "rgbThreshold", "uvCoordinates", "targetColor"
  ]);
}

ParticleSystemMerger.prototype.removeFog = function(){
  macroHandler.removeMacro("HAS_FOG", this.mesh.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}

ParticleSystemMerger.prototype.setFog = function(){
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.mesh.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogHandler.isFogBlendingWithSkybox()){
    if (!this.mesh.material.uniforms.cubeTexture){
      macroHandler.injectMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
      this.mesh.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
      this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    }
  }
  this.mesh.material.needsUpdate = true;
}

ParticleSystemMerger.prototype.destroy = function(){
  for (var psName in this.psObj){
    this.psObj[psName].destroy();
  }
  scene.remove(this.mesh);
  this.mesh.geometry.dispose();
  this.mesh.material.dispose();
  delete mergedParticleSystems[this.name];
}

ParticleSystemMerger.prototype.clean = function(){
  for (var psName in this.psObj){
    this.psObj[psName].expiredFlags = null;
    this.psObj[psName].flags2 = null;
    this.psObj[psName].positions = null;
    this.psObj[psName].rgbThresholds = null;
    this.psObj[psName].velocities = null;
    this.psObj[psName].accelerations = null;
    this.psObj[psName].flags1 = null;
    this.psObj[psName].flags3 = null;
    this.psObj[psName].flags4 = null;
    this.psObj[psName].targetColors = null;
    this.psObj[psName].angularQuaternions = null;
    this.psObj[psName].uvCoordinates = null;
    this.psObj[psName].positionBufferAttribute = null;
    this.psObj[psName].rgbThresholdBufferAttribute = null;
    this.psObj[psName].expiredFlagBufferAttribute = null;
    this.psObj[psName].velocityBufferAttribute = null;
    this.psObj[psName].accelerationBufferAttribute = null;
    this.psObj[psName].targetColorBufferAttribute = null;
    this.psObj[psName].flags1BufferAttribute = null;
    this.psObj[psName].flags2BufferAttribute = null;
    this.psObj[psName].flags3BufferAttribute = null;
    this.psObj[psName].flags4BufferAttribute = null;
    this.psObj[psName].angularQuaternionsBufferAttribute = null;
    this.psObj[psName].uvCoordinatesBufferAttribute = null;
    this.psObj[psName].mesh.geometry.dispose();
    this.psObj[psName].mesh.material.dispose();
  }
}

ParticleSystemMerger.prototype.removePS = function(ps){
  this.material.uniforms.hiddenArray.value[ps.mergedIndex] = (20.0);
  this.activePSMap.delete(ps.name);
  delete this.psObj[ps.name];
  delete ps.mergedIndex;
  if (Object.keys(this.psObj).length == 0){
    this.destroy();
  }
}

ParticleSystemMerger.prototype.notifyPSVisibilityChange = function(ps, isVisible){
  if (isVisible){
    this.activePSMap.set(ps.name, ps);
  }else{
    this.activePSMap.delete(ps.name);
  }
}

ParticleSystemMerger.prototype.updateObject = function(ps){
  ps.update();
}

ParticleSystemMerger.prototype.update = function(){
  this.activePSMap.forEach(this.updateObject);
}
