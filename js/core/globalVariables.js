var isDeployment = false;
var IS_WORKER_CONTEXT = false;

var COS30DEG = Math.cos(30 * Math.PI / 180);
var SIN30DEG = Math.sin(30 * Math.PI / 180);

// CLI
var terminal;
var cliInnerDiv;
var cliDivheader;

// VERSION
var ROYGBIV_ENGINE_VERSION = 1;

// LOAD
var loadInput;

// NOOP
function noop(){}

// WINDOW
var windowLoaded;
var cliFocused = true;
var omGUIFocused = false;
var tmGUIFocused = false;
var smGUIFocused = false;
var cmGUIFocused = false;
var acGUIFocused = false;
var lGUIFocused = false;
var cliIsBeingDragged = false;
var requestID;
var boundingClientRect;
var pointerLockSupported = false;
var defaultAspect = 1.9174434087882823;
var onFullScreen = false;
var isScreenVisible = true;
var inactiveCounter = 0;
var maxInactiveTime = 0;

// EVENT HANDLERS
var touchEventHandler;
var pointerLockEventHandler;
var fullScreenEventHandler;
var visibilityChangeEventHandler;
var mouseEventHandler;
var resizeEventHandler;
var keyboardEventHandler;
var hashChangeEventHandler;

// THREE.JS VARIABLES
var scene;
var camera;
var orthographicCamera;
var canvas;
var sceneBackgroundColor = 0x000000 ;
var axesHelper = new THREE.AxesHelper(20000);
var pointerLockRequested = false;
var fullScreenRequested = false;
var viewportMaxWidth = 0;
var viewportMaxHeight = 0;
var currentViewport = new Object();
var fixedAspect = 0;

var STEP = 1/60;

// PHYSICS
var debugRenderer;
var physicsWorld;
var physicsSolver = new CANNON.GSSolver();
var quatNormalizeSkip = 0;
var quatNormalizeFast = false;
var contactEquationStiffness = 1e9;
var contactEquationRelaxation = 4;
var physicsIterations = 7;
var physicsTolerance = 0.1;
var gravityY = -900;
var physicsStepAmount = STEP;
var friction = 1;
var surfacePhysicalThickness = 1;

