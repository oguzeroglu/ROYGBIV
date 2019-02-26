var WebGLCallbackHandler = function(){
  this.doNotCache = false;
  this.gl = renderer.context;
  this.vertexAttribPointerCache = new Map();
  this.bindedCubeTextureCache = new Map();
}

WebGLCallbackHandler.prototype.registerEngineObject = function(object){
  object.mesh.onBeforeRender = function(){
    webglCallbackHandler.onBeforeRender(object);
  }
}

WebGLCallbackHandler.prototype.onShaderCompilationError = function(type, shaderInfoLog, lines){
  this.shaderCompilationError = true;
  if (!isDeployment){
    canvas.style.visibility = "hidden";
    terminal.disable();
    terminal.clear();
    terminal.printHeader("Fatal error");
    terminal.printInfo("Shader compilation error: "+((type == this.gl.VERTEX_SHADER) ? "[VERTEX_SHADER]" : "[FRAGMENT_SHADER]"));
    terminal.printInfo("Error: "+shaderInfoLog);
    terminal.printHeader("Shader code");
    terminal.printError(lines);
  }else{
    if (typeof cliDiv == UNDEFINED){
      cliDiv = document.createElement("textarea");
      cliDiv.id = "cliDiv";
      cliDiv.className = "noselect";
      document.body.insertBefore(cliDiv, canvas);
      cliDiv.style.height = window.innerHeight +"px";
      cliDiv.style.maxHeight = cliDiv.style.height;
    }
    canvas.style.visibility = "hidden";
    cliDiv.value = "";
    appendtoDeploymentConsole("FATAL ERROR. Please copy the message below and send it to the developer.");
    appendtoDeploymentConsole("Shader compilation error: "+((type == this.gl.VERTEX_SHADER) ? "[VERTEX_SHADER]" : "[FRAGMENT_SHADER]"));
    appendtoDeploymentConsole("Error: "+shaderInfoLog);
    appendtoDeploymentConsole("Shader code");
    appendtoDeploymentConsole(lines);
    throw new Error("Shader compilation error.");
  }
}

WebGLCallbackHandler.prototype.onShaderCompilationWarning = function(type, shaderInfoLog, lines){

}

WebGLCallbackHandler.prototype.onCreateBuffer = function(){

}

WebGLCallbackHandler.prototype.onBeforeRender = function(object){

}

WebGLCallbackHandler.prototype.onCreateProgram = function(){

}

WebGLCallbackHandler.prototype.onCreateShader = function(){

}

WebGLCallbackHandler.prototype.onBeforeUniform1i = function(location, unit){
  this.gl.uniform1i(location, unit);
}

WebGLCallbackHandler.prototype.onBeforeUniform4f = function(location, v0, v1, v2, v3){
  this.gl.uniform4f(location, v0, v1, v2, v3);
}

WebGLCallbackHandler.prototype.onBeforeUniform3f = function(location, v0, v1, v2){
  this.gl.uniform3f(location, v0, v1, v2);
}

WebGLCallbackHandler.prototype.onBeforeUniform2f = function(location, v0, v1){
  this.gl.uniform2f(location, v0, v1);
}

WebGLCallbackHandler.prototype.onBeforeUniform1f = function(location, v0){
  this.gl.uniform1f(location, v0);
}

WebGLCallbackHandler.prototype.onBeforeBlendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha, lineID){
  this.gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
}

WebGLCallbackHandler.prototype.onBeforeBlendFunc = function(sFactor, dFactor, lineID){
  this.gl.blendFunc(sFactor, dFactor);
}

WebGLCallbackHandler.prototype.onBeforeBlendEquationSeparate = function(func, funcAlpha, lineID){
  if (!this.doNotCache){
    if (this.blendEquationRGBCache && this.blendEquationRGBCache == func){
      if (this.blendEquationAlphaCache && this.blendEquationAlphaCache == funcAlpha){
        return;
      }
    }
  }
  this.gl.blendEquationSeparate(func, funcAlpha);
  if (!this.doNotCache){
    this.blendEquationRGBCache = func;
    this.blendEquationAlphaCache = funcAlpha;
  }
}

