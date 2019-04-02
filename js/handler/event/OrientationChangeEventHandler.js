var OrientationChangeEventHandler = function(){
  if (!isMobile){
    return;
  }
  window.addEventListener('orientationchange', resizeEventHandler.onResize);
}
