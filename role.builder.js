/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
var act_recharge = require('act.recharge');
var tools = require('tools');
 
module.exports = {
    run: function(creep) {
        if(!creep.memory.hasOwnProperty('activity') || (creep.memory.activity == 'Building' && 
            creep.carry.energy == 0)) {
            creep.memory.activity = 'Recharging';
            creep.say("Recharging");
        }
        if(creep.memory.activity == 'Recharging' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.activity = 'Building';
            creep.say("Building");
        }
        
        if(creep.memory.activity == 'Repairing' && creep.carry.energy == 0) {
            creep.memory.activity == 'Recharging';
        }
        
        if(creep.memory.activity == 'Recharging') {
            act_recharge.run(creep, 1);
        }
        if(creep.memory.activity == 'Building') {
            var site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (site != null) {
                if(creep.build(site) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(site, {
                        visualizePathStyle: {
                            stroke: '#f00'
                        }
                    });
                }
            } else {
                creep.memory.activity = 'Repairing';   
            }
        }
        if(creep.memory.activity == 'Repairing') {
            var dmgStrucs = creep.room.find(FIND_STRUCTURES, {
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
                if(creep.repair(struc) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(struc);
                }
            } else {
                creep.memory.activity = 'Building';
            }
        }
    },
    bodyPlan: {
        ensure: {'work': 1, 'move': 1, 'carry': 1},
        parts: {
            'work': 0.7,
            'move': 0.2,
            'carry': 0.1
        }
    }
};
