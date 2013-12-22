# -----------------------------------------------------------------------------
#
# Copyright (C) 2013 by John Watkinson
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# -----------------------------------------------------------------------------

class Validate

  @require : (object, item, name) ->
    if (!object.hasOwnProperty(item))
      console.log("#{name} is missing '#{item}'.")

  @run : ->
    console.log("--- VALIDATING ...")
    console.log("-- SPELLS")
    for spell in eburp.data.spells
      if (spell.type == "summon")
        if (!spell.creature)
          console.log(" No creature for summon spell #{spell.name}.")
        else if (!Library.getCreatureByName(spell.creature))
          console.log(" Creature for summon spell #{spell.name} not found: '#{spell.creature}'.")
      if ((spell.target == "range" or spell.target == "area") and !spell.animation)
        console.log(" Animation missing for spell #{spell.name}")
    console.log("-- CREATURES")
    spellSet = {}
    for creature in eburp.data.creatures
      Validate.require(creature, "icon", creature.name)
      Validate.require(creature, "groups", creature.name)
      Validate.require(creature, "meleeMinDamage", creature.name)
      Validate.require(creature, "meleeMaxDamage", creature.name)
      Validate.require(creature, "level", creature.name)
      Validate.require(creature, "minHitPoints", creature.name)
      Validate.require(creature, "maxHitPoints", creature.name)
      Validate.require(creature, "experienceValue", creature.name)
      Validate.require(creature, "numAttacks", creature.name)
      Validate.require(creature, "numMoves", creature.name)
      Validate.require(creature, "armorClass", creature.name)
      Validate.require(creature, "description", creature.name)
      if (creature.rangeMinDamage and !creature.rangeAnimation)
        console.log(" No range animation for #{creature.name}.")
      if (creature.hitSpell and !Library.getSpellByName(creature.hitSpell))
        console.log(" Missing hit spell #{creature.hitSpell} for #{creature.name}.")
      if (creature.hitSpell)
        spellSet[creature.hitSpell] = true
      if (creature.spells)
        for spell in creature.spells
          if (!Library.getSpellByName(spell.name))
            console.log(" Missing spell #{spell.name} for #{creature.name}.")
          else
            spellSet[spell.name] = true
    console.log("-- ITEMS")
    for item in eburp.data.items
      Validate.require(item, "icon", item.name)
      Validate.require(item, "type", item.name)
      Validate.require(item, "groups", item.name)
      Validate.require(item, "rarity", item.name)
      Validate.require(item, "baseValue", item.name)
      Validate.require(item, "level", item.name)
      Validate.require(item, "usedBy", item.name)
      if (item.rangeMinDamage and !item.rangeAnimation)
        console.log(" No range animation for #{item.name}.")
      if (item.spell and !Library.getSpellByName(item.spell))
        console.log(" Missing spell #{item.spell} for #{item.name}.")
      if (item.hitSpell and !Library.getSpellByName(item.hitSpell))
        console.log(" Missing hit spell #{item.hitSpell} for #{item.name}.")
      if (item.combatSpell and !Library.getSpellByName(item.combatSpell))
        console.log(" Missing combat spell #{item.combatSpell} for #{item.name}.")
      if (item.spell)
        spellSet[item.spell] = true
      if (item.hitSpell)
        spellSet[item.hitSpell] = true
      if (item.combatSpell)
        spellSet[item.combatSpell] = true
    console.log("-- MAPS")
    idSet = {}
    locationSet = {}
    for name,map of eburp.getMaps()
      if (map.encounterChance and map.encounterChance > 0 and !map.combatMap)
        console.log(" Missing combat map for #{name}.")
      if (map.features)
        for feature in map.features
          if (feature.type == "transition")
            if (!feature.target)
              console.log(" Missing transition target in #{name}.")
            else if (!eburp.data.maps[feature.target])
              console.log(" Transition target #{feature.target} not found in #{name}.")
            else
              target = eburp.data.maps[feature.target]
              if (feature.targetX >= target.width or feature.targetY >= target.height)
                console.log(" Transition target location is not valid in #{feature.target} for #{name}.")
          else if (feature.type == "encounter")
            location = name + "-" + feature.x + "-" + feature.y
            if (locationSet[location])
              console.log(" More than one encounter at '#{name} : #{feature.x}, #{feature.y}'.")
            else
              locationSet[location] = true
            if (idSet[feature.id])
              console.log(" More than one encounter with id '#{feature.id}'.")
            else
              idSet[feature.id] = true
            if (feature.creatures)
              for creature in feature.creatures
                if (!Library.getCreatureByName(creature.name))
                  console.log(" Creature #{creature.name} not found in #{name}.")
            if (feature.items)
              for item in feature.items
                if (!Library.getItemTemplateByName(item.name))
                  console.log(" Item #{item.name} not found in #{name}.")
    for spell in eburp.data.spells
      if (!spellSet[spell.name] && !spell.who)
        console.log(" Unused spell: #{spell.name}")
    console.log("--- VALIDATION COMPLETE.")
