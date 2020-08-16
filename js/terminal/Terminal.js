var Terminal = function(){
	this.options = {
		greetings: "Type help for list of commands.\n",
		name: "roygbivCLI",
		prompt: "ROYGBIV> ",
		wrap: true,
		keydown: function(e){
			if (e.keyCode == 9 && !isDeployment){
				try{
					var command = this.jqueryContext.get_command();
					this.autocomplete(command);
				}catch (err){
					console.error("Auto completion error: "+err);
				}
				return false;
			}
		}.bind(this)
	}
}

Terminal.prototype.init = function(){
  cliInnerDiv = document.getElementById("terminalDiv");
	this.jqueryContext = $("#terminalDiv");
	var options = this.options;
	this.jqueryContext.terminal(
		function(userInput){
			this.clear();
			parseCommand(userInput);
		}, options
	);
	this.setStyle();
	this.prompt = document.getElementsByClassName("prompt")[0];
	this.cursor = document.getElementsByClassName("cursor-line")[0];
	this.clear();
	this.printInfo("Loading shaders");
	canvas.style.visibility = "hidden";
	this.disable();
	this.skip = false;
}

Terminal.prototype.enable = function(){
	this.prompt.style.visibility = "";
	this.cursor.style.visibility = "";
	this.isDisabled = false;
}

Terminal.prototype.disable = function(){
	this.prompt.style.visibility = "hidden";
	this.cursor.style.visibility = "hidden";
	this.isDisabled = true;
}

Terminal.prototype.setStyle = function(){
	cliInnerDiv.style.overflow = "auto";
	cliInnerDiv.style.maxHeight = "500px";

}

Terminal.prototype.clear = function(){
	this.jqueryContext.clear();
}

Terminal.prototype.printHeader = function(text){
	if (this.skip){
		return;
	}
	this.print(text, {color: "#67b6bd", noNewLine: true});
}

Terminal.prototype.printError = function(text){
	if (this.skip){
		return;
	}
	this.print(text, {color: "#67b6bd"});
}

Terminal.prototype.printInfo = function(text, noNewLine){
	if (this.skip){
		return;
	}
	var colorText = "white";
	if (!noNewLine){
		this.print(text, {color: colorText});
	}else{
		this.print(text, {color: colorText, noNewLine: true});
	}
}

Terminal.prototype.printFromScript = function(text, color){
	if (this.skip){
		return;
	}
	var colorText = color;
	this.print(text, {color: colorText, noNewLine: true});
}

Terminal.prototype.handleAboutCommand = function(){
	if (this.skip){
		return;
	}
	if (isDeployment){
		this.printInfo("Project name: "+projectName);
		this.printInfo("Author: "+author);
		this.print("Powered by", {color: "#bfce72", noNewLine: true});
	}
	this.print(BANNERL1, {color: "white", noNewLine: true});
	this.print(BANNERL2, {color: "white", noNewLine: true});
	this.print(BANNERL3, {color: "white", noNewLine: true});
	this.print(BANNERL4, {color: "white", noNewLine: true});
	this.print(BANNERL5, {color: "white", noNewLine: false});
	if (!isDeployment){
		terminal.printHeader(Text.VERSION);
		terminal.printInfo(Text.TREE.replace(Text.PARAM1, ROYGBIV_ENGINE_VERSION));
		terminal.printHeader(Text.CODER);
		terminal.printInfo(Text.TREE.replace(Text.PARAM1, "Oğuz Eroğlu - github.com/oguzeroglu"));
	}else{
		this.print("by Oğuz Eroğlu - github.com/oguzeroglu", {color: "#bfce72", noNewLine: false});
	}
}