var initialCameraX = 0;
var initialCameraY = 50;
var initialCameraZ = 0;

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
var addedTexts = new Object();
var addedTexts2D = new Object();
var clickableAddedTexts = new Object();
var clickableAddedTexts2D = new Object();
var wallCollections = new Object();
var texturePacks = new Object();
var skyBoxes = new Object();
var scripts = new Object();
var scriptsToRun = new Map();
var objectGroups = new Object();
var disabledObjectNames = new Object();
var markedPoints = new Object();
var collisionCallbackRequests = new Map();
var particleCollisionCallbackRequests = new Object();
var particleSystemCollisionCallbackRequests = new Object();
var particleSystems = new Map();
var mergedParticleSystems = new Object();
var particleSystemPool = new Object();
var particleSystemPools = new Object();
var objectTrails = new Object();
var activeObjectTrails = new Map();
var dynamicObjects = new Map();
var dynamicObjectGroups = new Map();
var addedObjectsInsideGroups = new Object();
var ShaderContent;
var commandDescriptor;
var ColorNames;
var anchorGrid = 0;
var croppedGridSystemBuffer;
var mode = 0; // 0 -> DESIGN, 1-> PREVIEW
var PHYSICS_TEST_TYPE_BOX = "BOX", PHYSICS_TEST_TYPE_SPHERE = "SPHERE";
var physicsTestObjectMaterialColor = 0xFFFFFF;
var physicsDebugMode = false;
var selectedAddedObject = 0;
var selectedObjectGroup = 0;
var selectedAddedText = 0;
var selectedSprite = 0;
var selectedContainer = 0;
var planeWidthSegments = 10;
var planeHeightSegments = 10;
var boxWidthSegments = 10;
var boxHeightSegments = 10;
var boxDepthSegments = 10;
var sphereWidthSegments = 10;
var sphereHeightSegments = 10;
var cylinderWidthSegments = 10;
var cylinderHeightSegments = 10;
var defaultMaterialType = "BASIC"; //BASIC / PHONG
var texturePackRootDirectory = "texture_packs/";
var atlasRootDirectory = "texture_atlas/";
var skyBoxRootDirectory = "skybox/";
var dataPrefix = "text/json;charset=utf-8,";
var skyboxDistance = 4000;
var fogConfigurationsVisible = false;
var postProcessiongConfigurationsVisibility = new Object();
var gridCounter = 0;
var MAX_GRIDS_ALLOWED = 1000000;
var MIN_CELLSIZE_ALLOWED = 1;
var THREE_AXIS_VECTOR_X = new THREE.Vector3(1, 0, 0);
var THREE_AXIS_VECTOR_Y = new THREE.Vector3(0, 1, 0);
var THREE_AXIS_VECTOR_Z = new THREE.Vector3(0, 0, 1);
var ALL_AXES = [THREE_AXIS_VECTOR_X, THREE_AXIS_VECTOR_Y, THREE_AXIS_VECTOR_Z];
var CANNON_AXIS_VECTOR_X = new CANNON.Vec3(1, 0, 0);
var CANNON_AXIS_VECTOR_Y = new CANNON.Vec3(0, 1, 0);
var CANNON_AXIS_VECTOR_Z = new CANNON.Vec3(0, 0, 1);
var CANNON_ZERO_VECTOR = new CANNON.Vec3(0, 0, 0);
var REUSABLE_CANNON_QUATERNION = new CANNON.Quaternion();
var REUSABLE_CANNON_QUATERNION_2 = new CANNON.Quaternion();
var REUSABLE_QUAD_GEOMETRY = new THREE.PlaneBufferGeometry(2, 2);
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
var ALPHA_VARIATION_MODE_NORMAL = 0;
var ALPHA_VARIATION_MODE_SIN = 1;
var ALPHA_VARIATION_MODE_COS = 2;
var MOTION_MODE_NORMAL = 0;
var MOTION_MODE_CIRCULAR = 1;
var OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT = 0.25;
var cameraOperationsDone = false;
var LIMIT_BOUNDING_BOX = new THREE.Box3(new THREE.Vector3(-4000, -4000, -4000), new THREE.Vector3(4000, 4000, 4000));
var REUSABLE_BOX3 = new THREE.Box3();
var DEFAULT_OBJECT_OCTREE_SEGMENTS = 2;
var DEFAULT_OCTREE_MAX_DEPTH = 8;
var BIN_SIZE = 50;
var RAYCASTER_STEP_AMOUNT = 32;
var INTERSECTION_NORMAL = new THREE.Vector3();
var TOTAL_PARTICLE_SYSTEM_COUNT = 0;
var TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
var TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
var PARTICLE_POSITION_HISTORY_SIZE = 2;
var MAX_OBJECT_SEGMENT_COUNT = 200;
var SCRIPT_STATUS_STARTED = 1;
var SCRIPT_STATUS_STOPPED = 2;
var SCRIPT_STATUS_ERROR = 0;
var MESSAGE_TYPE_BASIC = 0;
var MESSAGE_TYPE_BUFFER = 1;
var UNDEFINED = "undefined";
var PIPE = "|";
var reusableCollisionInfo;
var TOTAL_OBJECT_COLLISION_LISTENER_COUNT = 0;
var MAX_OBJECT_COLLISION_LISTENER_COUNT = 50;
var MAX_VERTEX_UNIFORM_VECTORS;
var MAX_VERTEX_ATTRIBS;
var MAX_PS_COMPRESS_AMOUNT_4096 = 200;
var TOTAL_MERGED_COUNT = 0;
var MAX_TEXTURE_SIZE = 4096;
var ACCEPTED_TEXTURE_SIZE = 128;
var DEFAULT_MAX_PS_TIME = 100000;
var EMPTY_OBJECT = {};
var crosshairs = new Object();
var selectedCrosshair;
var GLOBAL_FOG_UNIFORM = new THREE.Uniform(new THREE.Vector4(-100.0, 0, 0, 0));
var GLOBAL_PROJECTION_UNIFORM = new THREE.Uniform(new THREE.Vector3());
var GLOBAL_VIEW_UNIFORM = new THREE.Uniform(new THREE.Matrix4());
var GLOBAL_CAMERA_POSITION_UNIFORM = new THREE.Uniform(new THREE.Vector3());
var GLOBAL_CAMERA_QUATERNION_UNIFORM = new THREE.Uniform(new THREE.Quaternion());
var GLOBAL_CUBE_TEXTURE_UNIFORM;
var GLOBAL_VIEWPORT_UNIFORM;
var GLOBAL_SCREEN_RESOLUTION_UNIFORM = new THREE.Uniform(1);
var GLOBAL_PS_REF_HEIGHT_UNIFORM = new THREE.Uniform(0);
var VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED;
var ASTC_SUPPORTED;
var S3TC_SUPPORTED;
var PVRTC_SUPPORTED;
var INSTANCING_SUPPORTED;
var jobHandlerSelectedGrid = 0;
var jobHandlerWorking = false;
var jobHandlerRaycasterRefresh = false;
var geometryCache = new Object();
var physicsShapeCache = new Object();
var MAX_TEXTURE_COUNT = 8;
var compressedTextureFallbackFormat = ".png";
var webglCallbackHandler;
var threejsRenderMonitoringHandler;
var areas = new Object();
var areasVisible = true;
var areaConfigurationsVisible = false;
var areaConfigurationsHandler;
var textureAtlasHandler;
var markedPointsVisible = true;
var frustum = new THREE.Frustum();
var SIDE_BOTH = "Both";
var SIDE_FRONT = "Front";
var SIDE_BACK = "Back";
var textureUniformCache = new Object(); // after global texture atlas implementation, this only has dynamic texture uniforms
var screenResolution = 1;
var useOriginalResolution = false;
var rayCaster;
var objectPicker2D;
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
var screenKeydownCallbackFunction = 0;
var screenKeyupCallbackFunction = 0;
var screenMouseWheelCallbackFunction = 0;
var screenPinchCallbackFunction = 0;
var screenDragCallbackFunction = 0;
var screenOrientationChangeCallbackFunction = 0;
var userInactivityCallbackFunction = 0;
var fpsDropCallbackFunction = 0;
var performanceDropCallbackFunction = 0;
var hashChangeCallbackFunction = 0;
var modeSwitcher;
var isMouseDown = false;
var projectName = "@@1";
var author = "@@2";
var loadedScriptsCounter = 0;
var isMobile = /Mobi|Android/i.test(navigator.userAgent);
var WHITE_COLOR = new THREE.Color("white");
var LIME_COLOR = new THREE.Color("lime");
var ORANGE_COLOR = new THREE.Color("orange");
var NO_MOBILE = false;
var isPaused = false;
var defaultFont;
var fonts = new Object();
var MAX_TEXT_CHAR_COUNT = 50;
var DEFAULT_OFFSET_BETWEEN_CHARS = 20;
var DEFAULT_OFFSET_BETWEEN_LINES = 20;
var MARGIN_MODE_2D_TOP_LEFT = 0;
var MARGIN_MODE_2D_BOTTOM_RIGHT = 1;
var MARGIN_MODE_2D_CENTER = 2;
var CONTAINER_ALIGNMENT_TYPE_RIGHT = "CONTAINER_ALIGNMENT_TYPE_RIGHT";
var CONTAINER_ALIGNMENT_TYPE_LEFT = "CONTAINER_ALIGNMENT_TYPE_LEFT";
var CONTAINER_ALIGNMENT_TYPE_TOP = "CONTAINER_ALIGNMENT_TYPE_TOP";
var CONTAINER_ALIGNMENT_TYPE_BOTTOM = "CONTAINER_ALIGNMENT_TYPE_BOTTOM";
var roygbivAttributeCounter = 1;
var roygbivBufferAttributeCounter = 1;
var roygbivSkippedArrayBufferUpdates = 0;
var roygbivSkippedElementArrayBufferUpdates = 0;
var selectionHandler;
var guiHandler;
var cpuOperationsHandler;
var particleSystemRefHeight = 0;
var preConditions;
var HIGH_PRECISION_SUPPORTED = false;
var physicsBodyGenerator;
var alterThreeJSRenderFunction = true;
var autoInstancingHandler;
var autoInstancedObjects = new Object();
var fpsHandler;
var objectsWithOnClickListeners = new Map();
var objectsWithMouseOverListeners = new Map();
var objectsWithMouseOutListeners = new Map();
var objectsWithMouseMoveListeners = new Map();
var currentMouseOverObjectName;
var renderer;
var bloom;
var macroHandler;
var activeControl;
var crosshairHandler;
var isOrientationLandscape;
var shaderPrecisionHandler;
var particleSystemCreatorGUIHandler;
var muzzleFlashCreatorGUIHandler;
var fpsWeaponGUIHandler;
var texturePackCreatorGUIHandler;
var skyboxCreatorGUIHandler;
var fogCreatorGUIHandler;
var fontCreatorGUIHandler;
var crosshairCreatorGUIHandler;
var scriptsGUIHandler;
var animationCreatorGUIHandler;
var lightningCreatorGUIHandler;
var virtualKeyboardCreatorGUIHandler;
var lightsGUIHandler;
var graphCreatorGUIHandler;
var steeringBehaviorCreatorGUIHandler;
var jumpDescriptorCreatorGUIHandler;
var skyboxHandler;
var fogHandler;
var scriptsHandler;
var animationHandler;
var lightHandler;
var lightningHandler;
var preConfiguredParticleSystems = new Object();
var preConfiguredParticleSystemPools = new Object();
var muzzleFlashes = new Object();
var particleSystemGenerator;
var PARTICLE_REWIND_ON_COLLIDED = 2;
var PARTICLE_DISSAPEAR_ON_COLLIDED = 1;
var PARTICLE_SYSTEM_ACTION_TYPE_NONE = -1;
var PARTICLE_SYSTEM_ACTION_TYPE_START = 0;
var PARTICLE_SYSTEM_ACTION_TYPE_STOP = 1;
var PARTICLE_SYSTEM_ACTION_TYPE_HIDE = 2;
var plusX = "+x";
var plusY = "+y";
var plusZ = "+z";
var minusX = "-x";
var minusY = "-y";
var minusZ = "-z";
var endpointInverses = {
  "+x": "-x",
  "+y": "-y",
  "+z": "-z",
  "-x": "+x",
  "-y": "+y",
  "-z": "+z"
};
var GS_AXIS_XY = "XY";
var GS_AXIS_XZ = "XZ";
var GS_AXIS_YZ = "YZ";
var ADDED_OBJECT_TYPE_SURFACE = "surface";
var ADDED_OBJECT_TYPE_BOX = "box";
var ADDED_OBJECT_TYPE_RAMP = "ramp";
var ADDED_OBJECT_TYPE_SPHERE = "sphere";
var ADDED_OBJECT_TYPE_CYLINDER = "cylinder";
var DEFAULT_UV_RANGE = {startU: 0, startV: 1, endU: 1, endV: 0};
var activeMuzzleFlashes = new Map();
var activeLightnings = new Map();
var delayedExecutionHandler;
var sceneHandler;
var ANIMATION_STATE_NOT_RUNNING = 0;
var ANIMATION_STATE_RUNNING = 1;
var ANIMATION_STATE_FROZEN = 2;
var ANIMATION_STATE_REWINDING = 3;
var lightnings = new Object();
var areaEnterCallbacks = new Object();
var areaExitCallbacks = new Object();
var sprites = new Object();
var clickableSprites = new Object();
var clickableContainers = new Object();
var draggingSprite = false;
var containers = new Object();
var childContainers = new Object();
var virtualKeyboards = new Object();
var activeVirtualKeyboard;
var inputText;
var dragCandidate;
var dynamicTextureFolders = new Object();
var dynamicallyLoadedTextures = new Object();
var protocolDefinitionFileName = 0;
var serverWSURL = 0;
var objectExportImportHandler;
var DUMMY_TEXTURE = new THREE.Texture();
var masses = new Object();

