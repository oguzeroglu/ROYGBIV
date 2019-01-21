var CommandDescriptor = function(){

  this.UNKNOWN_INDICATOR        =   0;
  this.GRID_SYSTEM_AXIS         =   1;
  this.GRID_SYSTEM_NAME         =   2;
  this.COLOR                    =   3;
  this.BOOLEAN                  =   4;
  this.MATERIAL_NAME            =   5;
  this.MATERIAL_NAME_WITH_NULL  =   6;
  this.OBJECT_NAME              =   7;
  this.UPLOADED_IMAGE_NAME      =   8;
  this.TEXTURE_NAME             =   9;
  this.OBJECT_AXIS              =   10;
  this.PHYSICS_TEST_INDEX       =   11;
  this.STATE_ON_OFF             =   12;
  this.S_T_ST                   =   13;
  this.WALL_COLLECTION_NAME     =   14;
  this.DEFAULT_MATERIAL_TYPE    =   15;
  this.LIGHT_NAME               =   16;
  this.FILE_EXTENSION           =   17;
  this.TEXTURE_PACK_NAME        =   18;
  this.HIDE_SHOW                =   19;
  this.SKYBOX_NAME              =   20;
  this.SCRIPT_NAME              =   21;
  this.ANY_OBJECT               =   22;
  this.GLUED_OBJECT_NAME        =   23;
  this.MARKED_POINT_NAME        =   24;
  this.API_FUNCTION_NAME        =   25;
  this.BLENDING_MODE            =   26;
  this.OBJECT_CREATION_NAME     =   27;
  this.AREA_NAME                =   28;
  this.AREA_NAME_WITH_DEFAULT   =   29;
  this.RENDER_SIDE              =   30;
  this.CHILD_OBJECT_NAME        =   31;

  // newGridSystem
  this.newGridSystem = new Object();
  this.newGridSystem.types = [];
  this.newGridSystem.types.push(this.UNKNOWN_INDICATOR); //name
  this.newGridSystem.types.push(this.UNKNOWN_INDICATOR); //sizeX
  this.newGridSystem.types.push(this.UNKNOWN_INDICATOR); //sizeZ
  this.newGridSystem.types.push(this.UNKNOWN_INDICATOR); //centerX
  this.newGridSystem.types.push(this.UNKNOWN_INDICATOR); //centerY
  this.newGridSystem.types.push(this.UNKNOWN_INDICATOR); //centerZ
  this.newGridSystem.types.push(this.COLOR);             //color
  this.newGridSystem.types.push(this.UNKNOWN_INDICATOR); //cellSize
  this.newGridSystem.types.push(this.GRID_SYSTEM_AXIS); //axis

  // printGridSystemInfo
  this.printGridSystemInfo = new Object();
  this.printGridSystemInfo.types = [];
  this.printGridSystemInfo.types.push(this.GRID_SYSTEM_NAME); //name

  // destroyGridSystem
  this.destroyGridSystem = new Object();
  this.destroyGridSystem.types = [];
  this.destroyGridSystem.types.push(this.GRID_SYSTEM_NAME); //name

  // selectAllGrids --> DEPRECATED
  this.selectAllGrids = new Object();
  this.selectAllGrids.types = [];
  this.selectAllGrids.types.push(this.GRID_SYSTEM_NAME); //name

  // pasteCroppedGridSystem
  this.pasteCroppedGridSystem = new Object();
  this.pasteCroppedGridSystem.types = [];
  this.pasteCroppedGridSystem.types.push(this.UNKNOWN_INDICATOR); //name
  this.pasteCroppedGridSystem.types.push(this.UNKNOWN_INDICATOR); //xTranslation
  this.pasteCroppedGridSystem.types.push(this.UNKNOWN_INDICATOR); //yTranslation
  this.pasteCroppedGridSystem.types.push(this.UNKNOWN_INDICATOR); //zTranslation
  this.pasteCroppedGridSystem.types.push(this.COLOR); //outlineColor
  this.pasteCroppedGridSystem.types.push(this.UNKNOWN_INDICATOR); //cellSize

  // newBasicMaterial
  this.newBasicMaterial = new Object();
  this.newBasicMaterial.types = [];
  this.newBasicMaterial.types.push(this.UNKNOWN_INDICATOR); //name
  this.newBasicMaterial.types.push(this.COLOR); //color

  // destroyMaterial
  this.destroyMaterial = new Object();
  this.destroyMaterial.types = [];
  this.destroyMaterial.types.push(this.MATERIAL_NAME); //name

  // newSurface
  this.newSurface = new Object();
  this.newSurface.types = [];
  this.newSurface.types.push(this.OBJECT_CREATION_NAME); //name
  this.newSurface.types.push(this.MATERIAL_NAME_WITH_NULL); //material

  // printMetaData
  this.printMetaData = new Object();
  this.printMetaData.types = [];
  this.printMetaData.types.push(this.OBJECT_NAME); //name

  // destroyObject
  this.destroyObject = new Object();
  this.destroyObject.types = [];
  this.destroyObject.types.push(this.OBJECT_NAME); //name

  // newTexture
  this.newTexture = new Object();
  this.newTexture.types = [];
  this.newTexture.types.push(this.UNKNOWN_INDICATOR); //name
  this.newTexture.types.push(this.UPLOADED_IMAGE_NAME); //fileName
  this.newTexture.types.push(this.UNKNOWN_INDICATOR); //repeatU
  this.newTexture.types.push(this.UNKNOWN_INDICATOR); //repeatV

  // destroyTexture
  this.destroyTexture = new Object();
  this.destroyTexture.types = [];
  this.destroyTexture.types.push(this.TEXTURE_NAME); //name

  // mapTexture
  this.mapTexture = new Object();
  this.mapTexture.types = [];
  this.mapTexture.types.push(this.TEXTURE_NAME); //textureName
  this.mapTexture.types.push(this.OBJECT_NAME); // objectName

  // adjustTextureRepeat
  this.adjustTextureRepeat = new Object();
  this.adjustTextureRepeat.types = [];
  this.adjustTextureRepeat.types.push(this.OBJECT_NAME); //objectName
  this.adjustTextureRepeat.types.push(this.UNKNOWN_INDICATOR); //repeatU
  this.adjustTextureRepeat.types.push(this.UNKNOWN_INDICATOR); //repeatV

  // newPhysicsBoxTest
  this.newPhysicsBoxTest = new Object();
  this.newPhysicsBoxTest.types = [];
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //duration
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //sizeX
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //sizeY
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //sizeZ
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //mass
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //positionX
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //positionY
  this.newPhysicsBoxTest.types.push(this.UNKNOWN_INDICATOR); //positionZ

  // newPhysicsSphereTest
  this.newPhysicsSphereTest = new Object();
  this.newPhysicsSphereTest.types = [];
  this.newPhysicsSphereTest.types.push(this.UNKNOWN_INDICATOR); //duration
  this.newPhysicsSphereTest.types.push(this.UNKNOWN_INDICATOR); //radius
  this.newPhysicsSphereTest.types.push(this.UNKNOWN_INDICATOR); //mass
  this.newPhysicsSphereTest.types.push(this.UNKNOWN_INDICATOR); //positionX
  this.newPhysicsSphereTest.types.push(this.UNKNOWN_INDICATOR); //positionY
  this.newPhysicsSphereTest.types.push(this.UNKNOWN_INDICATOR); //positionZ

  // newRamp
  this.newRamp = new Object();
  this.newRamp.types = [];
  this.newRamp.types.push(this.OBJECT_CREATION_NAME); //name
  this.newRamp.types.push(this.MATERIAL_NAME_WITH_NULL); //material
  this.newRamp.types.push(this.OBJECT_AXIS); //axis
  this.newRamp.types.push(this.UNKNOWN_INDICATOR); //height

  // restartPhysicsTest
  this.restartPhysicsTest = new Object();
  this.restartPhysicsTest.types = [];
  this.restartPhysicsTest.types.push(this.PHYSICS_TEST_INDEX); //physicsTestIndex

  // mirror
  this.mirror = new Object();
  this.mirror.types = [];
  this.mirror.types.push(this.OBJECT_NAME); //objectName
  this.mirror.types.push(this.STATE_ON_OFF); //on-off
  this.mirror.types.push(this.S_T_ST); //s-t-st

  // newBox
  this.newBox = new Object();
  this.newBox.types = [];
  this.newBox.types.push(this.OBJECT_CREATION_NAME); //name
  this.newBox.types.push(this.MATERIAL_NAME_WITH_NULL); //material
  this.newBox.types.push(this.UNKNOWN_INDICATOR); //height

  // newWallCollection
  this.newWallCollection = new Object();
  this.newWallCollection.types = [];
  this.newWallCollection.types.push(this.UNKNOWN_INDICATOR); //name
  this.newWallCollection.types.push(this.UNKNOWN_INDICATOR); //height
  this.newWallCollection.types.push(this.COLOR); //outlineColor

  // destroyWallCollection
  this.destroyWallCollection = new Object();
  this.destroyWallCollection.types = [];
  this.destroyWallCollection.types.push(this.WALL_COLLECTION_NAME); //name

  // remakeGridSystem --> DEPRECATED
  this.remakeGridSystem = new Object();
  this.remakeGridSystem.types = [];
  this.remakeGridSystem.types.push(this.GRID_SYSTEM_NAME); //name

  // uploadImage
  this.uploadImage = new Object();
  this.uploadImage.types = [];
  this.uploadImage.types.push(this.UNKNOWN_INDICATOR); //name

  // mapSpecular
  this.mapSpecular = new Object();
  this.mapSpecular.types = [];
  this.mapSpecular.types.push(this.TEXTURE_NAME); //textureName
  this.mapSpecular.types.push(this.OBJECT_NAME); //objectName

  // mapEnvironment
  this.mapEnvironment = new Object();
  this.mapEnvironment.types = [];
  this.mapEnvironment.types.push(this.TEXTURE_NAME); //textureName
  this.mapEnvironment.types.push(this.OBJECT_NAME); //objectName

  // mapAmbientOcculsion
  this.mapAmbientOcculsion = new Object();
  this.mapAmbientOcculsion.types = [];
  this.mapAmbientOcculsion.types.push(this.TEXTURE_NAME); //textureName
  this.mapAmbientOcculsion.types.push(this.OBJECT_NAME); //objectName

  // mapAlpha
  this.mapAlpha = new Object();
  this.mapAlpha.types = [];
  this.mapAlpha.types.push(this.TEXTURE_NAME); //textureName
  this.mapAlpha.types.push(this.OBJECT_NAME); //objectName

  // setDefaultMaterial
  this.setDefaultMaterial = new Object();
  this.setDefaultMaterial.types = [];
  this.setDefaultMaterial.types.push(this.DEFAULT_MATERIAL_TYPE); //basic-phong

  // newAmbientLight
  this.newAmbientLight = new Object();
  this.newAmbientLight.types = [];
  this.newAmbientLight.types.push(this.UNKNOWN_INDICATOR); //name
  this.newAmbientLight.types.push(this.COLOR); //color

  // selectLight
  this.selectLight = new Object();
  this.selectLight.types = [];
  this.selectLight.types.push(this.LIGHT_NAME); //name

  // destroyLight
  this.destroyLight = new Object();
  this.destroyLight.types = [];
  this.destroyLight.types.push(this.LIGHT_NAME); //name

  // newPhongMaterial
  this.newPhongMaterial = new Object();
  this.newPhongMaterial.types = [];
  this.newPhongMaterial.types.push(this.UNKNOWN_INDICATOR); //name
  this.newPhongMaterial.types.push(this.COLOR); //color

  // mapNormal
  this.mapNormal = new Object();
  this.mapNormal.types = [];
  this.mapNormal.types.push(this.TEXTURE_NAME); //textureName
  this.mapNormal.types.push(this.OBJECT_NAME); //objectName

  // mapEmissive
  this.mapEmissive = new Object();
  this.mapEmissive.types = [];
  this.mapEmissive.types.push(this.TEXTURE_NAME); //textureName
  this.mapEmissive.types.push(this.OBJECT_NAME); //objectName

  // newLambertMaterial
  this.newLambertMaterial = new Object();
  this.newLambertMaterial.types = [];
  this.newLambertMaterial.types.push(this.UNKNOWN_INDICATOR); //name
  this.newLambertMaterial.types.push(this.COLOR); //color

  // newTexturePack
  this.newTexturePack = new Object();
  this.newTexturePack.types = [];
  this.newTexturePack.types.push(this.UNKNOWN_INDICATOR); //name
  this.newTexturePack.types.push(this.UNKNOWN_INDICATOR); //directoryName
  this.newTexturePack.types.push(this.FILE_EXTENSION); //fileExtension

  // printTexturePackInfo
  this.printTexturePackInfo = new Object();
  this.printTexturePackInfo.types = [];
  this.printTexturePackInfo.types.push(this.TEXTURE_PACK_NAME); //name

  // mapTexturePack
  this.mapTexturePack = new Object();
  this.mapTexturePack.types = [];
  this.mapTexturePack.types.push(this.TEXTURE_PACK_NAME); //texturePackName
  this.mapTexturePack.types.push(this.OBJECT_NAME); //objectName

  // destroyTexturePack
  this.destroyTexturePack = new Object();
  this.destroyTexturePack.types = [];
  this.destroyTexturePack.types.push(this.TEXTURE_PACK_NAME); //name

  // refreshTexturePack
  this.refreshTexturePack = new Object();
  this.refreshTexturePack.types = [];
  this.refreshTexturePack.types.push(this.TEXTURE_PACK_NAME); //name

  // mapHeight
  this.mapHeight = new Object();
  this.mapHeight.types = [];
  this.mapHeight.types.push(this.TEXTURE_NAME); //textureName
  this.mapHeight.types.push(this.OBJECT_NAME); //objectName

  // resetMaps
  this.resetMaps = new Object();
  this.resetMaps.types = [];
  this.resetMaps.types.push(this.OBJECT_NAME); //objectName

  // segmentObject
  this.segmentObject = new Object();
  this.segmentObject.types = [];
  this.segmentObject.types.push(this.OBJECT_NAME); //name
  this.segmentObject.types.push(this.UNKNOWN_INDICATOR); //count

  // superposeGridSystem
  this.superposeGridSystem = new Object();
  this.superposeGridSystem.types = [];
  this.superposeGridSystem.types.push(this.GRID_SYSTEM_NAME); //gridSystemName
  this.superposeGridSystem.types.push(this.COLOR); //outlineColor
  this.superposeGridSystem.types.push(this.UNKNOWN_INDICATOR); //cellSize
  this.superposeGridSystem.types.push(this.OBJECT_NAME); //objectName

  // postProcessing
  this.postProcessing = new Object();
  this.postProcessing.types = [];
  this.postProcessing.types.push(this.HIDE_SHOW); //hide/show

  // sliceGrid
  this.sliceGrid = new Object();
  this.sliceGrid.types = [];
  this.sliceGrid.types.push(this.UNKNOWN_INDICATOR); //newName
  this.sliceGrid.types.push(this.UNKNOWN_INDICATOR); //cellSize
  this.sliceGrid.types.push(this.COLOR); //outlineColor

  // newPointLight
  this.newPointLight = new Object();
  this.newPointLight.types = [];
  this.newPointLight.types.push(this.UNKNOWN_INDICATOR); //name
  this.newPointLight.types.push(this.COLOR); //color
  this.newPointLight.types.push(this.UNKNOWN_INDICATOR); //offsetX
  this.newPointLight.types.push(this.UNKNOWN_INDICATOR); //offsetY
  this.newPointLight.types.push(this.UNKNOWN_INDICATOR); //offsetZ

  // newSkybox
  this.newSkybox = new Object();
  this.newSkybox.types = [];
  this.newSkybox.types.push(this.UNKNOWN_INDICATOR); //name
  this.newSkybox.types.push(this.UNKNOWN_INDICATOR); //directory
  this.newSkybox.types.push(this.FILE_EXTENSION); //fileExtension

  // printSkyboxInfo
  this.printSkyboxInfo = new Object();
  this.printSkyboxInfo.types = [];
  this.printSkyboxInfo.types.push(this.SKYBOX_NAME); //name

  // mapSkybox
  this.mapSkybox = new Object();
  this.mapSkybox.types = [];
  this.mapSkybox.types.push(this.SKYBOX_NAME); //name

  // destroySkybox
  this.destroySkybox = new Object();
  this.destroySkybox.types = [];
  this.destroySkybox.types.push(this.SKYBOX_NAME); //name

  // skybox
  this.skybox = new Object();
  this.skybox.types = [];
  this.skybox.types.push(this.HIDE_SHOW); //hide/show

  // scaleSkybox
  this.scaleSkybox = new Object();
  this.scaleSkybox.types = [];
  this.scaleSkybox.types.push(this.UNKNOWN_INDICATOR); //amount

  // selectObject
  this.selectObject = new Object();
  this.selectObject.types = [];
  this.selectObject.types.push(this.OBJECT_NAME); //name

  // setMass
  this.setMass = new Object();
  this.setMass.types = [];
  this.setMass.types.push(this.OBJECT_NAME); //name
  this.setMass.types.push(this.UNKNOWN_INDICATOR); //mass

  // rotateObject
  this.rotateObject = new Object();
  this.rotateObject.types = [];
  this.rotateObject.types.push(this.OBJECT_NAME); //name
  this.rotateObject.types.push(this.OBJECT_AXIS); //axis
  this.rotateObject.types.push(this.UNKNOWN_INDICATOR); //radian

  // newScript
  this.newScript = new Object();
  this.newScript.types = [];
  this.newScript.types.push(this.UNKNOWN_INDICATOR); //name

  // runScript
  this.runScript = new Object();
  this.runScript.types = [];
  this.runScript.types.push(this.SCRIPT_NAME); //name

  // stopScript
  this.stopScript = new Object();
  this.stopScript.types = [];
  this.stopScript.types.push(this.SCRIPT_NAME); //name

  // editScript
  this.editScript = new Object();
  this.editScript.types = [];
  this.editScript.types.push(this.SCRIPT_NAME); //name

  // destroyScript
  this.destroyScript = new Object();
  this.destroyScript.types = [];
  this.destroyScript.types.push(this.SCRIPT_NAME); //nane

  // translateObject --> DEPRECATED
  this.translateObject = new Object();
  this.translateObject.types = [];
  this.translateObject.types.push(this.OBJECT_NAME); //name
  this.translateObject.types.push(this.OBJECT_AXIS); //axis
  this.translateObject.types.push(this.UNKNOWN_INDICATOR); //amount

  // setFog
  this.setFog = new Object();
  this.setFog.types = [];
  this.setFog.types.push(this.COLOR); //fogColor
  this.setFog.types.push(this.UNKNOWN_INDICATOR); //fogDensity

  // glue
  this.glue = new Object();
  this.glue.types = [];
  this.glue.types.push(this.OBJECT_CREATION_NAME); //newName
  this.glue.types.push(this.ANY_OBJECT); //objectName[1],objectName[2],...objectName[n]

  // detach
  this.detach = new Object();
  this.detach.types = [];
  this.detach.types.push(this.GLUED_OBJECT_NAME); //detach

  // mark
  this.mark = new Object();
  this.mark.types = [];
  this.mark.types.push(this.UNKNOWN_INDICATOR); //name
  this.mark.types.push(this.UNKNOWN_INDICATOR); //offsetX
  this.mark.types.push(this.UNKNOWN_INDICATOR); //offsetY
  this.mark.types.push(this.UNKNOWN_INDICATOR); //offsetZ

  // unmark
  this.unmark = new Object();
  this.unmark.types = [];
  this.unmark.types.push(this.MARKED_POINT_NAME); //name

  // runAutomatically
  this.runAutomatically = new Object();
  this.runAutomatically.types = [];
  this.runAutomatically.types.push(this.SCRIPT_NAME); //scriptName

  // uploadScript
  this.uploadScript = new Object();
  this.uploadScript.types = [];
  this.uploadScript.types.push(this.UNKNOWN_INDICATOR); //scriptName
  this.uploadScript.types.push(this.UNKNOWN_INDICATOR); //filePath

  // runManually
  this.runManually = new Object();
  this.runManually.types = [];
  this.runManually.types.push(this.SCRIPT_NAME); //scriptName

  // physicsWorkerMode
  this.physicsWorkerMode = new Object();
  this.physicsWorkerMode.types = [];
  this.physicsWorkerMode.types.push(this.STATE_ON_OFF); //state

  // explain
  this.explain = new Object();
  this.explain.types = [];
  this.explain.types.push(this.API_FUNCTION_NAME); //functionName

  // search
  this.search = new Object();
  this.search.types = [];
  this.search.types.push(this.UNKNOWN_INDICATOR); //textToSearch

  // rescaleTexture
  this.rescaleTexture = new Object();
  this.rescaleTexture.types = [];
  this.rescaleTexture.types.push(this.TEXTURE_NAME); //textureName
  this.rescaleTexture.types.push(this.UNKNOWN_INDICATOR); //scale
  this.rescaleTexture.types.push(this.UNKNOWN_INDICATOR); //newTextureName

  // rescaleTexturePack
  this.rescaleTexturePack = new Object();
  this.rescaleTexturePack.types = [];
  this.rescaleTexturePack.types.push(this.TEXTURE_PACK_NAME); //texturePackName
  this.rescaleTexturePack.types.push(this.UNKNOWN_INDICATOR); //scale
  this.rescaleTexturePack.types.push(this.UNKNOWN_INDICATOR); //newTexturePackName

  // destroyImage
  this.destroyImage = new Object();
  this.destroyImage.types = [];
  this.destroyImage.types.push(this.UPLOADED_IMAGE_NAME); //imageName

  // setBlending
  this.setBlending = new Object();
  this.setBlending.types = [];
  this.setBlending.types.push(this.OBJECT_NAME); //objectName
  this.setBlending.types.push(this.BLENDING_MODE); //mode

  // setWorldLimits
  this.setWorldLimits = new Object();
  this.setWorldLimits.types = [];
  this.setWorldLimits.types.push(this.UNKNOWN_INDICATOR); //minX
  this.setWorldLimits.types.push(this.UNKNOWN_INDICATOR); //minY
  this.setWorldLimits.types.push(this.UNKNOWN_INDICATOR); //minZ
  this.setWorldLimits.types.push(this.UNKNOWN_INDICATOR); //maxX
  this.setWorldLimits.types.push(this.UNKNOWN_INDICATOR); //maxY
  this.setWorldLimits.types.push(this.UNKNOWN_INDICATOR); //maxZ

  // setBinSize
  this.setBinSize = new Object();
  this.setBinSize.types = [];
  this.setBinSize.types.push(this.UNKNOWN_INDICATOR); //size

  // particleCollisionWorkerMode
  this.particleCollisionWorkerMode = new Object();
  this.particleCollisionWorkerMode.types = [];
  this.particleCollisionWorkerMode.types.push(this.STATE_ON_OFF); // on/off

  // particleSystemCollisionWorkerMode
  this.particleSystemCollisionWorkerMode = new Object();
  this.particleSystemCollisionWorkerMode.types = [];
  this.particleSystemCollisionWorkerMode.types.push(this.STATE_ON_OFF); // on/off

  // addPaddingToTexture
  this.addPaddingToTexture = new Object();
  this.addPaddingToTexture.types = [];
  this.addPaddingToTexture.types.push(this.TEXTURE_NAME); // textureName
  this.addPaddingToTexture.types.push(this.UNKNOWN_INDICATOR); // padding
  this.addPaddingToTexture.types.push(this.UNKNOWN_INDICATOR); // newTextureName

  // newSphere
  this.newSphere = new Object();
  this.newSphere.types = [];
  this.newSphere.types.push(this.UNKNOWN_INDICATOR); // name
  this.newSphere.types.push(this.MATERIAL_NAME_WITH_NULL); // material
  this.newSphere.types.push(this.UNKNOWN_INDICATOR); // radius

  // applyDisplacementMap
  this.applyDisplacementMap = new Object();
  this.applyDisplacementMap.types = [];
  this.applyDisplacementMap.types.push(this.OBJECT_NAME); // objectName
  this.applyDisplacementMap.types.push(this.TEXTURE_NAME); // textureName
  this.applyDisplacementMap.types.push(this.UNKNOWN_INDICATOR); // scale
  this.applyDisplacementMap.types.push(this.UNKNOWN_INDICATOR); // bias

  // setSlipperiness
  this.setSlipperiness = new Object();
  this.setSlipperiness.types = [];
  this.setSlipperiness.types.push(this.OBJECT_NAME); // objectName
  this.setSlipperiness.types.push(this.STATE_ON_OFF); // on/off

  // setAtlasTextureSize
  this.setAtlasTextureSize = new Object();
  this.setAtlasTextureSize.types = [];
  this.setAtlasTextureSize.types.push(this.UNKNOWN_INDICATOR); // width
  this.setAtlasTextureSize.types.push(this.UNKNOWN_INDICATOR); // height

  // sync
  this.sync = new Object();
  this.sync.types = [];
  this.sync.types.push(this.OBJECT_NAME); // sourceObject
  this.sync.types.push(this.OBJECT_NAME); // targetObject

  // newArea
  this.newArea = new Object();
  this.newArea.types = [];
  this.newArea.types.push(this.UNKNOWN_INDICATOR); // name
  this.newArea.types.push(this.UNKNOWN_INDICATOR); // height

  // destroyArea
  this.destroyArea = new Object();
  this.destroyArea.types = [];
  this.destroyArea.types.push(this.AREA_NAME); // areaName

  // areaConfiguration
  this.areaConfigurations = new Object();
  this.areaConfigurations.types = [];
  this.areaConfigurations.types.push(this.HIDE_SHOW); // show/hide

  // setResolution
  this.setResolution = new Object();
  this.setResolution.types = [];
  this.setResolution.types.push(this.UNKNOWN_INDICATOR); // resolution

  // configureArea
  this.configureArea = new Object();
  this.configureArea.types = [];
  this.configureArea.types.push(this.AREA_NAME_WITH_DEFAULT); // areaName

  // newAreaConfiguration
  this.newAreaConfiguration = new Object();
  this.newAreaConfiguration.types = [];
  this.newAreaConfiguration.types.push(this.AREA_NAME_WITH_DEFAULT); // areaName
  this.newAreaConfiguration.types.push(this.OBJECT_NAME); // objectName
  this.newAreaConfiguration.types.push(this.BOOLEAN); // isVisible
  this.newAreaConfiguration.types.push(this.RENDER_SIDE); // sides

  // autoConfigureArea
  this.autoConfigureArea = new Object();
  this.autoConfigureArea.types = [];
  this.autoConfigureArea.types.push(this.AREA_NAME); // areaName

  // newCylinder
  this.newCylinder = new Object();
  this.newCylinder.types = [];
  this.newCylinder.types.push(this.UNKNOWN_INDICATOR); // name
  this.newCylinder.types.push(this.MATERIAL_NAME_WITH_NULL); // materialName
  this.newCylinder.types.push(this.UNKNOWN_INDICATOR); // topRadius
  this.newCylinder.types.push(this.UNKNOWN_INDICATOR); // bottomRadius
  this.newCylinder.types.push(this.UNKNOWN_INDICATOR); // height
  this.newCylinder.types.push(this.BOOLEAN); // isOpenEnded

  // setRotationPivot
  this.setRotationPivot = new Object();
  this.setRotationPivot.types = [];
  this.setRotationPivot.types.push(this.OBJECT_NAME); // objectName
  this.setRotationPivot.types.push(this.UNKNOWN_INDICATOR); // offsetX
  this.setRotationPivot.types.push(this.UNKNOWN_INDICATOR); // offsetY
  this.setRotationPivot.types.push(this.UNKNOWN_INDICATOR); // offsetZ

  // printChildPosition
  this.printChildPosition = new Object();
  this.printChildPosition.types = [];
  this.printChildPosition.types.push(this.GLUED_OBJECT_NAME); // objectName
  this.printChildPosition.types.push(this.CHILD_OBJECT_NAME); // childObjName

  // unsetRotationPivot
  this.unsetRotationPivot = new Object();
  this.unsetRotationPivot.types = [];
  this.unsetRotationPivot.types.push(this.OBJECT_NAME); // objectName

  // copyObject
  this.copyObject = new Object();
  this.copyObject.types = [];
  this.copyObject.types.push(this.OBJECT_NAME); // sourceName
  this.copyObject.types.push(this.OBJECT_CREATION_NAME); // targetName
  this.copyObject.types.push(this.UNKNOWN_INDICATOR); // offsetX
  this.copyObject.types.push(this.UNKNOWN_INDICATOR); // offsetY
  this.copyObject.types.push(this.UNKNOWN_INDICATOR); // offsetZ
  this.copyObject.types.push(this.BOOLEAN); // isHardCopy

  // build
  this.build = new Object();
  this.build.types = [];
  this.build.types.push(this.UNKNOWN_INDICATOR); // projectName
  this.build.types.push(this.UNKNOWN_INDICATOR); // author

  // skyboxConfigurations
  this.skyboxConfigurations = new Object();
  this.skyboxConfigurations.types = [];
  this.skyboxConfigurations.types.push(this.HIDE_SHOW); // hide/show

  // fogConfigurations
  this.fogConfigurations = new Object();
  this.fogConfigurations.types = [];
  this.fogConfigurations.types.push(this.HIDE_SHOW); // hide/show

  // noMobile
  this.noMobile = new Object();
  this.noMobile.types = [];
  this.noMobile.types.push(this.STATE_ON_OFF); // on/off

  // setMaxViewport
  this.setMaxViewport = new Object();
  this.setMaxViewport.types = [];
  this.setMaxViewport.types.push(this.UNKNOWN_INDICATOR); // widthInPx
  this.setMaxViewport.types.push(this.UNKNOWN_INDICATOR); // heightInPx

};

CommandDescriptor.prototype.test = function(){
  for (var i = 0; i<commands.length; i++){
    var curCommand = commands[i];
    var curDescriptor = this[curCommand];
    if (!curDescriptor && commandArgumentsExpectedCount[i] > 0){
      console.error("CommandDescriptor error: "+curCommand+" not implemented.");
      return;
    }
    if (curDescriptor){
      var curTypes = curDescriptor.types;
      if (!curTypes){
        console.error("CommandDescriptor error: "+curCommand+" has no type.");
        return;
      }else{
        if (curTypes.length != commandArgumentsExpectedCount[i]){
          console.error("CommandDescriptor error: "+curCommand+" types size mismatch.");
          return;
        }
      }
    }
  }
};
