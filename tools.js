/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tools');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    ensureCreep: function(spawn, name, role) {
        if(role == 'upgrader') {
            spawn.createCreep([WORK,MOVE,CARRY], name, {role: role});
        }
    },
    nextFreeSource: function(creep) {
        
    },
    getCreepNamesByRole: function(role) {
        var creeps = [];
        for (var creepname in Game.creeps) {
            if (Game.creeps[creepname].memory.role == role) {
                creeps.push(creepname);
            } 
        }
        return creeps;
    },
    getCreepsByRole: function(role) {
        var creeps = [];
        var creepNames = this.getCreepNamesByRole(role);
        for (var idx in creepNames) {
            creeps.push(Game.creeps[creepNames[idx]]);
        }
        return creeps;
    },
    getCreepIdsByRole: function(role) {
        var creeps = this.getCreepNamesByRole(role);
        var creep_ids = [];
        for(var idx in creeps) {
            creep_ids.push(Game.creeps[creeps[idx]].id);
        }
        console.log("creepIdsByRole:" + creep_ids);
        return creep_ids;
    },
    roleCall: function() {
        for(var idx in Game.creeps) {
            Game.creeps[idx].say(Game.creeps[idx].memory.role);
        }
    },
    findFarthestEnergySourceCreep(pos) {
        return Game.creeps.John;
    },
    genBodyArrayFromBodyMap: function(bodymap) {
        var body = [];
        console.log("Generating body from bodymap: "+ JSON.stringify(bodymap));
        for(var bodypart in bodymap) {
            var nPart = bodymap[bodypart];
            console.log(bodypart + ":" + nPart);
            for(var i = 0; i < nPart; ++i) {
                body.push(bodypart);
            }
        }
        console.log(body);
        return body;
    },
    genBody: function(bodyPlan, energyLevel) {
        var bodyparts = {}
        var minEnergy = 0;
        console.log("Creating body:"+ JSON.stringify(bodyPlan));
        for(var bodypart in bodyPlan.ensure) {
            console.log("Bodypart:" + bodypart + ":" + BODYPART_COST[bodypart]);
            minEnergy += BODYPART_COST[bodypart] * bodyPlan.ensure[bodypart];
            bodyparts[bodypart] = bodyPlan.ensure[bodypart];
        }
        console.log("Minenergy:" + minEnergy);
        if(minEnergy > energyLevel) {
            console.log("ERROR: Cannot build builder with " + energyLevel + " energy.");
            return null;
        }
        var energyDistributable = energyLevel - minEnergy;
        for(var part in bodyPlan.parts){
            bodyparts[part] += Math.floor(bodyPlan.parts[part]*Math.floor(energyDistributable/BODYPART_COST[part]));
        }
        console.log("bodyparts:" + JSON.stringify(bodyparts));
        var ret = this.genBodyArrayFromBodyMap(bodyparts);
        console.log("Result-Body:" + JSON.stringify(ret));
        return ret;
    }

};
