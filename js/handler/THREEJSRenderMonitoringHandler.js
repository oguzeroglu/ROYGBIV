var THREEJSRenderMonitoringHandler = function(){
  this.record = false;
  this.currentRenderCallCountPerFrame = 0;
  this.maxRenderCallCountPerFrame = 0;
  this.currentPassName = "";
}

THREEJSRenderMonitoringHandler.prototype.startRecording = function(){
  this.renderOperations = [];
  for (var i =0 ; i<this.maxRenderCallCountPerFrame; i++){
    this.renderOperations.push({
      performanceLogs: {
        updateSceneCameraMatrixWorld: 0,
        renderStateInit: 0,
        frustumSet: 0,
        initClipping: 0,
        renderListInit: 0,
        projectObject: 0,
        renderListSort: 0,
        renderTargetSet: 0,
        backgroundRender: 0,
        renderObjects: 0,
        updateRenderTargetMipmap: 0,
        setTestMaskPolygonOffset: 0
      },
      counters: {
        updateSceneCameraMatrixWorld: 0,
        renderStateInit: 0,
        frustumSet: 0,
        initClipping: 0,
        renderListInit: 0,
        projectObject: 0,
        renderListSort: 0,
        renderTargetSet: 0,
        backgroundRender: 0,
        renderObjects: 0,
        updateRenderTargetMipmap: 0,
        setTestMaskPolygonOffset: 0
      },
      passName: ""
    })
  }
  this.record = true;
}

THREEJSRenderMonitoringHandler.prototype.dumpPerformanceLogs = function(){
  var performances = [];
  var totalRenderTime = 0;
  for (var i = 0; i<this.renderOperations.length; i++){
    var curRenderOperation = this.renderOperations[i];
    var curPerformanceLogs = curRenderOperation.performanceLogs;
    var curTotalTime = 0;
    for (var operationKey in curPerformanceLogs){
      curTotalTime += curPerformanceLogs[operationKey];
    }
    totalRenderTime += curTotalTime;
    performances.push({
      totalTime: curTotalTime,
      renderOperationIndex: i,
      passName: curRenderOperation.passName
    });
  }
  console.log("%cTotal WebGLRenderer.render time: "+totalRenderTime+" ms.", "background: black; color: magenta");
  performances.sort(function(a, b){
    return b.totalTime - a.totalTime;
  });
  for (var i = 0 ; i<performances.length; i++){
    console.log("%c   "+performances[i].passName+"  [Render #"+performances[i].renderOperationIndex+"] -> "+performances[i].totalTime+" ms.", "background: black; color: yellow");
    var curPerformanceLogs = this.renderOperations[performances[i].renderOperationIndex].performanceLogs;
    var performanceLogsAry = [];
    for (var operationKey in curPerformanceLogs){
      performanceLogsAry.push({
        key: operationKey, time: curPerformanceLogs[operationKey]
      });
    }
    performanceLogsAry.sort(function(a, b){
      return b.time - a.time
    });
    for (var i2 = 0; i2<performanceLogsAry.length; i2++){
      console.log("%c     ["+performanceLogsAry[i2].key+"]: "+performanceLogsAry[i2].time+" ms.", "background: black; color: lightcyan");
    }
  }
}

THREEJSRenderMonitoringHandler.prototype.dispatchEvent = function(eventID, isStartEvent){
  if (!this.record){
    return;
  }
  if (!this.renderOperations[this.currentRenderCallCountPerFrame-1]){
    this.maxRenderCallCountPerFrame = this.currentRenderCallCountPerFrame;
    this.startRecording();
    return;
  }
  var curCounter = this.renderOperations[this.currentRenderCallCountPerFrame-1].counters;
  var curPerformanceLogs = this.renderOperations[this.currentRenderCallCountPerFrame-1].performanceLogs;
  this.renderOperations[this.currentRenderCallCountPerFrame-1].passName = this.currentPassName;
  switch(eventID){
    case 0:
      if (isStartEvent){
        curCounter.updateSceneCameraMatrixWorld = performance.now();
      }else{
        curPerformanceLogs.updateSceneCameraMatrixWorld = performance.now() - curCounter.updateSceneCameraMatrixWorld;
      }
    break;
    case 1:
      if (isStartEvent){
        curCounter.renderStateInit = performance.now();
      }else{
        curPerformanceLogs.renderStateInit = performance.now() - curCounter.renderStateInit;
      }
    break;
    case 2:
      if (isStartEvent){
        curCounter.frustumSet = performance.now();
      }else{
        curPerformanceLogs.frustumSet = performance.now() - curCounter.frustumSet;
      }
    break;
    case 3:
      if (isStartEvent){
        curCounter.initClipping = performance.now();
      }else{
        curPerformanceLogs.initClipping = performance.now() - curCounter.initClipping;
      }
    break;
    case 4:
      if (isStartEvent){
        curCounter.renderListInit = performance.now();
      }else{
        curPerformanceLogs.renderListInit = performance.now() - curCounter.renderListInit;
      }
    break;
    case 5:
      if (isStartEvent){
        curCounter.projectObject = performance.now();
      }else{
        curPerformanceLogs.projectObject = performance.now() - curCounter.projectObject;
      }
    break;
    case 6:
      if (isStartEvent){
        curCounter.renderListSort = performance.now();
      }else{
        curPerformanceLogs.renderListSort = performance.now() - curCounter.renderListSort;
      }
    break;
    case 7:
      if (isStartEvent){
        curCounter.renderTargetSet = performance.now();
      }else{
        curPerformanceLogs.renderTargetSet = performance.now() - curCounter.renderTargetSet;
      }
    break;
    case 8:
      if (isStartEvent){
        curCounter.backgroundRender = performance.now();
      }else{
        curPerformanceLogs.backgroundRender = performance.now() - curCounter.backgroundRender;
      }
    break;
    case 9:
      if (isStartEvent){
        curCounter.renderObjects = performance.now();
      }else{
        curPerformanceLogs.renderObjects = performance.now() - curCounter.renderObjects;
      }
    break;
    case 10:
      if (isStartEvent){
        curCounter.updateRenderTargetMipmap = performance.now();
      }else{
        curPerformanceLogs.updateRenderTargetMipmap = performance.now() - curCounter.updateRenderTargetMipmap;
      }
    break;
    case 11:
      if (isStartEvent){
        curCounter.setTestMaskPolygonOffset = performance.now();
      }else{
        curPerformanceLogs.setTestMaskPolygonOffset = performance.now() - curCounter.setTestMaskPolygonOffset;
      }
    break;
  }
}
