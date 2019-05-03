var PhysicsBodyGenerator = function(){

}

PhysicsBodyGenerator.prototype.addImpulseInfo = function(body){
  body.impulseVec1 = new CANNON.Vec3();
  body.impulseVec2 = new CANNON.Vec3();
  return body;
}

PhysicsBodyGenerator.prototype.generateBodyFromSameShape = function(sourceBody){
  return this.addImpulseInfo(new CANNON.Body({
      mass: 0,
      shape: sourceBody.shapes[0],
      material: new CANNON.Material()
  }));
}

PhysicsBodyGenerator.prototype.generateEmptyBody = function(){
  var physicsMaterial = new CANNON.Material();
  var physicsBody = new CANNON.Body({mass: 0, material: physicsMaterial});
  return this.addImpulseInfo(physicsBody);
}

PhysicsBodyGenerator.prototype.generateBoxBody = function(params){
  var physicsShapeKey = "BOX" + PIPE + params["x"] + PIPE + params["y"] + PIPE + params["z"];
  var surfacePhysicsShape = physicsShapeCache[physicsShapeKey];
  if (!surfacePhysicsShape){
    surfacePhysicsShape = new CANNON.Box(new CANNON.Vec3(params["x"], params["y"], params["z"]));
    physicsShapeCache[physicsShapeKey] = surfacePhysicsShape;
  }
  var mass = 0;
  if (!(typeof params.mass == UNDEFINED)){
    mass = params.mass;
  }
  var material;
  if (typeof params.material == UNDEFINED){
    material = new CANNON.Material();
  }else{
    material = params.material;
  }
  var surfacePhysicsBody = new CANNON.Body({mass: mass, shape: surfacePhysicsShape, material: material});
  return this.addImpulseInfo(surfacePhysicsBody);
}

PhysicsBodyGenerator.prototype.generateCylinderBody = function(params){
  var radialSegments = 8;
  if (params.radialSegments){
    radialSegments = params.radialSegments;
  }
  var physicsShapeKey = "CYLINDER" + PIPE + params.topRadius + PIPE + params.bottomRadius + PIPE + Math.abs(params.height) + PIPE + radialSegments + PIPE + params.axis + PIPE + (params.height > 0);
  var cylinderPhysicsShape = physicsShapeCache[physicsShapeKey];
  var cached = false;
  if (!cylinderPhysicsShape){
      cylinderPhysicsShape = new CANNON.Cylinder(params.topRadius, params.bottomRadius, Math.abs(params.height), radialSegments);
      physicsShapeCache[physicsShapeKey] = cylinderPhysicsShape;
  }else{
    cached = true;
  }
  cylinderPhysicsShape.topRadius = params.topRadius;
  cylinderPhysicsShape.bottomRadius = params.bottomRadius;
  cylinderPhysicsShape.height = Math.abs(params.height);
  if (params.axis == "XZ"){
    if (!cached){
      var quat = new CANNON.Quaternion();
      var coef = 1;
      if (params.height < 0){
        coef = -1;
      }
      quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2 * coef);
      var translation = new CANNON.Vec3(0, 0, 0);
      cylinderPhysicsShape.transformAllPoints(translation, quat);
    }
  }else if (params.axis == "XY"){
    if (!cached){
      if (params.height < 0){
        var quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);
        var translation = new CANNON.Vec3(0, 0, 0);
        cylinderPhysicsShape.transformAllPoints(translation, quat);
      }
    }
  }else if (params.axis == "YZ"){
    if (!cached){
      var quat = new CANNON.Quaternion();
      var coef = 1;
      if (params.height < 0){
        coef = -1;
      }
      quat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), coef * Math.PI/2);
      var translation = new CANNON.Vec3(0, 0, 0);
      cylinderPhysicsShape.transformAllPoints(translation, quat);
    }
  }
  var physicsMaterial;
  var mass;
  if (!params.material){
    physicsMaterial = new CANNON.Material();
  }else{
    physicsMaterial = params.material;
  }
  if (typeof params.mass == UNDEFINED){
    mass = 0;
  }else{
    mass = params.mass
  }
  var cylinderPhysicsBody = new CANNON.Body({mass: mass, shape: cylinderPhysicsShape, material: physicsMaterial});
  return this.addImpulseInfo(cylinderPhysicsBody);
}

PhysicsBodyGenerator.prototype.generateSphereBody = function(params){
  var physicsShapeKey = "SPHERE" + PIPE + params.radius;
  var spherePhysicsShape = physicsShapeCache[physicsShapeKey];
  if (!spherePhysicsShape){
    spherePhysicsShape = new CANNON.Sphere(Math.abs(params.radius));
    physicsShapeCache[physicsShapeKey] = spherePhysicsShape;
  }
  var physicsMaterial = new CANNON.Material();
  var mass = 0;
  if (!(typeof params.mass == UNDEFINED)){
    mass = params.mass;
  }
  var spherePhysicsBody = new CANNON.Body({mass: mass, shape: spherePhysicsShape, material: physicsMaterial});
  return this.addImpulseInfo(spherePhysicsBody);
}
