// WARNING: THIS CLASS IS NO LONGER USED AND IS NOT COMPATIBLE WITH PHYSICS WORKERS
// PHYSICS TEST COMMANDS ARE DEPRECATED
var PhysicsTest = function(metadata, duration){

  this.metadata = metadata;
  this.duration = duration;

  this.key = new Date().getUTCMilliseconds();
  this.startTime = new Date().toLocaleString();
  this.status = "RUNNING";

  if (physicsTests[this.key]){
    terminal.printError(Text.PHY_TEST_KEY_NOT_UNIQUE);
    return false;
  }

  this.material =  new THREE.MeshBasicMaterial({
    color: physicsTestObjectMaterialColor,
    side: THREE.DoubleSide,
    wireframe: false,
    transparent: true,
    opacity: 0.5
  });

  if (metadata["type"] == PHYSICS_TEST_TYPE_BOX){
    this.initBoxTest();
  }else if (metadata["type"] == PHYSICS_TEST_TYPE_SPHERE){
    this.initSphereTest();
  }

  physicsTests[this.key] = this;

  previewScene.add(this.mesh);
  physicsWorld.add(this.physicsBody);

  this.timeoutID = setTimeout(this.endTest.bind(this), (this.duration * 1000));

}

PhysicsTest.prototype.initBoxTest = function(){
  this.geometry = new THREE.BoxGeometry(
    this.metadata["sizeX"],
    this.metadata["sizeY"],
    this.metadata["sizeZ"]
  );
  this.mesh = new THREE.Mesh( this.geometry, this.material );
  this.mesh.position.x = this.metadata["positionX"];
  this.mesh.position.y = this.metadata["positionY"];
  this.mesh.position.z = this.metadata["positionZ"];
  this.physicsShape = new CANNON.Box(new CANNON.Vec3(
    this.metadata["sizeX"] / 2,
    this.metadata["sizeY"] / 2,
    this.metadata["sizeZ"] / 2
  ));
  this.physicsBody = new CANNON.Body({
    mass: this.metadata["mass"],
    shape: this.physicsShape
  });
  this.physicsBody.position.set(
    this.metadata["positionX"],
    this.metadata["positionY"],
    this.metadata["positionZ"]
  );
}

PhysicsTest.prototype.initSphereTest = function(){
  this.geometry = new THREE.SphereGeometry( this.metadata["radius"], 32, 32 );
  this.mesh = new THREE.Mesh( this.geometry, this.material );
  this.mesh.position.x = this.metadata["positionX"];
  this.mesh.position.y = this.metadata["positionY"];
  this.mesh.position.z = this.metadata["positionZ"];
  this.physicsShape = new CANNON.Sphere(this.metadata["radius"]);
  this.physicsBody = new CANNON.Body({
    mass: this.metadata["mass"],
    shape: this.physicsShape
  });
  this.physicsBody.position.set(
    this.metadata["positionX"],
    this.metadata["positionY"],
    this.metadata["positionZ"]
  );
}

PhysicsTest.prototype.endTest = function(){
  previewScene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  this.status = "FINISHED";
}

PhysicsTest.prototype.restart = function(){
  if (this.status != "FINISHED"){
    this.endTest();
    clearTimeout(this.timeoutID);
  }

  this.status = "RUNNING";

  if (this.metadata["type"] == PHYSICS_TEST_TYPE_BOX){
    this.initBoxTest();
  }else if (this.metadata["type"] == PHYSICS_TEST_TYPE_SPHERE){
    this.initSphereTest();
  }

  previewScene.add(this.mesh);
  physicsWorld.add(this.physicsBody);

  this.timeoutID = setTimeout(this.endTest.bind(this), (this.duration * 1000));

}