// ROTATION MODES
var rotationModes = {
  LOCAL: "LOCAL",
  WORLD: "WORLD"
};

// AXES
var axes = {"X": "x", "Y": "y", "Z": "z"};

// LIGHTING LIMITS
var MAX_STATIC_DIFFUSE_LIGHT_COUNT = 5;
var MAX_STATIC_POINT_LIGHT_COUNT = 5;

// RENDER ORDERS
var renderOrders = {
  MARKED_POINT: -30,
  GRID_HELPER: -20,
  FPS_WEAPON: -10,
  SKYBOX: -1,
  PARTICLE_SYSTEM: 0,
  GRID: 10,
  GRID_DOT: 10,
  GRID_SYSTEM_BOUNDING_PLANE: 10,
  GRID_SYSTEM_REPRESENTATION: 10,
  OBJECT: 10,
  TEXT_3D: 10,
  LIGHTNING: 10,
  TEXT_2D: 50,
  SPRITE: 50,
  CROSSHAIR: 60,
  OBJECT_TRAIL: 100,
  CONTAINER_BACKGROUND: 5000,
  ELEMENT_IN_CONTAINER: 6000,
  RECTANGLE: 7000
}

// FACTORIES
var raycasterFactory;
var physicsFactory;
var textureLoaderFactory;

