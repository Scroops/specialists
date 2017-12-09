/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.powercord');
 * mod.thing == 'a thing'; // true
 */
var tools = require('tools');

module.exports = {
    run:function(creep) {
        var prev_link = creep.memory.prev_link;
        if(!prev_link) {
            var target = tools.findFarthestEnergySourceCreep(creep.pos);
            creep.moveTo(target);
        } else {
            creep.moveTo(Game.getObjectById(prev_link));
        }
        var targetnames = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: function(obj) {
                return obj.carry[RESOURCE_ENERGY] < obj.carryCapacity && obj.memory.role != 'upgrader' &&
                    obj.memory.role != 'extractor' && obj.id != prev_link;
            }
        });
        for(var idx in targetnames) {
            var target = targetnames[idx];
            if(targetnames.length > 1 && target.id == creep.memory.last_target) continue;
            if(target != null) {
                creep.say(target.name);
                var amnt =  Math.min(creep.carry[RESOURCE_ENERGY], target.carryCapacity - target.carry[RESOURCE_ENERGY]);
                if(creep.transfer(target, RESOURCE_ENERGY, amnt)!= OK) {
                    creep.say("Fail!");
                };
                creep.memory.last_target = target.id;
            }
        }
        if(creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creep.memory.isEnergySource = true
            creep.memory.emptyCounter = 0;
        } else {
            if(creep.memory.emptyCounter > 10) {
                creep.memory.isEnergySource = false;
            }
            creep.memory.emptyCounter++;
        }

    }

};