WebGLCallbackHandler.prototype.onBeforeBlendEquation = function(func, lineID){
  if (!this.doNotCache){
    if (this.blendEquationRGBCache && this.blendEquationRGBCache == func){
      if (this.blendEquationAlphaCache && this.blendEquationAlphaCache == func){
        return;
      }
    }
  }
  this.gl.blendEquation(func);
  if (!this.doNotCache){
    this.blendEquationRGBCache = func;
    this.blendEquationAlphaCache = func;
  }
}

WebGLCallbackHandler.prototype.onBeforeUseProgram = function(program){
  this.gl.useProgram(program);
}

WebGLCallbackHandler.prototype.onBeforeLinkProgram = function(program){
  this.gl.linkProgram(program);
}

WebGLCallbackHandler.prototype.onBeforeAttachShader = function(program, shader){
  this.gl.attachShader(program, shader);
}

WebGLCallbackHandler.prototype.onBeforeCompileShader = function(shader){
  this.gl.compileShader(shader);
}

WebGLCallbackHandler.prototype.onBeforeShaderSource = function(shader, string){
  this.gl.shaderSource(shader, string);
}

WebGLCallbackHandler.prototype.onBeforeActiveTexture = function(slot){
  if (!this.doNotCache){
    this.activeTextureSlot = slot;
  }
  this.gl.activeTexture(slot);
}

WebGLCallbackHandler.prototype.onBeforeBindTexture = function(type, texture, lineID){
  var curCachedElement;
  var isCubeTexture = type == this.gl.TEXTURE_CUBE_MAP;
  if (!this.doNotCache && this.activeTextureSlot && isCubeTexture){
    curCachedElement = this.bindedCubeTextureCache.get(this.activeTextureSlot);
    if (curCachedElement){
      if (texture == curCachedElement){
        return;
      }
    }
  }
  this.gl.bindTexture(type, texture);
  if (!this.doNotCache && !curCachedElement && this.activeTextureSlot && isCubeTexture){
    this.bindedCubeTextureCache.set(this.activeTextureSlot, texture);
  }
}

WebGLCallbackHandler.prototype.onBeforeVertexAttribPointer = function(index, size, type, normalized, stride, offset, buffer, lineID){
  var curCachedElement;
  if (!this.doNotCache){
    curCachedElement = this.vertexAttribPointerCache.get(index);
    if (curCachedElement){
      var cachedSize = curCachedElement.size;
      var cachedType = curCachedElement.type;
      var cachedNormalized = curCachedElement.normalized;
      var cachedStride = curCachedElement.stride;
      var cachedOffset = curCachedElement.offset;
      var cachedBuffer = curCachedElement.buffer;
      if (cachedSize == size && cachedType == type && cachedNormalized == normalized &&
        cachedStride == stride && cachedOffset == offset && cachedBuffer == buffer){
        return;
      }
    }
  }
  this.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  if (!this.doNotCache){
    if (curCachedElement){
      curCachedElement.size = size;
      curCachedElement.type = type;
      curCachedElement.normalized = normalized;
      curCachedElement.stride = stride;
      curCachedElement.offset = offset;
      curCachedElement.buffer = buffer;
      this.vertexAttribPointerCache.set(index, curCachedElement);
    }else{
      this.vertexAttribPointerCache.set(index, {
        size: size, type: type, normalized: normalized, stride: stride, offset: offset, buffer: buffer
      });
    }
  }
}

WebGLCallbackHandler.prototype.onBeforeBindBuffer = function(isElementArrayBuffer, buffer, lineID){
  if (!this.doNotCache){
    if (isElementArrayBuffer && this.lastBindElementArrayBuffer){
      if (this.lastBindElementArrayBuffer == buffer){
        return;
      }
    }else if (!isElementArrayBuffer && this.lastBindArrayBuffer){
      if (this.lastBindArrayBuffer == buffer){
        return;
      }
    }
  }
  if (isElementArrayBuffer){
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    if (!this.doNotCache){
      this.lastBindElementArrayBuffer = buffer;
    }
  }else{
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    if (!this.doNotCache){
      this.lastBindArrayBuffer = buffer;
    }
  }
}
