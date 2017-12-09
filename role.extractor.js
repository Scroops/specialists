/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.extractor');
 * mod.thing == 'a thing'; // true
 */

var roleExtractor = {
    run: function(creep) {
        var source = Game.getObjectById(creep.memory.source);
        console.log(creep.name + " is going to harvest " + source);
        if(source === undefined || source === null) {
            source = creep.pos.findClosestByPath(FIND_SOURCES);
            creep.memory.source = source;
        }
        if (creep.memory.role_extractor === undefined) {
            creep.memory.role_extractor = {};
            creep.memory.role_extractor.customers = [];
        }
        if(creep.carry[RESOURCE_ENERGY] < creep.carryCapacity) {
            var ret = creep.harvest(source);
            if(ret == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
                creep.memory.isEnergySource = false;
            } else if (ret != OK) {
                delete creep.memory.source;
            }
            // see if we are busy:
            var x, y, backlog=0;
            for (x=-1; x < 2; x++) {
                for (y=-1; y < 2; y++) {
                    if (!(x==0 && y == 0)) {
                        var objs = creep.room.lookForAt(LOOK_CREEPS, creep.pos.x +x, creep.pos.y + y);
                        if (objs != undefined && objs[0] != undefined && objs[0].memory.role != 'extractor' && objs[0].carry[RESOURCE_ENERGY] == 0){
                            backlog++;
                        }
                    }
                }
            }
            console.log(backlog);
            if (backlog > 1) creep.memory.isBusy = true;;
            
        } else {
            creep.memory.isEnergySource = true;
            // check creeps:
            var target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: function(obj) {
                    return obj.carry[RESOURCE_ENERGY] < obj.carryCapacity &&
                        obj.memory.role != 'extractor';
                }
            });
            if(target != null) {
                creep.say(target.name);
                var amnt =  Math.min(creep.carry[RESOURCE_ENERGY], target.carryCapacity - target.carry[RESOURCE_ENERGY]);
                if(creep.transfer(target, RESOURCE_ENERGY, amnt)!= OK) {
                    creep.moveTo(target);
                } else {
                    creep.memory.role_extractor.customers = [];
                };
                creep.memory.last_target = target.id;
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
};

module.exports = roleExtractor;
