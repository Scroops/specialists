/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.carrier');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    build: function(creep) {
        var target = creep.room.find(FIND_MY_STRUCTURES, {
            filter: function(struc) {
                return struc.structureType == STRUCTURE_TOWER && struc.energy < struc.energyCapacity;
            }
        });
        target = target[0];
        if(target != null) {
            creep.say("CTower");
            var amnt = target.energyCapacity - target.energy;
            console.log('Charging tower by: ' + amnt + ' (' + target + ')');
            if(creep.transfer(target, RESOURCE_ENERGY, Math.min(creep.carry[RESOURCE_ENERGY], amnt)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle:{stroke: '#0f0'}});
            }
        }        
    }
};
