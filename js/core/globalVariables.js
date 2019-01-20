// CLI
var terminal = new Terminal();
var cliInnerDiv;
var scriptCreatorDiv;
var scriptCreatorCancelButton;
var scriptCreatorSaveButton;
var scriptCreatorTextArea;
var commandArgumentsExpectedCount = [
    0, //help
    9, //newGridSystem
    0, //printCameraPosition
    0, //printCameraDirection
    0, //printGridSystems
    1, //printGridSystemInfo
    1, //destroyGridSystem
    0, //printKeyboardInfo
    0, //printSelectedGrids
    0, //resetSelectedGrids
    1, //selectAllGrids
    0, //cropGridSystem
    6, //pasteCroppedGridSystem
    0, //switchView
    2, //newBasicMaterial
    0, //printMaterials
    1, //destroyMaterial
    2, //newSurface
    0, //printObjects
    1, //printMetaData
    1, //destroyObject
    4, //newTexture
    0, //printTextures
    1, //destroyTexture
    2, //mapTexture
    3, //adjustTextureRepeat
    8, //newPhysicsBoxTest
    6, //newPhysicsSphereTest
    0, //printPhysicsTests
    0, //switchPhysicsDebugMode
    4, //newRamp
    0, //setAnchor
    1, //restartPhysicsTest
    3, //mirror
    3, //newBox
    3, //newWallCollection
    0, //printWallCollections
    1, //destroyWallCollection
    0, //destroySelectedGrids
    1, //remakeGridSystem
    0, //resetCamera
    1, //uploadImage
    0, //printImages
    2, //mapSpecular
    2, //mapEnvironment
    2, //mapAmbientOcculsion
    2, //mapAlpha
    1, //setDefaultMaterial
    2, //newAmbientLight
    0, //printLights
    1, //selectLight
    1, //destroyLight
    2, //newPhongMaterial
    2, //mapNormal
    2, //mapEmissive
    2, //newLambertMaterial
    3, //newTexturePack
    0, //printTexturePacks
    1, //printTexturePackInfo
    2, //mapTexturePack
    1, //destroyTexturePack
    1, //refreshTexturePack
    2, //mapHeight
    1, //resetMaps
    2, //segmentObject
    4, //superposeGridSystem
    1, //postProcessing
    3, //sliceGrid
    5, //newPointLight
    3, //newSkybox
    0, //printSkyboxes
    1, //printSkyboxInfo
    1, //mapSkybox
    1, //destroySkybox
    1, //skybox
    1, //scaleSkybox
    0, //save
    0, //load
    0, //undo
    0, //redo
    1, //selectObject
    2, //setMass
    3, //rotateObject
    1, //newScript
    1, //runScript
    1, //stopScript
    0, //printScripts
    1, //editScript
    1, //destroyScript
    3, //translateObject
    2, //setFog
    0, //removeFog
    2, //glue
    1, //detach
    4, //mark
    1, //unmark
    0, //printMarkedPoints
    0, //toggleMarkedPoints
    1, //runAutomatically
    2, //uploadScript
    1, //runManually
    1, //physicsWorkerMode
    0, //printPhysicsWorkerMode
    1, //explain
    0, //printScriptingFunctions
    0, //printPerformance
    1, //search
    3, //rescaleTexture
    3, //rescaleTexturePack
    1, //destroyImage
    2, //setBlending
    0, //about
    0, //resetKeyboardBuffer
    6, //setWorldLimits
    1, //setBinSize
    0, //printWorldLimits
    0, //printBinSize
    1, //particleCollisionWorkerMode
    0, //printParticleCollisionWorkerMode
    1, //particleSystemCollisionWorkerMode
    0, //printParticleSystemCollisionWorkerMode
    0, //logFrameDrops
    3, //addPaddingToTexture
    3, //newSphere
    0, //printFogInfo
    4, //applyDisplacementMap
    2, //setSlipperiness
    2, //setAtlasTextureSize
    0, //printAtlasTextureSize
    2, //sync
    2, //newArea
    0, //toggleAreas
    1, //destroyArea
    1, //areaConfigurations
    1, //setResolution
    1, //configureArea
    4, //newAreaConfiguration
    1, //autoConfigureArea
    0, //stopAreaConfigurations
    0, //startAreaConfigurations
    6, //newCylinder
    4, //setRotationPivot
    2, //printChildPosition
    1, //unsetRotationPivot
    6, //copyObject
    2, //build
    1, //skyboxConfigurations
    1, //fogConfigurations
    1  //noMobile
];
var commandArgumentsExpectedExplanation = [
  "help", //help
  "newGridSystem name sizeX sizeZ centerX centerY centerZ color cellSize axis", //newGridSystem
  "printCameraPosition", //printCameraPosition
  "printCameraDirection", //printCameraDirection
  "printGridSystems", //printGridSystems
  "printGridSystemInfo name", //printGridSystemInfo
  "destroyGridSystem name", //destroyGridSystem
  "printKeyboardInfo", //printKeyboardInfo
  "printSelectedGrids", //printSelectedGrids
  "resetSelectedGrids", //resetSelectedGrids
  "selectAllGrids name", //selectAllGrids
  "cropGridSystem", // cropGridSystem
  "pasteCroppedGridSystem name xTranslation yTranslation zTranslation outlineColor cellSize", //pasteCroppedGridSystem
  "switchView", //switchView
  "newBasicMaterial name color", //newBasicMaterial
  "printMaterials", //printMaterials
  "destroyMaterial name", //destroyMaterial
  "newSurface name material", //newSurface
  "printObjects", //printObjects
  "printMetaData name", //printMetaData
  "destroyObject name", //destroyObject
  "newTexture name fileName repeatU repeatV", //newTexture
  "printTextures", //printTextures
  "destroyTexture name", //destroyTexture
  "mapTexture textureName objectName", //mapTexture
  "adjustTextureRepeat objectName repeatU repeatV", //adjustTextureRepeat
  "newPhysicsBoxTest duration sizeX sizeY sizeZ mass positionX positionY positionZ", //newPhysicsBoxTest
  "newPhysicsSphereTest duration radius mass positionX positionY positionZ", //newPhysicsSphereTest
  "printPhysicsTests", //printPhysicsTests
  "switchPhysicsDebugMode", //switchPhysicsDebugMode
  "newRamp name material axis height", //newRamp
  "setAnchor", //setAnchor
  "restartPhysicsTest physicsTestIndex", //restartPhysicsTest
  "mirror objectName on/off s/t/st", //mirror
  "newBox name material height", //newBox
  "newWallCollection name height outlineColor", //newWallCollection
  "printWallCollections", //printWallCollections
  "destroyWallCollection name", //destroyWallCollection
  "destroySelectedGrids", //destroySelectedGrids
  "remakeGridSystem name", //remakeGridSystem
  "resetCamera", //resetCamera
  "uploadImage name", //uploadImage
  "printImages", //printImages
  "mapSpecular textureName objectName", //mapSpecular
  "mapEnvironment textureName objectName", //mapEnvironment
  "mapAmbientOcculsion textureName objectName", //mapAmbientOcculsion
  "mapAlpha textureName objectName", //mapAlpha
  "setDefaultMaterial basic/phong", //setDefaultMaterial"
  "newAmbientLight name color", //newAmbientLight
  "printLights", //printLights
  "selectLight name", //selectLight
  "destroyLight name", //destroyLight
  "newPhongMaterial name color", //newPhongMaterial
  "mapNormal textureName objectName", //mapNormal
  "mapEmissive textureName objectName", //mapEmissive
  "newLambertMaterial name color", //newLambertMaterial
  "newTexturePack name directoryName fileExtension", //newTexturePack
  "printTexturePacks", //printTexturePacks
  "printTexturePackInfo name", //printTexturePackInfo
  "mapTexturePack texturePackName objectName", //mapTexturePack
  "destroyTexturePack name", //destroyTexturePack
  "refreshTexturePack name", //refreshTexturePack
  "mapHeight textureName objectName", //mapHeight
  "resetMaps name", //resetMaps
  "segmentObject name count", //segmentObject
  "superposeGridSystem gridSystemName outlineColor cellSize objectName", //superposeGridSystem
  "postProcessing hide/show", //postProcessing
  "sliceGrid newName cellSize outlineColor", //sliceGrid
  "newPointLight name color offsetX offsetY offsetZ", //newPointLight
  "newSkybox name directory fileExtension", //newSkybox
  "printSkyboxes", //printSkyboxes
  "printSkyboxInfo name", //printSkyboxInfo
  "mapSkybox name", //mapSkybox
  "destroySkybox name", //destroySkybox
  "skybox show/hide", //skybox
  "scaleSkybox amount", //scaleSkybox
  "save", //save
  "load", //load
  "undo", //undo
  "redo", //redo
  "selectObject name", //selectObject
  "setMass name mass", //setMass
  "rotateObject name axis radian", //rotateObject
  "newScript name", //newScript
  "runScript name", //runScript
  "stopScript name", //stopScript
  "printScripts", //printScripts
  "editScript name", //editScript
  "destroyScript name", //destroyScript
  "translateObject name axis amount", //translateObject
  "setFog fogColor fogDensity", //setFog
  "removeFog", //removeFog
  "glue newName objectName[1],objectName[2],...objectName[n]", //glue
  "detach name", //detach
  "mark name offsetX offsetY offsetZ", //mark
  "unmark name", //unmark
  "printMarkedPoints", //printMarkedPoints
  "toggleMarkedPoints", //toggleMarkedPoints
  "runAutomatically scriptName", //runAutomatically
  "uploadScript scriptName filePath", //uploadScript
  "runManually scriptName", //runManually
  "physicsWorkerMode on/off", //physicsWorkerMode
  "printPhysicsWorkerMode", //printPhysicsWorkerMode
  "explain functionName", //explain
  "printScriptingFunctions", //printScriptingFunctions
  "printPerformance", //printPerformance
  "search textToSearch", // search
  "rescaleTexture textureName scale newTextureName", //rescaleTexture
  "rescaleTexturePack texturePackName scale newTexturePackName", //rescaleTexturePack
  "destroyImage imageName", //destroyImage
  "setBlending objectName mode", //setBlending
  "about", //about
  "resetKeyboardBuffer", //resetKeyboardBuffer
  "setWorldLimits minX minY minZ maxX maxY maxZ", //setWorldLimits
  "setBinSize size", //setBinSize
  "printWorldLimits", //printWorldLimits
  "printBinSize", //printBinSize
  "particleCollisionWorkerMode on/off", //particleCollisionWorkerMode
  "printParticleCollisionWorkerMode", //printParticleCollisionWorkerMode
  "particleSystemCollisionWorkerMode on/off", //particleSystemCollisionWorkerMode
  "printParticleSystemCollisionWorkerMode", //printParticleSystemCollisionWorkerMode
  "logFrameDrops", //logFrameDrops
  "addPaddingToTexture textureName padding newTextureName", //addPaddingToTexture
  "newSphere name material radius", //newSphere
  "printFogInfo", //printFogInfo
  "applyDisplacementMap objectName textureName scale bias", //applyDisplacementMap
  "setSlipperiness objectName on/off", //setSlipperiness
  "setAtlasTextureSize width height", //setAtlasTextureSize
  "printAtlasTextureSize", //printAtlasTextureSize
  "sync sourceObject targetObject", //sync
  "newArea areaName height", //newArea
  "toggleAreas", //toggleAreas
  "destroyArea areaName", //destroyArea
  "areaConfigurations show/hide", //areaConfigurations
  "setResolution resolution", //setResolution
  "configureArea areaName", //configureArea
  "newAreaConfiguration areaName objectName isVisible sides", //newAreaConfiguration
  "autoConfigureArea areaName", //autoConfigureArea
  "stopAreaConfigurations", //stopAreaConfigurations
  "startAreaConfigurations", //startAreaConfigurations
  "newCylinder name materialName topRadius bottomRadius height isOpenEnded", //newCylinder
  "setRotationPivot objectName offsetX offsetY offsetZ", //setRotationPivot
  "printChildPosition objectName childObjectName", //printChildPosition
  "unsetRotationPivot objectName", //unsetRotationPivot
  "copyObject sourceName targetName offsetX offsetY offsetZ isHardCopy", //copyObject
  "build projectName author", //build
  "skyboxConfigurations show/hide", //skyboxConfigurations
  "fogConfigurations show/hide", //fogConfigurations
  "noMobile on/off" //noMobile
];
var commands = [
  "help",
  "newGridSystem",
  "printCameraPosition",
  "printCameraDirection",
  "printGridSystems",
  "printGridSystemInfo",
  "destroyGridSystem",
  "printKeyboardInfo",
  "printSelectedGrids",
  "resetSelectedGrids",
  "selectAllGrids",
  "cropGridSystem",
  "pasteCroppedGridSystem",
  "switchView",
  "newBasicMaterial",
  "printMaterials",
  "destroyMaterial",
  "newSurface",
  "printObjects",
  "printMetaData",
  "destroyObject",
  "newTexture",
  "printTextures",
  "destroyTexture",
  "mapTexture",
  "adjustTextureRepeat",
  "newPhysicsBoxTest",
  "newPhysicsSphereTest",
  "printPhysicsTests",
  "switchPhysicsDebugMode",
  "newRamp",
  "setAnchor",
  "restartPhysicsTest",
  "mirror",
  "newBox",
  "newWallCollection",
  "printWallCollections",
  "destroyWallCollection",
  "destroySelectedGrids",
  "remakeGridSystem",
  "resetCamera",
  "uploadImage",
  "printImages",
  "mapSpecular",
  "mapEnvironment",
  "mapAmbientOcculsion",
  "mapAlpha",
  "setDefaultMaterial",
  "newAmbientLight",
  "printLights",
  "selectLight",
  "destroyLight",
  "newPhongMaterial",
  "mapNormal",
  "mapEmissive",
  "newLambertMaterial",
  "newTexturePack",
  "printTexturePacks",
  "printTexturePackInfo",
  "mapTexturePack",
  "destroyTexturePack",
  "refreshTexturePack",
  "mapHeight",
  "resetMaps",
  "segmentObject",
  "superposeGridSystem",
  "postProcessing",
  "sliceGrid",
  "newPointLight",
  "newSkybox",
  "printSkyboxes",
  "printSkyboxInfo",
  "mapSkybox",
  "destroySkybox",
  "skybox",
  "scaleSkybox",
  "save",
  "load",
  "undo",
  "redo",
  "selectObject",
  "setMass",
  "rotateObject",
  "newScript",
  "runScript",
  "stopScript",
  "printScripts",
  "editScript",
  "destroyScript",
  "translateObject",
  "setFog",
  "removeFog",
  "glue",
  "detach",
  "mark",
  "unmark",
  "printMarkedPoints",
  "toggleMarkedPoints",
  "runAutomatically",
  "uploadScript",
  "runManually",
  "physicsWorkerMode",
  "printPhysicsWorkerMode",
  "explain",
  "printScriptingFunctions",
  "printPerformance",
  "search",
  "rescaleTexture",
  "rescaleTexturePack",
  "destroyImage",
  "setBlending",
  "about",
  "resetKeyboardBuffer",
  "setWorldLimits",
  "setBinSize",
  "printWorldLimits",
  "printBinSize",
  "particleCollisionWorkerMode",
  "printParticleCollisionWorkerMode",
  "particleSystemCollisionWorkerMode",
  "printParticleSystemCollisionWorkerMode",
  "logFrameDrops",
  "addPaddingToTexture",
  "newSphere",
  "printFogInfo",
  "applyDisplacementMap",
  "setSlipperiness",
  "setAtlasTextureSize",
  "printAtlasTextureSize",
  "sync",
  "newArea",
  "toggleAreas",
  "destroyArea",
  "areaConfigurations",
  "setResolution",
  "configureArea",
  "newAreaConfiguration",
  "autoConfigureArea",
  "stopAreaConfigurations",
  "startAreaConfigurations",
  "newCylinder",
  "setRotationPivot",
  "printChildPosition",
  "unsetRotationPivot",
  "copyObject",
  "build",
  "skyboxConfigurations",
  "fogConfigurations",
  "noMobile"
];
var commandInfo = [
  "help: Prints command list.",
  "newGridSystem: Creates a new GridSystem.",
  "printCameraPosition: Prints the camera position.",
  "printCameraDirection: Prints the camera direction vector.",
  "printGridSystems: Prints existent grid system names.",
  "printGridSystemInfo: Prints a grid system information.",
  "destroyGridSystem: Destroys a grid system.",
  "printKeyboardInfo: Prints information about keyboard shortcuts.",
  "printSelectedGrids: Prints selected grid names.",
  "resetSelectedGrids: Resets all selected grids.",
  "selectAllGrids: Select all grids of a grid system.",
  "cropGridSystem: Crops selected part of a grid system.",
  "pasteCroppedGridSystem: Draws a cropped grid system.",
  "switchView: Switches between views (design/preview).",
  "newBasicMaterial: Creates a new basic material.",
  "printMaterials: Prints created materials.",
  "destroyMaterial: Destroys a material.",
  "newSurface: Creates a new surface.",
  "printObjects: Prints objects.",
  "printMetaData: Prints the metadata of an object.",
  "destroyObject: Destroys an object",
  "newTexture: Creates a new texture.",
  "printTextures: Prints textures.",
  "destroyTexture: Destroys a texture.",
  "mapTexture: Maps a diffuse/color texture to an object.",
  "adjustTextureRepeat: Modifies the repeat amount of a texture/texture pack.",
  "newPhysicsBoxTest: Simulates a box in a physical world.",
  "newPhysicsSphereTest: Simulates a sphere in a physical world.",
  "printPhysicsTests: Prints physics tests statuses.",
  "switchPhysicsDebugMode: Switches physics debug mode (on/off).",
  "newRamp: Creates a new inclined plane.",
  "setAnchor: Sets an anchor grid.",
  "restartPhysicsTest: Restarts a physics test.",
  "mirror: Sets on/off a mapped textures mirrored repeat property.",
  "newBox: Creates a new box.",
  "newWallCollection: Creates a new wall collection, a set of grid systems.",
  "printWallCollections: Prints created wall collections.",
  "destroyWallCollection: Destroys a wall collection.",
  "destroySelectedGrids: Destroys selected grids.",
  "remakeGridSystem: Remakes destroyed grids of a grid system.",
  "resetCamera: Resets camera position and rotation.",
  "uploadImage: Uploads an image from the local filesystem (TGA images not supported).",
  "printImages: Prints uploaded images.",
  "mapSpecular: Sets a specular map of an object.",
  "mapEnvironment: Sets an environment map of an object.",
  "mapAmbientOcculsion: Sets an ambient occulsion map of an object.",
  "mapAlpha: Sets an alpha map of an object.",
  "setDefaultMaterial: Sets the type of the default material (basic/phong).",
  "newAmbientLight: Creates a new ambient light.",
  "printLights: Prints created lights.",
  "selectLight: Selects a created light.",
  "destroyLight: Destroys a created light.",
  "newPhongMaterial: Creates a new Phong material (light sensitive).",
  "mapNormal: Sets a normal map of an object.",
  "mapEmissive: Sets an emissive map of an object.",
  "newLambertMaterial: Creates a new Lambert material (light sensitive).",
  "newTexturePack: Cretes a new Texture Pack.",
  "printTexturePacks: Prints created texture packs.",
  "printTexturePackInfo: Prints information about a texture pack.",
  "mapTexturePack: Maps a texture pack to an object.",
  "destroyTexturePack: Destroys a texture pack.",
  "refreshTexturePack: Reloads a texture pack.",
  "mapHeight: Set a displacement/height map of an object.",
  "resetMaps: Resets all textures of an object.",
  "segmentObject: Segments an object (width/height/depth).",
  "superposeGridSystem: Creates a new grid system above a specific object.",
  "postProcessing: Shows/hides post processing effects GUI.",
  "sliceGrid: Slices a grid into equal parts and creates a new Grid System with the pieces.",
  "newPointLight: Creates a new point light.",
  "newSkybox: Creates a new Skybox",
  "printSkyboxes: Prints created skyboxes.",
  "printSkyboxInfo: Prints information about a Skybox.",
  "mapSkybox: Maps a Skybox to the scene.",
  "destroySkybox: Destroys a Skybox.",
  "skybox: Shows/hides the skybox cube.",
  "scaleSkybox: Modifies the scale of the Skybox cube.",
  "save: Saves the current state of the engine as a JSON file and initiates the download process.",
  "load: Loads a project saved in JSON format (via the save command).",
  "undo: Undo the last successful command.",
  "redo: Redo the last successful command.",
  "selectObject: Selects an object.",
  "setMass: Sets the mass of an object.",
  "rotateObject: Rotates an object around given axis.",
  "newScript: Creates a new script.",
  "runScript: Runs a script.",
  "stopScript: Stops a running script.",
  "printScripts: Prints created scripts.",
  "editScript: Edits a script.",
  "destroyScript: Destroys a script.",
  "translateObject: Translates an object along given axis.",
  "setFog: Sets the fog attributes of the scene.",
  "removeFog: Removes the fog from the scene.",
  "glue: Creates a new object, gluing given objects together.",
  "detach: Detaches a group of objects glued together using the glue command.",
  "mark: Marks a specific point.",
  "unmark: Unmarks a marked point.",
  "printMarkedPoints: Prints marked points.",
  "toggleMarkedPoints: Hides or shows the marked points on the screen.",
  "runAutomatically: Makes a script start automatically when switched to the preview mode.",
  "uploadScript: Uploads a script from the local file system.",
  "runManually: Makes a script wait for the runScript command to start the execution.",
  "physicsWorkerMode: Enables or disables the usage of web workers for physics iterations.",
  "printPhysicsWorkerMode: Prints if the physics web worker is enabled or not.",
  "explain: Prints information about given scripting API function.",
  "printScriptingFunctions: Prints a list of ROYGBIV scripting API functions.",
  "printPerformance: Prints the performance of rendering functions for the last rendered frame.",
  "search: Finds related commands.",
  "rescaleTexture: Rescales a texture and creates a new texture from the rescaled version.",
  "rescaleTexturePack: Rescales a texture pack and creates a new texture pack from the rescaled version.",
  "destroyImage: Destroys an uploaded image.",
  "setBlending: Sets the blending mode of an object. Mode can be one of NO_BLENDING, NORMAL_BLENDING, ADDITIVE_BLENDING, SUBTRACTIVE_BLENDING,\n  MULTIPLY_BLENDING.",
  "about: Prints info about this engine.",
  "resetKeyboardBuffer: Resets the keyboard buffer.",
  "setWorldLimits: Sets the limits of the scene. Objects outside of this limit will be ignored for collisions with particles/particle systems\n  and area calculations.",
  "setBinSize: Sets the size of the bin. Bins are imaginary cubes that split the scene into segments to help particle/particle system\n  collision detections and area calculations.Larger the size worse the performance but better the collision detection performs\n  for fast particles.",
  "printWorldLimits: Prints the limit info of the world. Objects outside of this limit will be ignored for collisions with particles/particle systems.",
  "printBinSize: Prints the size of the bin. Bins are imaginary cubes that split the scene into segments to help particle collision detections.",
  "particleCollisionWorkerMode: Enables or disables the usage of web workers for particle collision detection.",
  "printParticleCollisionWorkerMode: Prints if the particle collision web worker is enabled or not.",
  "particleSystemCollisionWorkerMode: Enables or disables the usage of web workers for particle system collision detection.",
  "printParticleSystemCollisionWorkerMode: Prints if the particle system collision web worker is enabled or not.",
  "logFrameDrops: Records frame drops for a minute and prints exactly how many frames are missed within a minute to Javascript console.",
  "addPaddingToTexture: Adds padding to a texture. This can be useful for crosshair rotations to prevent visual errors.",
  "newSphere: Creates a new sphere.",
  "printFogInfo: Prints the fog info.",
  "applyDisplacementMap: Applies a displacement map to an object and modifies its geometry.",
  "setSlipperiness: Sets the slipperiness of an object.",
  "setAtlasTextureSize: Sets the size of each texture/texture pack when creating object groups.",
  "printAtlasTextureSize: Prints the atlas texture size set with setAtlasTextureSize command.",
  "sync: Sets the material properties of the target object according to the source object.",
  "newArea: Creates a new area.",
  "toggleAreas: Show/hides the areas.",
  "destroyArea: Destroys an area.",
  "areaConfigurations: Show/hides the area configuration window.",
  "setResolution: Sets the screen resolution.",
  "configureArea: Shows the area configuration window for a certain area.",
  "newAreaConfiguration: Creates a new area configuration for an area and object.",
  "autoConfigureArea: Automatically configures an area using ray tests. Manual corrections may be necesary after using this command.",
  "stopAreaConfigurations: Stops area configurations handling.",
  "startAreaConfigurations: Starts area configurations handling.",
  "newCylinder: Creates a new cylinder.",
  "setRotationPivot: Defines a pivot point of rotation for an object in its local axis system.",
  "printChildPosition: Prints the world position of a child object of an object group.",
  "unsetRotationPivot: Unsets the rotation pivot point of an object set by using setRotationPivot command.",
  "copyObject: Creates a clone of an object.",
  "build: Builds the project for release.",
  "skyboxConfigurations: Shows/hides the skybox configuration GUI.",
  "fogConfigurations: Shows/hides the fog configuration GUI.",
  "noMobile: Prevents the application from loading and alerts a warning message in deployment mode for mobile devices if used with on parameter."
];
var keyboardInfo = [
  "W/S : Translates the camera on axis Z.",
  "A/D : Translates the camera on axis X.",
  "Up/Down : Rotates the camera around axis X.",
  "Left/Right : Rotates the camera around axis Y.",
  "E/Q : Translates the camera on axis Y.",
  "Z/C: Rotates the camera around axis Z.",
  "Backspace: Destroys selected object.",
  ". : Shows corner coordinates of selected grids.",
  "SHIFT: Activates grid selection mode.",
  "TE: Opens the ROYGBIV terminal if closed."
];