Terminal.prototype.print = function(text, options){
	if (this.skip){
		return;
	}
	if (options){
		if (!options.noNewLine){
			text += "\n";
		}
	}else{
		text += "\n";
	}
	if (!options){
		this.jqueryContext.echo(text, {
			finalize: function(div) {
				div.css("color", "#bfce72");
			}, wrap: true
		});
	}else{
		this.jqueryContext.echo(text, {
			finalize: function(div){
				if (options.color){
					div.css("color", options.color);
				}
			}, wrap: true
		});
	}
}

Terminal.prototype.printFunctionArguments = function(commandIndex){
	if (this.skip){
		return;
	}
	var expectedCount = commandDescriptor.commandArgumentsExpectedCount[commandIndex];
	var functionName = commandDescriptor.commands[commandIndex];
	if (expectedCount == 0){
		terminal.print(
			Text.NO_ARGUMENTS_EXPECTED.replace(
				Text.PARAM1, functionName
			),{
				color: "white"
			}
		);
		return;
	}
	var args = commandDescriptor.commandArgumentsExpectedExplanation[commandIndex];
	var argumentsSplitted = args.split(" ");
	terminal.print(
		Text.ARGUMENTS_EXPECTED.replace(
			Text.PARAM1, expectedCount
		),{
			color: "white"
		}
	);
	terminal.print(
		Text.ONLY_PARAM.replace(
			Text.PARAM1, functionName
		),{
			color: "#67b6bd",
			noNewLine: true
		}
	);
	for (var i = 1; i<argumentsSplitted.length; i++){
		if (i != argumentsSplitted.length -1){
			terminal.print(
				Text.TREE.replace(
					Text.PARAM1, argumentsSplitted[i]
				),{
					color: "white",
					noNewLine: true
				}
			);
		}else{
			terminal.print(
				Text.TREE.replace(
					Text.PARAM1, argumentsSplitted[i]
				),{
					color: "white"
				}
			);
		}
	}
}

Terminal.prototype.help = function(commandInfosSorted, commandsSorted, apiMatchesSorted){
	if (this.skip){
		return;
	}
	for (var i=0; i<commandInfosSorted.length; i++){
		var commandInfosSplitted = commandInfosSorted[i].split(" ");
		commandInfosSorted[i] = "";
		for (var i2 = 1; i2<commandInfosSplitted.length; i2++){
			commandInfosSorted[i] += commandInfosSplitted[i2]+" ";
		}
		terminal.print(
			Text.ONLY_PARAM.replace(
				Text.PARAM1, commandsSorted[i]
			),{
				color: "#67b6bd",
				noNewLine: true
			}
		);
		terminal.print(
			Text.TABULATED_1.replace(
				Text.PARAM1, commandInfosSorted[i]
			),{
				color: "white"
			}
		);
		this.jqueryContext.resize();
	}
	if (apiMatchesSorted){
		for (var i = 0; i<apiMatchesSorted.length; i++){
			var functionName = apiMatchesSorted[i];
			var functionExplanaion = Text[Text.ROYGBIV_SCRIPTING_API_PREFIX+functionName.toUpperCase()];
			terminal.print(
				Text.ONLY_PARAM.replace(
					Text.PARAM1, functionName+" (API function)"
				),{
					color: "#67b6bd",
					noNewLine: true
				}
			);
			terminal.print(
				Text.TABULATED_1.replace(
					Text.PARAM1, functionExplanaion
				),{
					color: "white"
				}
			);
			this.jqueryContext.resize();
		}
	}
}

Terminal.prototype.setCommand = function(command){
	this.jqueryContext.set_command(command);
}

Terminal.prototype.getExpectedArgCountByCommandName = function(commandName){
	for (var i = 0; i<commandDescriptor.commands.length; i++){
		if (commandDescriptor.commands[i] == commandName.toLowerCase()){
			return commandDescriptor.commandArgumentsExpectedCount[i];
		}
	}
	return "NOT_FOUND";
}

