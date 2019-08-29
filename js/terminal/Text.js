var Text = function(){

  this.PARAM1 = "@@1";
  this.PARAM2 = "@@2";
  this.PARAM3 = "@@3";
  this.PARAM4 = "@@4";
  this.PARAM5 = "@@5";

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
  this.NO_FONTS = "There are no created fonts.";
  this.FONT_USED_IN = "Font used in text: @@1. Delete the text first.";
  this.COMMAND_EXECUTED_FOR_X_PARTICLE_SYSTEMS = "Command executed for @@1 particle systems.";
  this.COMMAND_EXECUTED_FOR_X_PARTICLE_SYSTEM_POOLS = "Command executed for @@1 particle system pools.";
  this.NO_PARTICLE_SYSTEMS_FOUND = "No particle systems found.";
  this.NO_PARTICLE_SYSTEM_POOLS_FOUND = "No particle system pools found.";
  this.NO_MUZZLE_FLASHES_FOUND = "No muzzleflashes found.";
  this.COMMAND_EXECUTED_FOR_X_TEXTS = "Command executed for @@1 texts.";
  this.COMMAND_EXECUTED_FOR_X_FONTS = "Command executed for @@1 fonts.";
  this.COMMAND_EXECUTED_FOR_X_MUZZLE_FLASHES = "Command executed for @@1 muzzleflashes.";
  this.NO_TEXT_FOUND = "No text found.";
  this.NO_TEXTS_CREATED = "No texts created.";
  this.NO_FONTS_FOUND = "No fonts found.";
  this.GRIDSYSTEMS = "Grid systems";
  this.NO_SUCH_GRID_SYSTEM = "No such grid system.";
  this.NO_SUCH_CROSSHAIR = "No such crosshair.";
  this.GRID_SYSTEM_IS_OUT_OF = "Grid system is out of world limits. Use setWorldLimits command to increase the limit.";
  this.NO_SUCH_FONT = "No such font.";
  this.NO_SUCH_PARTICLE_SYSTEM = "No such particle system.";
  this.NO_SUCH_PARTICLE_SYSTEM_POOL = "No such particle system pool.";
  this.NO_SUCH_MUZZLE_FLASH = "No such muzzle flash.";
  this.PARTICLE_SYSTEM_BELONGS_TO_ANOTHER_POOL = "Particle system belongs to another pool.";
  this.PARTICLE_SYSTEM_POOL_CREATED = "Particle system pool created.";
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
  this.FONT_DESTROYED = "Font destroyed.";
  this.CONTROLS = "Control Info";
  this.SELECTED_GRIDS = "Selected grids";
  this.NONE_OF_THE_GRIDS_ARE_SELECTED = "None of the grids are selected.";
  this.GRIDS_RESET = "@@1 grids reset.";
  this.CHILD_OBJECT_POSITION = "World position of @@1:";
  this.MUST_HAVE_TWO_GRIDS_SELECTED = "Must have two grids selected.";
  this.SELECTED_GRIDS_SAME_GRIDSYSTEM = "Selected grids must be in the same grid system.";
  this.CROPPED_GS_BUFFER_IS_EMPTY = "Cropped grid system buffer is empty.";
  this.XTRANSLATION_MUST_BE_A_NUMBER = "xTranslation must be a number.";
  this.YTRANSLATION_MUST_BE_A_NUMBER = "yTranslation must be a number.";
  this.ZTRANSLATION_MUST_BE_A_NUMBER = "zTranslation must be a number.";
  this.RADUIS_MUST_BE_A_NUMBER = "Radius must be a number.";
  this.RADIUS_MUST_BE_DIFFERENT_THAN_ZERO = "Radius must be different than zero.";
  this.BOTH_BOTTOM_RADIUS_AND_TOP_RADIUS = "Both bottom radius and top radius cannot be zero.";
  this.SPHERE_CREATED = "Sphere created.";
  this.CYLINDER_CREATED = "Cylinder created.";
  this.JOB_COMPLETED = "Job completed.";
  this.SWITCHED_TO_PREVIEW_MODE = "Switched to preview mode.";
  this.SWITCHED_TO_DESIGN_MODE = "Switched to design mode.";
  this.NAME_RESERVED = "Name reserved.";
  this.MATERIAL_NAME_MUST_BE_UNIQUE = "Material name must be unique.";
  this.ISWIREFRAMED_MUST_BE_TRUE_OR_FALSE = "isWireFramed must be true or false.";
  this.ISVISIBLE_MUST_BE_TRUE_OR_FALSE = "isVisible must be true or false.";
  this.ISOPENENDED_MUST_BE_TRUE_OR_FALSE = "isOpenEnded must be true or false";
  this.ISHARDCOPY_MUST_BE_TRUE_OR_FALSE = "isHardCopy must be true or false.";
  this.SIDES_MUST_BE_BOTH_FRONT_OR_BACK = "sides must be front, back or both.";
  this.DIFFERENT_GRID_SYSTEM_AXIS = "Source object and target object have different grid system axis.";
  this.CONFIGURATION_CREATED = "Configuration created.";
  this.MATERIAL_CREATED = "Material created.";
  this.BASIC_MATERIAL_INFO_TREE = "|____BASIC MATERIAL: @@1 -> color: @@2";
  this.MATERIALS = "Materials";
  this.NO_CREATED_MATERIALS = "There are no created materials.";
  this.NO_SUCH_MATERIAL = "No such material.";
  this.MATERIAL_DESTROYED = "Material destroyed.";
  this.MUST_HAVE_1_OR_2_GRIDS_SELECTED = "Must have 1 or 2 grids selected.";
  this.NAME_MUST_BE_UNIQUE = "Name must be unique.";
  this.FONT_NAME_MUST_BE_UNIQUE = "Font name must be unique.";
  this.NAME_USED_AS_A_REFERENCE = "Name used as a copy reference name in an object. Cannot use this name.";
  this.NAME_USED_IN_AN_OBJECT_GROUP = "Name used in an object group.";
  this.OBJECT_ADDED = "Object added.";
  this.X_GRIDS_SELECTED = "@@1 grids selected.";
  this.OBJECT_INFO_TREE = "|____[@@1]: @@2 (@@3, @@4, @@5)";
  this.OBJECT_GROUP_INFO_TREE = "|____[glued]: @@1 (@@2) (@@3, @@4, @@5)";
  this.NO_OBJECT_ADDED_TO_THE_SCENE = "No objects added to scene.";
  this.OBJECTS = "Objects";
  this.FONTS = "Fonts";
  this.GS_ATTACHED_TO_A_WC = "Gridsystem attached to a wall collection. Use destroyWallCollection command instead.";
  this.NO_SUCH_OBJECT = "No such object.";
  this.NO_SUCH_OBJECT_GROUP = "No such object group.";
  this.NO_SUCH_CHILD_OBJECT_IN_THE_GROUP = "No such child object in the group.";
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
  this.TEXTURE_CREATED_DDS_SUPPORT_ISSUE = "DDS textures are not supported in this device. Used "+compressedTextureFallbackFormat+" format instead.";
  this.COMPRESSED_TEXTURES_DO_NOT_SUPPORT = "Compressed textures do not support this function.";
  this.TEXTURE_CLONED = "Texture cloned for optimization.";
  this.TREE_TEXTURE = "|____@@1 @@2 -> @@3"
  this.THERE_ARE_NO_TEXTURES = "There are no textures.";
  this.STATUS_PENDING = "(PENDING)";
  this.STATUS_DOWNLOADING = "(DOWNLOADING)";
  this.STATUS_ERROR = "(ERROR)";
  this.STATUS_LOADED = "(LOADED)";
  this.GRID_SYSTEM_NOT_IN_SCENE = "Gridsystem is not inside the active scene.";
  this.AREA_NOT_IN_SCENE = "Area is not inside the active scene.";
  this.OBJECT_NOT_IN_SCENE = "Object is not inside the active scene.";
  this.MARKED_POINT_NOT_IN_SCENE = "Marked point is not inside the active scene.";
  this.OBJECT_NR_X_NOT_IN_SCENE = "Object nr. @@1 is not inside the active scene.";
  this.SOURCE_OBJECT_NOT_IN_SCENE = "Source object is not inside the active scene.";
  this.TARGET_OBJECT_NOT_IN_SCENE = "Target object is not inside the active scene.";
  this.MUZZLE_FLASH_NOT_IN_SCENE = "Muzzle flash is not inside the active scene.";
  this.PS_NOT_IN_SCENE = "Particle system is not inside the active scene.";
  this.TEXT_NOT_IN_SCENE = "Text not inside the active scene.";
  this.TEXTURES = "Textures";
  this.GENERATING_TEXTURE_ATLAS = "Generating texture atlas.";
  this.INITIALIZING_WORKERS = "Initializing workers.";
  this.NAME_CANNOT_EXCEED_X_CHARS = "Name cannot exceed @@1 characters.";
  this.CREATED_X_SURFACES = "Command executed for @@1 surfaces.";
  this.CREATED_X_BOXES = "Command executed for @@1 boxes.";
  this.CREATED_X_COPIES = "Command executed for @@1 copies.";
  this.CREATED_X_SPHERES = "Command executed for @@1 spheres.";
  this.CREATED_X_CYLINDERS = "Command executed for @@1 cylinders.";
  this.DESTROYED_X_TEXTURES = "Command executed for @@1 textures.";
  this.OBJECT_HAS_NO_MASS = "Object does not have a mass.";
  this.OBJECT_CANNOT_SET_MASS = "This object does not have a physics body as none of its children has a physics body.";
  this.PHYSICS_SIMPLIFIED = "Physics simplified.";
  this.PHYSICS_DESIMPLIFIED = "Physics desimplified.";
  this.NO_IMAGES_FOUND = "No images found.";
  this.COMMAND_EXECUTED_FOR_X_IMAGES = "Command executed for @@1 images.";
  this.NO_TEXTURE_FOUND = "No texture found.";
  this.NO_OBJECT_FOUND = "No object found.";
  this.PARTICLE_SYSTEMS = "Particle systems";
  this.PARTICLE_SYSTEM_POOLS = "Particle system pools.";
  this.MUZZLE_FLASHES = "Muzzleflashes.";
  this.NO_PARTICLE_SYSTEMS_CREATED = "No particle systems created.";
  this.NO_PARTICLE_SYSTEM_POOLS_CREATED = "No particle system pools created.";
  this.NO_MUZZLE_FLASHES_CREATED = "No muzzleflashes created.";
  this.SHADER_PRECISION_ADJUSTED = "Shader precision adjusted.";
  this.COMMAND_EXECUTED_FOR_X_OBJECTS = "Command executed for @@1 objects.";
  this.TEXTURE_PACK_MAPPED_TO_X_OBJECTS = "Command executed for @@1 objects.";
  this.TEXTURE_PACK_ALREADY_USED = "Texture pack already mapped, cannot be edited.";
  this.NO_GRID_SYSTEM_FOUND = "No grid system found.";
  this.DESTROYED_X_GRID_SYTEMS = "Command executed for @@1 grid systems.";
  this.NO_WALL_COLLECTION_FOUND = "No wall collection found."
  this.COMMAND_EXECUTED_FOR_X_WALL_COLLECTIONS = "Command executed for @@1 wall collections.";
  this.SCENE_DESTROYED = "Scene destroyed.";
  this.SCENE_IS_ACTIVE_CANNOT_DELETE = "Scene is active, cannot delete. Use switchScene command first.";
  this.CANNOT_DELETE_ENTRY_SCENE = "Cannot delete the entry scene.";
  this.FOG_IS_NOT_SET = "Fog is not set.";
  this.NO_SUCH_TEXTURE = "No such texture.";
  this.COMPRESSING_FONT = "Compressing font.";
  this.SCENE_CREATED = "Scene created.";
  this.NO_SUCH_SCENE = "No such scene.";
  this.SCENE_IS_ALREADY_ACTIVE = "Scene is already active.";
  this.SCENE_SWITCHED = "Scene switched";
  this.SOURCE_OBJECT_NOT_DEFINED = "Source object is not defined.";
  this.TARGET_OBJECT_NOT_DEFINED = "Target object is not defined.";
  this.SOURCE_AND_TARGET_OBJECTS_ARE_THE_SAME = "Source and target objects are the same.";
  this.OBJECTS_SYNCED = "Objects synced.";
  this.TEXTURE_DESTROYED = "Texture destroyed.";
  this.TEXTURE_NOT_READY = "Texture not ready.";
  this.ERROR_HAPPENED_LOADING_TYPEFACE = "Error happened loading typeface.";
  this.ERROR_HAPPENED_COMPRESSING_FONT = "Error happened compressing font.";
  this.CANNOT_MAP_TEXTURE_TO_A_GLUED_OBJECT = "Cannot map texture to a glued object.";
  this.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION = "Glued objects do not support this function.";
  this.NO_TEXTURE_MAPPED_TO_OBJECT = "No texture mapped to object.";
  this.ENTRY_SCENE_SET = "Entry scene is @@1.";
  this.REPEAT_AMOUNT_MODIFIED = "Repeat amount modified.";
  this.WORKS_ONLY_IN_PREVIEW_MODE = "This command works only in preview mode.";
  this.DURATION_MUST_BE_A_NUMBER = "Duration must be a number.";
  this.NO_SUCH_EFFECT = "No such effect.";
  this.SIZEX_MUST_BE_A_NUMBER = "SizeX must be a number.";
  this.SIZEY_MUST_BE_A_NUMBER = "SizeY must be a number.";
  this.SIZEZ_MUST_BE_A_NUMBER = "SizeZ must be a number.";
  this.MASS_MUST_BE_A_NUMBER = "Mass must be a number.";
  this.POSITION_X_MUST_BE_A_NUMBER = "PositionX must be a number.";
  this.POSITION_Y_MUST_BE_A_NUMBER = "PositionY must be a number.";
  this.POSITION_Z_MUST_BE_A_NUMBER = "PositionZ must be a number.";
  this.PARTICLE_SYSTEM_CREATED = "Particle system created.";
  this.PARTICLE_SYSTEM_EDITED = "Particle system edited.";
  this.MUZZLEFLASH_CREATED = "Muzzle flash created.";
  this.MUZZLEFLASH_EDITED = "Muzzle flash edited.";
  this.OBJECT_MARKED_AS = "Object marked as @@1.";
  this.OBJECT_INTERSECTABLE = "Object set as intersectable. It means that the object can be collided with particles/particle systems and be picked with mouse.";
  this.OBJECT_UNINTERSECTABLE = "Object set as unintersectable. It means that the object cannot be collided with particles/particle systems and be picked with mouse.";
  this.A_NEW_BOX_TEST_STARTED = "A new box test started.";
  this.RADIUS_MUST_BE_A_NUMBER = "Radius must be a number.";
  this.A_NEW_SPHERE_TEST_STARTED = "A new sphere test started.";
  this.PHYSICS_TEST_TREE = "|____@@1 @@2 (@@3) -> @@4";
  this.PHYSICS_TESTS = "Physics tests"
  this.THERE_ARE_NO_PHYSICS_TESTS = "There are no physics tests.";
  this.PHYSICS_DEBUG_MODE_ON = "Physics debug mode: ON";
  this.PHYSICS_DEBUG_MODE_OFF = "Physics debug mode: OFF";
  this.ERROR_HAPPENED_COMPRESSING_TEXTURE_ATLAS = "Error happened compressing texture atlas.";
  this.AXIS_MUST_BE_ONE_OF_X_Y_Z = "Axis must be one of x, y, or z.";
  this.HEIGHT_MUST_BE_A_NUMBER = "Height must be a number.";
  this.NO_ANCHOR_GRIDS_SELECTED = "No anchor grid selected. Use setAnchor command first.";
  this.ONE_OF_THE_GRID_SELECTIONS_MUST_BE_THE_ANCHOR_GRID = "One of the grid selections must be the anchor grid.";
  this.AXIS_MUST_BE_X_OR_Z = "Axis must be x or z for this grid system.";
  this.AXIS_MUST_BE_Y_OR_Z = "Axis must be y or z for this grid system.";
  this.AXIS_MUST_BE_X_OR_Y = "Axis must be x or y for this grid system.";
  this.NO_AREAS_FOUND = "No areas found.";
  this.COMMAND_EXECUTED_FOR_X_AREAS = "Command executed for @@1 areas.";
  this.MUST_HAVE_ONE_GRID_SELECTED = "Must have one grid selected.";
  this.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED = "Must have at least one grid selected.";
  this.NO_MATERIAL_FOUND = "No material found.";
  this.DESTROYED_X_MATERIALS = "Command executed for @@1 materials.";
  this.ANCHOR_SET = "Anchor set: @@1";
  this.INVALID_INDEX = "Invalid index.";
  this.TEST_RESTARTED = "Test restarted.";
  this.INVALID_PARAMETER = "Invalid parameter: @@1";
  this.ANIMATION_UPDATED = "Animation updated.";
  this.AXIS_MUST_BE_ONE_OF_S_T = "Axis must be one of s, t or st.";
  this.OBJECT_IS_ALREADY_SLIPPERY = "Object is already slippery.";
  this.SLIPPERINESS_ADJUSTED = "Slipperiness adjusted.";
  this.TEXT_ALLOCATED = "Text allocated.";
  this.OBJECT_WILL_BE_USED_AS_FPS_WEAPON = "Object will be used as FPS weapon. Use fpsWeaponAlignment CLI command to configure the weapon alignment.";
  this.OBJECT_IS_NOT_MARKED_AS_FPS_WEAPON = "Object is not marked as an FPS weapon.";
  this.TEXTS = "Texts";
  this.OBJECT_IS_ALREADY_NOT_SLIPPERY = "Slipperiness is already off for the object.";
  this.SLIPPERINESS_STATE_MUST_BE_ON_OR_OFF = "Slipperiness state must be on or off."
  this.MIRROR_STATE_MUST_BE_ON_OR_OFF = "Mirror state must be on or off.";
  this.MIRRORED_REPEAT_SET = "Mirrored repeat set @@1 for @@2.";
  this.BOX_CREATED = "Box created.";
  this.AN_ERROR_HAPPENED_CHOOSE_ANOTHER_NAME = "An error happened. Choose another name.";
  this.MUZZLE_FLASH_USED_IN = "Muzzleflash used in FPS weapon @@1. Cannot destroy.";
  this.MUZZLE_FLASH_DESTROYED = "Muzzleflash destroyed."
  this.HEIGHT_CANNOT_BE_0 = "Height cannot be 0.";
  this.WALL_COLLECTION_CREATED = "Wall collection created.";
  this.WALL_COLLECTIONS = "Wall collections";
  this.TREE_WALL_COLLECTIONS = "|____@@1: OUTLINE COLOR -> @@2";
  this.PHYSICS_UNSIMPLIFIED = "Physics unsimplified.";
  this.PHYSICS_IS_NOT_SIMPLIFIED = "Object physics is not simplified.";
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
  this.CROSSHAIR_CREATED = "Crosshair created.";
  this.CROSSHAIR_EDITED = "Crosshair edited.";
  this.CROSSHAIR_DESTROYED = "Crosshair destroyed.";
  this.OBJECTS_HAVE_TOO_MANY_FACES = "Objects have too many faces. Cannot glue.";
  this.TOO_MANY_GRIDS = "Too many grids.";
  this.NO_UPLOADED_IMAGES = "No uploaded images.";
  this.SPECULAR_TEXTURE_MAPPED = "Specular texture mapped.";
  this.ENVIRONMENT_TEXTURE_MAPPED = "Environment texture mapped";
  this.AMBIENT_OCCULSION_TEXTURE_MAPPED = "Ambient occulsion texture mapped";
  this.ALPHA_TEXTURE_MAPPED = "Alpha texture mapped";
  this.TEXTURE_MAPPED = "Texture mapped.";
  this.TREE_LIGHTS = "|____@@1 @@2";
  this.SELECTED = "Selected @@1.";
  this.NORMAL_MAPS_ARE_NOT_SUPPROTED = "Normal maps are not supported by basic materials.";
  this.SPECULAR_MAPS_ARE_NOT_SUPPORTED = "Specular maps are not supported by basic materials.";
  this.NORMAL_TEXTURE_MAPPED = "Normal texture mapped.";
  this.EMISSIVE_MAPS_ARE_NOT_SUPPORTED = "Emissive maps are not supported by basic materials.";
  this.EMISSIVE_TEXTURE_MAPPED = "Emissive texture mapped.";
  this.DIRECTORY_NAME_CANNOT_BE_EMPTY = "Directory name must not be empty.";
  this.FILE_EXTENSION_CANNOT_BE_EMPTY = "File extension must not be empty.";
  this.TEXTURE_PACK_CREATED = "Texture pack created.";
  this.TEXTURE_PACK_EDITED = "Texture pack edited.";
  this.TEXTURE_PACKS = "Texture packs";
  this.INCLUDED_SCRIPTS = "Included scripts";
  this.CROSSHAIRS = "Crosshairs";
  this.SCENES = "Scenes";
  this.NO_TEXTURE_PACK_FOUND = "No texture pack found.";
  this.COMMAND_EXECUTED_FOR_X_TEXTURES = "Command executed for @@1 textures.";
  this.COMMAND_EXECUTED_FOR_X_TEXTURE_PACKS = "Command executed for @@1 texture packs.";
  this.COMMAND_EXECUTED_FOR_X_SKYBOXES = "Command executed for @@1 skyboxes.";
  this.NO_SKYBOX_FOUND = "No skybox found.";
  this.NO_SCRIPTS_FOUND = "No scripts found.";
  this.COMMAND_EXECUTED_FOR_X_SCRIPTS = "Command executed for @@1 scripts.";
  this.COMMAND_EXECUTED_FOR_X_MARKED_POINTS = "Command executed for @@1 marked points.";
  this.MARKED_X_POINTS = "Command executed for @@1 points.";
  this.NO_TEXTURE_PACKS_CREATED = "No texture packs created.";
  this.NO_SCRIPTS_INCLUDED = "No scripts included.";
  this.NO_CROSSHAIRS_CREATED = "No crosshairs created.";
  this.COMMAND_EXECUTED_FOR_X_CROSSHAIRS = "Command executed for @@1 crosshairs.";
  this.NO_CROSSHAIRS_FOUND = "No crosshairs found.";
  this.NO_SUCH_TEXTURE_PACK = "No such texture pack.";
  this.NO_SUCH_TEXT = "No such text.";
  this.TEXTURE_COMPRESSION_ERROR = "Error happened while compressing texture pack @@1. Try using smaller PNGs.";
  this.TEXTURE_COMPRESSION_ENCODE_ERROR = "Error happened while compressing @@1 texture of @@2.\nTry providing a JPEG alternative for this texture under the texture pack folder.";
  this.TEXTURE_PACK_NOT_USABLE = "Texture pack not usable.";
  this.TEXTURE_PACK_MAPPED = "Texture pack mapped.";
  this.TEXTURE_PACK_DESTROYED = "Texture pack destroyed.";
  this.TEXTURE_PACK_REFRESHED = "Texture pack refreshed.";
  this.HEIGHT_TEXTURE_MAPPED = "Height texture mapped.";
  this.MAPS_RESET = "Maps reset.";
  this.COUNT_MUST_BE_A_NUMBER = "Count must be a number.";
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
  this.SKYBOX_CREATED = "Skybox created.";
  this.SKYBOX_EDITED = "Skybox edited.";
  this.CANNOT_CREATE_MUZZLEFLASH_COLLIDABLE_PS = "Cannot create muzzleflash from a collidable particle system.";
  this.CANNOT_CREATE_MUZZLEFLASH_COLLIDABLE_PARTICLES = "Cannot create muzzleflash from a particle system with collidable particles.";
  this.SKYBOXES = "Skyboxes";
  this.PIVOT_SET = "Pivot set.";
  this.NO_SKYBOXES_CREATED = "No skyboxes created.";
  this.NO_SUCH_SKYBOX = "No such skybox.";
  this.SKYBOX_NOT_USABLE = "Skybox not usable. Use the command printSkyboxInfo for the details.";
  this.SKYBOX_MAPPED = "Skybox mapped.";
  this.SKYBOX_DESTROYED = "Skybox destroyed.";
  this.NO_SKYBOX_MAPPED = "No skybox mapped. Use mapSkybox command first.";
  this.NO_FOG_SET = "No fog set. Use setFog command first.";
  this.SKYBOX_NOT_VISIBLE = "Skybox not visible.";
  this.SKYBOX_HIDDEN = "Skybox hidden.";
  this.SKYBOX_ALREADY_VISIBLE = "Skybox already visible.";
  this.SKYBOX_SHOWN = "Skybox shown.";
  this.SKYBOX_NOT_DEFINED = "Skybox not defined.";
  this.AMOUNT_MUST_HAVE_A_NUMERICAL_VALUE = "Amount must have a numerical value.";
  this.SKYBOX_SCALE_ADJUSTED = "Skybox scale adjusted.";
  this.PHYSICS_DISABLED = "Physics disabled for object.";
  this.PHYSICS_ENABLED = "Physics enabled for object.";
  this.DOWNLOAD_PROCESS_INITIATED = "Download process initiated.";
  this.CHOOSE_A_FILE_TO_UPLOAD = "Dialog opened. Choose a file to upload.";
  this.LOADING_FILE = "Loading file.";
  this.BUILDING_PROJECT = "Building project.";
  this.PROJECT_LOADED = "Project loaded.";
  this.FONT_CREATED = "Font created.";
  this.ERROR_CREATING_FONT = "An error happened creating font. Make sure @@1 exists.";
  this.LOADING_SHADERS = "Loading shaders.";
  this.LOADING_PROJECT = "Loading project.";
  this.LOADING_SCRIPTS = "Loading scripts.";
  this.LOADING_FONT = "Loading font.";
  this.LOADING = "Loading.";
  this.COMPRESSING_TEXTURE = "Compressing texture.";
  this.TEXTURES_COMPRESSED = "Textures compressed.";
  this.CONFIGURING_AREA = "Configuring area.";
  this.CONFIGURING_AREAS = "Configuring areas.";
  this.AREA_CONFIGURED = "Area configured. Please check the area for manual corrections.";
  this.AREAS_CONFIGURED = "Areas configured. Please check the areas for manual corrections.";
  this.PROJECT_FAILED_TO_LOAD = "Project failed to load: @@1";
  this.NOTHING_TO_UNDO = "Nothing to undo.";
  this.OK = "Ok.";
  this.NOTHING_TO_REDO = "Nothing to redo.";
  this.OBJECT_SELECTED = "@@1 selected.";
  this.MASS_MUST_BE_A_POSITIVE_NUMBER = "Mass must be a positive number.";
  this.MASS_SET = "Mass set.";
  this.INVALID_EXPRESSION = "Invalid expression.";
  this.NO_VALID_TEXTURE_PACK_FOLDER = "There are no valid texture pack folders under texture_packs folder.";
  this.NO_VALID_SKYBOX_FOLDER = "There are no valid skybox folders under skybox root folder.";
  this.NO_VALID_FONTS = "There are no valid TTF files under fonts root folder.";
  this.RADIAN_MUST_BE_A_NUMBER = "Radian must be a number.";
  this.OBJECT_ROTATED = "Object rotated.";
  this.TEXT_DESTROYED = "Text destroyed.";
  this.OPERATION_CANCELLED = "Operation cancelled.";
  this.SCRIPT_CREATED = "Script created.";
  this.NO_SUCH_SCRIPT = "No such script.";
  this.SCRIPT_ALREADY_RUNNING = "Script already running.";
  this.SCRIPT_STARTED_RUNNING = "Script started running.";
  this.SCRIPT_IS_NOT_RUNNING = "Script is not running.";
  this.SCRIPT_STOPPED = "Script stopped.";
  this.NO_SCRIPTS_CREATED = "No scripts created.";
  this.PARTICLE_SYSTEM_USED_IN_A_POOL = "Particle system is used in a pool. Cannot delete.";
  this.PARTICLE_SYSTEM_USED_IN_A_MUZZLEFLASH = "Particle system is used in a muzzle flash. Cannot delete.";
  this.PARTICLE_SYSTEM_DESTROYED = "Particle system destroyed.";
  this.PARTICLE_SYSTEM_POOL_DESTROYED = "Particle system pool destroyed.";
  this.SCRIPTS = "Scripts";
  this.TREE_SCRIPTS = "|____ @@1 -> @@2";
  this.SCRIPT_MODIFIED = "Script modified.";
  this.SCRIPT_DESTROYED = "Script destroyed.";
  this.NEAR_MUST_BE_A_NUMBER = "Near must be a number.";
  this.FAR_MUST_BE_A_NUMBER = "Far must be a number.";
  this.FOG_SET = "Fog set. Fogs are visible only in the preview mode.";
  this.FOG_INFO = "Fog info"
  this.FOG_REMOVED = "Fog removed from the scene.";
  this.ATLAS_TEXTURE_SIZE = "Atlas texture size";
  this.ATLAS_TEXTURE_SIZE_NOT_SET = "Atlas texture size not set.";
  this.TEXTURE_SIZE_CANNOT_EXCEED = "Texture size cannot exceed "+MAX_TEXTURE_SIZE;
  this.CANNOT_GLUE_OBJECTS_WITH_DIFFERENT_MATERIAL_TYPES = "Cannot glue objects with different material types.";
  this.MUST_GLUE_AT_LEAST_2_OBJECTS = "Must glue at least 2 objects.";
  this.OBJECT_NR_DOES_NOT_EXIST = "Object #@@1 does not exist.";
  this.OBJECT_IN_MOTION = "Object #@@1 is in motion. Use switchView command first to reset the animation.";
  this.OBJECTS_GLUED_TOGETHER = "Objects glued together.";
  this.OBJECT_DOES_NOT_HAVE_A_PIVOT = "Object does not have a pivot point.";
  this.PIVOT_UNSET = "Pivot unset.";
  this.INVALID_SYNTAX = "Invalid syntax.";
  this.OBJECT_DETACHED = "Object detached.";
  this.POINT_MARKED = "Point marked.";
  this.NO_SUCH_POINT = "No such point.";
  this.POINT_UNMARKED = "Point unmarked.";
  this.NO_MARKED_POINTS = "No marked points.";
  this.NO_MARKED_POINTS_FOUND = "No marked points found.";
  this.PROJECT_BUILDED = "Project builded. Deployment folder is: @@1";
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
  this.SHININESS = "Shininess: @@1";
  this.MAX_NUMBER_OF_SEGMENTS_ALLOWED = "Maximum number of allowed segments is @@1.";
  this.NO_OBJECTS_SELECTED_TO_ADJUST_SHININESS = "No objects selected to adjust shininess.";
  this.HEIGHT_MAP_SCALE = "Height map scale: @@1";
  this.NO_HEIGHT_TEXTURE_MAPPED_TO_THIS_OBJECT = "No height texture mapped to this object.";
  this.NO_OBJECTS_SELECTED_TO_ADJUST_HEIGHT_MAP_SCALE = "No objects selected to adjust height map scale.";
  this.HEIGHT_MAP_BIAS = "Height map bias: @@1";
  this.GUI_IS_ALREADY_OPEN_FOR_THIS_OBJECT = "GUI is already open for this object.";
  this.PRESS_DONE_BUTTON_TO = "Press Done button to quit FPS weapon alignment mode.";
  this.AFTER_PS_CREATION = "Press Done button to create particle system.\nUse mouse wheel/mouse drag to rotate.\nUp/Down or W/S (Z/S - French keyboard) to zoom in/out.";
  this.AFTER_MUZZLE_FLASH_CREATION = "Press Done button to create muzzle flash.\nUse mouse wheel/mouse drag to rotate.\nUp/Down or W/S (Z/S - French keyboard) to zoom in/out.";
  this.AFTER_TEXTURE_PACK_CREATION = "Press Done button to create texture pack.\nUse mouse wheel/mouse drag to rotate.\nUp/Down or W/S (Z/S - French keyboard) to zoom in/out.";
  this.AFTER_SKYBOX_CREATION = "Press Done button to create skybox.\nUse mouse wheel/mouse drag to rotate.";
  this.AFTER_FONT_CREATION = "Press Done button to create font.\nUp/Down or W/S (Z/S - French keyboard) to zoom in/out.";
  this.AFTER_FOG_CREATION = "Press Done button to close.";
  this.AFTER_CROSSHAIR_CREATION = "Press Done button to create crosshair.";
  this.AFTER_SCRIPT_CREATION = "Press Done button to close.";
  this.AFTER_ANIMATION_CREATION = "Press Done button to close.\nUse mouse wheel/mouse drag to rotate.\nUp/Down or W/S (Z/S - French keyboard) to zoom in/out.";
  this.AFTER_ANIMATION_CREATION_FPS_WEAPON = "Press Done button close.";
  this.ANIMATION_NAME_MUST_BE_A_NON_EMPTY_STRING = "Animation name must be a non empty string.";
  this.ANIMATION_NAME_MUST_BE_UNIQUE = "Animation name must be unique.";
  this.DONE = "Done.";
  this.GS_CREATION_ERROR_1 = "sizeX and sizeZ must be greater than zero.";
  this.GS_CREATION_ERROR_2 = "sizeX is not multiple of cellSize";
  this.GS_CREATION_ERROR_3 = "sizeZ is not multiple of cellSize";
  this.GS_CREATION_ERROR_4 = "name must be unique.";
  this.GS_CREATION_ERROR_5 = "cellSize is less than minimum size allowed ("+MIN_CELLSIZE_ALLOWED+")";
  this.GS_CREATION_ERROR_6 = "Too many grids in a scene. Maximum "+MAX_GRIDS_ALLOWED+" allowed.";
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
  this.AREA_CONFIGURATIONS_ARE_ALREADY_STOPPED = "Area configurations handling is already stopped.";
  this.AREA_CONFIGURATIONS_ARE_ALREADY_STARTED = "Area configurations handling is already started.";
  this.AREA_CONFIGURATIONS_ARE_STOPPED = "Area configurations handling is stopped.";
  this.AREA_CONFIGURATIONS_ARE_STARTED = "Area configurations handling is started.";
  this.THIS_SCRIPT_IS_UPLOADED = "This script is uploaded from the local file system. Make your modifications locally."
  this.PREPARING_OBJECT = "Creating KTree of @@1";
  this.OBJECT_MUST_BE_IN_THE_SAME_GRIDSYSTEM = "Glued objects must be in the same grid system.";
  this.CREATING_X_GRIDS = "Creating @@1 grids.";
  this.TEXTURE_REPEAT_U_MUST_BE_A_POSITIVE_NUMBER = "repeatU must be a positive number.";
  this.TEXTURE_REPEAT_V_MUST_BE_A_POSITIVE_NUMBER = "repeatV must be a positive number.";
  this.WORKS_ONLY_IN_DESIGN_MODE = "This command works only in Design mode.";
  this.INVALID_CHARACTER_IN_OBJECT_NAME = "Invalid character in object name.";
  this.INVALID_CHARACTER_IN_NAME = "Invalid character in name.";
  this.PARAMETER_MUST_BE_ON_OFF = "Parameter must be on or off.";
  this.FOR_MOBILE = "Application is @@1 for mobile devices.";
  this.CANNOT_SIMPLIFY_PHYISCS_DYNAMIC_OBJECTS = "Cannot simplify physics of dynamic objects.";
  this.CANNOT_SET_MASS_FOR_SIMPLIFIED_OBJECTS = "Cannot set mass for objects with simplified physics.";
  this.ALREADY_FOR_MOBILE = "Application is already @@1 for mobile devices.";
  this.ENABLED = "enabled";
  this.OBJECT_HAS_CHILD_ROTATION_SET = "Object has at least a child that has been rotated. Simplify physics before any rotation.";
  this.OBJECT_HAS_ROTATION_SET = "Object has been rotated. Simplify physics before any rotation.";
  this.DISABLED = "disabled";
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
  this.RESOLUTION_SET = "Resolution set.";
  this.IS_NOT_A_NUMBER = "@@1 is not a number.";
  this.IS_NOT_POWER_OF_TWO = "@@1 is not power of two.";
  this.ATLAS_TEXTURE_SIZE_SET = "Atlas texture size set.";
  this.TEXTURE_RESCALED = "Texture rescaled and saved.";
  this.TEXTURE_SIZE_TOO_SMALL = "Texture size becomes too small after being rescaled.";
  this.TEXTURE_PACK_NAME_MUST_BE_UNIQUE = "Texture pack name must be unique.";
  this.TEXTURE_PACK_RESCALED = "Texture pack rescaled.";
  this.TEXTURE_USED_IN_A_PARTICLE_SYSTEM = "Texture used in a particle system [@@1]. Cannot delete.";
  this.TEXTURE_USED_IN_AN_OBJECT = "Texture used in object [@@1]. Cannot delete.";
  this.TEXTURE_PACK_USED_IN_AN_OBJECT = "Texture pack used in object [@@1]. Cannot delete.";
  this.TEXTURE_PACK_USED_IN_A_PARTICLE_SYSTEM = "Texture pack used in a particle system [@@1]. Cannot delete.";
  this.TEXTURE_PACK_USED_IN_A_CROSSHAIR = "Texture pack used in a crosshair [@@1]. Cannot delete.";
  this.MATERIAL_USED_IN_AN_OBJECT = "Material used in an object [@@1]. Cannot delete.";
  this.NO_SUCH_IMAGE = "No such image.";
  this.IMAGE_DESTROYED = "Image destroyed.";
  this.IMAGE_USED_IN_TEXTURE = "Image used in texture [@@1]. Cannot delete.";
  this.RESOLUTION_MUST_BE_BETWEEN = "Resolution must be between ]0,1]";
  this.MAX_CHAR_SIZE_MUST_BE_BETWEEN = "maxCharacterSize must be between [1,@@1].";
  this.BLENDING_MODE_SET_TO = "Blending mode set to @@1.";
  this.RAYCASTER_STEP_AMOUNT_SET_TO = "Raycaster step amount set to @@1.";
  this.KEYBOARD_BUFFER_RESET = "Keyboard buffer reset.";
  this.BLENDING_MODE_MUST_BE_ONE_OF = "Blending mode should be one of NO_BLENDING, NORMAL_BLENDING, ADDITIVE_BLENDING, SUBTRACTIVE_BLENDING and MULTIPLY_BLENDING.";
  this.MUST_BE_GREATER_THAN = "@@1 must be greater than @@2.";
  this.OCTREE_LIMIT_SET = "World limit set.";
  this.OCTREE_SEGMENTS_SET = "Octree segments set.";
  this.BIN_SIZE_MUST_BE_A_NUMBER = "Bin size must be a number.";
  this.PARAMETERS_MUST_BE_DIVISABLE_BY = "Parameters must be divisable by @@1.";
  this.WORLD_LIMITS_MUST_BE_DIVISABLE_BY_BIN_SIZE = "World limits must be divisable by bin size.";
  this.GRID_SYSTEM_SIZES_MUST_BE_DIVISABLE_BY_BIN_SIZE = "Grid system sizes must be divisable by bin size.";
  this.BIN_SIZE_SET = "Bin size set.";
  this.WORLD_LIMITS = "World limits";
  this.BIN_SIZE = "Bin size";
  this.RAYCASTER_STEP_AMOUNT = "Raycaster step amount";
  this.OBJECT_COPIED = "Object copied.";
  this.MIN = "Min";
  this.MAX = "Max";
  this.THIS_TEXT_IS_ALLOCATED_FOR = "This text is allocated for @@1 characters maximum.";
  this.AREA_CREATED = "Area created.";
  this.AREA_HEIGHT_MUST_BE_DIVISABLE = "Area height must be divisable by grid size.";
  this.NO_AREAS_CREATED = "No areas created.";
  this.AREA_CONFIGURATION_WINDOW_IS_ALREADY_VISIBLE = "Area configuration window is already visible.";
  this.AREA_CONFIGURATION_WINDOW_IS_ALREADY_HIDDEN = "Area configuration window is already hidden.";
  this.AREAS_ARE_VISIBLE = "Areas are visible.";
  this.AREAS_ARE_INVISIBLE = "Areas are invisible.";
  this.AREA_INTERSECTS_WITH_OTHER_AREAS = "Area collapses with other areas.";
  this.NO_SUCH_AREA = "No such area.";
  this.REFRESHING_RAYCASTER = "Refreshing raycaster.";
  this.AREA_DESTROYED = "Area destroyed.";
  this.MAX_VIEWPORT_SET = "Max viewport set. Viewport changes can be observed in preview mode.";
  this.ASPECT_FIXED = "Aspect fixed to @@1. Viewport changes can be observed in preview mode.";
  this.ASPECT_UNFIXED = "Aspect unfixed.";
  this.FRAME_DROP_ALREADY = "There is already a frame-drop recording process working.";
  this.FRAME_DROP_STARTED = "Frame-drop recording started.";
  this.DISPLACEMENT_MAP_APPLIED = "Displacement map applied.";
  this.CONFIGURING_AREA = "Configuring area.";
  this.ROYGBIV_SCRIPTING_API_GETOBJECT = "Returns the object or glued object having the name given as the parameter, or undefined if no such object or glued object is found.";
  this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEM = "Returns the particle system having the name given as the parameter, or zero if no such particle system is found.";
  this.ROYGBIV_SCRIPTING_API_GETCHILDOBJECT = "Returns a child object having the name given as the second parameter of a glued object given as the first parameter,\nor zero if no such object is found.";
  this.ROYGBIV_SCRIPTING_API_GETRANDOMCOLOR = "Returns the HTML name of a random color.";
  this.ROYGBIV_SCRIPTING_API_HIDE = "Hides an object or a glued object, removes it from the scene. Does nothing if the object is already hidden.\nThe additional keepPhysics parameter can be used in order to hide only the graphical representation of the object but\nkeep its physicsal body. The default value of keepPhysics is false.";
  this.ROYGBIV_SCRIPTING_API_SHOW = "Makes a hidden object or glued object visible. Does nothing if the object is already visible.";
  this.ROYGBIV_SCRIPTING_API_VECTOR = "Creates a new vector from x, y and z coordinates.";
  this.ROYGBIV_SCRIPTING_API_DISTANCE = "Returns the distance between two vectors.";
  this.ROYGBIV_SCRIPTING_API_SUB = "Returns the substraction of two vectors.";
  this.ROYGBIV_SCRIPTING_API_ADD = "Returns the summation of two vectors.";
  this.ROYGBIV_SCRIPTING_API_MOVETOWARDS = "Moves vec1 towards vec2 by given amount and returns the new position of vec1. If amount is 1, vec1 goes all the way towards vec2.";
  this.ROYGBIV_SCRIPTING_API_APPLYFORCE = "Applies a physical force to an object or a glued object from a given point.";
  this.ROYGBIV_SCRIPTING_API_ROTATE = "Rotates an object or a glued object around a given world axis by given radians. The parameter axis must be one of x, y or z.\nObjects are rotated around their own centers, so their positions do not change when rotated using this function.";
  this.ROYGBIV_SCRIPTING_API_ROTATEAROUNDXYZ = "Rotates an object or a glued object around the given (x, y, z). Unlike the rotate function, the positions of the objects\ncan change when rotated using this function.";
  this.ROYGBIV_SCRIPTING_API_SETPOSITION = "Puts an object or glued object to the specified (x, y, z) coordinate.";
  this.ROYGBIV_SCRIPTING_API_COLOR = "Creates a new color object from the given HTML color name.";
  this.ROYGBIV_SCRIPTING_API_SETMASS = "Sets the mass property of an object or a glued object. Objects are considered dynamic if and only if their mass is greater than zero.";
  this.ROYGBIV_SCRIPTING_API_TRANSLATE = "Translates an object or glued object on the given axis by the given amount.\nAxis must be one of x, y or z.";
  this.ROYGBIV_SCRIPTING_API_GETPOSITION = "Returns the (x, y, z) coordinates of an object, glued object or a particle system.\nIf a specific axis is specified, only the position on the specified axis is returned.";
  this.ROYGBIV_SCRIPTING_API_OPACITY = "Increases/decreases the opacity of given object.";
  this.ROYGBIV_SCRIPTING_API_GETOPACITY = "Returns the opacity of given object.";
  this.ROYGBIV_SCRIPTING_API_SETCOLLISIONLISTENER = "Sets a collision listener for an object, glued object or a particle system."+
                                                    "Callback function given as the second parameter is\nfired with a CollisionInfo instance when the sourceObject is collided with other objects or glued objects of the scene.\n"+
                                                    "The additional timeOffset parameter can be used for particle systems to pre-calculate future collisions. This can help to\nprevent visual errors of collisions of rather fast particle systems.";
  this.ROYGBIV_SCRIPTING_API_REMOVECOLLISIONLISTENER = "Removes collision listeners of an object, glued object or a particle system.";
  this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMROTATION = "Sets the rotation of a particle system around given axis.";
  this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMQUATERNION = "Sets the quaternion of given particle system.";
  this.ROYGBIV_SCRIPTING_API_GETMARKEDPOSITION = "Returns (x,y,z) coordinates of a point marked using the mark command.";
  this.ROYGBIV_SCRIPTING_API_SETEXPIRELISTENER = "Sets an expiration listener for a particle system. The parameter callbackFunction is executed when sourceObject is expired.\nThe name of the particle system is passed to the callbackFunction as a parameter.";
  this.ROYGBIV_SCRIPTING_API_REMOVEEXPIRELISTENER = "Removes the expiration listener function of a particle system.";
  this.ROYGBIV_SCRIPTING_API_NORMALIZEVECTOR = "Normalizes the vector given in the parameter. Note that this function modifies directly the parameter and returns nothing.";
  this.ROYGBIV_SCRIPTING_API_COMPUTEQUATERNIONFROMVECTORS = "Returns the quaternion between two vectors.";
  this.ROYGBIV_SCRIPTING_API_MULTIPLYSCALAR = "Multiplies a vector by a scalar.";
  this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEMVELOCITYATTIME = "Calcualtes and returns the velocity vector of a particle system at given time. For particles with circular motion, this function returns\nthe angular velocity at given time.";
  this.ROYGBIV_SCRIPTING_API_STOPPARTICLESYSTEM = "Stops the motion of a particle system. This can be useful for smooth after collision effects of particle systems as it lets particles\nto dissapear smoothly. The particle system is killed after stopDuration seconds.If particle systems have collision listener attached,\nthe collision listener needs to be reset when starting the particle system after stopping.";
  this.ROYGBIV_SCRIPTING_API_STARTPARTICLESYSTEM = "Starts a particle system after its creation. Configurations are:\n"+
                                                     "particleSystem: The particle system to start. (mandatory)\n"+
                                                     "startPosition: The initial position vector of the particle system. (optional)\n"+
                                                     "startVelocity: The initial velocity vector of the particle system. (optional)\n"+
                                                     "startAcceleration: The initial acceleration vector of the particle system. (optional)\n"+
                                                     "startQuaternion: The initial quaternion of the particle system. Use ROYGBIV.computeQuaternionFromVectors (optional)";
  this.ROYGBIV_SCRIPTING_API_HIDEPARTICLESYSTEM = "Makes a particle system invisible.";
  this.ROYGBIV_SCRIPTING_API_GETCAMERADIRECTION = "Returns the direction vector of the camera.";
  this.ROYGBIV_SCRIPTING_API_GETCAMERAPOSITION = "Returns the position of the camera.";
  this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEMPOOL = "Finds a particle system pool by name and returns it.";
  this.ROYGBIV_SCRIPTING_API_GETPARTICLESYSTEMFROMPOOL = "Returns an available particle system from the pool, or false if there is not an available particle system inside the pool.\nThe particle systems become available when hidden or expired.";
  this.ROYGBIV_SCRIPTING_API_SETVECTOR = "Set the x, y, z components of a vector.";
  this.ROYGBIV_SCRIPTING_API_QUATERNION = "Returns a new THREE.Quaternion instance.";
  this.ROYGBIV_SCRIPTING_API_FADEAWAY = "Makes the particles of given particle system smaller on each frame. Greater the coefficient, faster the particles fade away.\nThis can be used for smoke like particle systems to make them dissapear smoothly.";
   this.ROYGBIV_SCRIPTING_API_SELECTCROSSHAIR = "Selects a crosshair. Only the selected crosshair is visible on the screen.";
   this.ROYGBIV_SCRIPTING_API_CHANGECROSSHAIRCOLOR = "Changes the color of the selected crosshair.";
   this.ROYGBIV_SCRIPTING_API_HIDECROSSHAIR = "Destroys the selected crosshair. selectCrosshair function should be used after this function\nin order to put a crosshair on the screen.";
   this.ROYGBIV_SCRIPTING_API_STARTCROSSHAIRROTATION = "Starts rotation effect of the selected crosshair.";
   this.ROYGBIV_SCRIPTING_API_STOPCROSSHAIRROTATION = "Stops rotation effect of the selected crosshair.";
   this.ROYGBIV_SCRIPTING_API_PAUSECROSSHAIRROTATION = "Pauses rotation effect of the selected crosshair. startCrosshairRotation function can be used to continue the rotation effect.";
   this.ROYGBIV_SCRIPTING_API_EXPANDCROSSHAIR = "Expands a crosshair. This can be used while shooting or walking for fps games. The crosshair expands by delta while\nits size is less than targetSize on each frame. This function is designed to be called inside onmousedown or onkeydown like events.";
   this.ROYGBIV_SCRIPTING_API_SHRINKCROSSHAIR = "Shrinks a crosshair. This can be used after calling the expandCrosshair function. The crosshair shrinks by delta while its size is\ngreater than its initial size. This function is designed to be called inside onmouseup or onkeyup like events.";
   this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMPOSITION = "Sets the position of a particle system. This function is designed for magic circle like particle systems which may follow players.\nThis function should not be used for particle systems with collision callbacks or particle systems with defined motions in general.";
   this.ROYGBIV_SCRIPTING_API_STARTMOTIONBLUR = "Starts the motion blur effect of an object.";
   this.ROYGBIV_SCRIPTING_API_STOPMOTIONBLUR = "Stops the motion blur effect of an object. The effect can be restarted using the startMotionBlur command.";
   this.ROYGBIV_SCRIPTING_API_SETOBJECTVELOCITY = "Sets the velocity of an object or a glued object. The object must be a dynamic object (mass > 0) in order to have a velocity.";
   this.ROYGBIV_SCRIPTING_API_SETOBJECTCLICKLISTENER = "Sets a click listener for an object or an object group. The callbackFunction is executed with\nx, y, z coordinates of the clicked point. The callbackFunction is bound to object (this = object inside the function).";
   this.ROYGBIV_SCRIPTING_API_REMOVEOBJECTCLICKLISTENER = "Removes the click listener of an object or an object group.";
   this.ROYGBIV_SCRIPTING_API_SETOBJECTCOLOR = "Modifies the color and alpha value of an object or an object group.";
   this.ROYGBIV_SCRIPTING_API_RESETOBJECTCOLOR = "Resets the color and alpha value of an object or an object group.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENCLICKLISTENER = "Sets a click listener for the screen. The callbackFunction is executed with x, y coordinates when clicked on the screen.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENCLICKLISTENER = "Removes the click listener of screen.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENMOUSEDOWNLISTENER = "Sets a mouse down listener for screen. The callbackFunction is executed with x, y coordinates when mouse-downed on the screen.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENMOUSEDOWNLISTENER = "Removes the mouse down listener of screen.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENMOUSEUPLISTENER = "Sets mouse up listener for screen. The callbackFunction is executed with x, y coordinates when mouse-upped on the screen.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENMOUSEUPLISTENER = "Removes mouse up listener for screen.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENMOUSEMOVELISTENER = "Sets mouse move listener for screen. The callbackFunction is executed with x, y coordinates and dX, dY values when\nmouse moves on the screen.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENMOUSEMOVELISTENER = "Removes mouse move listener for screen.";
   this.ROYGBIV_SCRIPTING_API_REQUESTPOINTERLOCK = "Requests pointer lock from window on the next click.";
   this.ROYGBIV_SCRIPTING_API_CONVERTEULERTODEGREES = "Returns the degree equivalent of an Euler angle.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENPOINTERLOCKCHANGELISTENER = "Sets a callback function for Pointer Lock API status changes. The callbackFunction is executed with isPointerLocked parameter.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENPOINTERLOCKCHANGELISTENER = "Removes the Pointer Lock change listener for the screen.";
   this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMPOOLCONSUMEDLISTENER = "Sets a listener for particle system pool consumption. The callbackFunction is executed wheren there is no available\nparticle system left inside the pool.";
   this.ROYGBIV_SCRIPTING_API_REMOVEPARTICLESYSTEMPOOLCONSUMEDLISTENER = "Removes the consumption listener of a particle system pool.";
   this.ROYGBIV_SCRIPTING_API_SETPARTICLESYSTEMPOOLAVAILABLELISTENER = "Sets an availability listener for a particle system pool. The callbackFunction is executed when there is at least\none available particle system inside the pool again.";
   this.ROYGBIV_SCRIPTING_API_REMOVEPARTICLESYSTEMPOOLAVAILABLELISTENER = "Removes the availablity listener for a particle system pool.";
   this.ROYGBIV_SCRIPTING_API_ISKEYPRESSED = "Returns whether the given key is pressed or not. See the keyCodeToChar variable for possible key names.";
   this.ROYGBIV_SCRIPTING_API_SETCAMERAPOSITION = "Sets the position of the camera.";
   this.ROYGBIV_SCRIPTING_API_LOOKAT = "Makes the camera look at specific position.";
   this.ROYGBIV_SCRIPTING_API_APPLYAXISANGLE = "Rotates the vector around an axis by given angle.";
   this.ROYGBIV_SCRIPTING_API_TRACKOBJECTPOSITION = "Makes sourceObject keep its relative position to targetObject.";
   this.ROYGBIV_SCRIPTING_API_UNTRACKOBJECTPOSITION = "Stops tracking an objects position for an object.";
   this.ROYGBIV_SCRIPTING_API_CREATEROTATIONPIVOT = "Creates and returns a rotation pivot for an object. This function is not optimized for the runtime. Use this function before\nsetRotationPivot API on initialization. Instead of ROYGBIV.rotate API that works on world axes, this function may be used with\n0 offset parameters to achieve local rotation for objects.";
   this.ROYGBIV_SCRIPTING_API_SETROTATIONPIVOT = "Sets a rotation pivot for an object created with createRotationPivot API.";
   this.ROYGBIV_SCRIPTING_API_UNSETROTATIONPIVOT = "Unsets a rotation pivot point for an object set with setRotationPivot API.";
   this.ROYGBIV_SCRIPTING_API_ROTATECAMERA = "Rotates the camera around its axis by given radians.";
   this.ROYGBIV_SCRIPTING_API_TRANSLATECAMERA = "Translates the camera along given axis by given amount.";
   this.ROYGBIV_SCRIPTING_API_REQUESTFULLSCREEN = "Goes to full screen mode. on the next mouse click. Does nothing if the screen is already in full screen mode.";
   this.ROYGBIV_SCRIPTING_API_SETFULLSCREENCHANGECALLBACKFUNCTION = "Sets a callback function for fullscreen change API. The callbackFunction is executed with isFullScreenOn\nboolean parameter when the fullscreen status is changed.";
   this.ROYGBIV_SCRIPTING_API_REMOVEFULLSCREENCHANGECALLBACKFUNCTION = "Removes the fullscreen change listener.";
   this.ROYGBIV_SCRIPTING_API_ISMOUSEDOWN = "Returns true if the mouse is pressed, false otherwise.";
   this.ROYGBIV_SCRIPTING_API_INTERSECTIONTEST = "Finds the first intersected object on a ray. The onComplete callback function is executed with x, y, z and objectName parameters.\nIf there's no intersection, the objectName is set to null. If the web workers not supported, the onComplete is executed immediately."
   this.ROYGBIV_SCRIPTING_API_GETENDPOINT = "Gets an end point of an object. The axis may be +x,-x,+y,-y,+z or -z. Note that object groups do not support this function\nbut child objects do. This function may be useful in cases where for example a particle system needs to be started from\nthe tip point of an object.";
   this.ROYGBIV_SCRIPTING_API_ISMOBILE = "Returns if the current client is a mobile client.";
   this.ROYGBIV_SCRIPTING_API_LERP = "Linearly interpolate between vector1 and vector2. The result is vector1 if amount = 0 and vector2 if amount = 1.";
   this.ROYGBIV_SCRIPTING_API_RESETOBJECTVELOCITY = "Resets the velocity and angular velocity of an object.";
   this.ROYGBIV_SCRIPTING_API_SETFPSDROPCALLBACKFUNCTION = "Sets a callback function for FPS drops. The callbackFunction is executed with dropAmount parameter if the FPS is\nless than 60 for given second. The dropAmount is calculated using this formula: (60 - [current_fps])";
   this.ROYGBIV_SCRIPTING_API_REMOVEFPSDROPCALLBACKFUNCTION = "Removes the callback function for FPS drops.";
   this.ROYGBIV_SCRIPTING_API_SETPERFORMANCEDROPCALLBACKFUNCTION = "Sets a callback function for performance drops. The callbackFunction is executed if the FPS is under [minFPS] for [seconds] seconds.\nThe callbackFunction is automatically removed after the execution, so use this function again if needed after\nthe execution of the callbackFunction.";
   this.ROYGBIV_SCRIPTING_API_REMOVEPERFORMANCEDROPCALLBACKFUNCTION = "Removes the callback function for performance drops.";
   this.ROYGBIV_SCRIPTING_API_GETVIEWPORT = "Returns the current viewport object having startX, startY, width and height parameters.\nDo not modify the values of the returned object.";
   this.ROYGBIV_SCRIPTING_API_SETUSERINACTIVITYCALLBACKFUNCTION = "Sets a callback function for user inactivity. The callbackFunction is executed if the user does not move or press the mouse or\npress a key for more than maxTimeInSeconds seconds. The callbackFunction is reset after the execution so use this function again\nto create a new inactivity listener.";
   this.ROYGBIV_SCRIPTING_API_REMOVEUSERINACTIVITYCALLBACKFUNCTION = "Removes the user inactivity callback function.";
   this.ROYGBIV_SCRIPTING_API_PAUSE = "Pauses/unpauses rendering. Note that once the rendering is paused the scripts also pause so in order to unpause the rendering,\nuse callback functions such as ROYGBIV.setScreenClickListener or ROYGBIV.setScreenPointerLockChangeListener.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENKEYDOWNLISTENER = "Sets a keydown listener. The callbackFunction is executed with the pressedChar parameter. See the values of keyCodeToChar\nvariable for possible pressedChar parameters.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENKEYDOWNLISTENER = "Removes the keydown listener.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENKEYUPLISTENER = "Sets a keyup listener. The callbackFunction is executed with the uppedChar parameter. See the values of keyCodeToChar\nvariable for possible uppedChar parameters.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENKEYUPLISTENER = "Removes the keyup listener.";
   this.ROYGBIV_SCRIPTING_API_GETTEXT = "Returns a text object or 0 if the text does not exist.";
   this.ROYGBIV_SCRIPTING_API_SETTEXT = "Sets a text to a text object.";
   this.ROYGBIV_SCRIPTING_API_SETTEXTCOLOR = "Sets the color of a text. colorName can be a color name like red or an hex string like #afef54.";
   this.ROYGBIV_SCRIPTING_API_SETTEXTALPHA = "Sets the alpha of a text.";
   this.ROYGBIV_SCRIPTING_API_SETTEXTPOSITION = "Sets the position of a text object. If text is 2D only x and y parameters are necessary representing the marginX and marginY.";
   this.ROYGBIV_SCRIPTING_API_SETTEXTBACKGROUND = "Sets the background color/alpha of a text object.";
   this.ROYGBIV_SCRIPTING_API_REMOVETEXTBACKGROUND = "Removes the background of a text object.";
   this.ROYGBIV_SCRIPTING_API_ONTEXTCLICK = "Sets a click listener for a text object. The callbackFunction is executed with textName parameter when the text object is clicked.";
   this.ROYGBIV_SCRIPTING_API_REMOVETEXTCLICKLISTENER = "Removes the click listener of a text object.";
   this.ROYGBIV_SCRIPTING_API_SETTEXTCENTERPOSITION = "Puts the center of the given text object to given x, y, z coordinates.";
   this.ROYGBIV_SCRIPTING_API_HIDETEXT = "Makes the given text object invisible. Does nothing if the text is already invisible.";
   this.ROYGBIV_SCRIPTING_API_SHOWTEXT = "Makes the given text object visible. Does nothing if the text is already visible.";
   this.ROYGBIV_SCRIPTING_API_GETFPS = "Returns the current FPS";
   this.ROYGBIV_SCRIPTING_API_EXECUTEFOREACHOBJECT = "Executes the given function for each object and object group. The func paremter is executed with\nobject and objectName parameters.";
   this.ROYGBIV_SCRIPTING_API_GETRANDOMINTEGER = "Returns a random integer in range [minInclusive, maxInclusive]";
   this.ROYGBIV_SCRIPTING_API_ISANYFINGERTOUCHING = "For mobile devices, returns true if there is any finger touching to the screen.";
   this.ROYGBIV_SCRIPTING_API_GETCURRENTTOUCHCOUNT = "For mobile devices, returns the amount of fingers touching to the screen.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENMOUSEWHEELLISTENER = "Sets a mouse wheel listener. The callbackFunction is executed with deltaX and deltaY parameters when a mousewheel event is triggered.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENMOUSEWHEELLISTENER = "Removes the listener for mousewheel events.";
   this.ROYGBIV_SCRIPTING_API_SETSCREENPINCHLISTENER = "For mobile devices, sets a pinch zoom gesture listener. The callbackFunction is executed with delta parameter\nthat represents the variation of the distance between two fingers.";
   this.ROYGBIV_SCRIPTING_API_REMOVESCREENPINCHLISTENER = "Removes the listener for pinch gesture.";
   this.ROYGBIV_SCRIPTING_API_SETOBJECTMOUSEOVERLISTENER = "Sets a mouseover listener for an object or an object group. The callbackFunction is executed with x, y, z coordinates of mouse.\nThe callbackFunction is bound to object (this = object inside the function).";
   this.ROYGBIV_SCRIPTING_API_REMOVEOBJECTMOUSEOVERLISTENER = "Removes the mouseover listener of an object or an object group.";
   this.ROYGBIV_SCRIPTING_API_SETOBJECTMOUSEOUTLISTENER = "Sets a mouseout listener for an object or an object group. The callbackFunction is bound to object (this = object inside the function).";
   this.ROYGBIV_SCRIPTING_API_REMOVEOBJECTMOUSEOUTLISTENER = "Removes the mouseout listener of an object or an object group.";
   this.ROYGBIV_SCRIPTING_API_ONTEXTMOUSEOVER = "Sets a mouseover listener for a text. The callbackFunction is bound to text (this = text inside the function).";
   this.ROYGBIV_SCRIPTING_API_REMOVETEXTMOUSEOVERLISTENER = "Removes the mouseover listener of a text.";
   this.ROYGBIV_SCRIPTING_API_ONTEXTMOUSEOUT = "Sets a mouseout listener for a text. The callbackFunction is bound to text (this = text inside the function).";
   this.ROYGBIV_SCRIPTING_API_REMOVETEXTMOUSEOUTLISTENER = "Removes the mouseout listener of a text.";
   this.ROYGBIV_SCRIPTING_API_ONOBJECTPOSITIONTHRESHOLDEXCEEDED = "Sets a listener for an object detecting the position threshold passage for given axis. If controlMode = 1 the callbackFunction\nis executed when object.position[axis] > threshold, if controlMode = 2 the callbackFunction is executed when\nobject.position[axis] < threshold. The callbackFunction is bound to object (this = object inside the function)."+
                                                                  "This API\nmay be used to restart position of objects that went out of bounds of the scene by falling down etc.";
   this.ROYGBIV_SCRIPTING_API_REMOVEOBJECTPOSITIONTHRESHOLDEXCEEDEDLISTENER = "Removes the position threshold passage listener for an object. Does nothing if the object does not have such listener.";
   this.ROYGBIV_SCRIPTING_API_CREATEFREECONTROL = "Creates a new FreeControl implementation where the camera can freely move inside the scene for both desktop and mobile devices.\nThe controls are:\n" +
                                                  "WSAD or ZQSD (French keyboard): Translate on plane XZ\n" +
                                                  "E - Space: Translate on axis Y\n" +
                                                  "Arrow keys or touch (mobile): Look around\n" +
                                                  "Finger pinch (mobile) - Mouse wheel (desktop): Translate on axis Z\n"+
                                                  "The configurations are:\n"+
                                                  "rotationYDelta (optional): Camera rotation amount for left-right keys. Default is 0.07.\n"+
                                                  "rotationXDelta (optional): Camera rotation amount for up-down keys. Default is 0.07.\n"+
                                                  "translateZAmount (optional): Translation amount on Z axis for WS or ZS keys or finger pinch events. Default is 3.\n"+
                                                  "translateXAmount (optional): Translation amount on X axis for DA or DQ keys. Default is 3.\n"+
                                                  "translateYAmount (optional): Translation amount on Y axis for E-Space keys. Default is 3.\n"+
                                                  "mouseWheelSpeed (optional): Translation speed for mousewheel zoom in/out. Default is 1.\n"+
                                                  "swipeSpeed (optional): Rotation speed for look with touch events on mobile. Default is 0.002.\n"+
                                                  "mouseDragSpeed (optional): Rotation speed for mouse drag events on desktop devices. Default is 15.\n"+
                                                  "requestFullScreen (optional): If true, fullscreen mode is requested automatically. Default is false.";
  this.ROYGBIV_SCRIPTING_API_CREATECUSTOMCONTROL = "Creates a CustomControl implementation. This API may be used to create custom controls by filling the related event handlers.\nParameters are:\n"+
                                                 "onClick (optional): Function to be executed with the click event when the user clicks. Default value is noop.\n"+
                                                 "onTap (optional): Function to be executed with the touch event when the user taps (mobile). Default value is noop.\n"+
                                                 "onSwipe (optional): Function to be executed with diffX and diffY parameters when the user moves their finger on the screen (mobile).\nDefault value is noop.\n"+
                                                 "onPinch (optional): Function to be executed with diff parameter when the user performs a pinch zoom (mobile). Default value is noop.\n"+
                                                 "onMouseWheel (optional): Function to be executed with the mouse wheel event when the user performs a mouse wheel. Default value is noop.\n"+
                                                 "onMouseMove (optional): Function to be executed with the mouse move event when the user performs a mouse move. Default value is noop.\n"+
                                                 "onMouseDown (optional): Function to be executed with the mouse down event when the user performs a mouse down. Default vaue is noop.\n"+
                                                 "onMouseUp (optional): Function to be executed with the mouse up event when the user performs a mouse up. Default value is noop.\n"+
                                                 "onTouchStart (optional): Function to be executed with the TouchEvent when the user performs a touch start. Default value is noop.\n"+
                                                 "onTouchMove (optional): Function to be executed with the TouchEvent when the user performs a touch move. Default value is noop.\n"+
                                                 "onTouchEnd (optional): Function to be executed with the TouchEvent when the user performs a touch end. Default value is noop.\n"+
                                                 "onResize (optional): Function to be executed when the screen is resized. Default value is noop.\n"+
                                                 "onFullScreenChange (optional): Function to be executed with the isFullScreen parameter when the fullscreen status of the screen is\nchanged. Default value is noop.\n"+
                                                 "onDrag (optional): Function to be executed with x, y, movementX, movementY parameters when the user performs a moue drag operation.\nDefault value is noop.\n"+
                                                 "onUpdate (optional): Function to be executed on each frame. Default value is noop.";
 this.ROYGBIV_SCRIPTING_API_SETACTIVECONTROL = "Sets the active control.";
 this.ROYGBIV_SCRIPTING_API_CREATEFPSCONTROL = "Creates a new FPSControls object to be used in First Person Shooter games for both desktop and mobile devices. FPSControls automatically\nhandles the PointerLock as well. The controls are:\n"+
                                              "For desktop:\n"+
                                              "WSAD/ZQSD (French keyboard) / Arrow Keys: Move\n"+
                                              "Mouse: Look\n"+
                                              "Click: Shoot\n"+
                                              "Space: Jump\n"+
                                              "For mobile:\n"+
                                              "Left side of the screen: Move\n"+
                                              "Right side of the screen: Look around\n"+
                                              "Tap on the right side of the screen: Jump\n"+
                                              "For mobile devices controls are automatically paused for portrait orientation.\n"+
                                              "Configurations are:\n"+
                                              "playerBodyObject (mandatory): A dummy sphere type object to physically represent the player. The camera is placed on the\ncenter of the playerBodyObject. The playerBodyObject is graphically hidden when the FPSControls object is activated,\nshown again when deactivated. The playerBodyObject must be a dynamic object (mass > 0) and must be marked as changeable in order\nto be used by FPSControls class.\n"+
                                              "mouseSpeed (optional): The speed of mouse based camera look-around event. Default value is 0.002.\n"+
                                              "touchLookSpeed (optional): The speed of touch based camera look*around event. Default value is 0.01.\n"+
                                              "speed (optional): The speed of motion. Default value is 200.\n"+
                                              "jumpSpeed (optional): The jump speed. Default value is 500.\n"+
                                              "touchJoystickThreshold (optional): For the left hand move controls on mobile devices, this parameter is used in order to filter out\nnegligible TouchEvents on finger move, thus preventing flickering moves. The TouchEvents are filtered if the length between the previous\nand the current (pageX, pageY) is less than or equals to touchJoystickThreshold. Default value is 1.5.\n"+
                                              "crosshairName (optional): The name of the Crosshair.\n"+
                                              "crosshairExpandSize (optional): The target size of the crosshair in order to be used for expand animation when the player is moving\nor shooting. Default value is 9.\n"+
                                              "crosshairAnimationDelta (optional): The delta value of the crosshair expand animation. Default value is 0.2.\n"+
                                              "hasDoubleJump (optional): If true, the user may double jump by pressing Space or tapping twice. Default value is true.\n"+
                                              "doubleJumpTimeThresholdInMs (optional): This parameter define the max time in milliseconds between two Space key hits or taps in order\nto perform a double jump. Default value is 500.\n"+
                                              "weaponObject1 (optional): The first weapon object. This might be any object or object group marked as FPS Weapon.\n"+
                                              "weaponObject2 (optional): The second weapon object. This might be any object or object group marked as FPS Weapon.\n"+
                                              "hasIdleGunAnimation (optional): If true weapon objects are animated in order to give the FPS controls a realistic feeling. Default value\nis true.\n"+
                                              "idleGunAnimationSpeed (optional): The speed of the idle gun animation. Default value is 0.05.\n"+
                                              "weaponRotationRandomnessOn (optional): If true the weapons rotate a bit more than the camera in order to give the FPS view more\nrealistic view. Default value is true.\n"+
                                              "onLook (optional): A callback function executed each frame with x, y, z and objName parameters representing the intersected object\nfrom the FPS camera. If there is no intersected object the objName is set to null. Default value is noop.\n"+
                                              "onShoot (optional): A callback function executed with x, y, z and objName parameters representing the intersected object from the FPS\ncamera while the mouse is down for Desktop devices. For mobile devices due to lack of mouse device this function is executed when the\ncamera is looking at one of the shootable objects defined with the shootableObjects parameter in order to help implementing the\nauto-shoot functionality. Default value is noop.\n"+
                                              "shootableObjects (optional): An array of objects representing the objects that can be shot. This parameter is used inside the onShoot\nevent for mobile devices in order to decide if the object being looked at should trigger the onShoot function or not. Default value\nis an empty array.\n"+
                                              "onPause (optional): A callback function to be executed when the FPS controls are paused on mobile devices due to switching to Portrait\norientation. Default value is noop.\n"+
                                              "onResume (optional): A callback function to be executed on mobile devices when the FPS controls are resumed after switching back to the\nLandscape orientation. Default value is noop.\n"+
                                              "requestFullScreen (optional): If true the FullScreen mode is requested if the screen is not on full screen. FPS Controls API\nalso automatically re-requests the FullScreen mode every time after the user cancels the FullScreen. Default value is true.";

  this.ROYGBIV_SCRIPTING_API_SETSCREENDRAGLISTENER = "Sets a mouse drag listener for the screen. The callbackFunction is executed with x, y, movementX and movementY parameters.";
  this.ROYGBIV_SCRIPTING_API_REMOVESCREENDRAGLISTENER = "Removes the screen drag listener.";
  this.ROYGBIV_SCRIPTING_API_CREATEORBITCONTROL = "Creates a new OrbitControl object. Using the OrbitControl, camera can orbit around a specified point by looking at it on each frame.\nCamera can move freely around the surface of an imaginary sphere. Controls are:\n"+
                                                  "For desktop:\n"+
                                                  "Mouse wheel/Mouse drag: Rotate\n"+
                                                  "Right/Left/D/A/Q: Rotate\n"+
                                                  "Up/Down/W/S/Z: Zoom in/out\n"+
                                                  "Space: Zoom in/out\n"+
                                                  "For mobile:\n"+
                                                  "Finger pinch zoom: Zoom in/out\n"+
                                                  "Finger touch: Rotate\n"+
                                                  "Configurations are:\n"+
                                                  "lookPosition (optional): A vector defining the look position and the center of the imaginary sphere. Default value is (0, 0, 0).\n"+
                                                  "maxRadius (optional): The maximum radius of the imaginary sphere that the camera can zoom out to. Default value is 150.\n"+
                                                  "minRadius (optional): The minimum radius of the imaginary sphere that the camera can zoom in to. Default value is 50.\n"+
                                                  "zoomDelta (optional): The difference of radius when the user performs a zoom in/out. Default value is 1.\n"+
                                                  "mouseWheelRotationSpeed (optional): The speed of mouse wheel rotation. Default value is 3.\n"+
                                                  "mouseDragRotationSpeed (optional): The speed of mouse drag rotation. Default value is 20.\n"+
                                                  "fingerSwipeRotationSpeed (optional): The speed of finger touch rotation for mobile devices. Default value is 20.\n"+
                                                  "keyboardRotationSpeed (optional): The speed of rotation using keyboard events. Default value is 10.\n"+
                                                  "requestFullScreen (optional): If true the FullScreen mode is requested if the screen is not on full screen. Orbit Controls API\nalso automatically re-requests the FullScreen mode every time after the user cancels the FullScreen. Default value is false.";
  this.ROYGBIV_SCRIPTING_API_ISORIENTATIONLANDSCAPE = "For mobile devices returns if the orientation is landscape for mobile devices. Returns false for desktop devices";
  this.ROYGBIV_SCRIPTING_API_SETSCREENORIENTATIONCHANGELISTENER = "Sets a listener for orientation change events. For mobile devices, the callbackFunction is executed with isLandscape parameter\nwhen the orientation is changed.";
  this.ROYGBIV_SCRIPTING_API_REMOVESCREENORIENTATIONCHANGELISTENER = "Removes the listener for orientation change events.";
  this.ROYGBIV_SCRIPTING_API_EXECUTEFOREACHPARTICLESYSTEM = "Runs the provided function for each particle system of given particle system pool. The callbackFunction is executed with\nparticleSystem parameter.";
  this.ROYGBIV_SCRIPTING_API_STARTSCRIPT = "Starts a script. To get scripts use this format as scriptName:\n"+
                                           "parentdir1_parentdir2_....._parentdirX_scriptFileName\n"+
                                           "For example in order to get a script under the scripts/ root folder example.js, the scriptName parameter should be example. However,\nto get a script under scripts/testFolder/test.js, the scriptName parameter should be testFolder_test.";
  this.ROYGBIV_SCRIPTING_API_STOPSCRIPT = "Stops a script. The scriptName parameter is explained with startScript API.";
  this.ROYGBIV_SCRIPTING_API_STARTANIMATION = "Starts an animation of given object, object group or text.";
  this.ROYGBIV_SCRIPTING_API_STOPANIMATION = "Stops an animation of given object, object group or text.";
  this.ROYGBIV_SCRIPTING_API_ONANIMATIONFINISHED = "Sets a finish listener for an animation of given object, object group or text. For repeating animations the callbackFunction is\nexecuted before each repeat. For rewinding animations the callbackFunction is executed when the rewind is finished.";
  this.ROYGBIV_SCRIPTING_API_REMOVEANIMATIONFINISHLISTENER = "Removes the finish listener for an animation of given object, object group or text.";
  this.ROYGBIV_SCRIPTING_API_SHOWMUZZLEFLASH = "Shows a muzzle flash. This function may be called each time a FPS weapon is shooting.";
  this.ROYGBIV_SCRIPTING_API_EXECUTEDELAYED = "Runs a function after delayInMS milliseconds. If the repeat parameter is set to true runs the function in every delayInMS milliseconds.\nThis function returns a delayedExecutionID. This ID may provided to stopDelayedExecution API\nin order to stop a function to get executed.";
  this.ROYGBIV_SCRIPTING_API_STOPDELAYEDEXECUTION = "Stops a function to get executed with executeDelayed API. The delayedExecutionID parameter should be the return value of\nexecuteDelayed API. This API returns true if a function is found associated with the provided delayedExecutionID parameter,\nreturns false otherwise.";
}