var deprecatedCommandIndices = [
  26, //newPhysicsBoxTest -> Deprecated due to lack of use cases. This command is implemented to test if the physics bodies fit the meshes. After the implementation of switchPhysicsDebugMode, this command is no longer needed.
  27, //newPhysicsSphereTest -> Deprecated due to lack of use cases. This command is implemented to test if the physics bodies fit the meshes. After the implementation of switchPhysicsDebugMode, this command is no longer needed.
  28, //printPhysicsTests -> Since box and sphere physics tests are deprecated, this command is no longer needed.
  32, //restartPhysicsTest -> Since box and sphere physics tests are deprecated, this command is no longer needed.
  38, //destroySelectedGrids -> Deprecated due to architectural changes during development. Grids are no longer rendered as seperate objects due to performance issues.
  39, //remakeGridSystem -> Deprecated due to architectural changes during development. Since grids are no longer destroyable, this command has no use case anymore.
  44, //mapEnvironment -> Deprecated due to lack of use cases of environment maps in the ROYGBIV engine. Will implement mirror materials for better visual effects.
  55, //newLambertMaterial -> Deprecated due to lack of uses cases. Phong is fine for light affected objects.
  78, //undo -> Deprecated because causes memory issues for big projects.
  79, //redo -> Deprecated because causes memory issues for big projects.
  89, //translateObject -> Deprecated due to architectural conflicts. Objects can only be translated using animations. Instead of translating the object in the design mode, a new grid system should be created at the specific position. Every object should be associated with certain grids.
  105, //printPerformance -> Deprecated because calling performance.now() multiple times on each render is costly.
  125, //applyDisplacementMap -> Deprecated because causes problems with geometry caching.
  127, //setAtlasTextureSize -> Deprecated because has no use cases after deprecation of TextureMerger class
  128 //printAtlasTextureSize -> Deprecated due to same reasons as setAtlasTextureSize
];

