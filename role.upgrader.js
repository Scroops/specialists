/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */

var roleUpgrader = {
    run: function(creep){
        if(!creep.memory.activity || (creep.memory.activity == 'Upgrading' && 
            creep.carry.energy == 0)) {
            creep.memory.activity = 'Recharging';
            creep.say("Recharging");
        }
        if(creep.memory.activity == 'Recharging' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.activity = 'Upgrading';
            creep.say("Upgrading");
        }
        
        if(creep.memory.activity == 'Recharging') {
            var source = creep.room.find(FIND_SOURCES)[0];
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: {
                        stroke: '#0f0'
                    }
                });
            }
        }
        if(creep.memory.activity == 'Upgrading') {
            let con = creep.room.controller;
            if(creep.upgradeController(con) == ERR_NOT_IN_RANGE) {
                creep.moveTo(con, {
                    visualizePathStyle: {
                        stroke: '#00f'
                        }
                });
            } else {
                creep.upgradeController(con);
            }
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

}
module.exports = roleUpgrader;
