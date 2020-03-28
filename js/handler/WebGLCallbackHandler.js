var WebGLCallbackHandler = function(){
  this.record = false;
  this.performanceLogs = {
    drawElementsInstancedANGLE: 0,
    drawArraysInstancedANGLE: 0,
    drawElements: 0,
    drawArrays: 0,
    uniformMatrix4fv: 0,
    uniformMatrix3fv: 0,
    uniformMatrix2fv: 0,
    uniform4iv: 0,
    uniform3iv: 0,
    uniform2iv: 0,
    uniform1iv: 0,
    uniform4fv: 0,
    uniform3fv: 0,
    uniform2fv: 0,
    uniform1fv: 0,
    uniform1i: 0,
    uniform4f: 0,
    uniform3f: 0,
    uniform2f: 0,
    uniform1f: 0,
    blendFuncSeparate: 0,
    blendFunc: 0,
    blendEquationSeparate: 0,
    blendEquation: 0,
    useProgram: 0,
    linkProgram: 0,
    attachShader: 0,
    compileShader: 0,
    shaderSource: 0,
    activeTexture: 0,
    bindTexture: 0,
    vertexAttribPointer: 0,
    bindBuffer: 0
  }
  this.doNotCache = false;
  this.gl = renderer.getContext();
  this.vertexAttribPointerCache = new Map();
  this.bindedCubeTextureCache = new Map();
}

WebGLCallbackHandler.prototype.startRecording = function(){
  this.record = true;
}

WebGLCallbackHandler.prototype.dumpPerformanceLogs = function(){
  var sum = 0;
  var pseudoAry = [];
  for (var key in this.performanceLogs){
    sum += this.performanceLogs[key];
    pseudoAry.push({
      name: key,
      value: this.performanceLogs[key]
    })
  }
  pseudoAry.sort(function(obj1, obj2){
    return obj2.value - obj1.value
  });
  console.log("%cTotal time: "+sum+" ms.", "background: black; color: magenta")
  for (var i = 0; i<pseudoAry.length; i++){
    console.log("%c["+pseudoAry[i].name+"] -> "+pseudoAry[i].value+" ms.", "background: black; color: yellow");
  }
}

