var Terminal = function(){
	this.options = {
		greetings: "Type help for list of commands.\n",
		name: "roygbivCLI",
		prompt: "ROYGBIV> ",
		wrap: true,
		keydown: function(e){
			if (e.keyCode == 9){
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
}

Terminal.prototype.setStyle = function(){
	cliInnerDiv.style.overflow = "scroll";
	cliInnerDiv.style.maxHeight = "500px";

}

Terminal.prototype.clear = function(){
	this.jqueryContext.clear();
}

Terminal.prototype.printHeader = function(text){
	this.print(text, {color: "fuchsia", noNewLine: true});
}

Terminal.prototype.printError = function(text){
	this.print(text, {color: "fuchsia"});
}

Terminal.prototype.printInfo = function(text, noNewLine){
	if (!noNewLine){
		this.print(text, {color: "yellow"});
	}else{
		this.print(text, {color: "yellow", noNewLine: true});
	}
}

Terminal.prototype.handleAboutCommand = function(){
	this.print(Text.BANNERL1, {color: "lime", noNewLine: true});
	this.print(Text.BANNERL2, {color: "lime", noNewLine: true});
	this.print(Text.BANNERL3, {color: "lime", noNewLine: true});
	this.print(Text.BANNERL4, {color: "lime", noNewLine: true});
	this.print(Text.BANNERL5, {color: "lime", noNewLine: false});
	terminal.printHeader(Text.VERSION);
	terminal.printInfo(Text.TREE.replace(Text.PARAM1, ROYGBIV_ENGINE_VERSION));
	terminal.printHeader(Text.CODER);
	terminal.printInfo(Text.TREE.replace(Text.PARAM1, "Oğuz Eroğlu - oguzeroglu.com"));
}

Terminal.prototype.print = function(text, options){
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
				div.css("color", "lime");
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
	var expectedCount = commandArgumentsExpectedCount[commandIndex];
	var functionName = commands[commandIndex];
	if (expectedCount == 0){
		terminal.print(
			Text.NO_ARGUMENTS_EXPECTED.replace(
				Text.PARAM1, functionName
			),{
				color: "red"
			}
		);
		return;
	}
	var arguments = commandArgumentsExpectedExplanation[commandIndex];
	var argumentsSplitted = arguments.split(" ");
	terminal.print(
		Text.ARGUMENTS_EXPECTED.replace(
			Text.PARAM1, expectedCount
		),{
			color: "red"
		}
	);
	terminal.print(
		Text.ONLY_PARAM.replace(
			Text.PARAM1, functionName
		),{
			color: "fuchsia",
			noNewLine: true
		}
	);
	for (var i = 1; i<argumentsSplitted.length; i++){
		if (i != argumentsSplitted.length -1){
			terminal.print(
				Text.TREE.replace(
					Text.PARAM1, argumentsSplitted[i]
				),{
					color: "yellow",
					noNewLine: true
				}
			);
		}else{
			terminal.print(
				Text.TREE.replace(
					Text.PARAM1, argumentsSplitted[i]
				),{
					color: "yellow"
				}
			);
		}
	}
}

Terminal.prototype.help = function(commandInfosSorted, commandsSorted, apiMatchesSorted){
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
				color: "fuchsia",
				noNewLine: true
			}
		);
		terminal.print(
			Text.TABULATED_1.replace(
				Text.PARAM1, commandInfosSorted[i]
			),{
				color: "yellow"
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
					color: "fuchsia",
					noNewLine: true
				}
			);
			terminal.print(
				Text.TABULATED_1.replace(
					Text.PARAM1, functionExplanaion
				),{
					color: "yellow"
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
	for (var i = 0; i<commands.length; i++){
		if (commands[i] == commandName.toLowerCase()){
			return commandArgumentsExpectedCount[i];
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
	for (var i = 0; i<commands.length; i++){
		if (commands[i].toLowerCase().startsWith(command.toLowerCase())){
			possibilities.push(commandArgumentsExpectedExplanation[i]);
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
				for (var gridSystemName in gridSystems){
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
				for (objectName in addedObjects){
					if (objectName.startsWith(curEntry)){
						possibilities.push(objectName);
					}
				}
				for (gluedObjectName in objectGroups){
					if (gluedObjectName.startsWith(curEntry)){
						possibilities.push(gluedObjectName);
					}
				}
				helpString = "[Objects]: "
			break;
			case commandDescriptor.UPLOADED_IMAGE_NAME:
				for (imgName in uploadedImages){
					if (imgName.startsWith(curEntry)){
						possibilities.push(imgName);
					}
				}
				helpString = "[Uploaded images]: ";
			break;
			case commandDescriptor.TEXTURE_NAME:
				for (textureName in textures){
					if (textureName.startsWith(curEntry)){
						possibilities.push(textureName);
					}
				}
				helpString = "[Textures]: ";
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
			case commandDescriptor.PHYSICS_TEST_INDEX:
				var physicsTestCount = Object.keys(physicsTests).length;
				if (physicsTestCount > 0){
					for (var i = 1; i <= physicsTestCount; i++){
						if (i.toString().startsWith(curEntry)){
							possibilities.push(i.toString());
						}
					}
				}
				helpString = "[Physics tests]: ";
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
				for (var wallCollectionName in wallCollections){
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
				if ("LAMBERT".startsWith(curEntry.toUpperCase())){
					possibilities.push("LAMBERT");
				}
				helpString = "[Types]: ";
			break;
			case commandDescriptor.LIGHT_NAME:
				for (var lightName in lights){
					if (lightName.startsWith(curEntry)){
						possibilities.push(lightName);
					}
				}
				helpString = "[Lights]: ";
			break;
			case commandDescriptor.FILE_EXTENSION:
				var knownExtensions = [
					"tga", "TGA", "jpg", "JPG", "jpeg",
					"JPEG", "png", "PNG", "gif", "GIF",
					"bmp", "BMP"
				];
				for (var i = 0; i < knownExtensions.length; i++){
					if (knownExtensions[i].startsWith(curEntry)){
						possibilities.push(knownExtensions[i]);
					}
				}
				helpString = "[File extensions]: ";
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
			case commandDescriptor.SCRIPT_NAME:
				for (var scriptName in scripts){
					if (scriptName.startsWith(curEntry)){
						possibilities.push(scriptName);
					}
				}
				helpString = "[Scripts]: ";
			break;
			case commandDescriptor.ANY_OBJECT:
				var splittedEntry = curEntry.split(",");
				for (var objectName in addedObjects){
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
				for (var gluedObjectName in objectGroups){
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
				for (var gluedObjectName in objectGroups){
					if (gluedObjectName.startsWith(curEntry)){
						possibilities.push(gluedObjectName);
					}
				}
				helpString = "[Glued objects]: ";
			break;
			case commandDescriptor.MARKED_POINT_NAME:
				for (var markedPointName in markedPoints){
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
