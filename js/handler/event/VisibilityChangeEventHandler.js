var VisibilityChangeEventHandler = function(){
  var hiddenText, visibilityChange;
  if (!(typeof document.hidden == UNDEFINED)){
    hiddenText = "hidden";
    visibilityChange = "visibilitychange";
  }else if (!(typeof document.mozHidden == UNDEFINED)){
    hiddenText = "mozHidden";
    visibilityChange = "mozvisibilitychange";
  }else if (!(typeof document.msHidden == UNDEFINED)){
    hiddenText = "msHidden";
    visibilityChange = "msvisibilitychange";
  }else if (!(typeof document.webkitHidden == UNDEFINED)){
    hiddenText = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  if (visibilityChange){
    this.hiddenText = hiddenText;
    document.addEventListener(visibilityChange, this.onVisibilityChange, false);
  }
}

VisibilityChangeEventHandler.prototype.onVisibilityChange = function(event){
  isScreenVisible = !(document[visibilityChangeEventHandler.hiddenText]);
}