if (commandInfo.length != commands.length){
  console.error("CommandInfo & commands mismatch");
}
if (commandArgumentsExpectedCount.length != commands.length){
  console.error("commandArgumentsExpectedCount & commands mismatch");
  console.error(commandArgumentsExpectedCount.length+", "+commands.length);
}

for (var i=0; i<commands.length; i++){
  var splitted = commandArgumentsExpectedExplanation[i].split(" ");
  if (splitted.length != (commandArgumentsExpectedCount[i] + 1)){
    console.error("commandArgumentsExpectedExplanation commandArgumentsExpectedCount mismatch: "+i);
  }
}

// VERSION
var ROYGBIV_ENGINE_VERSION = 1;

//IMAGE UPLOADER
var imageUploaderInput;

// LOAD
var loadInput;

// WINDOW
var windowLoaded;
var cliFocused = true;
var omGUIFocused = false;
var lightsGUIFocused = false;
var cliIsBeingDragged = false;
var requestID;
var boundingClientRect;
var pointerLockSupported = false;
var defaultAspect = 1.9174434087882823;
var onFullScreen = false;

// THREE.JS VARIABLES
var renderer;
var scene;
var camera;
var canvas;
var sceneBackgroundColor = 0x000000 ;
var textureLoader = new THREE.TextureLoader();
var tgaLoader = new THREE.TGALoader();
var ddsLoader = new THREE.DDSLoader();
var axesHelper = new THREE.AxesHelper(20000);
var pointerLockRequested = false;
var fullScreenRequested = false;

