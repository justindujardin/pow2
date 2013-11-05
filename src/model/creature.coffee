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

class Creature

  hitPoints : 0
  maxHitPoints : 0
  spellPoints : 0
  maxSpellPoints : 0

  constructor : (@template, @bonus = 0) ->
    @maxHitPoints = Util.random(@template.minHitPoints, @template.maxHitPoints) + @bonus
    if (@maxHitPoints < 1)
      @maxHitPoints = 1
    @hitPoints = @maxHitPoints
    if (@template.minSpellPoints)
      @maxSpellPoints = Util.random(@template.minSpellPoints, @template.maxSpellPoints) + @bonus
      @spellPoints = @maxSpellPoints
    @good = false

  canAttackRange : =>
    if (@template.rangeMinDamage) then true else false

  canAttackArea : =>
    if (@template.target == "area") then true else false

  canAttackMelee : =>
    if (@template.meleeMinDamage) then true else false

  getHitSpell : =>
    if (@template.hitSpell)
      Library.getSpellByName(@template.hitSpell)
    else
      null

  getToHitBonus : =>
    (@template.hitModifier ? 0) + @bonus

  getResistance : =>
    (@template.resistance ? 0) + @bonus

  getPotency : =>
    (@template.potency ? 0) + Math.floor(@template.level/2) + @bonus

  getArmorClass : =>
    (@template.armorClass ? 0) + @bonus

  getMeleeDamageBounds: =>
    min = Math.max(@template.meleeMinDamage + @bonus, 1)
    max = Math.max(@template.meleeMaxDamage + @bonus, 1)
    {"min" : min, "max" : max}

  getRangeDamageBounds: =>
    min = Math.max(@template.rangeMinDamage + @bonus, 1)
    max = Math.max(@template.rangeMaxDamage + @bonus, 1)
    {"min" : min, "max" : max}

  getSpellRange : (spell) =>
    min = spell.minAmount + @bonus
    max = spell.maxAmount + @bonus
    if (min < 1)
      min = 1
    if (max < 1)
      max = 1
    {"min" : min, "max" : max}

  getName : =>
    @template.name

  getSpells : =>
    list = @template.spells
    results = []
    if (list)
      for spell in list
        results.push(Library.getSpellByName(spell.name))
    results
