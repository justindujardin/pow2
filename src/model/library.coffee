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

# Static methods for accessing the library of game data
class Library

  @getItemTemplateByName: (name) =>
    for item in Data.items
      if (item.name == name)
        return item
    null

  @getItemTemplates: (level, groups) =>
    results = new Array()
    for item in Data.items
      if (item.level == level and (!groups or Util.hasCommonElements(groups, item.groups)))
        results.push(item)
    results

  @getCharacterByName : (name) =>
    for character in Data.characters
      if (character.name == name)
        return character
    null

  @getCreatureByName: (name) =>
    for creature in Data.creatures
      if (creature.name == name)
        return creature
    null

  @getCreatures: (level, groups) =>
    results = new Array()
    for creature in Data.creatures
      if (creature.level == level and (!groups or Util.hasCommonElements(groups, creature.groups)))
        results.push(creature)
    results

  @getLevelNear: (level) =>
    x = Util.random(0, 9999)
    a = Data.levelTransformations[level - 1]
    i = 0
    while (x > a[i])
      x -= a[i]
      i++
    i + 1

  @getSpellsForCharacterAndLevel : (character, level) =>
    type = character.type
    job = character.job
    results = new Array()
    for spell in Data.spells
      if ((spell.who == type or spell.who == job) and spell.level <= level)
        results.push(spell)
    results

  @newSpellsForCharacterAndLevel : (character, level) =>
    type = character.type
    job = character.job
    for spell in Data.spells
      if ((spell.who == type or spell.who == job) and spell.level == level)
        return true
    false

  @getSpellByName : (name) =>
    for spell in Data.spells
      if (spell.name == name)
        return spell
    null