// PHYSICS
var debugRenderer;
var physicsWorld = new CANNON.World();
var physicsSolver = new CANNON.GSSolver();
var quatNormalizeSkip = 0;
var quatNormalizeFast = false;
var contactEquationStiffness = 1e9;
var contactEquationRelaxation = 4;
var physicsIterations = 7;
var physicsTolerance = 0.1;
var gravityY = -900;
var physicsStepAmount = 1/60;
var friction = 1;
var surfacePhysicalThickness = 1;

// POST PROCESSING
var renderPass;
var copyPass;
var composer;
var bloomPass;
var bloomStrength = 0.4; // 0 - 3
var bloomRadius = 0; // 0 - 1
var bloomThreshold = 1; // 0 - 1
var bloomResolutionScale = 1; // 0.1 - 1
var bloomOn = false;
var originalBloomConfigurations = new Object();

// CAMERA CONFIGURATIONS
var initialCameraX = 0;
var initialCameraY = 50;
var initialCameraZ = 0;
var rotationYDelta = 0.07;
var rotationXDelta = 0.07;
var rotationZDelta = 0.07;
var translateZAmount = 3;
var translateXAmount = 3;
var translateYAmount = 3;

// FOG
var fogActive = false;
var fogColor = "black";
var fogDensity = 0;
var fogColorRGB = new THREE.Color(fogColor);
var fogBlendWithSkybox = false;

