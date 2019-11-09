var Sprite = function(name){
  this.isSprite = true;
  this.name = name;
  this.geometry = new THREE.PlaneBufferGeometry(5, 5);
  this.mesh = new MeshGenerator().generateSprite(this);
  scene.add(this.mesh);
}
