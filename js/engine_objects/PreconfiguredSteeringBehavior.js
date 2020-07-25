var PreconfiguredSteeringBehavior = function(parameters){
  this.parameters = parameters;
}

PreconfiguredSteeringBehavior.prototype.export = function(){
  var exported = JSON.parse(JSON.stringify(this.parameters));

  var params = this.parameters;

  if (params.type == steeringHandler.steeringBehaviorTypes.BLENDED){
    for (var i = 0; i < params.list.length; i++){
      exported.list[i].behavior = params.list[i].behavior.export();
    }
  }else if (params.type == steeringHandler.steeringBehaviorTypes.PRIORITY){
    for (var i = 0; i < params.list.length; i++){
      exported.list[i] = params.list[i].export();
    }
  }

  return exported;
}

PreconfiguredSteeringBehavior.prototype.getBehavior = function(object){
  var params = this.parameters;

  switch (params.type){
    case steeringHandler.steeringBehaviorTypes.ALIGN: return new Kompute.AlignBehavior();
    case steeringHandler.steeringBehaviorTypes.ARRIVE: return new Kompute.ArriveBehavior({satisfactionRadius: params.satisfactionRadius, slowDownRadius: params.slowDownRadius});
    case steeringHandler.steeringBehaviorTypes.AVOID: return new Kompute.AvoidBehavior({maxSeeAhead: params.maxSeeAhead, maxAvoidForce: params.maxAvoidForce});
    case steeringHandler.steeringBehaviorTypes.BLENDED:
      var list = [];
      for (var i = 0; i < params.list.length; i ++){
        var curListItem = params.list[i];
        list.push({behavior: curListItem.behavior.getBehavior(object), weight: curListItem.weight});
      }
    return new Kompute.BlendedSteeringBehavior(list);
    case steeringHandler.steeringBehaviorTypes.COHESIION: return new Kompute.CohesionBehavior();
    case steeringHandler.steeringBehaviorTypes.EVADE: return new Kompute.EvadeBehavior({maxPredictionTime: params.maxPredictionTime});
    case steeringHandler.steeringBehaviorTypes.FLEE: return new Kompute.FleeBehavior();
    case steeringHandler.steeringBehaviorTypes.HIDE: return new Kompute.HideBehavior({
      arriveSatisfactionRadius: params.arriveSatisfactionRadius,
      arriveSlowDownRadius: params.arriveSlowDownRadius,
      hideDistance: params.hideDistance,
      threatDistance: params.threatDistance
    });
    case steeringHandler.steeringBehaviorTypes.LOOK_WHERE_YOU_ARE_GOING: return new Kompute.LookWhereYouAreGoingBehavior();
    case steeringHandler.steeringBehaviorTypes.PATH_FOLLOWING:
      var path;
      var komputePath = steeringHandler.usedPathIDs[params.pathID];
      if (!komputePath){
        komputePath = steeringHandler.usedAStarIDs[params.pathID].path;
        path = komputePath;
      }else{
        path = komputePath.clone();
      }
    return new Kompute.PathFollowingBehavior({path: path, satisfactionRadius: params.satisfactionRadius});
    case steeringHandler.steeringBehaviorTypes.PRIORITY:
      var list = [];
      for (var i = 0; i < params.list.length; i ++){
        list.push(params.list[i].getBehavior(object));
      }
    return new Kompute.PrioritySteeringBehavior({list: list, threshold: params.threshold});
    case steeringHandler.steeringBehaviorTypes.PURSUE: return new Kompute.PursueBehavior({maxPredictionTime: params.maxPredictionTime});
    case steeringHandler.steeringBehaviorTypes.RANDOM_PATH:
      var graph = steeringHandler.usedGraphIDs[params.graphID].clone();
      var clonedGraphs = steeringHandler.clonedGraphsBySceneName[object.registeredSceneName] || [];
      clonedGraphs.push(graph);
      steeringHandler.clonedGraphsBySceneName[object.registeredSceneName] = clonedGraphs;
    return new Kompute.RandomPathBehavior({graph: graph, satisfactionRadius: params.satisfactionRadius});
    case steeringHandler.steeringBehaviorTypes.RANDOM_WAYPOINT:
      var path = steeringHandler.usedPathIDs[params.pathID].clone();
    return new Kompute.RandomWaypointBehavior({path: path, satisfactionRadius: params.satisfactionRadius});
    case steeringHandler.steeringBehaviorTypes.SEEK: return new Kompute.SeekBehavior();
    case steeringHandler.steeringBehaviorTypes.SEPARATION: return new Kompute.SeparationBehavior({strength: params.strength});
    case steeringHandler.steeringBehaviorTypes.WANDER_TWO: return new Kompute.Wander2DBehavior({
      angleChange: params.angleChange,
      normal: new Kompute.Vector3D(params.normalX, params.normalY, params.normalZ),
      wanderCircleDistance: params.wanderCircleDistance,
      wanderCircleRadius: params.wanderCircleRadius
    });
    case steeringHandler.steeringBehaviorTypes.WANDER_THREE: return new Kompute.Wander3DBehavior({
      angleChange: params.angleChange,
      wanderSphereDistance: params.wanderSphereDistance,
      wanderSphereRadius: params.wanderSphereRadius
    });
  }
}