// ENGINE VARIABLES
var keyboardBuffer = new Object();
var cameraRotationBuffer = {
  "x": 0,
  "y":0,
  "z": 0
}
var gridSystems = new Object();
var gridSelections = new Object();
var materials = new Object();
var addedObjects = new Object();
var textures = new Object();
var textureURLs = new Object();
var wallCollections = new Object();
var uploadedImages = new Object();
var modifiedTextures = new Object();
var lights = new Object();
var pointLightRepresentations = new Object();
var texturePacks = new Object();
var skyBoxes = new Object();
var scripts = new Object();
var scriptsToRun = new Object();
var objectGroups = new Object();
var disabledObjectNames = new Object();
var markedPoints = new Object();
var collisionCallbackRequests = new Object();
var particleCollisionCallbackRequests = new Object();
var particleSystemCollisionCallbackRequests = new Object();
var particleSystems = new Object();
var mergedParticleSystems = new Object();
var particleSystemPool = new Object();
var particleSystemPools = new Object();
var objectTrails = new Object();
var activeObjectTrails = new Object();
var dynamicObjects = new Object();
var dynamicObjectGroups = new Object();
var addedObjectsInsideGroups = new Object();
var trackingObjects = new Object();
var ShaderContent;
var commandDescriptor;
var ColorNames;
var anchorGrid = 0;
var croppedGridSystemBuffer;
var mode = 0; // 0 -> DESIGN, 1-> PREVIEW
var PHYSICS_TEST_TYPE_BOX = "BOX", PHYSICS_TEST_TYPE_SPHERE = "SPHERE";
var physicsTestObjectMaterialColor = 0xFFFFFF;
var physicsDebugMode = false;
var textureOffsetAdjustmentDX = 0.01;
var textureOffsetAdjustmentDY = 0.01;
var opacityDelta = 0.01;
var lightIntensityDelta = 0.01;
var heightMapScaleDelta = 0.1;
var heightMapBiasDelta = 0.1;
var superposeYOffset = 1;
var shininessDelta = 1;
var selectedAddedObject = 0;
var selectedObjectGroup = 0;
var selectedLightName = 0;
var planeWidthSegments = 10;
var planeHeightSegments = 10;
var boxWidthSegments = 10;
var boxHeightSegments = 10;
var boxDepthSegments = 10;
var sphereWidthSegments = 10;
var sphereHeightSegments = 10;
var cylinderWidthSegments = 10;
var cylinderHeightSegments = 10;
var lightPositionDeltaX = 0.5;
var lightPositionDeltaY = 0.5;
var lightPositionDeltaZ = 0.5;
var defaultMaterialType = "BASIC"; //BASIC / PHONG
var texturePackRootDirectory = "texture_packs/";
var skyBoxRootDirectory = "skybox/";
var dataPrefix = "text/json;charset=utf-8,";
var skyboxDistance = 4000;
var skyboxMesh;
var skyboxPreviewMesh;
var skyboxVisible = false;
var skyboxConfigurationsVisible = false;
var fogConfigurationsVisible = false;
var mappedSkyboxName = 0;
var frameCounter = 0;
var fps = 0;
var fpsCounterIntervalID;
var gridCounter = 0;
var MAX_GRIDS_ALLOWED = 1000000;
var MIN_CELLSIZE_ALLOWED = 5;
var diffuseTextureCache = new Object();
var heightTextureCache = new Object();
var ambientOcculsionTextureCache = new Object();
var normalTextureCache = new Object();
var specularTextureCache = new Object();
var alphaTextureCache = new Object();
var emissiveTextureCache = new Object();
var CACHE_NOT_PRESENT = "CACHE_NOT_PRESENT";
var objectSelectedByCommand = false;
var THREE_AXIS_VECTOR_X = new THREE.Vector3(1, 0, 0);
var THREE_AXIS_VECTOR_Y = new THREE.Vector3(0, 1, 0);
var THREE_AXIS_VECTOR_Z = new THREE.Vector3(0, 0, 1);
var CANNON_AXIS_VECTOR_X = new CANNON.Vec3(1, 0, 0);
var CANNON_AXIS_VECTOR_Y = new CANNON.Vec3(0, 1, 0);
var CANNON_AXIS_VECTOR_Z = new CANNON.Vec3(0, 0, 1);
var CANNON_ZERO_VECTOR = new CANNON.Vec3(0, 0, 0);
var REUSABLE_CANNON_QUATERNION = new CANNON.Quaternion();
var REUSABLE_CANNON_QUATERNION_2 = new CANNON.Quaternion();
var scriptEditorShowing = false;
var NO_BLENDING = THREE.NoBlending;
var NORMAL_BLENDING = THREE.NormalBlending;
var ADDITIVE_BLENDING = THREE.AdditiveBlending;
var SUBTRACTIVE_BLENDING = THREE.SubtractiveBlending;
var MULTIPLY_BLENDING = THREE.MultiplyBlending;
var COLLISION_BOUNDING_BOX = new THREE.Box3();
var REUSABLE_LINE = new THREE.Line3();
var REUSABLE_VECTOR = new THREE.Vector3();
var REUSABLE_VECTOR_2 = new THREE.Vector3();
var REUSABLE_VECTOR_3 = new THREE.Vector3();
var REUSABLE_VECTOR_4 = new THREE.Vector3();
var REUSABLE_VECTOR_5 = new THREE.Vector3();
var REUSABLE_VECTOR_6 = new THREE.Vector3();
var REUSABLE_VECTOR_7 = new THREE.Vector3();
var REUSABLE_2_VECTOR = new THREE.Vector2();
var REUSABLE_CANNON_VECTOR = new CANNON.Vec3();
var REUSABLE_CANNON_VECTOR_2 = new CANNON.Vec3();
var REUSABLE_MATRIX_3 = new THREE.Matrix3();
var REUSABLE_MATRIX_4 = new THREE.Matrix4();
var REUSABLE_QUATERNION = new THREE.Quaternion();
var REUSABLE_QUATERNION2 = new THREE.Quaternion();
var REUSABLE_COLOR = new THREE.Color();
var MAX_VERTICES_ALLOWED_IN_A_PARTICLE_SYSTEM = 1000000;
var tempSlicedGridExport;
var ALPHA_VARIATION_MODE_NORMAL = 0;
var ALPHA_VARIATION_MODE_SIN = 1;
var ALPHA_VARIATION_MODE_COS = 2;
var MOTION_MODE_NORMAL = 0;
var MOTION_MODE_CIRCULAR = 1;
var OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT = 0.25;
var cameraOperationsDone = false;
var LIMIT_BOUNDING_BOX = new THREE.Box3(new THREE.Vector3(-4000, -4000, -4000), new THREE.Vector3(4000, 4000, 4000));
var DEFAULT_OBJECT_OCTREE_SEGMENTS = 2;
var DEFAULT_OCTREE_MAX_DEPTH = 8;
var BIN_SIZE = 50;
var INTERSECTION_NORMAL = new THREE.Vector3();
var MAX_PARTICLE_SYSTEM_COUNT = 1000; // MUST BE DIVISIBLE BY 10
var MAX_PARTICLE_COLLISION_LISTEN_COUNT = 10000;
var TOTAL_PARTICLE_SYSTEM_COUNT = 0;
var TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
var TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
var PARTICLE_POSITION_HISTORY_SIZE = 2;
var MAX_OBJECT_SEGMENT_COUNT = 200;
var LOG_FRAME_DROP_ON = false;
var LOG_FRAME_DROP_CTR = 0;
var FRAME_DROP_COUNT = 0;
var MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS = 50;
var TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS = 0;
var SCRIPT_STATUS_STARTED = 1;
var SCRIPT_STATUS_STOPPED = 2;
var SCRIPT_STATUS_ERROR = 0;
var MESSAGE_TYPE_BASIC = 0;
var MESSAGE_TYPE_BUFFER = 1;
var UNDEFINED = "undefined";
var PIPE = "|";
var mergedTextureCache = new Object();
var lastFPS = 0;
var reusableCollisionInfo = new CollisionInfo();
var TOTAL_OBJECT_COLLISION_LISTENER_COUNT = 0;
var MAX_OBJECT_COLLISION_LISTENER_COUNT = 50;
var MAX_VERTEX_UNIFORM_VECTORS;
var MAX_PS_COMPRESS_AMOUNT_4096 = 200;
var TOTAL_MERGED_COUNT = 0;
var MAX_TEXTURE_SIZE = 4096;
var MAX_PS_TIME = 100000;
var crosshairs = new Object();
var selectedCrosshair;
var GLOBAL_FOG_UNIFORM = new THREE.Uniform(new THREE.Vector4(-100.0, 0, 0, 0));
var GLOBAL_PROJECTION_UNIFORM = new THREE.Uniform(new THREE.Vector3());
var GLOBAL_VIEW_UNIFORM = new THREE.Uniform(new THREE.Matrix4());
var GLOBAL_PS_MERGED_UNIFORM = new THREE.Uniform(20.0);
var GLOBAL_PS_NOT_MERGED_UNIFORM = new THREE.Uniform(-20.0);
var GLOBAL_CAMERA_POSITION_UNIFORM = new THREE.Uniform(new THREE.Vector3());
var GLOBAL_CUBE_TEXTURE_UNIFORM = new THREE.Uniform(new THREE.CubeTexture());
var GLOBAL_SKYBOX_ALPHA_UNIFORM = new THREE.Uniform(1.0);
var VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED;
var DDS_SUPPORTED;
var jobHandlerSelectedGrid = 0;
var jobHandlerWorking = false;
var geometryCache = new Object();
var physicsShapeCache = new Object();
var MAX_TEXTURE_COUNT = 8;
var nullTexture = new THREE.Texture();
var compressedTextureFallbackFormat = ".png";
var areaBinHandler;
var areas = new Object();
var areasVisible = true;
var areaConfigurationsVisible = false;
var areaConfigurationsHandler;
var markedPointsVisible = true;
var frustum = new THREE.Frustum();
var SIDE_BOTH = "Both";
var SIDE_FRONT = "Front";
var SIDE_BACK = "Back";
var textureUniformCache = new Object();
var screenResolution = 1;
var rayCaster;
var intersectionPoint = 0;
var intersectionObject = 0;
var projectLoaded = true;
var stopAreaConfigurationsHandler = false;
var jobHandlerInternalCounter = 0;
var jobHandlerInternalMaxExecutionCount = 0;
var screenClickCallbackFunction = 0;
var screenMouseDownCallbackFunction = 0;
var screenMouseUpCallbackFunction = 0;
var screenMouseMoveCallbackFunction = 0;
var screenPointerLockChangedCallbackFunction = 0;
var screenFullScreenChangeCallbackFunction = 0;
var fpsDropCallbackFunction = 0;
var performanceDropCallbackFunction = 0;
var terminalTextInputCallbackFunction = 0;
var defaultCameraControlsDisabled = false;
var modeSwitcher;
var isMouseDown = false;
var projectName = "@@1";
var author = "@@2";
var isDeployment = false;
var loadedScriptsCounter = 0;
var isMobile = /Mobi|Android/i.test(navigator.userAgent);
var WHITE_COLOR = new THREE.Color("white");
var NO_MOBILE = false;
var performanceDropMinFPS = 0;
var performanceDropSeconds = 0;
var performanceDropCounter = 0;

