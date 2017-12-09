/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */
var actRecharge = require('act.recharge');

var roleHarvester = {
    run: function(creep) {
        if(!creep.memory.hasOwnProperty('activity'))
            creep.memory.activity = "Harvesting";
        if(creep.memory.activity == 'Harvesting' && creep.carry.energy == 0) {
            creep.memory.activity = 'Recharging';
            creep.say("Recharging");
        }
        if(creep.memory.activity == 'Recharging' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.activity = 'Harvesting';
            creep.say("Harvesting");
        }
    
        if(creep.memory.activity == 'Recharging') {
            actRecharge.run(creep, 1);
        }
        
        if(creep.memory.activity == 'Harvesting') {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            // Refill spawn:
            if(Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity) {
                if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns['Spawn1'], {
                        visualizePathStyle: {
                            stroke: '#0f0'
                        }
                    });
                }
            } else {
            	// Spawn is full, refill extensions:
                var extensions = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, {
                    filter: strc => strc.structureType === STRUCTURE_EXTENSION && strc.energy < strc.energyCapacity && strc.isActive()
                });
                if(extensions.length > 0) {
                	// we have non-full extensions, go refill:
                    extensions.sort(function(a,b){
                        return  (creep.pos.getRangeTo(a.pos))-creep.pos.getRangeTo(b.pos); 
                    });
                    var idx = 0;
                    if(creep.transfer(extensions[idx], RESOURCE_ENERGY,
                        Math.min(creep.carry.energy, extensions[idx].energyCapacity - extensions[idx].energy)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(extensions[idx]);
                    }              	
                } else {
                    var towers = creep.room.find(FIND_MY_STRUCTURES, 
                        {filter: strc => (strc.structureType == STRUCTURE_TOWER) && (strc.energy < strc.energyCapacity/2)});
                    if (towers.length > 0) {
                        creep.say("TRecharge");
                        if(creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(towers[0]);
                        }
                    } else {
                        if (!(creep.room.storage === undefined)) {
                        	let target = creep.room.storage;
                        	creep.say("Storing");
                        	// no empty extensions, just store it:
                        	if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        		creep.moveTo(target);
                        	}
                        } else {
                            if (!creep.pos.isNearTo(Game.spawns.Spawn1.pos)) {
                                creep.moveTo(Game.spawns['Spawn1']);
                            }
                        }
                    }
                } 
            }
        }
        
        if(creep.ticksToLive < 10) {
            // creep is dying
            Memory.harvesters[creep.id];
        }
    },
    bodyPlan: {
        ensure: {'work': 1, 'move': 1, 'carry': 1},
        parts: {
            'work': 0.6,
            'move': 0.2,
            'carry': 0.2
        }
    }
};

module.exports = roleHarvester;
