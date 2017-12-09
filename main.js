var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleExtractor = require('role.extractor');
var rolePowerCord = require('role.powercord');
var roleMover = require('role.mover');
var tools = require('tools');

var sources = [{p:0, refs: 0},{p:0, refs:0}]

function spawnCreeps(spawn) {
    //if(Memory.harvesters===undefined) {
        //console.log("Harvesters:" + Memory.harvesters.length);
        //for(var idx in Game.creeps) {
        //    if(Game.creeps[idx].memory.role == 'harvester') {
        //        Memory.harvesters.push(Game.creeps[idx].id);
        //    }
        //}
    //}
    
    
    
    var dummy = {};
    dummy.sources = {};
    var sources = spawn.room.find(FIND_SOURCES);
    console.log("Sources1st" + sources);
    for(var source in sources) {
        console.log("Saving source" + sources[source].id);
        dummy.sources[sources[source].id] = {nExtractors:0};
    }
    Memory.rooms[spawn.room.name] = dummy;
    
    var uppys = tools.getCreepNamesByRole('upgrader');
    var builders = tools.getCreepNamesByRole('builder');
    var extractors = tools.getCreepNamesByRole('extractor');
    console.log("Harvesters:" + Memory.harvesters.length + 
        ' Upgraders:' + uppys.length + ' Builders:' + builders.length + 
        ' Extractors:' + extractors.length);
    
    //console.log("nHarvesters" + Memory.harvesters.length)
    if(Memory.harvesters.length < 2) {
        console.log("Trying to spawn harvester:");
        var creepname = spawn.createCreep(tools.genBody(roleHarvester.bodyPlan, spawn.room.energyAvailable), null, {role: 'harvester'});
        console.log(typeof creepname);
        if(typeof creepname==='string') {
            Memory.harvesters.push(Game.creeps[creepname].id);
        }
    } else {
        if(uppys.length < 2){
            spawn.createCreep(tools.genBody(roleUpgrader.bodyPlan, spawn.room.energyAvailable), null, {role: 'upgrader'});
        }
        
        if(builders.length < 3) {
            spawn.createCreep(tools.genBody(roleBuilder.bodyPlan, spawn.room.energyAvailable), null, {role: 'builder', activity: 'Recharging'});
        }
        
        var sources = spawn.room.find(FIND_SOURCES);
        console.log(sources);
        for(var source in sources) {
            console.log("This is in sources:" + source);
        }
        if(extractors.length < sources.length) {
            sources.sort(function(a,b){
                return Memory.rooms[spawn.room.name].sources[a.id].nExtractors > Memory.rooms[spawn.room.name].sources[b.id].nExtractors;
            });
            var s = spawn.createCreep(tools.genBody(roleExtractor.bodyPlan, spawn.room.energyAvailable), null, {role: 'extractor', activity: 'Recharging', source: sources[0].id});
            if(typeof s === 'string') {
                console.log("Created Extractor " + s.name + " Assigning it to source "+ sources[0].id);
            }
        }
    }
}


function tower_run(tower) {
    var dmgStrucs = tower.room.find(FIND_STRUCTURES, {
       filter: function(o) {
           return o.hits < o.hitsMax && (o.structureType == STRUCTURE_ROAD || o.my);
       }
    });
    console.log(JSON.stringify(dmgStrucs));
    dmgStrucs = dmgStrucs.sort(function(a, b){
        return (a.hitsMax - a.hits) < (b.hitsMax - b.hits);
    });
    console.log(JSON.stringify(dmgStrucs));
    if(dmgStrucs.length > 0) {
        var struc = dmgStrucs[0];
        tower.repair(struc);
    }

}

function MyCreep(creep) {
    var o = Object.create(creep); 
    o.cry = function (what) {
        this.say("**"+what+"**");
    };
    return o;
}

function buildExtensions(spawn) {
    console.log(spawn);
    console.log(spawn.room);
    console.log(spawn.room.name);
    
	if (spawn.room.controller.level < 2) {
		return;
	}
	for (var siteKey in Game.constructionSites) {
		var site = Game.constructionSites[siteKey];
		if (site.structureType == STRUCTURE_EXTENSION) {
			return;
		}
	}
	var directions = [[-1,-1], [1,-1],[-1,1],[1,1]];
	for (var idx in directions) {
		var prospect = new RoomPosition(spawn.pos.x+directions[idx][0], 
		        spawn.pos.y+directions[idx][1], spawn.room.name);
		var site = prospect.createConstructionSite(STRUCTURE_EXTENSION);
		if(site == OK) {
		    return site;
		} else {
		}
	}
}

module.exports.loop = function () {
    var spawn;
    Memory.rooms = {};

    var mycreeps = {};
    
    for (var idx in Game.creeps) {
        var creep = Game.creeps[idx];
        mycreeps[creep.name] = MyCreep(creep);
    }
    
    
    // Creep memory GC:
    if(Game.time % 10) {
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }

    // Spawn Creeps if fully charged:
    Memory.harvesters = tools.getCreepIdsByRole('harvester');

    for(var name in Game.spawns) {
        spawn = Game.spawns[name];
        if((spawn.room.energyAvailable == spawn.room.energyCapacityAvailable) || 
                (Memory.harvesters.length < 2)) {
            spawnCreeps(spawn);
        } else if(spawn.room.energyAvailable > spawn.room.energyCapacityAvailable/2){
        	let geezers = spawn.pos.findInRange(FIND_MY_CREEPS, 1, 
        	    {filter: crp => crp.ticksToLive < 100});
        	if(geezers.length > 0) {
        		spawn.renewCreep(geezers[0]);
        	}
        }
        
        buildExtensions(spawn);
        
        var towers = spawn.room.find(FIND_MY_STRUCTURES, {
            filter:function(obj) {
                return obj.structureType == STRUCTURE_TOWER;
            }});
        for(var idx in towers) {
                console.log("TowerIdx:" + JSON.stringify(idx));
                if(towers[idx].energy > 0) {
                    tower_run(towers[idx]);
                }
            }
    }
    
    // Exec creep bahviours: 
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester')
            roleHarvester.run(creep);
        if (creep.memory.role == 'upgrader')
            roleUpgrader.run(creep);
        if (creep.memory.role == 'builder')
            roleBuilder.run(creep);
        if (creep.memory.role == 'extractor')
            roleExtractor.run(creep);
        if (creep.memory.role == 'powercord')
            rolePowerCord.run(creep);
        if (creep.memory.role == 'mover')
            roleMover.run(creep);
    }
}
