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
# An instance of an item

class Item

  @TYPE_WEAPON: "weapon"
  @TYPE_SHIELD: "shield"
  @TYPE_HAT: "hat"
  @TYPE_ARMOR: "armor"
  @TYPE_BOOTS: "boots"
  @TYPE_AMULET: "amulet"
  @TYPE_USE: "use"

  @TYPES : [
    Item.TYPE_WEAPON,
    Item.TYPE_SHIELD,
    Item.TYPE_HAT,
    Item.TYPE_ARMOR,
    Item.TYPE_BOOTS,
    Item.TYPE_AMULET,
    Item.TYPE_USE,
  ]

  name : null

  constructor: (@template, @id, @bonus = 0, @charges = 0) ->
    @name = @template.name
    if (@bonus > 0)
      @name += " +" + @bonus
    else if (@bonus < 0)
      @name += " -" + (-@bonus)

  getColor : =>
    @template.legendary ? "#FFF"

  getType: =>
    @template.type

  isWeapon : =>
    @template.type == Item.TYPE_WEAPON

  getHitSpell : =>
    if (@template.hitSpell)
      Library.getSpellByName(@template.hitSpell)
    else
      null

  getCombatSpell : =>
    if (@template.combatSpell)
      Library.getSpellByName(@template.combatSpell)
    else
      null

  isUseable: =>
    @template.type == Item.TYPE_USE

  isEquipableBy: (characterType) =>
    return !@isUseable() && @isFor(characterType)

  isFor: (characterType) =>
    Util.hasElement(@template.usedBy, characterType)

  getSpell: =>
    if (@template.spell)
      Library.getSpellByName(@template.spell)
    else if (@template.combatSpell)
      Library.getSpellByName(@template.combatSpell)
    else
      null

  getSpellRange : (spell = null) =>
    if (!spell)
      spell = @getSpell()
    if (!spell)
      spell = @getHitSpell()
    {"min" : spell.minAmount + @bonus * spell.modifyAmount, "max" : spell.maxAmount + @bonus * spell.modifyAmount}

  canUseOutsideOfCombat: =>
    spell = @getSpell()
    @isUseable() and spell.type == "heal" and (spell.healType == "restore" or spell.healType == "heal" or !spell.healType)

  isMeleeWeapon: =>
    @isWeapon() and @template.meleeMinDamage

  isRangeWeapon: =>
    @isWeapon() and @template.rangeMinDamage

  isAreaWeapon: =>
    @isWeapon() and @template.target == "area"

  getMeleeMinDamage: =>
    @template.meleeMinDamage + @bonus

  getMeleeMaxDamage: =>
    @template.meleeMaxDamage + @bonus

  getRangeMinDamage: =>
    @template.rangeMinDamage + @bonus

  getRangeMaxDamage: =>
    @template.rangeMaxDamage + @bonus

  getToHitBonus: =>
    if @isWeapon()
      if @template.toHitBonus then @template.toHitBonus + @bonus else @bonus
    else
      0

  getArmorClass: =>
    if @template.armorClass then @template.armorClass + @bonus else 0

  getResistance: =>
    if @template.resistance then @template.resistance + @bonus else 0

  getExtraMoves : =>
    @template.extraMoves ? 0

  getExtraAttacks : =>
    @template.extraAttacks ? 0

  getStrengthBonus: =>
    if @template.strengthBonus then @template.strengthBonus + @bonus else 0

  getAccuracyBonus: =>
    if @template.accuracyBonus then @template.accuracyBonus + @bonus else 0

  getAwarenessBonus: =>
    if @template.awarenessBonus then @template.awarenessBonus + @bonus else 0

  getConstitutionBonus: =>
    if @template.constitutionBonus then @template.constitutionBonus + @bonus else 0

  getValue: =>
    value = @template.baseValue
    if (@isUseable())
      value *= @charges
      value = Math.round(value + (value * @bonus / 2))
    else
      if (@bonus > 0)
        for i in [0...@bonus]
          value = value * 1.8
      else if (@bonus < 0)
        for i in [@bonus...0]
          value = value / 1.5
        value = Math.max(1, value)
    Math.round(value)

  getShopValue: (modPerCent) =>
    value = Math.floor(@getValue() * modPerCent / 100)
    if (value < 1)
      value = 1
    value

  getSpellName: =>
    @template.spell