Terminal.prototype.autocomplete = function(command){
	this.clear();
	this.print("Type help for list of commands.");
	var replaceCommand = true;
	var commandSplitted = command.split(" ");
	var degree = commandSplitted.length;
	var command = commandSplitted[0];

	var possibilities = [];
	for (var i = 0; i<commandDescriptor.commands.length; i++){
		if (commandDescriptor.commands[i].toLowerCase().startsWith(command.toLowerCase())){
			possibilities.push(commandDescriptor.commandArgumentsExpectedExplanation[i]);
		}
	}
	possibilities.sort();
	if (possibilities.length > 0){
		var cmdHeaders = [];
		for (var i = 0; i<possibilities.length; i++){
			var options = true;
			if (i == possibilities.length -1){
				options = false;
			}
			this.printInfo(Text.ONLY_PARAM.replace(
				Text.PARAM1, possibilities[i]
			), options);
			cmdHeaders.push(possibilities[i].split(" ")[0]);
		}
		if (cmdHeaders.length > 1){
			var headerFirst = cmdHeaders[0];
			var headerLast = cmdHeaders[cmdHeaders.length - 1];
			var firstLen = headerFirst.length;
			var i = 0;
			while (i < firstLen && headerFirst.charAt(i) === headerLast.charAt(i)){
				i ++;
			}
			var commonHead = headerFirst.substring(0, i);
			if (commonHead.length > 0 && commonHead.length > command.length){
				this.setCommand(commonHead);
			}
		}
	}
	if (degree == 1){
		if (possibilities.length == 1){
			var cmd = possibilities[0].split(" ")[0];
			this.setCommand(cmd);
		}
	}else{
		var commandDescription = commandDescriptor[command];
		if (!commandDescription){
			return;
		}
		var curType = commandDescription.types[degree - 2];
		var curEntry = commandSplitted[degree - 1];
		var possibilities = [];
		var helpString = "";
		switch (curType){
			case commandDescriptor.UNKNOWN_INDICATOR:
				// Nothing to do really.
				return;
			break;
			case commandDescriptor.GRID_SYSTEM_AXIS:
				if ("XZ".startsWith(curEntry.toUpperCase())){
					possibilities.push("XZ");
				}
				if ("XY".startsWith(curEntry.toUpperCase())){
					possibilities.push("XY");
				}
				if ("YZ".startsWith(curEntry.toUpperCase())){
					possibilities.push("YZ");
				}
				helpString = "[Axis]: ";
			break;
			case commandDescriptor.GRID_SYSTEM_NAME:
				for (var gridSystemName in sceneHandler.getGridSystems()){
					if (gridSystemName.startsWith(curEntry)){
						possibilities.push(gridSystemName);
					}
				}
				helpString = "[Grid system names]: ";
			break;
			case commandDescriptor.COLOR:
				for (var i = 0; i<ColorNames.colorNames.length; i++){
					if (ColorNames.colorNames[i].startsWith(curEntry.toLowerCase())){
						possibilities.push(ColorNames.colorNames[i]);
					}
				}
				helpString = "[Colors]: ";
			break;
			case commandDescriptor.BOOLEAN:
				if ("true".startsWith(curEntry.toLowerCase())){
					possibilities.push("true");
				}
				if ("false".startsWith(curEntry.toLowerCase())){
					possibilities.push("false");
				}
				helpString = "[Boolean]: ";
			break;
			case commandDescriptor.MATERIAL_NAME:
				for (materialName in materials){
					if (materialName.startsWith(curEntry)){
						possibilities.push(materialName);
					}
				}
				helpString = "[Materials]: ";
			break;
			case commandDescriptor.MATERIAL_NAME_WITH_NULL:
				for (materialName in materials){
					if (materialName.startsWith(curEntry)){
						possibilities.push(materialName);
					}
				}
				if ("NULL".startsWith(curEntry.toUpperCase())){
					possibilities.push("NULL");
				}
				helpString = "[Materials]: ";
			break;
			case commandDescriptor.OBJECT_NAME:
				for (objectName in sceneHandler.getAddedObjects()){
					if (objectName.startsWith(curEntry)){
						possibilities.push(objectName);
					}
				}
				for (gluedObjectName in sceneHandler.getObjectGroups()){
					if (gluedObjectName.startsWith(curEntry)){
						possibilities.push(gluedObjectName);
					}
				}
				helpString = "[Objects]: "
			break;
			case commandDescriptor.OBJECT_AXIS:
				if ("x".startsWith(curEntry.toLowerCase())){
					possibilities.push("x");
				}
				if ("y".startsWith(curEntry.toLowerCase())){
					possibilities.push("y");
				}
				if ("z".startsWith(curEntry.toLowerCase())){
					possibilities.push("z");
				}
				helpString = "[Axis]: ";
			break;
			case commandDescriptor.STATE_ON_OFF:
				if ("on".startsWith(curEntry.toLowerCase())){
					possibilities.push("on");
				}
				if ("off".startsWith(curEntry.toLowerCase())){
					possibilities.push("off");
				}
				helpString = "[States]: ";
			break;
			case commandDescriptor.S_T_ST:
				if ("S".startsWith(curEntry.toUpperCase())){
					possibilities.push("S");
				}
				if ("T".startsWith(curEntry.toUpperCase())){
					possibilities.push("T");
				}
				if ("ST".startsWith(curEntry.toUpperCase())){
					possibilities.push("ST");
				}
				helpString = "[Axis]: ";
			break;
			case commandDescriptor.WALL_COLLECTION_NAME:
				for (var wallCollectionName in sceneHandler.getWallCollections()){
					if (wallCollectionName.startsWith(curEntry)){
						possibilities.push(wallCollectionName);
					}
				}
				helpString = "[Wall collections]: ";
			break;
			case commandDescriptor.DEFAULT_MATERIAL_TYPE:
				if ("BASIC".startsWith(curEntry.toUpperCase())){
					possibilities.push("BASIC");
				}
				if ("PHONG".startsWith(curEntry.toUpperCase())){
					possibilities.push("PHONG");
				}
				helpString = "[Types]: ";
			break;
			case commandDescriptor.TEXTURE_PACK_NAME:
				for (var texturePackName in texturePacks){
					if (texturePackName.startsWith(curEntry)){
						possibilities.push(texturePackName);
					}
				}
				helpString = "[Texture packs]: ";
			break;
			case commandDescriptor.HIDE_SHOW:
				if ("hide".startsWith(curEntry.toLowerCase())){
					possibilities.push("hide");
				}
				if ("show".startsWith(curEntry.toLowerCase())){
					possibilities.push("show");
				}
				helpString = "[States]: ";
			break;
			case commandDescriptor.SKYBOX_NAME:
				for (var skyboxName in skyBoxes){
					if (skyboxName.startsWith(curEntry)){
						possibilities.push(skyboxName);
					}
				}
				helpString = "[Skyboxes]: ";
			break;
			case commandDescriptor.ANY_OBJECT:
				var splittedEntry = curEntry.split(",");
				for (var objectName in sceneHandler.getAddedObjects()){
					var found = false;
					for (var i = 0; i<splittedEntry.length; i++){
						if (splittedEntry[i] == objectName){
							found = true;
						}
					}
					if (!found){
						possibilities.push(objectName);
					}
				}
				for (var gluedObjectName in sceneHandler.getObjectGroups()){
					var found = false;
					for (var i = 0; i<splittedEntry.length; i++){
						if (splittedEntry[i] == gluedObjectName){
							found = true;
						}
					}
					if (!found){
						possibilities.push(gluedObjectName);
					}
				}
				replaceCommand = false;
				helpString = "[Objects]: ";
			break;
			case commandDescriptor.GLUED_OBJECT_NAME:
				for (var gluedObjectName in sceneHandler.getObjectGroups()){
					if (gluedObjectName.startsWith(curEntry)){
						possibilities.push(gluedObjectName);
					}
				}
				helpString = "[Glued objects]: ";
			break;
			case commandDescriptor.MARKED_POINT_NAME:
				for (var markedPointName in sceneHandler.getMarkedPoints()){
					if (markedPointName.startsWith(curEntry)){
						possibilities.push(markedPointName);
					}
				}
				helpString = "[Marked points]: ";
			break;
			case commandDescriptor.API_FUNCTION_NAME:
				for (var i = 0; i < ROYGBIV.functionNames.length; i++){
					if (ROYGBIV.functionNames[i].startsWith(curEntry)){
						possibilities.push(ROYGBIV.functionNames[i]);
					}
				}
				helpString = "[API functions]: ";
			break;
			case commandDescriptor.BLENDING_MODE:
				var possibleBlendingModes = [
					"NO_BLENDING",
					"NORMAL_BLENDING",
					"ADDITIVE_BLENDING",
					"SUBTRACTIVE_BLENDING",
					"MULTIPLY_BLENDING"
				 ];
				 for (var i = 0; i < possibleBlendingModes.length; i++){
					 if (possibleBlendingModes[i].startsWith(curEntry.toUpperCase())){
						 possibilities.push(possibleBlendingModes[i]);
					 }
				 }
				 helpString = "[Blending modes]: ";
			break;
			case commandDescriptor.OBJECT_CREATION_NAME:
				if ("NULL".startsWith(curEntry.toUpperCase())){
					possibilities.push("NULL");
				}
				helpString = "[Name]: Use NULL to generate a random name.";
			break;
			case commandDescriptor.AREA_NAME:
				for (var areaName in sceneHandler.getAreas()){
					if (areaName.startsWith(curEntry)){
						possibilities.push(areaName);
					}
				}
				helpString = "[Area names]: ";
			break;
			case commandDescriptor.AREA_NAME_WITH_DEFAULT:
				for (var areaName in sceneHandler.getAreas()){
					if (areaName.startsWith(curEntry)){
						possibilities.push(areaName);
					}
				}
				if ("default".startsWith(curEntry.toLowerCase())){
					possibilities.push("default");
				}
				helpString = "[Area names]: ";
			break;
			case commandDescriptor.RENDER_SIDE:
				if ("both".startsWith(curEntry.toLowerCase())){
					possibilities.push("both");
				}
				if ("back".startsWith(curEntry.toLowerCase())){
					possibilities.push("back");
				}
				if ("front".startsWith(curEntry.toLowerCase())){
					possibilities.push("front");
				}
				helpString = "[Sides]: ";
			break;
			case commandDescriptor.CHILD_OBJECT_NAME:
				if (commandSplitted && commandSplitted.length == 3){
					var objectGroup = objectGroups[commandSplitted[1]];
					if (objectGroup){
						for (var childObjName in objectGroup.group){
							if (childObjName.toLowerCase().startsWith(curEntry.toLowerCase())){
								possibilities.push(childObjName);
							}
						}
					}
				}
				helpString = "[Children]: ";
			break;
			case commandDescriptor.FONT_NAME:
				for (var fontName in fonts){
					if (fontName.startsWith(curEntry)){
						possibilities.push(fontName);
					}
				}
				helpString = "[Fonts]: ";
			break;
			case commandDescriptor.TEXT_NAME:
				var allTexts = (commandSplitted[0] == "syncTextProperties")? addedTexts: sceneHandler.getAddedTexts();
				for (var textName in allTexts){
					if (textName.startsWith(curEntry)){
						possibilities.push(textName);
					}
				}
				helpString = "[Texts]: ";
			break;
			case commandDescriptor.EFFECT_NAME:
				for (var effectName in renderer.effects){
					if (effectName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(effectName);
					}
				}
				helpString = "[Effects]: ";
			break;
			case commandDescriptor.FPS_WEAPON:
				for (var objName in sceneHandler.getAddedObjects()){
					var obj = addedObjects[objName];
					if (!obj.isFPSWeapon){
						continue;
					}
					if (objName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(objName);
					}
				}
				for (var objName in sceneHandler.getObjectGroups()){
					var obj = objectGroups[objName];
					if (!obj.isFPSWeapon){
						continue;
					}
					if (objName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(objName);
					}
				}
				helpString = "[FPS weapons]: ";
			break;
			case commandDescriptor.PRECONFIGURED_PS_NAME:
				for (var psName in sceneHandler.getParticleSystems()){
					if (psName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(psName);
					}
				}
				helpString = "[Particle systems]: ";
			break;
			case commandDescriptor.PRECONFOGURED_PS_POOL_NAME:
				for (var poolName in sceneHandler.getParticleSystemPools()){
					if (poolName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(poolName);
					}
				}
				helpString = "[Particle system pools]: ";
			break;
			case commandDescriptor.MUZZLE_FLASH_NAME:
				for (var muzzleFlashName in sceneHandler.getMuzzleFlashes()){
					if (muzzleFlashName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(muzzleFlashName);
					}
				}
				helpString = "[Muzzle flashes]: ";
			break;
			case commandDescriptor.CROSSHAIR_NAME:
				for (var crosshairName in sceneHandler.getCrosshairs()){
					if (crosshairName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(crosshairName);
					}
				}
				helpString = "[Crosshairs]: ";
			break;
			case commandDescriptor.OBJECT_AND_TEXT_NAME:
				for (var objName in sceneHandler.getAddedObjects()){
					if (objName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(objName);
					}
				}
				for (var objName in sceneHandler.getObjectGroups()){
					if (objName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(objName);
					}
				}
				for (var textName in sceneHandler.getAddedTexts()){
					if (textName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(textName);
					}
				}
				helpString = "[Objects]: ";
			break;
			case commandDescriptor.SCENE_NAME:
				for (var sceneName in sceneHandler.scenes){
					if (sceneName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(sceneName);
					}
				}
				helpString = "[Scenes]: ";
			break;
			case commandDescriptor.GS_NAME_NO_WC:
				for (var gridSystemName in sceneHandler.getGridSystems()){
					if (gridSystemName.startsWith(curEntry)){
						var found = false;
						for (var wcName in wallCollections){
							var gsNames = wallCollections[wcName].gridSystemNames;
							for (var i = 0; i<gsNames.length; i++){
								if (gsNames[i] == gridSystemName){
									found = true;
								}
							}
						}
						if (!found){
							possibilities.push(gridSystemName);
						}
					}
				}
				helpString = "[Grid system names]: ";
			break;
			case commandDescriptor.LIGHTNING_NAME:
				for (var lightningName in sceneHandler.getLightnings()){
					if (lightningName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(lightningName);
					}
				}
				helpString = "[Lightnings]: ";
			break;
			case commandDescriptor.SPRITE_NAME:
				for (var spriteName in sceneHandler.getSprites()){
					if (spriteName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(spriteName);
					}
				}
				helpString = "[Sprites]: ";
			break;
			case commandDescriptor.OBJECT_OR_SPRITE_NAME:
				for (objectName in sceneHandler.getAddedObjects()){
					if (objectName.startsWith(curEntry)){
						possibilities.push(objectName);
					}
				}
				for (var spriteName in sceneHandler.getSprites()){
					if (spriteName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(spriteName);
					}
				}
				helpString = "[Objects/Sprites]: ";
			break;
			case commandDescriptor.OBJECT_TEXT_SPRITE_NAME:
				for (var objName in sceneHandler.getAddedObjects()){
					if (objName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(objName);
					}
				}
				for (var objName in sceneHandler.getObjectGroups()){
					if (objName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(objName);
					}
				}
				for (var textName in sceneHandler.getAddedTexts()){
					if (textName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(textName);
					}
				}
				for (var spriteName in sceneHandler.getSprites()){
					if (spriteName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(spriteName);
					}
				}
				helpString = "[Objects]: ";
			break;
			case commandDescriptor.CONTAINER_NAME:
				for (var containerName in sceneHandler.getContainers()){
					if (containerName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(containerName);
					}
				}
				helpString = "[Containers]: ";
			break;
			case commandDescriptor.SPRITE_OR_2D_TEXT_NAME:
				for (var textName in sceneHandler.getAddedTexts2D()){
					if (textName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(textName);
					}
				}
				for (var spriteName in sceneHandler.getSprites()){
					if (spriteName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(spriteName);
					}
				}
				helpString = "[2D objects]: ";
			break;
			case commandDescriptor.CONTAINER_ALIGNMENT_TYPE:
				if ("container_alignment_type_top".startsWith(curEntry.toLowerCase())){
					possibilities.push("CONTAINER_ALIGNMENT_TYPE_TOP");
				}
				if ("container_alignment_type_bottom".startsWith(curEntry.toLowerCase())){
					possibilities.push("CONTAINER_ALIGNMENT_TYPE_BOTTOM");
				}
				if ("container_alignment_type_right".startsWith(curEntry.toLowerCase())){
					possibilities.push("CONTAINER_ALIGNMENT_TYPE_RIGHT");
				}
				if ("container_alignment_type_left".startsWith(curEntry.toLowerCase())){
					possibilities.push("CONTAINER_ALIGNMENT_TYPE_LEFT");
				}
				helpString = "[Alignment type]: ";
			break;
			case commandDescriptor.VIRTUAL_KEYBOARD_NAME:
				for (var vkName in sceneHandler.getVirtualKeyboards()){
					if (vkName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(vkName);
					}
				}
				helpString = "[Virtual keyboards]: ";
			break;
			case commandDescriptor.RESOLUTION_PARAM:
				if ("original_resolution".startsWith(curEntry.toLowerCase())){
					possibilities.push("ORIGINAL_RESOLUTION");
				}
				helpString = "[Resolution]: ";
			break;
			case commandDescriptor.DYNAMIC_TEXTURE_FOLDER_NAME:
				for (var folderName in dynamicTextureFolders){
					if (folderName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(folderName);
					}
				}
				helpString = "[Dynamic texture folder name]: ";
			break;
			case commandDescriptor.AI_OBSTACLE_ID:
				var obstacles = steeringHandler.obstaclesBySceneName[sceneHandler.getActiveSceneName()];
				if (obstacles){
					for (var id in obstacles){
						if (id.toLowerCase().startsWith(curEntry.toLowerCase())){
							possibilities.push(id);
						}
					}
				}
				helpString = "[AI Obstacle ids]: ";
			break;
			case commandDescriptor.JUMP_DESCRIPTOR_ID:
				var jumpDescriptors = steeringHandler.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()];
				if (jumpDescriptors){
					for (var id in jumpDescriptors){
						if (id.toLowerCase().startsWith(curEntry.toLowerCase())){
							possibilities.push(id);
						}
					}
				}
				helpString = "[Jump descriptor ids]: ";
			break;
			case commandDescriptor.ANY_MARKED_POINT:
				var splittedEntry = curEntry.split(",");
				for (var ptName in sceneHandler.getMarkedPoints()){
					var found = false;
					for (var i = 0; i<splittedEntry.length; i++){
						if (splittedEntry[i] == ptName){
							found = true;
						}
					}
					if (!found){
						possibilities.push(ptName);
					}
				}
				replaceCommand = false;
				helpString = "[Points]: ";
			break;
			case commandDescriptor.PATH_ID:
				var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()];
				if (paths){
					for (var id in paths){
						if (id.toLowerCase().startsWith(curEntry.toLowerCase())){
							possibilities.push(id);
						}
					}
				}
				helpString = "[Paths]: ";
			break;
			case commandDescriptor.GRAPH_ID:
				var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()];
				if (graphs){
					for (var id in graphs){
						if (id.toLowerCase().startsWith(curEntry.toLowerCase())){
							possibilities.push(id);
						}
					}
				}
				helpString = "[Graphs]: ";
			break;
			case commandDescriptor.ANY_GRAPH_ID:
				var splittedEntry = curEntry.split(",");
				for (var graphID in steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()]){
					var found = false;
					for (var i = 0; i<splittedEntry.length; i++){
						if (splittedEntry[i] == graphID){
							found = true;
						}
					}
					if (!found){
						possibilities.push(graphID);
					}
				}
				replaceCommand = false;
				helpString = "[Graphs]: ";
			break;
			case commandDescriptor.STEERING_BEHAVIOR_NAME:
				var behaviors = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
				for (var name in behaviors){
					if (name.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(name);
					}
				}
				helpString = "[Steering behaviors]: ";
			break;
			case commandDescriptor.ASTAR_ID:
				var astars = steeringHandler.astarsBySceneName[sceneHandler.getActiveSceneName()];
				if (astars){
					for (var id in astars){
						if (id.toLowerCase().startsWith(curEntry.toLowerCase())){
							possibilities.push(id);
						}
					}
				}
				helpString = "[AStars]: ";
			break;
			case commandDescriptor.STEERABLE_NAME:
				var steerables = steeringHandler.steerablesBySceneName[sceneHandler.getActiveSceneName()];
				if (steerables){
					for (var id in steerables){
						if (id.toLowerCase().startsWith(curEntry.toLowerCase())){
							possibilities.push(id);
						}
					}
				}
				helpString = "[Steerables]: ";
			break;
			case commandDescriptor.MASS_ID:
				var massesInTheScene = sceneHandler.getMasses();
				for (var massName in massesInTheScene){
					if (massName.toLowerCase().startsWith(curEntry.toLowerCase())){
						possibilities.push(massName);
					}
				}
				helpString = "[Masses in the scene]: ";
			break;
		}

		//  **********************************************************
		//  *
		//  * C O R E M E T H O D
		//  *
		//  **********************************************************

		if (possibilities.length == 0){
			return ;
		}else if (possibilities.length == 1){
			var reconstructedCommand = "";
			for (var i = 0; i < commandSplitted.length; i++){
				if (i != commandSplitted.length -1){
					reconstructedCommand += commandSplitted[i]+" ";
				}else{
					reconstructedCommand += possibilities[0];
				}
			}
			if (replaceCommand){
				this.setCommand(reconstructedCommand);
			}else{
				for (var i = 0; i< possibilities.length; i++){
					helpString += possibilities[i];
					if (i != possibilities.length -1){
						helpString += ", ";
					}
				}
				this.printInfo(Text.ONLY_PARAM.replace(
					Text.PARAM1, helpString
				));
			}
		}else{
			for (var i = 0; i< possibilities.length; i++){
				helpString += possibilities[i];
				if (i != possibilities.length -1){
					helpString += ", ";
				}
			}
			this.printInfo(Text.ONLY_PARAM.replace(
				Text.PARAM1, helpString
			));
			var sorted = possibilities.sort();
			var headerFirst = possibilities[0];
			var headerLast = possibilities[possibilities.length - 1];
			var firstLen = headerFirst.length;
			var i = 0;
			while (i < firstLen && headerFirst.charAt(i) === headerLast.charAt(i)){
				i ++;
			}
			var commonHead = headerFirst.substring(0, i);
			if (commonHead.length > 0){
				var reconstructedCommand = "";
				for (var i = 0; i < commandSplitted.length; i++){
					if (i != commandSplitted.length -1){
						reconstructedCommand += commandSplitted[i]+" ";
					}else{
						reconstructedCommand += commonHead;
					}
				}
				if (replaceCommand){
					this.setCommand(reconstructedCommand);
				}
			}
		}
		// **********************************************************
	}

}