// WORKER VARIABLES
var WORKERS_SUPPORTED = (typeof(Worker) !== "undefined");
var WORKERS_DEBUG_MODE_ENABLED = false;
var PHYSICS_WORKER_PATH = "/js/worker/physicsWorker.js";
var COLLISION_WORKER_PATH = "/js/worker/collisionWorker.js";
var PS_COLLISION_WORKER_PATH = "/js/worker/psCollisionWorker.js";
var PHYSICS_WORKER_ENABLED = true;
var COLLISION_WORKER_ENABLED = true;
var PS_COLLISION_WORKER_ENABLED = true;

// TEXT POOL
var Text = new Text();

// SCRIPTING UTILITY FUNCTIONS
var ROYGBIV;

// DAT GUI
var datGui;
var datGuiObjectManipulation;
var datGuiLights;
var datGuiAreaConfigurations;
var datGuiSkybox;
var datGuiFog;
var omGUIlastObjectName = "";

var postprocessingParameters = {
  "Bloom_strength": bloomStrength,
  "Bloom_radius": bloomRadius,
  "Bloom_threshhold": bloomThreshold,
  "Bloom_resolution_scale": bloomResolutionScale,
  "Bloom": bloomOn
};

var omObjController;
var omRotationXController;
var omRotationYController;
var omRotationZController;
var omMassController;
var omSlipperyController;
var omChangeableController;
var omHasMassController;
var omSideController;
var omHideHalfController;
var omBlendingController;
var omTextureOffsetXController;
var omTextureOffsetYController;
var omOpacityController;
var omAOIntensityController;
var omEmissiveIntensityController;
var omEmissiveColorController;
var omDisplacementScaleController;
var omDisplacementBiasController;
var objectManipulationParameters = {
  "Object": "objectName",
  "Rotate x": 0.0,
  "Rotate y": 0.0,
  "Rotate z": 0.0,
  "Mass": 0.0,
  "Slippery": false,
  "Changeable": false,
  "Has mass": true,
  "Side": "Both",
  "Hide half": "None",
  "Blending": "None",
  "Texture offset x": 0.0,
  "Texture offset y": 0.0,
  "Opacity": 1.0,
  "AO intensity": 0.0,
  "Emissive int.": 0.0,
  "Emissive col.": "#ffffff",
  "Disp. scale": 0.0,
  "Disp. bias": 0.0
};

