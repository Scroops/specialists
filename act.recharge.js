/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('act.recharge');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep, lazyness) {
        if(creep.carry[RESOURCE_ENERGY] < creep.carryCapacity) {
            var de = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
            if(de.length > 0) {
                creep.pickup(de[0]);
            } else {
                if(creep.memory.act_recharge === undefined) {
                    creep.memory.act_recharge = {waittime: 0};
                }
                
                creep.memory.act_recharge.waittime = creep.memory.act_recharge.waittime+1;
                
                if(creep.memory.act_recharge.waittime > lazyness){
                    creep.say("Fetching");
                    var nrgy = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
                    if(nrgy != null){
                        if(creep.pickup(nrgy) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(nrgy);
                        }
                    } else {
                        var extractor = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                            filter: function(obj) {
                                return obj.memory.isEnergySource && obj.memory.role == 'extractor' && obj.memory.role_extractor.customers.length < 1;
                            }
                        });
                        if(extractor != null) {
                            if (!creep.pos.isNearTo(extractor.pos)) {
                                creep.moveTo(extractor);
                            } else {
                                rolex = extractor.memory.role_extractor;
                                rolex.customers = _.union(rolex.customers, [creep.id]);
                            }
                            creep.say("WFC");
                        } else {
                            creep.say("MeTooStoopid");
                            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(source);
                            }
                        }
                    }
                }
            }
        } else {
            // I am charged
            creep.say("Charged!");
            creep.memory.act_recharge={waittime:0};
            return true;
        }
        return false;
    }
};
