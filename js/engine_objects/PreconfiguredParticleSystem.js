var PreconfiguredParticleSystem = function(name, type, params){
  this.name = name;
  this.type = type;
  this.params = {}
  for (var key in params){
    this.params[key] = params[key];
  }
}
