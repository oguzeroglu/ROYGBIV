var HashChangeEventHandler = function(){
  window.onhashchange = this.onHashChange;
}

HashChangeEventHandler.prototype.onHashChange = function(){
  if (mode == 1 && hashChangeCallbackFunction){
    var newHash = window.location.hash;
    if (newHash && newHash.startsWith("#")){
      newHash = newHash.substr(1);
    }
    hashChangeCallbackFunction(newHash);
  }
}