// WORKER VARIABLES
var WORKERS_SUPPORTED = (typeof(Worker) !== UNDEFINED);
var RAYCASTER_WORKER_ON = true;
var PHYSICS_WORKER_ON = true;
var LIGHTNING_WORKER_ON = true;
if (!WORKERS_SUPPORTED && !(typeof WorkerGlobalScope !== UNDEFINED && self instanceof WorkerGlobalScope)){
  console.warn("[!] Workers are not supported for this browser.");
}

// TEXT POOL
var Text;

// SCRIPTING UTILITY FUNCTIONS
var ROYGBIV;

// KEYCODE TO STRING MAP
var keyCodeToChar = {
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

var shiftCombinationKeys = {};
shiftCombinationKeys[192] = "~";
shiftCombinationKeys[49] = "!";
shiftCombinationKeys[50] = "@";
shiftCombinationKeys[51] = "#";
shiftCombinationKeys[52] = "$";
shiftCombinationKeys[53] = "%";
shiftCombinationKeys[54] = "^";
shiftCombinationKeys[55] = "&";
shiftCombinationKeys[56] = "*";
shiftCombinationKeys[57] = "(";
shiftCombinationKeys[48] = ")";
shiftCombinationKeys[109] = "_";
shiftCombinationKeys[107] = "+";
shiftCombinationKeys[219] = "{";
shiftCombinationKeys[221] = "}";
shiftCombinationKeys[220] = "|";
shiftCombinationKeys[59] = ":";
shiftCombinationKeys[222] = "\"";
shiftCombinationKeys[188] = "<";
shiftCombinationKeys[190] = ">";
shiftCombinationKeys[191] = "?";

// SUPPORTED FONT ATLAS CHARACTERS
var supportedFontAtlasChars = [
  "!", "\"", "#", "$", "%", "&", "\'", "(", ")", "*", "+", ",", "-", ".", "/",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?",
  "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
  "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
  "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "q", "Q", "█"
];
var supportedFontCharMap = new Object();
for (var i = 0; i<supportedFontAtlasChars.length; i++){
  supportedFontCharMap[supportedFontAtlasChars[i]] = true;
}

// BANNER
var BANNERL1 = " ____   _____   ______ ____ _____     __ ";
var BANNERL2 = "|  _ \\ / _ \\ \\ / / ___| __ )_ _\\ \\   / / ";
var BANNERL3 = "| |_) | | | \\ V / |  _|  _ \\| | \\ \\ / /  ";
var BANNERL4 = "|  _ <| |_| || || |_| | |_) | |  \\   /   ";
var BANNERL5 = "|_| \\_\\\\___/ |_| \\____|____/___|  \\_/    ";

// DEPLOYED SCRIPTS
var deploymentScriptsStatus = {
//@DEPLOYMENT_SCRIPTS_STATUS
};