var lightNameController;
var lightsOffsetXController;
var lightsOffsetYController;
var lightsOffsetZController;
var lightsIntensityController;
var lightsParameters = {
  "Light": "lightName",
  "Offset x": 0.0,
  "Offset y": 0.0,
  "Offset z": 0.0,
  "Intensity": 0.0
};

var skyboxNameController;
var skyboxColorController;
var skyboxParameters = {
  "Name": "skyboxName",
  "Color": "#ffffff"
};

var fogDensityController;
var fogColorController;
var fogBlendWithSkyboxController;
var fogParameters = {
  "Density": 0.0,
  "Color": "#ffffff",
  "Blend skybox": false
};

// KEYCODE TO STRING MAP
keyCodeToChar = {
  8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause/Break",20:"Caps Lock",
  27:"Esc",32:"Space",33:"Page Up",34:"Page Down",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",
  40:"Down",45:"Insert",46:"Delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",
  57:"9",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",
  78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",91:"Windows",
  93:"Right Click",96:"Numpad 0",97:"Numpad 1",98:"Numpad 2",99:"Numpad 3",100:"Numpad 4",101:"Numpad 5",
  102:"Numpad 6",103:"Numpad 7",104:"Numpad 8",105:"Numpad 9",106:"Numpad *",107:"Numpad +",109:"Numpad -",
  110:"Numpad .",111:"Numpad /",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",
  120:"F9",121:"F10",122:"F11",123:"F12",144:"Num Lock",145:"Scroll Lock",182:"My Computer",
  183:"My Calculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",
  219:"[",220:"\\",221:"]",222:"'"
};