WebGLCallbackHandler.prototype.registerEngineObject = function(object){
  object.mesh.onBeforeRender = function(){
    webglCallbackHandler.onBeforeRender(object);
    if (object.onBeforeRender){
      object.onBeforeRender();
    }
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

WebGLCallbackHandler.prototype.onBeforeDrawElementsInstancedANGLE = function(ext, mode, count, type, offset, maxCount){
  if (this.record){
    s = performance.now();
    ext.drawElementsInstancedANGLE(mode, count, type, offset, maxCount);
    this.performanceLogs.drawElementsInstancedANGLE = performance.now() - s;
  }else{
    ext.drawElementsInstancedANGLE(mode, count, type, offset, maxCount);
  }
}

WebGLCallbackHandler.prototype.onBeforeDrawArraysInstancedANGLE = function(ext, mode, start, count, maxCount){
  if (this.record){
    s = performance.now();
    ext.drawArraysInstancedANGLE(mode, start, count, maxCount);
    this.performanceLogs.drawArraysInstancedANGLE = performance.now() - s;
  }else{
    ext.drawArraysInstancedANGLE(mode, start, count, maxCount);
  }
}

WebGLCallbackHandler.prototype.onBeforeDrawElements = function(mode, count, type, offset){
  if (this.record){
    s = performance.now();
    this.gl.drawElements(mode, count, type, offset);
    this.performanceLogs.drawElements = performance.now() - s;
  }else{
    this.gl.drawElements(mode, count, type, offset);
  }
}

WebGLCallbackHandler.prototype.onBeforeDrawArrays = function(mode, start, count){
  if (this.record){
    s = performance.now();
    this.gl.drawArrays(mode, start, count);
    this.performanceLogs.drawArrays = performance.now() - s;
  }else{
    this.gl.drawArrays(mode, start, count);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniformMatrix4fv = function(location, transpose, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniformMatrix4fv(location, transpose, v);
    this.performanceLogs.uniformMatrix4fv = performance.now() - s;
  }else{
    this.gl.uniformMatrix4fv(location, transpose, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniformMatrix3fv = function(location, transpose, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniformMatrix3fv(location, transpose, v);
    this.performanceLogs.uniformMatrix3fv = performance.now() - s;
  }else{
    this.gl.uniformMatrix3fv(location, transpose, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniformMatrix2fv = function(location, transpose, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniformMatrix2fv(location, transpose, v);
    this.performanceLogs.uniformMatrix2fv = performance.now() - s;
  }else{
    this.gl.uniformMatrix2fv(location, transpose, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform4iv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform4iv(location, v);
    this.performanceLogs.uniform4iv = performance.now() - s;
  }else{
    this.gl.uniform4iv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform3iv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform3iv(location, v);
    this.performanceLogs.uniform3iv = performance.now() - s;
  }else{
    this.gl.uniform3iv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform2iv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform2iv(location, v);
    this.performanceLogs.uniform2iv = performance.now() - s;
  }else{
    this.gl.uniform2iv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform1iv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform1iv(location, v);
    this.performanceLogs.uniform1iv = performance.now() - s;
  }else{
    this.gl.uniform1iv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform4fv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform4fv(location, v);
    this.performanceLogs.uniform4fv = performance.now() - s;
  }else{
    this.gl.uniform4fv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform3fv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform3fv(location, v);
    this.performanceLogs.uniform3fv = performance.now() - s;
  }else{
    this.gl.uniform3fv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform2fv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform2fv(location, v);
    this.performanceLogs.uniform2fv = performance.now() - s;
  }else{
    this.gl.uniform2fv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform1fv = function(location, v){
  if (this.record){
    var s = performance.now();
    this.gl.uniform1fv(location, v);
    this.performanceLogs.uniform1fv = performance.now() - s;
  }else{
    this.gl.uniform1fv(location, v);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform1i = function(location, unit){
  if (this.record){
    var s = performance.now();
    this.gl.uniform1i(location, unit);
    this.performanceLogs.uniform1i = performance.now() - s;
  }else{
    this.gl.uniform1i(location, unit);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform4f = function(location, v0, v1, v2, v3){
  if (this.record){
    var s = performance.now();
    this.gl.uniform4f(location, v0, v1, v2, v3);
    this.performanceLogs.uniform4f = performance.now() - s;
  }else{
    this.gl.uniform4f(location, v0, v1, v2, v3);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform3f = function(location, v0, v1, v2){
  if (this.record){
    var s = performance.now();
    this.gl.uniform3f(location, v0, v1, v2);
    this.performanceLogs.uniform3f = performance.now() - s;
  }else{
    this.gl.uniform3f(location, v0, v1, v2);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform2f = function(location, v0, v1){
  if (this.record){
    var s = performance.now();
    this.gl.uniform2f(location, v0, v1);
    this.performanceLogs.uniform2f = performance.now() - s;
  }else{
    this.gl.uniform2f(location, v0, v1);
  }
}

WebGLCallbackHandler.prototype.onBeforeUniform1f = function(location, v0){
  if (this.record){
    var s = performance.now();
    this.gl.uniform1f(location, v0);
    this.performanceLogs.uniform1f = performance.now() - s;
  }else{
    this.gl.uniform1f(location, v0);
  }
}

WebGLCallbackHandler.prototype.onBeforeBlendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha, lineID){
  if (this.record){
    var s = performance.now();
    this.gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
    this.performanceLogs.blendFuncSeparate = performance.now() - s;
  }else{
    this.gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
  }
}

WebGLCallbackHandler.prototype.onBeforeBlendFunc = function(sFactor, dFactor, lineID){
  if (this.record){
    var s = performance.now();
    this.gl.blendFunc(sFactor, dFactor);
    this.performanceLogs.blendFunc = performance.now() - s;
  }else{
    this.gl.blendFunc(sFactor, dFactor);
  }
}

WebGLCallbackHandler.prototype.onBeforeBlendEquationSeparate = function(func, funcAlpha, lineID){
  if (!this.doNotCache){
    if (this.blendEquationRGBCache && this.blendEquationRGBCache == func){
      if (this.blendEquationAlphaCache && this.blendEquationAlphaCache == funcAlpha){
        return;
      }
    }
  }
  if (this.record){
    var s = performance.now();
    this.gl.blendEquationSeparate(func, funcAlpha);
    this.performanceLogs.blendEquationSeparate = performance.now() - s;
  }else{
    this.gl.blendEquationSeparate(func, funcAlpha);
  }
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
  if (this.record){
    var s = performance.now();
    this.gl.blendEquation(func);
    this.performanceLogs.blendEquation = performance.now() - s;
  }else{
    this.gl.blendEquation(func);
  }
  if (!this.doNotCache){
    this.blendEquationRGBCache = func;
    this.blendEquationAlphaCache = func;
  }
}

WebGLCallbackHandler.prototype.onBeforeUseProgram = function(program){
  if (this.record){
    var s = performance.now();
    this.gl.useProgram(program);
    this.performanceLogs.useProgram = performance.now() - s;
  }else{
    this.gl.useProgram(program);
  }
}

WebGLCallbackHandler.prototype.onBeforeLinkProgram = function(program){
  if (this.record){
    var s = performance.now();
    this.gl.linkProgram(program);
    this.performanceLogs.linkProgram = performance.now() - s;
  }else{
    this.gl.linkProgram(program);
  }
}

WebGLCallbackHandler.prototype.onBeforeAttachShader = function(program, shader){
  if (this.record){
    var s = performance.now();
    this.gl.attachShader(program, shader);
    this.performanceLogs.attachShader = performance.now() - s;
  }else{
    this.gl.attachShader(program, shader);
  }
}

WebGLCallbackHandler.prototype.onBeforeCompileShader = function(shader){
  if (this.record){
    var s = performance.now();
    this.gl.compileShader(shader);
    this.performanceLogs.compileShader = performance.now() - s;
  }else{
    this.gl.compileShader(shader);
  }
}

WebGLCallbackHandler.prototype.onBeforeShaderSource = function(shader, string){
  if (this.record){
    var s = performance.now();
    this.gl.shaderSource(shader, string);
    this.performanceLogs.shaderSource = performance.now() - s;
  }else{
    this.gl.shaderSource(shader, string);
  }
}

WebGLCallbackHandler.prototype.onBeforeActiveTexture = function(slot){
  if (!this.doNotCache){
    this.activeTextureSlot = slot;
  }
  if (this.record){
    var s = performance.now();
    this.gl.activeTexture(slot);
    this.performanceLogs.activeTexture = performance.now() - s;
  }else{
    this.gl.activeTexture(slot);
  }
}

WebGLCallbackHandler.prototype.onBeforeBindTexture = function(type, texture, lineID){
  if (this.record){
    var s = performance.now();
    this.gl.bindTexture(type, texture);
    this.performanceLogs.bindTexture = performance.now() - s;
  }else{
    this.gl.bindTexture(type, texture);
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
  if (this.record){
    var s = performance.now();
    this.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    this.performanceLogs.vertexAttribPointer = performance.now() - s;
  }else{
    this.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  }
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
  if (isElementArrayBuffer){
    if (this.record){
      var s = performance.now();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
      this.performanceLogs.bindBuffer = performance.now() - s;
    }else{
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
  }else{
    if (this.record){
      var s = performance.now();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.performanceLogs.bindBuffer = performance.now() - s;
    }else{
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    }
  }
}
