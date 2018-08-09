var Text = function(){

  this.PARAM1 = "@@1";
  this.PARAM2 = "@@2";
  this.PARAM3 = "@@3";
  this.PARAM4 = "@@4";

  this.BANNERL1 = " ____   _____   ______ ____ _____     __ ";
  this.BANNERL2 = "|  _ \\ / _ \\ \\ / / ___| __ )_ _\\ \\   / / ";
  this.BANNERL3 = "| |_) | | | \\ V / |  _|  _ \\| | \\ \\ / /  ";
  this.BANNERL4 = "|  _ <| |_| || || |_| | |_) | |  \\   /   ";
  this.BANNERL5 = "|_| \\_\\\\___/ |_| \\____|____/___|  \\_/    ";
  this.VERSION = "VERSION";
  this.CODER = "CODER";

  this.ONLY_PARAM = "@@1";
  this.TABULATED_1 = "  @@1";
  this.TABULATED_2 = "    @@1";
  this.TABULATED_3 = "      @@1";
  this.TREE = "|____@@1";
  this.TREE2 = "|___@@1: @@2";
  this.SUBTREE2 = "   |___@@1: @@2";
  this.COORD_TREE = "|___@@1: (x:@@2, y:@@3, z:@@4)";
  this.COMMA = ",";
  this.PARAM_WITH_DOTS = "@@1: ";
  this.COMMAND_NOT_FOUND = "Command not found. Type help for list of commands.";
  this.COMMAND_DEPRECATED = "Command deprecated.";
  this.ARGUMENTS_EXPECTED = "@@1 argument(s) expected:";
  this.NO_ARGUMENTS_EXPECTED = "No arguments expected for @@1";
  this.CAMERA_POSITION = "Camera position: (@@1, @@2, @@3)";
  this.CAMERA_DIRECTION = "Camera direction: (@@1, @@2, @@3)";
  this.NO_GRIDSYSTEMS = "There are no GridSystems.";
  this.GRIDSYSTEMS = "Grid systems";
  this.NO_SUCH_GRID_SYSTEM = "No such grid system.";
  this.TREE_NAME = "|____Name: @@1";
  this.TREE_SIZEX = "|____SizeX: @@1";
  this.TREE_SIZEZ = "|____SizeZ: @@1";
  this.TREE_CENTERX = "|____CenterX: @@1";
  this.TREE_CENTERY = "|____CenterY: @@1";
  this.TREE_CENTERZ = "|____CenterZ: @@1";
  this.TREE_COLOR = "|____Color: @@1";
  this.TREE_OUTLINE_COLOR = "|____Outline Color: @@1";
  this.TREE_CELL_SIZE = "|____Cell Size: @@1";
  this.TREE_CELL_COUNT = "|____Cell Count: @@1";
  this.TREE_AXIS = "|____Axis: @@1";
  this.GRID_SYSTEM_DESTROYED = "Grid system destroyed.";
  this.CONTROLS = "Control Info";
  this.SELECTED_GRIDS = "Selected grids";
  this.NONE_OF_THE_GRIDS_ARE_SELECTED = "None of the grids are selected.";
  this.GRIDS_RESET = "@@1 grids reset.";
  this.MUST_HAVE_TWO_GRIDS_SELECTED = "Must have two grids selected.";
  this.SELECTED_GRIDS_SAME_GRIDSYSTEM = "Selected grids must be in the same grid system.";
  this.CROPPED_GS_BUFFER_IS_EMPTY = "Cropped grid system buffer is empty.";
  this.XTRANSLATION_MUST_BE_A_NUMBER = "xTranslation must be a number.";
  this.YTRANSLATION_MUST_BE_A_NUMBER = "yTranslation must be a number.";
  this.ZTRANSLATION_MUST_BE_A_NUMBER = "zTranslation must be a number.";
  this.RADUIS_MUST_BE_A_NUMBER = "Radius must be a number.";
  this.RADIUS_MUST_BE_DIFFERENT_THAN_ZERO = "Radius must be different than zero.";
  this.SPHERE_CREATED = "Sphere created.";
  this.SWITCHED_TO_PREVIEW_MODE = "Switched to preview mode.";
  this.SWITCHED_TO_DESIGN_MODE = "Switched to design mode.";
  this.NAME_RESERVED = "Name reserved.";
  this.MATERIAL_NAME_MUST_BE_UNIQUE = "Material name must be unique.";
  this.ISWIREFRAMED_MUST_BE_TRUE_OR_FALSE = "isWireFramed must be true or false.";
  this.MATERIAL_CREATED = "Material created.";
  this.BASIC_MATERIAL_INFO_TREE = "|____BASIC MATERIAL: @@1 -> color: @@2 @@3";
  this.PHONG_MATERIAL_INFO_TREE = "|____PHONG MATERIAL: @@1 -> color: @@2";
  this.LAMBER_MATERIAL_INFO_TREE = "|____LAMBERT MATERIAL: @@1 -> color: @@2";
  this.MATERIALS = "Materials";
  this.NO_CREATED_MATERIALS = "There are no created materials.";
  this.NO_SUCH_MATERIAL = "No such material.";
  this.MATERIAL_DESTROYED = "Material destroyed.";
  this.MUST_HAVE_1_OR_2_GRIDS_SELECTED = "Must have 1 or 2 grids selected.";
  this.NAME_MUST_BE_UNIQUE = "Name must be unique.";
  this.NAME_USED_IN_AN_OBJECT_GROUP = "Name used in an object group.";
  this.OBJECT_ADDED = "Object added.";
  this.OBJECT_INFO_TREE = "|____[@@1]: @@2";
  this.OBJECT_GROUP_INFO_TREE = "|____[glued]: @@1 (@@2)";
  this.NO_OBJECT_ADDED_TO_THE_SCENE = "No objects added to scene.";
  this.OBJECTS = "Objects";
  this.NO_SUCH_OBJECT = "No such object.";
  this.NO_META_DATA_TO_SHOW = "No metadata to show.";
  this.METADATA_OF = "Metadata of @@1";
  this.TEXTURE_PACK = "Texture Pack";
  this.MATERIAL_TYPE = "Material Type";
  this.OBJECT_DESTROYED = "Object destroyed.";
  this.TEXTURE_NAME_NOT_VALID = "Texture name not valid.";
  this.TEXTURE_NAME_MUST_BE_UNIQUE = "Texture name must be unique.";
  this.REPEATU_MUST_BE_A_NUMBER = "repeatU must be a number.";
  this.REPEATV_MUST_BE_A_NUMBER = "repeatV must be a number.";
  this.TEXTURE_CREATED = "Texture created.";
  this.TEXTURE_CLONED = "Texture cloned for optimization.";
  this.TREE_TEXTURE = "|____@@1 @@2 -> @@3"
  this.THERE_ARE_NO_TEXTURES = "There are no textures.";
  this.STATUS_PENDING = "(PENDING)";
  this.STATUS_DOWNLOADING = "(DOWNLOADING)";
  this.STATUS_ERROR = "(ERROR)";
  this.STATUS_LOADED = "(LOADED)";
  this.TEXTURES = "Textures";
  this.NO_SUCH_TEXTURE = "No such texture.";
  this.TEXTURE_DESTROYED = "Texture destroyed.";
  this.TEXTURE_NOT_READY = "Texture not ready.";
  this.CANNOT_MAP_TEXTURE_TO_A_GLUED_OBJECT = "Cannot map texture to a glued object.";
  this.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION = "Glued objects do not support this function.";
  this.NO_TEXTURE_MAPPED_TO_OBJECT = "No texture mapped to object.";
  this.REPEAT_AMOUNT_MODIFIED = "Repeat amount modified.";
  this.WORKS_ONLY_IN_PREVIEW_MODE = "This command works only in preview mode.";
  this.DURATION_MUST_BE_A_NUMBER = "Duration must be a number.";
  this.SIZEX_MUST_BE_A_NUMBER = "SizeX must be a number.";
  this.SIZEY_MUST_BE_A_NUMBER = "SizeY must be a number.";
  this.SIZEZ_MUST_BE_A_NUMBER = "SizeZ must be a number.";
  this.MASS_MUST_BE_A_NUMBER = "Mass must be a number.";
  this.POSITION_X_MUST_BE_A_NUMBER = "PositionX must be a number.";
  this.POSITION_Y_MUST_BE_A_NUMBER = "PositionY must be a number.";
  this.POSITION_Z_MUST_BE_A_NUMBER = "PositionZ must be a number.";
  this.A_NEW_BOX_TEST_STARTED = "A new box test started.";
  this.RADIUS_MUST_BE_A_NUMBER = "Radius must be a number.";
  this.A_NEW_SPHERE_TEST_STARTED = "A new sphere test started.";
  this.PHYSICS_TEST_TREE = "|____@@1 @@2 (@@3) -> @@4";
  this.PHYSICS_TESTS = "Physics tests"
  this.THERE_ARE_NO_PHYSICS_TESTS = "There are no physics tests.";
  this.PHYSICS_DEBUG_MODE_ON = "Physics debug mode: ON";
  this.PHYSICS_DEBUG_MODE_OFF = "Physics debug mode: OFF";
  this.AXIS_MUST_BE_ONE_OF_X_Y_Z = "Axis must be one of x, y, or z.";
  this.HEIGHT_MUST_BE_A_NUMBER = "Height must be a number.";
  this.NO_ANCHOR_GRIDS_SELECTED = "No anchor grid selected. Use setAnchor command first.";
  this.ONE_OF_THE_GRID_SELECTIONS_MUST_BE_THE_ANCHOR_GRID = "One of the grid selections must be the anchor grid.";
  this.AXIS_MUST_BE_X_OR_Z = "Axis must be x or z for this grid system.";
  this.AXIS_MUST_BE_Y_OR_Z = "Axis must be y or z for this grid system.";
  this.AXIS_MUST_BE_X_OR_Y = "Axis must be x or y for this grid system.";
  this.MUST_HAVE_ONE_GRID_SELECTED = "Must have one grid selected.";
  this.ANCHOR_SET = "Anchor set: @@1";
  this.INVALID_INDEX = "Invalid index.";
  this.TEST_RESTARTED = "Test restarted.";
  this.AXIS_MUST_BE_ONE_OF_S_T = "Axis must be one of s, t or st.";
  this.MIRROR_STATE_MUST_BE_ON_OR_OFF = "Mirror state must be on or off";
  this.MIRRORED_REPEAT_SET = "Mirrored repeat set @@1 for @@2.";
  this.BOX_CREATED = "Box created.";
  this.AN_ERROR_HAPPENED_CHOOSE_ANOTHER_NAME = "An error happened. Choose another name.";
  this.HEIGHT_CANNOT_BE_0 = "Height cannot be 0.";
  this.WALL_COLLECTION_CREATED = "Wall collection created.";
  this.WALL_COLLECTIONS = "Wall collections";
  this.TREE_WALL_COLLECTIONS = "|____@@1: OUTLINE COLOR -> @@2";
  this.THERE_ARE_NO_CREATED_WALL_COLLECTIONS = "There are no created wall collections.";
  this.WALL_COLLECTION_DESTROYED = "Wall collection destroyed.";
  this.NO_SUCH_WALL_COLLECTION = "No such wall collection.";
  this.CAMERA_RESET = "Camera reset.";
  this.THIS_FUNCTION_IS_NOT_SUPPORTED_IN_YOUR_BROWSER = "This function is not supported in your browser.";
  this.NAME_CANNOT_BE_EMPTY = "Name cannot be empty.";
  this.DIALOG_OPENED_CHOOSE_AN_IMAGE = "Dialog opened. Choose an image to upload.";
  this.LOADING_IMAGE = "Loading image.";
  this.IMAGE_CREATED = "@@1 created.";
  this.NO_FILE_SELECTED_OPERATION_CANCELLED = "No file selected, operation canceled.";
  this.IMAGES = "Images";
  this.NO_UPLOADED_IMAGES = "No uploaded images.";
  this.SPECULAR_TEXTURE_MAPPED = "Specular texture mapped.";
  this.ENVIRONMENT_TEXTURE_MAPPED = "Environment texture mapped";
  this.AMBIENT_OCCULSION_TEXTURE_MAPPED = "Ambient occulsion texture mapped";
  this.ALPHA_TEXTURE_MAPPED = "Alpha texture mapped";
  this.TEXTURE_MAPPED = "Texture mapped.";
  this.DEFAULT_MATERIAL_TYPE_MUST_BE = "Default material type must be one of basic, phong or lambert.";
  this.DEFAULT_MATERIAL_TYPE_SET_TO = "Default material type set to @@1";
  this.AMBIENT_LIGHT_CREATED = "Ambient light created.";
  this.LIGHTS = "Lights";
  this.TREE_LIGHTS = "|____@@1 @@2";
  this.NO_LIGHTS_CREATED = "No lights created.";
  this.NO_SUCH_LIGHT = "No such light.";
  this.SELECTED_LIGHT = "Selected @@1.";
  this.LIGHT_DESTROYED = "Light destroyed.";
  this.NORMAL_MAPS_ARE_NOT_SUPPROTED = "Normal maps are not supported by basic materials.";
  this.NORMAL_TEXTURE_MAPPED = "Normal texture mapped.";
  this.EMISSIVE_MAPS_ARE_NOT_SUPPORTED = "Emissive maps are not supported by basic materials.";
  this.EMISSIVE_TEXTURE_MAPPED = "Emissive texture mapped.";
  this.DIRECTORY_NAME_CANNOT_BE_EMPTY = "Directory name must not be empty.";
  this.FILE_EXTENSION_CANNOT_BE_EMPTY = "File extension must not be empty.";
  this.TEXTURE_PACK_CREATED = "Texture pack created.";
  this.TEXTURE_PACKS = "Texture packs";
  this.NO_TEXTURE_PACKS_CREATED = "No texture packs created.";
  this.NO_SUCH_TEXTURE_PACK = "No such texture pack.";
  this.TEXTURE_PACK_NOT_USABLE = "Texture pack not usable.";
  this.TEXTURE_PACK_MAPPED = "Texture pack mapped.";
  this.TEXTURE_PACK_DESTROYED = "Texture pack destroyed.";
  this.TEXTURE_PACK_REFRESHED = "Texture pack refreshed.";
  this.HEIGHT_MAPS_ARE_SUPPORTED_ONLY_BY = "Height maps are supported only by phong materials.";
  this.HEIGHT_TEXTURE_MAPPED = "Height texture mapped.";
  this.MAPS_RESET = "Maps reset.";
  this.COUNT_MUST_BE_A_NUMBER = "Count must be a number.";
  this.OBJECT_MUST_HAVE_A_PHONG_MATERIAL = "Object must have a phong material.";
  this.COUNT_MUST_BE_GREATER_THAN_1 = "Count must be greater than 1.";
  this.OBJECT_SEGMENTED = "Object segmented.";
  this.RAMPS_DO_NOT_SUPPORT_THIS_FUNCTION = "Ramps do not support this function.";
  this.SPHERES_DO_NOT_SUPPORT_THIS_FUNCTION = "Spheres do not support this function.";
  this.SURFACES_DO_NOT_SUPPORT_THIS_FUNCTION_UNLESS = "Surfaces do not support this function unless they are on XZ grid systems.";
  this.STATUS_MUST_BE_ONE_OF = "Status must be one of show or hide.";
  this.GUI_IS_ALREADY_HIDDEN = "GUI is already hidden.";
  this.GUI_CLOSED = "GUI closed.";
  this.GUI_IS_ALREADY_VISIBLE = "GUI is already visible.";
  this.GUI_OPENED = "GUI opened.";
  this.CELLSIZE_MUST_BE_A_NUMBER = "Cellsize must be a number.";
  this.OFFSETX_MUST_BE_A_NUMBER = "OffsetX must be a number.";
  this.OFFSETY_MUST_BE_A_NUMBER = "OffsetY must be a number.";
  this.OFFSETZ_MUST_BE_A_NUMBER = "OffsetZ must be a number.";
  this.LIGHT_ADDED = "Light added.";
  this.SKYBOX_CREATED = "Skybox created.";
  this.SKYBOXES = "Skyboxes";
  this.NO_SKYBOXES_CREATED = "No skyboxes created.";
  this.NO_SUCH_SKYBOX = "No such skybox.";
  this.SKYBOX_NOT_USABLE = "Skybox not usable. Use the command printSkyboxInfo for the details.";
  this.SKYBOX_MAPPED = "Skybox mapped.";
  this.SKYBOX_DESTROYED = "Skybox destroyed.";
  this.NO_SKYBOX_MAPPED = "No skybox mapped. Use mapSkybox command first.";
  this.SKYBOX_NOT_VISIBLE = "Skybox not visible.";
  this.SKYBOX_HIDDEN = "Skybox hidden.";
  this.SKYBOX_ALREADY_VISIBLE = "Skybox already visible.";
  this.SKYBOX_SHOWN = "Skybox shown.";
  this.SKYBOX_NOT_DEFINED = "Skybox not defined.";
  this.AMOUNT_MUST_HAVE_A_NUMERICAL_VALUE = "Amount must have a numerical value.";
  this.SKYBOX_SCALE_ADJUSTED = "Skybox scale adjusted.";
  this.DOWNLOAD_PROCESS_INITIATED = "Download process initiated.";
  this.CHOOSE_A_FILE_TO_UPLOAD = "Dialog opened. Choose a file to upload.";
  this.LOADING_FILE = "Loading file.";
  this.PROJECT_LOADED = "Project loaded.";
  this.PROJECT_FAILED_TO_LOAD = "Project failed to load: @@1";
  this.NOTHING_TO_UNDO = "Nothing to undo.";
  this.OK = "Ok.";
  this.NOTHING_TO_REDO = "Nothing to redo.";
  this.OBJECT_SELECTED = "@@1 selected.";
  this.MASS_MUST_BE_A_POSITIVE_NUMBER = "Mass must be a positive number.";
  this.MASS_SET = "Mass set.";
  this.INVALID_EXPRESSION = "Invalid expression.";
  this.RADIAN_MUST_BE_A_NUMBER = "Radian must be a number.";
  this.OBJECT_ROTATED = "Object rotated.";
  this.OPERATION_CANCELLED = "Operation cancelled.";
  this.SCRIPT_CREATED = "Script created.";
  this.NO_SUCH_SCRIPT = "No such script.";
  this.SCRIPT_ALREADY_RUNNING = "Script already running.";
  this.SCRIPT_STARTED_RUNNING = "Script started running.";
  this.SCRIPT_IS_NOT_RUNNING = "Script is not running.";
  this.SCRIPT_STOPPED = "Script stopped.";
  this.NO_SCRIPTS_CREATED = "No scripts created.";
  this.SCRIPTS = "Scripts";
  this.TREE_SCRIPTS = "|____ @@1 -> @@2";
  this.SCRIPT_MODIFIED = "Script modified.";
  this.SCRIPT_DESTROYED = "Script destroyed.";
  this.NEAR_MUST_BE_A_NUMBER = "Near must be a number.";
  this.FAR_MUST_BE_A_NUMBER = "Far must be a number.";
  this.FOG_SET = "Fog set. Fogs are visible only in the preview mode.";
  this.FOG_REMOVED = "Fog removed from the scene.";
  this.MUST_GLUE_AT_LEAST_2_OBJECTS = "Must glue at least 2 objects.";
  this.OBJECT_NR_DOES_NOT_EXIST = "Object #@@1 does not exist.";
  this.OBJECT_IN_MOTION = "Object #@@1 is in motion. Use switchView command first to reset the animation.";
  this.OBJECTS_GLUED_TOGETHER = "Objects glued together.";
  this.INVALID_SYNTAX = "Invalid syntax.";
  this.OBJECT_DETACHED = "Object detached.";
  this.POINT_MARKED = "Point marked.";
  this.NO_SUCH_POINT = "No such point.";
  this.POINT_UNMARKED = "Point unmarked.";
  this.NO_MARKED_POINTS = "No marked points.";
  this.MARKED_POINTS = "Marked points";
  this.TREE_POINT = "|____ @@1: (@@2, @@3, @@4)";
  this.MARKED_POINTS_TOGGLED = "Marked points toggled.";
  this.CENTERX_MUST_BE_A_NUMBER = "CenterX must be a number.";
  this.CENTERY_MUST_BE_A_NUMBER = "CenterY must be a number.";
  this.CENTERZ_MUST_BE_A_NUMBER = "CenterZ must be a number.";
  this.PADDING_MUST_BE_A_NUMBER = "padding must be a number.";
  this.PADDING_MUST_BE_POSITIVE = "padding must be greater than zero."
  this.PADDING_ADDED_TO_TEXTURE = "Padding added to texture.";
  this.AXIS_MUST_BE_ONE_OF_XY_YZ_XZ = "Axis must be one of XZ, XY or YZ.";
  this.CLICKED_ON = "Clicked on: @@1";
  this.NO_OBJECT_SELECTED_FOR_TEXTURE_ADJUSTMENT = "No object selected for texture adjustment.";
  this.NO_OBJECT_SELECTED_FOR_OPACITY_ADJUSTMENT = "No object selected for opacity adjustment.";
  this.OPACITY_ADJUSTED = "Opacity adjusted.";
  this.LIGHT_INTENSITY_ADJUSTED = "Light intensity adjusted.";
  this.NO_LIGHTS_SELECTED = "No lights selected. Use selectLight command.";
  this.SHININESS = "Shininess: @@1";
  this.MAX_NUMBER_OF_SEGMENTS_ALLOWED = "Maximum number of allowed segments is @@1.";
  this.THIS_OPERATION_IS_SUPPORTED_BY_PHONG_MATERIALS = "This operation is supported by Phong materials.";
  this.NO_OBJECTS_SELECTED_TO_ADJUST_SHININESS = "No objects selected to adjust shininess.";
  this.HEIGHT_MAP_SCALE = "Height map scale: @@1";
  this.NO_HEIGHT_TEXTURE_MAPPED_TO_THIS_OBJECT = "No height texture mapped to this object.";
  this.HEIGHT_MAP_SCALES_WORK_ONLY_FOR_PHONG_MATERIALS = "Height map scales work only for Phong materials.";
  this.NO_OBJECTS_SELECTED_TO_ADJUST_HEIGHT_MAP_SCALE = "No objects selected to adjust height map scale.";
  this.HEIGHT_MAP_BIAS = "Height map bias: @@1";
  this.LIGHT_POSITION_ADJUSTED = "Light position adjusted.";
  this.AMBIENT_LIGHTS_HAVE_NO_POSITION = "Ambient lights have no position.";
  this.GS_CREATION_ERROR_1 = "GridSystem creation error: sizeX and sizeZ must be greater than zero.";
  this.GS_CREATION_ERROR_2 = "GridSystem creation error: sizeX is not multiple of cellSize";
  this.GS_CREATION_ERROR_3 = "GridSystem creation error: sizeZ is not multiple of cellSize";
  this.GS_CREATION_ERROR_4 = "GridSystem creation error: name must be unique.";
  this.GS_CREATION_ERROR_5 = "GridSystem creation error: cellSize is less than minimum size allowed ("+MIN_CELLSIZE_ALLOWED+")";
  this.GS_CREATION_ERROR_6 = "GridSystem creation error: Too many grids in a scene. Maximum "+MAX_GRIDS_ALLOWED+" allowed.";
  this.GS_CREATED = "Grid system created.";
  this.GS_CROPPED = "Grid system cropped and added to buffer.";
  this.RAMP_CREATED = "Ramp created. Anchor reset.";
  this.PHY_TEST_KEY_NOT_UNIQUE = "Test key not unique. Test cancelled.";
  this.SPHERE_CAN_HAVE_MINIMUM_8_SEGMENTS = "Spheres can have minimum 8 segments.";
  this.SKYBOXINFO_HEADER = "Skybox info";
  this.SKYBOXINFO_NAME = "NAME: @@1";
  this.SKYBOXINFO_DIRNAME = "DIR NAME: @@1";
  this.SKYBOXINFO_FILEEXTENSION = "FILE EXTENSION: @@1";
  this.SKYBOXINFO_FILEPATHS = "FILE PATHS";
  this.SKYBOXINFO_TREE_BACK ="|____back: @@1";
  this.SKYBOXINFO_TREE_DOWN = "|____down: @@1";
  this.SKYBOXINFO_TREE_FRONT = "|____front: @@1";
  this.SKYBOXINFO_TREE_LEFT = "|____left: @@1";
  this.SKYBOXINFO_TREE_RIGHT = "|____right: @@1";
  this.SKYBOXINFO_TREE_UP = "|____up: @@1";
  this.SKYBOXINFO_TEXTURES = "TEXTURES";
  this.TEXTUREPACK_INFO_TREE_DIFFUSE = "|____diffuse: @@1";
  this.TEXTUREPACK_INFO_TREE_ALPHA = "|____alpha: @@1";
  this.TEXTUREPACK_INFO_TREE_AO = "|____ambient occulsion: @@1";
  this.TEXTUREPACK_INFO_TREE_EMISSIVE = "|____emissive: @@1";
  this.TEXTUREPACK_INFO_TREE_ENVIRONMENT = "|____environment: @@1";
  this.TEXTUREPACK_INFO_TREE_NORMAL = "|____normal: @@1";
  this.TEXTUREPACK_INFO_TREE_SPECULAR = "|____specular: @@1";
  this.TEXTUREPACK_INFO_TREE_HEIGHT = "|____height: @@1";
  this.TEXTUREPACK_TEXTURES = "TEXTURES";
  this.TEXTUREPACK_FILEPATHS = "FILE PATHS";
  this.TEXTUREPACK_NAME = "NAME: @@1";
  this.TEXTUREPACK_DIRNAME = "DIR NAME: @@1";
  this.TEXTUREPACK_FILEEXTENSION = "FILE EXTENSION: @@1";
  this.TEXTUREPACK_INFO_HEADER = "Texture pack info";
  this.FAILED_TO_LOAD_SCRIPT = "Failed to load script @@1 from file path @@2.";
  this.SCRIPT_UPLOADED = "Script uploaded.";
  this.AN_UNEXPECTED_ERROR_HAPPENED = "An unexpected error happened.";
  this.THIS_SCRIPT_IS_UPLOADED = "This script is uploaded from the local file system. Make your modifications locally."
  this.PREPARING_OBJECT = "Creating KTree of @@1";
  this.OBJECT_MUST_BE_IN_THE_SAME_GRIDSYSTEM = "Glued objects must be in the same grid system.";
  this.CREATING_X_GRIDS = "Creating @@1 grids.";
  this.TEXTURE_REPEAT_U_MUST_BE_A_POSITIVE_NUMBER = "repeatU must be a positive number.";
  this.TEXTURE_REPEAT_V_MUST_BE_A_POSITIVE_NUMBER = "repeatV must be a positive number.";
  this.WORKS_ONLY_IN_DESIGN_MODE = "This command works only in Design mode.";
  this.INVALID_CHARACTER_IN_OBJECT_NAME = "Invalid character in object name.";
  this.PHYSICS_WORKER_MODE_MUST_BE_ON_OR_OFF = "Physics worker mode must be on or off.";
  this.PARTICLE_COLLISION_WORKER_MODE_MUST_BE_ON_OR_OFF = "Particle collision worker mode must be on or off.";
  this.PARTICLE_SYSTEM_COLLISION_WORKER_MODE_MUST_BE_ON_OR_OFF = "Particle system collision worker mode must be on or off.";
  this.WORKERS_ARE_NOT_SUPPORTED = "Web workers are not supported in this browser.";
  this.PHYSICS_WORKER_MODE = "Physics worker mode is @@1.";
  this.PARTICLE_COLLISION_WORKER_MODE = "Particle collision worker mode is @@1.";
  this.PARTICLE_SYSTEM_COLLISION_WORKER_MODE = "Particle system collision worker mode is @@1.";
  this.ENABLED = "enabled";
  this.DISABLED = "disabled";
  this.PHYSICS_WORKER_MODE_IS_ALREADY_ENABLED = "Physics worker mode is already enabled.";
  this.PHYSICS_WORKER_MODE_IS_ALREADY_DISABLED = "Physics worker mode is already disabled.";
  this.PARTICLE_COLLISION_ALREADY_ENABLED = "Particle collision worker mode is already enabled.";
  this.PARTICLE_SYSTEM_COLLISION_ALREADY_ENABLED = "Particle system collision worker mode is already enabled.";
  this.PARTICLE_COLLISION_ALREADY_DISABLED = "Particle collision worker mode is already disabled.";
  this.PARTICLE_SYSTEM_COLLISION_ALREADY_DISABLED = "Particle system collision worker mode is already disabled.";
  this.INVALID_SCRIPT = "Invalid script (@@2): @@1";
  this.SCRIPT_IS_NOT_VALID = "Script is not valid.";
  this.ROYGBIV_SCRIPTING_API_PREFIX = "ROYGBIV_SCRIPTING_API_";
  this.NO_SUCH_FUNCTION = "No such function.";
  this.FUNCTIONS_LIST = "ROYGBIV Scripting API functions";
  this.PERFORMANCES = "Performances in ms";
  this.SCRIPT_EXECUTION_TIME = "Script execution time";
  this.PARTICLE_SYSTEM_UPDATE_TIME = "Particle system update time";
  this.RENDER_TIME = "Render time";
  this.NO_COMMAND_FOUND = "No command found.";
  this.IS_NOT_A_NUMBER = "@@1 is not a number.";
  this.TEXTURE_RESCALED = "Texture rescaled and saved.";
  this.TEXTURE_SIZE_TOO_SMALL = "Texture size becomes too small after being rescaled.";
  this.TEXTURE_PACK_NAME_MUST_BE_UNIQUE = "Texture pack name must be unique.";
  this.TEXTURE_PACK_RESCALED = "Texture pack rescaled.";
  this.TEXTURE_USED_IN_AN_OBJECT = "Texture used in object [@@1]. Cannot delete.";
  this.TEXTURE_PACK_USED_IN_AN_OBJECT = "Texture pack used in object [@@1]. Cannot delete.";
  this.MATERIAL_USED_IN_AN_OBJECT = "Material used in an object [@@1]. Cannot delete.";
  this.NO_SUCH_IMAGE = "No such image.";
  this.IMAGE_DESTROYED = "Image destroyed.";
  this.IMAGE_USED_IN_TEXTURE = "Image used in texture [@@1]. Cannot delete.";
  this.BLENDING_MODE_SET_TO = "Blending mode set to @@1.";
  this.KEYBOARD_BUFFER_RESET = "Keyboard buffer reset.";
  this.BLENDING_MODE_MUST_BE_ONE_OF = "Blending mode should be one of NO_BLENDING, NORMAL_BLENDING, ADDITIVE_BLENDING, SUBTRACTIVE_BLENDING and MULTIPLY_BLENDING.";
  this.MUST_BE_GREATER_THAN = "@@1 must be greater than @@2.";
  this.OCTREE_LIMIT_SET = "World limit set.";
  this.OCTREE_SEGMENTS_SET = "Octree segments set.";
  this.BIN_SIZE_MUST_BE_A_NUMBER = "Bin size must be a number.";
  this.PARAMETERS_MUST_BE_DIVISABLE_BY = "Parameters must be divisable by @@1.";
  this.WORLD_LIMITS_MUST_BE_DIVISABLE_BY_BIN_SIZE = "World limits must be divisable by bin size.";
  this.BIN_SIZE_SET = "Bin size set.";
  this.WORLD_LIMITS = "World limits";
  this.BIN_SIZE = "Bin size";
  this.MIN = "Min";
  this.MAX = "Max";
  this.FRAME_DROP_ALREADY = "There is already a frame-drop recording process working.";
  this.FRAME_DROP_STARTED = "Frame-drop recording started.";
  this.ROYGBIV_SCRIPTING_API_GETOBJECT = "Returns the object or glued object having the name given as the parameter, or zero if no such object or glued object is found.";
  this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEM = "Returns the particle system having the name given as the parameter, or zero if no such particle system is found.";
  this.ROYGBIV_SCRIPTING_API_GETCHILDOBJECT = "Returns a child object having the name given as the second parameter of a glued object given as the first parameter,\nor zero if no such object is found.";
  this.ROYGBIV_SCRIPTING_API_GETRANDOMCOLOR = "Returns the HTML name of a random color.";
  this.ROYGBIV_SCRIPTING_API_HIDE = "Hides an object or a glued object, removes it from the scene. Does nothing if the object is already hidden.";
  this.ROYGBIV_SCRIPTING_API_SHOW = "Makes a hidden object or glued object visible. Does nothing if the object is already visible.";
  this.ROYGBIV_SCRIPTING_API_GETLIGHT = "Returns the light having the name given as parameter or zero if no such light is found.";
  this.ROYGBIV_SCRIPTING_API_VECTOR = "Creates a new vector from x, y and z coordinates.";
  this.ROYGBIV_SCRIPTING_API_DISTANCE = "Returns the distance between two vectors.";
  this.ROYGBIV_SCRIPTING_API_SUB = "Returns the substraction of two vectors.";
  this.ROYGBIV_SCRIPTING_API_ADD = "Returns the summation of two vectors.";
  this.ROYGBIV_SCRIPTING_API_MOVETOWARDS = "Moves vec1 towards vec2 by given amount and returns the new position of vec1. If amount is 1, vec1 goes all the way towards vec2.";
  this.ROYGBIV_SCRIPTING_API_APPLYNOISE = "Applies Perlin noise to given vector [amount] times and returns the distorted value. The default amount is 1.\nSetting the amount too high can cause performance issues.";
  this.ROYGBIV_SCRIPTING_API_SPHERICALDISTRIBUTION = "Returns a vector sampled around an imaginary sphere of given radius centered at (0, 0, 0)";
  this.ROYGBIV_SCRIPTING_API_BOXDISTRIBUTION = "Returns a vector sampled on a face of a box centered at (0, 0, 0).\nThe size of the boxis specified with the parameters sizeX, sizeY and sizeZ.\nThe optional parameter [side] can be used to generate the point on a specific face.\nside = 1 -> UP\nside = 2 -> DOWN\nside = 3 -> FRONT\nside = 4 -> BACK\nside = 5 -> RIGHT\nside = 6 -> LEFT";
  this.ROYGBIV_SCRIPTING_API_APPLYFORCE = "Applies a physical force to an object or a glued object from a given point.";
  this.ROYGBIV_SCRIPTING_API_ROTATE = "Rotates an object or a glued object around a given axis by given radians. The parameter axis must be one of x, y or z.\nObjects are rotated around their own centers, so their positions do not change when rotated using this function.";
  this.ROYGBIV_SCRIPTING_API_ROTATEAROUNDXYZ = "Rotates an object, a glued object or a point light around the given (x, y, z). Unlike the rotate function,\nthe positions of the objects can change when rotated using this function.";
  this.ROYGBIV_SCRIPTING_API_SETPOSITION = "Puts an object, glued object or point light to the specified (x, y, z) coordinate.";
  this.ROYGBIV_SCRIPTING_API_COLOR = "Creates a new color object from the given HTML color name.";
  this.ROYGBIV_SCRIPTING_API_TOGGLELIGHT = "Turns on/off a light.";
  this.ROYGBIV_SCRIPTING_API_SETMASS = "Sets the mass property of an object or a glued object. Objects are considered dynamic if and only if their mass is greater than zero.";
  this.ROYGBIV_SCRIPTING_API_RUNSCRIPT = "Starts a script of the given name. If parameters are provided, they may be reached using this.[parameterName]\nwithin the newly started script.";
  this.ROYGBIV_SCRIPTING_API_ISRUNNING = "Returns whether a script of the given name is running or not.";
  this.ROYGBIV_SCRIPTING_API_TRANSLATE = "Translates an object, glued object or point light on the given axis by the given amount.\nAxis must be one of x, y or z.";
  this.ROYGBIV_SCRIPTING_API_GETPOSITION = "Returns the (x, y, z) coordinates of an object, glued object, point light or a particle system.\nIf a specific axis is specified, only the position on the specified axis is returned.";
  this.ROYGBIV_SCRIPTING_API_MAPTEXTUREPACK = "Maps a texture pack of given name to an object. Calling this function repeatedly may cause performance issues.";
  this.ROYGBIV_SCRIPTING_API_GETROTATION = "Returns the rotation of given object, glued object or particle system. If an axis is specified (x, y or z) only the rotation around the\nspecified axis is returned, a vector containing (x, y, z) rotations is returned otherwise.";
  this.ROYGBIV_SCRIPTING_API_INTENSITY = "Increases/decreases the intensity of given ambient light or point light.";
  this.ROYGBIV_SCRIPTING_API_GETINTENSITY = "Returns the intensity of given ambient light or point light.";
  this.ROYGBIV_SCRIPTING_API_OPACITY = "Increases/decreases the opacity of given object.";
  this.ROYGBIV_SCRIPTING_API_GETOPACITY = "Returns the opacity of given object.";
  this.ROYGBIV_SCRIPTING_API_SHININESS = "Increases/decreases the opacity of given object. Only the objects that have Phong materials have shininess property.";
  this.ROYGBIV_SCRIPTING_API_GETSHININESS = "Returns the shininess of an object. Only the objects who have Phong materials have shininess property.";
  this.ROYGBIV_SCRIPTING_API_TEXTUREOFFSETX = "Adjusts the x coordinate of texture offset of given object.";
  this.ROYGBIV_SCRIPTING_API_TEXTUREOFFSETY = "Adjusts the y coordinate of texture offset of given object.";
  this.ROYGBIV_SCRIPTING_API_TEXTUREOFFSET = "Adjusts the texture offset of given object.";
  this.ROYGBIV_SCRIPTING_API_HEIGHTMAPSCALE = "Modifies the height map scale of an object. Only the object that have Phong materials can have height maps.";
  this.ROYGBIV_SCRIPTING_API_GETHEIGHTMAPSCALE = "Returns the height map scale of an object. Only the objects that have Phong materials have height maps.";
  this.ROYGBIV_SCRIPTING_API_HEIGHTMAPBIAS = "Modifies the height map bias of an object. Only the objects that have Phong materials can have height maps.";
  this.ROYGBIV_SCRIPTING_API_GETHEIGHTMAPBIAS = "Returns the height map bias of an object. Only the objects that have Phong materials have height maps.";
  this.ROYGBIV_SCRIPTING_API_SETCOLLISIONLISTENER = "Sets a collision listener for an object, glued object, particle or a particle system. Using this with loads of particles\nmay cause performance issues if web worker usage is not enabled or supported. Callback function given as the second parameter is fired\nwith a CollisionInfo instance (except for particle collisions) when the sourceObject is collided with other objects or\nglued objects of the scene." +
                                                    " The additional timeOffset parameter can be used for particles/particle systems to pre-calculate\nfuture collisions. This can help to prevent visual errors of collisions of rather fast particles/particle systems.";
  this.ROYGBIV_SCRIPTING_API_REMOVECOLLISIONLISTENER = "Removes collision listeners of an object, glued object, particle or a particle system. Use this for performance improvements if\ncollision callbacks are no longer necessary for particles or particle systems.";
  this.ROYGBIV_SCRIPTING_API_CREATEPARTICLEMATERIAL = "Returns a material for a particle. The configurations are:\n"+
                                                      "color: The HTML color name of the particle. (mandatory)\n"+
                                                      "size: The size of the particle. (mandatory)\n"+
                                                      "alpha: The alpha value of the particle. (mandatory)\n"+
                                                      "textureName: The texture name of the particle, if the particle has any texture. (optional)\n"+
                                                      "rgbFilter: A vector containing RGB threshold values. Pixels that have RGB values below the rgbFilter values are discarded.\nThis can be used to eliminate texture background colors etc. (optional)\n"+
                                                      "targetColor: Target color name of the particle. If set, the color of the particle changes between the color and the targetColor\nby colorStep in each frame render. (optional)\n"+
                                                      "colorStep: A float between [0,1] that represents the variation of color between the color and the targetColor. (optional)";
  this.ROYGBIV_SCRIPTING_API_CREATEPARTICLE = "Creates and returns a new particle based on following configurations:\n"+
                                              "position: The initial local coordinates of the particle. This is mandatory unless the motionMode is MOTION_MODE_CIRCULAR.(optional)\n"+
                                              "material: The material of the particle created using createParticleMaterial function. (mandatory)\n"+
                                              "lifetime: The expiration time in seconds of the particle. Set this to 0 for unexpirable particles. (mandatory)\n"+
                                              "respawn:  The particle will be respawned to its initial position after its expiration if this parameter is set to true. (mandatory)\n"+
                                              "alphaVariation: The variation of the alpha value of the paramter on each frame. (optional)\n"+
                                              "alphaVariationMode: The alpha variation formula. This can be one of ALPHA_VARIATION_MODE_NORMAL, ALPHA_VARIATION_MODE_SIN\nor ALPHA_VARIATION_MODE_COS."+
                                              " For ALPHA_VARIATION_MODE_NORMAL the alpha value changes linearly (t * alphaVariation),\nfor ALPHA_VARIATION_MODE_SIN the alpha changes according to"+
                                              " the sine function (sin(alphaVariation * t)) and for\nALPHA_VARIATION_MODE_COS the alpha value changes according to the cos function"+
                                              " (cos(alphaVariation * t)). Default value is\nALPHA_VARIATION_MODE_NORMAL. (optional)\n"+
                                              "startDelay: The amount of delay in seconds before the particle is created. (optional)\n"+
                                              "trailMode: This can be set to true to achieve trail effect. Default is false. The velocity and acceleration of particles\nare redundant for the trail mode. This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)\n"+
                                              "useWorldPosition: If set to true, the particle uses the world coordinates instead of local coordinates of its parent.\nCircular motion of particles are ignored in this case. (optional)\n"+
                                              "velocity: The velocity vector of the particle. This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)\n"+
                                              "acceleration: The acceleration vector of the particle. This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)\n"+
                                              "initialAngle: The initial angle value (radians) of the particle. This is mandatory unless\nthe motionMode is MOTION_MODE_NORMAL. (optional)\n"+
                                              "angularVelocity: The angular velocity (w) value of the particle. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)\n"+
                                              "angularAcceleration: The angular acceleration value of the particle. This is used only if the motionMode is\nMOTION_MODE_CIRCULAR. (optional)\n"+
                                              "angularMotionRadius: The radius value of the angular motion. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)\n"+
                                              "angularQuaternion: If set this quaternion value is applied to particles with circular motion (motionMode = MOTION_MODE_CIRCULAR).\nBy default the particles that have MOTION_MODE_CIRCULAR as motionMode are initially created on the XZ plane, so the angularQuaternion\nparameter is used to change the initial rotation of the circular motion. This value can be calculated this way:\n"+
                                              "angularQuaternion = ROYGBIV.computeQuaternionFromVectors(ROYGBIV.vector(0,1,0), [desired normal value]) (optional)\n"+
                                              "motionMode: The motion mode of the particle. This can be MOTION_MODE_NORMAL or MOTION_MODE_CIRCULAR.\nMOTION_MODE_NORMAL represents the motion with uniform acceleration and the MOTION_MODE_CIRCULAR represents the uniform circular motion.\nThe default value is MOTION_MODE_NORMAL. (optional)";
  this.ROYGBIV_SCRIPTING_API_CREATEPARTICLESYSTEM = "Creates a new particle system based on following configurations:\n"+
                                                    "name: The unique name of the particle system. (mandatory)\n"+
                                                    "particles: An array of particles created using createParticle function. (mandatory)\n"+
                                                    "position: The initial position of the particle system. (mandatory)\n"+
                                                    "lifetime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)\n"+
                                                    "velocity: The velocity vector of the particle system. This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)\n"+
                                                    "acceleration: The acceleration vector of the particle system. This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)\n"+
                                                    "angularVelocity: The angular velocity (w) of the particle. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)\n"+
                                                    "angularAcceleration: The angular acceleration of the particle. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)\n"+
                                                    "angularMotionRadius: The radius value of the imaginary circlie on which the angular motion is performed.\nThis is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)\n"+
                                                    "angularQuaternion: If set this quaternion value is applied to the position of this particle system if the motionMode is\nMOTION_MODE_CIRCULAR. By default the particle systems that have MOTION_MODE_CIRCULAR as motionMode are initially created on the XZ plane,\nso the angularQuaternion parameter is used to change the initial rotation of the circular motion. This value can be calculated this way:\n"+
                                                    "angularQuaternion = ROYGBIV.computeQuaternionFromVectors(ROYGBIV.vector(0,1,0), [desired normal value]) (optional)\n"+
                                                    "initialAngle: The initial angle of the circular motion. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)\n"+
                                                    "motionMode: The motion mode of the particle system. This can be MOTION_MODE_NORMAL or MOTION_MODE_CIRCULAR.\nMOTION_MODE_NORMAL represents the motion with uniform accelerationa and the MOTION_MODE_CIRCULAR represents the circular motion with\nuniform acceleration. The default value is MOTION_MODE_NORMAL. (optional)\n"+
                                                    "updateFunction: The update function of this particle system that is executed on each render. (optional)";
  this.ROYGBIV_SCRIPTING_API_SCALE = "Modifies the scale of a particle system.";
  this.ROYGBIV_SCRIPTING_API_SETBLENDING = "Sets the blending mode of a particle system. Blending mode can be one of NO_BLENDING, NORMAL_BLENDING,\nADDITIVE_BLENDING, SUBTRACTIVE_BLENDING or MULTIPLY_BLENDING.";
  this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMROTATION = "Sets the rotation of a particle system around given axis.";
  this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMQUATERNION = "Sets the quaternion of given particle system.";
  this.ROYGBIV_SCRIPTING_API_KILL = "Destroys a particle or a particle system.";
  this.ROYGBIV_SCRIPTING_API_CREATESMOKE = "Returns a new smoke like particle system at (0,0,0) based on following configurations:\n"+
                                          "position: The initial position of the particle system (mandatory)\n"+
                                          "expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)\n"+
                                          "name: The unique name of the particle system (mandatory)\n"+
                                          "smokeSize: Size of the smoke source (mandatory)\n"+
                                          "particleSize: The size of each smoke particle (mandatory)\n"+
                                          "particleCount: Count of smoke particles (mandatory)\n"+
                                          "colorName: Color name of each particle (mandatory)\n"+
                                          "textureName: Name of the smoke texture (optional)\n"+
                                          "movementAxis: The axis vector on which the smoke particles move. Default value is (0,1,0) (optional)\n"+
                                          "velocity: The averag" +"e velocity of particles on the movementAxis (mandatory)\n"+
                                          "acceleration: The average acceleration of particles on the movementAxis (mandatory)\n"+
                                          "randomness: A number representing the turbulence factor of the smoke particles (mandatory)\n"+
                                          "lifetime: The average lifetime of particles (mandatory)\n"+
                                          "alphaVariation: A number between -1 and 0 represents the variaton of alpha of the smoke particles on each frame (mandatory)\n"+
                                          "accelerationDirection: The direction vector of acceleration. If set, the smoke is accelerated along this vector\ninstead of the movementAxis. This can be used to achieve realistic smoke movement on inclined surfaces or\nto simulate winds. (optional)\n"+
                                          "updateFunction: The update function of the particle system that will be executed on each frame render. (optional)\n"+
                                          "startDelay: The average delay in seconds before the particles are visible on the screen. (optional)\n"+
                                          "rgbFilter: This can be used to eliminate texture background colors. (optional)";
  this.ROYGBIV_SCRIPTING_API_GETMARKEDPOSITION = "Returns (x,y,z) coordinates of a point marked using the mark command.";
  this.ROYGBIV_SCRIPTING_API_CREATETRAIL = "Creates a trail particle system. The configurations are:\n"+
                                           "name: The unique name of the particle system. (mandatory)\n"+
                                           "position: The initial position of the particle system. (mandatory)\n"+
                                           "expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)\n"+
                                           "particleCount: The count of particles in the particle system. (mandatory)\n"+
                                           "velocity: The velocity of the particle system. (mandatory)\n"+
                                           "acceleration: The acceleration of the particle system. (mandatory)\n"+
                                           "lifetime: The average lifetime of the particles. This can be set to zero for infinite particles (mandatory)\n"+
                                           "alphaVariation: The average variation of alpha of particles on each frame. Expected value is between [-1,0] (mandatory)\n"+
                                           "startDelay: The average start delay of particles. (mandatory)\n"+
                                           "colorName: The HTML color name of particles. (mandatory)\n"+
                                           "particleSize: The size of each particle. (mandatory)\n"+
                                           "size: The size of the particle system. (mandatory)\n"+
                                           "textureName: Name of the texture mapped to particles. (optional)\n"+
                                           "rgbFilter: This can be used to eliminate texture background colors. (optional)\n"+
                                           "targetColor: Target color name of the particle. If set, the color of the particle changes between the color\nand the targetColor by colorStep in each frame render. (optional)\n"+
                                           "colorStep: A float between [0,1] that represents the variation of color between the color and the targetColor. (optional)\n"+
                                           "updateFunction: The update function of the particle system that is executed on each frame render. (optional)";
  this.ROYGBIV_SCRIPTING_API_CREATEPLASMA = "Returns a plasma like particle system (see Doom 4 - plasma rifle). The configurations are:\n"+
                                            "name: The unique name of the particle system. (mandatory)\n"+
                                            "position: The initial position of the particle system. (mandatory)\n"+
                                            "expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)\n"+
                                            "velocity: The velocity of the particle system. (mandatory)\n"+
                                            "acceleration: The acceleration of the particle system. (mandatory)\n"+
                                            "radius: The radius of the plasma. (mandatory)\n"+
                                            "avgParticleSpeed: The average circular velocity of particles. (mandatory)\n"+
                                            "particleCount: The count of particles. (mandatory)\n"+
                                            "particleSize: The size of particles. (mandatory)\n"+
                                            "alpha: The alpha value of particles. Default value is 1.(optional)\n"+
                                            "colorName: The HTML color name of plasma particles. (mandatory)\n"+
                                            "textureName: The texture name of plasma particles. (optional)\n"+
                                            "rgbFilter: This can be used to eliminate texture background colors. (optional)\n"+
                                            "alphaVariation: If set, the alpha value of particles would change according to the formula: sin(alphaVariation * t) (optional)";
  this.ROYGBIV_SCRIPTING_API_SETEXPIRELISTENER = "Sets an expiration listener for a particle system. The parameter callbackFunction is executed when sourceObject is expired.\nThe name of the particle system is passed to the callbackFunction as a parameter.";
  this.ROYGBIV_SCRIPTING_API_REMOVEEXPIRELISTENER = "Removes the expiration listener function of a particle system.";
  this.ROYGBIV_SCRIPTING_API_GETFACENORMALS = "Returns an array of face normal vectors of an object or a glued object.";
  this.ROYGBIV_SCRIPTING_API_NORMALIZEVECTOR = "Normalizes the vector given in the parameter. Note that this function modifies directly the parameter and returns nothing.";
  this.ROYGBIV_SCRIPTING_API_COMPUTEQUATERNIONFROMVECTORS = "Returns the quaternion between two vectors.";
  this.ROYGBIV_SCRIPTING_API_GETFACEINFOS = "Returns a map that contains face information of an object or a glued object. Each key of the map has\n\"[object name]_[axis]\" as the format. Each value of the map is an object that has center and normal information.\nThe [axis] field inside the key may be +X, -X, +Y, -Y, +Z or -Z.";
  this.ROYGBIV_SCRIPTING_API_CIRCULARDISTRIBUTION = "Returns a random point sampled around an imaginary circle with given radius and given quaternion in 3D space.\nIf no quaternion is specified the circle is sampled on the XY plane.";
  this.ROYGBIV_SCRIPTING_API_MULTIPLYSCALAR = "Multiplies a vector by a scalar.";
  this.ROYGBIV_SCRIPTING_API_CREATEFIREEXPLOSION = "Returns a fire explosion particle system. The configurations are:\n"+
                                                   "position: The initial position of the particle system. (mandatory)\n"+
                                                   "expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)\n"+
                                                   "name: The unique name of the particle system. (mandatory)\n"+
                                                   "radius: The radius of the explosion. (mandatory)\n"+
                                                   "particleSize: The size of each explosion particles. (mandatory)\n"+
                                                   "particleCount: Count of explosion particles. (mandatory)\n"+
                                                   "fireColorName: The fire color name of the explosion. Default value is white. (optional)\n"+
                                                   "smokeColorName: The smoke color name of the explosion. Default value is black. (optional)\n"+
                                                   "colorStep: The variaton of color between the fire color and the smoke color on each frame. The value is expected to be\nbetween [0, 1]. (mandatory)\n"+
                                                   "alphaVariationCoef: The alpha variation coefficient of the particle system. The alpha value of the explosion particles vary\nby sin(alphaVariationCoef * time) on each frame. (mandatory)\n"+
                                                   "explosionDirection: The direction vector of the explosion. (mandatory)\n"+
                                                   "explosionSpeed: The speed coefficient of explosion. (mandatory)\n"+
                                                   "lifetime: The average lifetime of the explosion particles. (mandatory)\n"+
                                                   "accelerationDirection: The direction vector of acceleration. If set, the explosion is accelerated along this vector\ninstead of the explosionDirection. This can be used to achieve realistic smoke movement for explosions on inclined surfaces\nor to simulate winds. (optional)\n"+
                                                   "textureName: Name of the explosion fire texture. (optional)\n"+
                                                   "rgbFilter: This can be used to eliminate texture background colors. (optional)\n"+
                                                   "updateFunction: The update function of the particle system that will be executed on each frame render. (optional)";
  this.ROYGBIV_SCRIPTING_API_CREATEMAGICCIRCLE = "Creates a magic circle effect. Configurations are:\n"+
                                                 "name: The unique name of the circle. (mandatory)\n"+
                                                 "position: The center position of the circle. (mandatory)\n"+
                                                 "particleCount: The count of particles. (mandatory)\n"+
                                                 "expireTime: The expiration time of the circle. (mandatory)\n"+
                                                 "speed: The turning speed value of the particles. (mandatory)\n"+
                                                 "acceleration: The turning acceleration value of the particles. (mandatory)\n"+
                                                 "radius: The radius of the circle. (mandatory)\n"+
                                                 "circleNormal: The normal vector of the circle. By default the circle is located on the XZ plane (normal: (0,1,0)). (optional)\n"+
                                                 "circleDistortionCoefficient: The average distortion value of the circle. If this is not set, the particles form a\nperfect circle. (optional)\n"+
                                                 "lifetime: The lifetime of the particles. For the magic circles the respawn flag is always true so the lifetime value can be used to\nachieve color changes from target color to the initial color. In that case the period value of the circular motion can be used:\nT = (2 * PI) / (angular velocity) (optional)\n"+
                                                 "angleStep: The angular difference between the particles (Math.PI/k). This can be set to zero for randomly distributed particles.\nDefault value is 0. angleStep can be useful to achieve circular trail effects. (optional)\n"+
                                                 "particleSize: The size of particles. (mandatory)\n"+
                                                 "colorName: The HTML color name of the particles. (mandatory)\n"+
                                                 "targetColorName: The target color name of the particles. (optional)\n"+
                                                 "colorStep: The color step value of the particles between [0,1]. (optional)\n"+
                                                 "alpha: The alpha value of the particles. (mandatory)\n"+
                                                 "alphaVariation: The variaton of alpha value of the particle on each frame. (optional)\n"+
                                                 "alphaVariationMode: The alpha variation formula. This can be one of ALPHA_VARIATION_MODE_NORMAL, ALPHA_VARIATION_MODE_SIN or\nALPHA_VARIATION_MODE_COS. For ALPHA_VARIATION_MODE_NORMAL the alpha value changes linearly (t * alphaVariation), for\nALPHA_VARIATION_MODE_SIN the alpha changes according to the sine function (sin(alphaVariation * t)) and for ALPHA_VARIATION_MODE_COS\nthe alpha value changes according to the cos function"+
                                                 " (cos(alphaVariation * t)). Default value is ALPHA_VARIATION_MODE_NORMAL. (optional)\n"+
                                                 "textureName: The name of texture of the particles. (optional)\n"+
                                                 "rgbFilter: This can be used to eliminate texture background colors. (optional)\n"+
                                                 "updateFunction: The update function of the particle system that is executed on each frame render. (optional)";

  this.ROYGBIV_SCRIPTING_API_CREATECIRCULAREXPLOSION = "Creates a circular explosion effect. The configurations are:\n"+
                                                       "name: The unique name of the particle system. (mandatory)\n"+
                                                       "particleCount: The count of particles. (mandatory)\n"+
                                                       "position: The center position of the explosion. (mandatory)\n"+
                                                       "radius: The initial radius of the explosion. (mandatory)\n"+
                                                       "colorName: The color name of the particles. (mandatory)\n"+
                                                       "targetColorName: The target color name of the particles. (optional)\n"+
                                                       "colorStep: The variation of color between colorName and targetColorName on each frame. The expected value is between [0, 1]. (optional)\n"+
                                                       "particleSize: The size of particles. (mandatory)\n"+
                                                       "alpha: The alpha value of particles. (mandatory)\n"+
                                                       "textureName: The name of texture of the particles. (optional)\n"+
                                                       "rgbFilter: This can be used to eliminate texture background colors. (optional)\n"+
                                                       "alphaVariation: The alpha variaton of particles. The expected value is between [-1, 0] (mandatory)\n"+
                                                       "speed: The speed value of explosion. (mandatory)\n"+
                                                       "normal: The normal vector of the explosion. The default value is (0, 1, 0) (optional)\n"+
                                                       "expireTime: The expiration time of the particle system. This can be set 0 for infinite particle systems. (mandatory)\n"+
                                                       "updateFunction: The update function of the particle system that is executed on each frame render. (optional)";
   this.ROYGBIV_SCRIPTING_API_CREATEDYNAMICTRAIL = "Creates a dynamic trail effect. Unlike normal trails, the particles of dynamic trails may have their unique velocities and\naccelerations. This may be useful to achieve smoke trails and fireballs that follow a linear path. Configurations are:\n"+
                                                   "name: The unique name of the particle system. (mandatory)\n"+
                                                   "position: The initial position of the trail. (mandatory)\n"+
                                                   "expireTime: The maximum lifetime of the trail in seconds. Expected value is greater than zero. (mandatory)\n"+
                                                   "particleCount: The particle count of the trail. (mandatory)\n"+
                                                   "size: The size of the trail. (mandatory)\n"+
                                                   "particleSize: The size of each trail particles. (mandatory)\n"+
                                                   "startDelay: The average delay of creation of trail particles in seconds. (mandatory)\n"+
                                                   "lifetime: The time passed in seconds before the particles are respawned. If set to 0 the trail would eventually\nbe disappeared. (mandatory)\n"+
                                                   "velocity: The velocity vector of the trail. (mandatory)\n"+
                                                   "acceleration: The acceleration vector of the trail. (mandatory)\n"+
                                                   "randomness: The randomness of trail particles. (mandatory)\n"+
                                                   "alphaVariation: The average alpha variaton of trail particles. Expected value is between [-1, 0] (mandatory)\n"+
                                                   "colorName: The initial color name of trail particles. (mandatory)\n"+
                                                   "targetColorName: The target color name of trail particles. (optional)\n"+
                                                   "colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)\n"+
                                                   "textureName: The texture name of trail particles. (optional)\n"+
                                                   "rgbFilter: This can be used to eliminate texture background colors. (optional)\n"+
                                                   "updateFunction: The update function of the particle system that is executed on each frame render. (optional)";
  this.ROYGBIV_SCRIPTING_API_CREATEOBJECTTRAIL = "Creates an object trail effect based on following configurations:\n"+
                                                  "object: The object or object group to which the trail effect is added. (mandatory)\n"+
                                                  "alpha: The alpha value of trails between [0,1]. (mandatory)";
  this.ROYGBIV_SCRIPTING_API_STOPOBJECTTRAIL = "Stops the trail effect of an object created using the createObjectTrail function.";
  this.ROYGBIV_SCRIPTING_API_GENERATEPARTICLESYSTEMNAME = "Generates a unique name for a particle system.";
  this.ROYGBIV_SCRIPTING_API_REWINDPARTICLE = "Rewinds a particle and restarts its motion. Particles using this functionality must have respawn = true and\nlifetime != 0 as configuration. The additional delay parameter may be used to delay the rewind process in seconds.";
  this.ROYGBIV_SCRIPTING_API_CREATELASER = "Creates a laser like particle system. Configurations are:\n"+
                                           "name: The unique name of the particle system. (mandatory)\n"+
                                           "position: The initial position of the particle system. (mandatory)\n"+
                                           "particleCount: The count of laser particles. (mandatory)\n"+
                                           "particleSize: The size of laser particles. (mandatory)\n"+
                                           "direction: The direction vector of the laser. (mandatory)\n"+
                                           "timeDiff: The difference between startDelay attribute of each laser particle in seconds. (mandatory)\n"+
                                           "expireTime: The maximum lifetime of the laser. Set this 0 for infinite laser. (mandatory)\n"+
                                           "velocity: The velocity vector of the laser. (mandatory)\n"+
                                           "acceleration: The acceleration vector of the laser. (mandatory)\n"+
                                           "alpha: The opacity of laser particles. Expected value is between [0, 1]. (mandatory)\n"+
                                           "colorName: The color name of laser particles. (mandatory)\n"+
                                           "targetColorName: The target color name of trail particles. (optional)\n"+
                                           "colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)\n"+
                                           "textureName: The name of texture of laser particles. (optional)\n"+
                                           "rgbFilter: This can be used to eliminate texture background colors. (optional)\n"+
                                           "updateFunction: The update function of the particle system that is executed on each frame render. (optional)";
   this.ROYGBIV_SCRIPTING_API_CREATEWATERFALL = "Creates a waterfall like particle system. This function initially puts the particles on an imaginary line on the X axis.\nSize and normal of this line are configurable. Configurations are:\n"+
                                                "name: The unique name of the particle system. (mandatory)\n"+
                                                "position: The initial position of the particle system. (mandatory)\n"+
                                                "particleCount: The count of waterfall particles. (mandatory)\n"+
                                                "size: The size of the waterfall. (mandatory)\n"+
                                                "particleSize: The size of waterfall particles. (mandatory)\n"+
                                                "particleExpireTime: The maximum expiration time in seconds of particles. (mandatory)\n"+
                                                "speed: A number representing the speed of waterfall particles. (mandatory)\n"+
                                                "acceleration: A number representing the acceleration of waterfall particles. (mandatory)\n"+
                                                "avgStartDelay: The average start delay of waterfall particles. Expected value is greater than zero.(mandatory)\n"+
                                                "colorName: The name of color of particles. (mandatory)\n"+
                                                "alpha: The alpha value between [0, 1] of each particle. (mandatory)\n"+
                                                "textureName: The name of texture of particles. (optional)\n"+
                                                "rewindOnCollided: If true, the particles that are collided are rewinded. This parameter can be a performance issue if\nnweb workers are not supported. (optional)\n"+
                                                "normal: The normal vector of the waterfall. Default value is (0, 0, 1). (optional)\n"+
                                                "randomness: The randomness of waterfall particles. (optional)\n"+
                                                "alphaVariation: The alpha variaton of particles. The expected value is between [-1, 0] (optional)\n"+
                                                "targetColorName: The target color name of trail particles. (optional)\n"+
                                                "colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)\n"+
                                                "rgbFilter: This can be used to eliminate the background colors of textures. (optional)\n"+
                                                "updateFunction: The update function of the particle system that is executed on each frame render. (optional)\n"+
                                                "collisionTimeOffset: This can be used to pre-calculate collisions of particles to prevent visuals errors caused by\nfast particles. (optional)";

    this.ROYGBIV_SCRIPTING_API_CREATESNOW = "Creates a snow or rain like particle system. Particles are initially created on an imaginary rectangle on XZ plane.\nThe normal vector and width/height values of this rectangle are configurable. Configurations are:\n"+
                                            "name: The unique name of the particle system. (mandatory)\n"+
                                            "position: The initial position of the particle system. (mandatory)\n"+
                                            "particleCount: The count of snow particles. (mandatory)\n"+
                                            "sizeX: The width of the particle system. (mandatory)\n"+
                                            "sizeZ: The depth of the particle system. (mandatory)\n"+
                                            "particleSize: The size of snow particles. (mandatory)\n"+
                                            "particleExpireTime: The maximum expiration time in seconds of particles. (mandatory)\n"+
                                            "speed: A number representing the speed of snow particles. (mandatory)\n"+
                                            "acceleration: A number representing the acceleration of snow particles. (mandatory)\n"+
                                            "avgStartDelay: The average start delay of snow particles. Expected value is greater than zero.(mandatory)\n"+
                                            "colorName: The name of color of particles. (mandatory)\n"+
                                            "alpha: The alpha value between [0, 1] of each particle. (mandatory)\n"+
                                            "textureName: The name of texture of particles. (optional)\n"+
                                            "rewindOnCollided: If true, the particles that are collided are rewinded. This parameter can be a performance issue if\nweb workers are not supported. (optional)\n"+
                                            "normal: The normal vector of the snow. Default value is (0, -1, 0). (optional)\n"+
                                            "randomness: The randomness of snow particles. (optional)\n"+
                                            "alphaVariation: The alpha variaton of particles. The expected value is between [-1, 0] (optional)\n"+
                                            "targetColorName: The target color name of trail particles. (optional)\n"+
                                            "colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)\n"+
                                            "rgbFilter: This can be used to eliminate the background colors of textures. (optional)\n"+
                                            "updateFunction: The update function of the particle system that is executed on each frame render. (optional)\n"+
                                            "collisionTimeOffset: This can be used to pre-calculate collisions of particles to prevent visuals errors caused by\nfast particles. (optional)";
    this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEMVELOCITYATTIME = "Calcualtes and returns the velocity vector of a particle system at given time. For particles with circular motion, this function returns\nthe angular velocity at given time.";
    this.ROYGBIV_SCRIPTING_API_STOPPARTICLESYSTEM = "Stops the motion of a particle system. This can be useful for smooth after collision effects of particle systems as it lets particles\nto dissapear smoothly. The particle system is killed after stopDuration seconds.If particle systems have collision listener attached,\nthe collision listener needs to be reset when starting the particle system after stopping.";
    this.ROYGBIV_SCRIPTING_API_STARTPARTICLESYSTEM = "Starts a particle system after its creation. Configurations are:\n"+
                                                     "particleSystem: The particle system to start. (mandatory)\n"+
                                                     "startPosition: The initial position vector of the particle system. (optional)\n"+
                                                     "startVelocity: The initial velocity vector of the particle system. (optional)\n"+
                                                     "startAcceleration: The initial acceleration vector of the particle system. (optional)\n"+
                                                     "startQuaternion: The initial quaternion of the particle system. Use ROYGBIV.computeQuaternionFromVectors (optional)";
    this.ROYGBIV_SCRIPTING_API_HIDEPARTICLESYSTEM = "Removes a particle system from the scene. Use this instead of ROYGBIV.kill() for reusable particle systems.";
    this.ROYGBIV_SCRIPTING_API_GETCAMERADIRECTION = "Returns the direction vector of the camera.";
    this.ROYGBIV_SCRIPTING_API_GETCAMERAPOSITION = "Returns the position of the camera.";
    this.ROYGBIV_SCRIPTING_API_CREATEPARTICLESYSTEMPOOL = "Creates a new particle system pool. Particle system pools are used to hold and keep track of particle systems.\nFor instance, for a plasma gun it is suggested to create the plasma particle systems, put them inside a pool and\nget them from the pool every time the player shoots.";
    this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEMPOOL = "Finds a particle system pool by name and returns it.";
    this.ROYGBIV_SCRIPTING_API_ADDPARTICLESYSTEMTOPOOL = "Puts a particle system to a particle system pool.";
    this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEMFROMPOOL = "Returns an available particle system from the pool, or false if there is not an available particle system inside the pool.\nThe particle systems become available when hidden or expired.";
    this.ROYGBIV_SCRIPTING_API_REMOVEPARTICLESYSTEMFROMPOOL = "Removes a particle system from its particle system pool.";
    this.ROYGBIV_SCRIPTING_API_DESTROYPARTICLESYSTEMPOOL = "Destroys a particle system pool.";
    this.ROYGBIV_SCRIPTING_API_CREATECONFETTIEXPLOSION = "Creates a confetti like explosion. This function initially puts the particles to the same position on the XZ plane and defines\nparabolic motion for each particle. The configurations are:\n"+
                                                         "name: The unique name of the particle system. (mandatory)\n"+
                                                         "position: The start position of the confetti. (mandatory)\n"+
                                                         "expireTime: The expiration time of particle system in seconds. This can be set 0 for inifinite particle systems. (mandatory)\n"+
                                                         "lifetime: The average lifetime of particles in seconds. (mandatory)\n"+
                                                         "verticalSpeed: The average vertical speed of particles. (mandatory)\n"+
                                                         "horizontalSpeed: The average horizontal speed of particles. (mandatory)\n"+
                                                         "verticalAcceleration: The average vertial acceleration (gravity) of particles. Expected value is less than zero. (mandatory)\n"+
                                                         "particleCount: The count of particles. (mandatory)\n"+
                                                         "particleSize: The size of particles. (mandatory)\n"+
                                                         "colorName: The color name of particles. (mandatory)\n"+
                                                         "alpha: The alpha value of particles. (mandatory)\n"+
                                                         "collisionMethod: 0 -> Nothing happens when particles are collided with objects.\n"+
                                                         "                 1 -> Particles are destroyed when collided with objects.\n"+
                                                         "                 2 -> Particles are respawned when collided with objects.\n"+
                                                         "                 Default value is 0. (optional)\n"+
                                                         "normal: The normal vector of the particle system. Default value is (0, 1, 0) (optional)\n"+
                                                         "collisionTimeOffset: The time offset of collision listener if the collisionMethod is 1 or 2. Default value is 0. (optional)\n"+
                                                         "startDelay: The average start delay of particles. Default value is 0. (optional)\n"+
                                                         "targetColorName: The target color name of particles. (optional)\n"+
                                                         "colorStep: A float between [0, 1] that represents the variation of color between the colorName and targetColorName each frame.(optional)\n"+
                                                         "alphaVariation: The variation of alpha of particles on each frame. (optional)\n"+
                                                         "textureName: The name of texture of particles. (optional)\n"+
                                                         "rgbFilter: This can be used to eliminate background colors of textures. (optional)";
   this.ROYGBIV_SCRIPTING_API_COPYPARTICLESYSTEM = "Returns a new copy of given particle system. This function can be used to improve memory usage of particle system pools.\nFor instance, given a plasma gun with X plasma particle systems it is better to create one plasma particle system then create\n(X-1) copies of it than to create X plasma particle systems.";
   this.ROYGBIV_SCRIPTING_API_SETVECTOR = "Set the x, y, z components of a vector.";
   this.ROYGBIV_SCRIPTING_API_QUATERNION = "Returns a new THREE.Quaternion instance.";
   this.ROYGBIV_SCRIPTING_API_FADEAWAY = "Makes the particles of given particle system smaller on each frame. Greater the coefficient, faster the particles fade away.\nThis can be used for smoke like particle systems to make them dissapear smoothly.";
   this.ROYGBIV_SCRIPTING_API_MERGEPARTICLESYSTEMS = "Merges all created particle systems to improve render performance.";
   this.ROYGBIV_SCRIPTING_API_CREATECROSSHAIR = "Creates a new crosshair. Configurations are:\n"+
                                                "name: The unique name of the crosshair. (mandatory)\n"+
                                                "textureName: The texture name of the crosshair. (mandatory)\n"+
                                                "colorName: The color name of the crosshair. (mandatory)\n"+
                                                "alpha: The alpha value of the crosshair. (mandatory)\n"+
                                                "size: The size of the crosshair. (mandatory)";
   this.ROYGBIV_SCRIPTING_API_SELECTCROSSHAIR = "Selects a crosshair. Only the selected crosshair is visible on the screen.";
   this.ROYGBIV_SCRIPTING_API_CHANGECROSSHAIRCOLOR = "Changes the color of the selected crosshair.";
   this.ROYGBIV_SCRIPTING_API_HIDECROSSHAIR = "Destroys the selected crosshair. selectCrosshair function should be used after this function\nin order to put a crosshair on the screen.";
   this.ROYGBIV_SCRIPTING_API_STARTCROSSHAIRROTATION = "Starts rotation effect of the selected crosshair.";
   this.ROYGBIV_SCRIPTING_API_STOPCROSSHAIRROTATION = "Stops rotation effect of the selected crosshair.";
   this.ROYGBIV_SCRIPTING_API_PAUSECROSSHAIRROTATION = "Pauses rotation effect of the selected crosshair. startCrosshairRotation function can be used to continue the rotation effect.";
   this.ROYGBIV_SCRIPTING_API_EXPANDCROSSHAIR = "Expands a crosshair. This can be used while shooting or walking for fps games. The crosshair expands by delta while\nits size is less than targetSize on each frame. This function is designed to be called inside onmousedown or onkeydown like events.";
   this.ROYGBIV_SCRIPTING_API_SHRINKCROSSHAIR = "Shrinks a crosshair. This can be used after calling the expandCrosshair function. The crosshair shrinks by delta while its size is\ngreater than its initial size. This function is designed to be called inside onmouseup or onkeyup like events.";
   this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMPOSITION = "Sets the position of a particle system. This function is designed for magic circle like particle systems which may follow players.\nThis function should not be used for particle systems with collision callbacks or particle systems with defined motions in general.";
}
