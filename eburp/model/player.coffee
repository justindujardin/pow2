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
# A "hero", but also used to represent the bag of holding.
class Player

  @TYPE_WARRIOR : "warrior"
  @TYPE_ARCHER : "archer"
  @TYPE_MAGE : "mage"

  @ATTRIBUTES = ["Strength", "Accuracy", "Awareness", "Toughness"]

  @MAX_ITEMS : 15

  strength : 0
  accuracy : 0
  awareness : 0
  constitution : 0
  hitPoints : 0
  maxHitPoints : 0
  spellPoints : 0
  maxSpellPoints : 0
  experience : 0
  level : 0

  items : null
  equipment : null

  fromData : (data) ->
    Util.copyProperties(data, this)
    @items = new Array()
    @equipment = {}
    @equipment[Item.TYPE_WEAPON] = null
    @equipment[Item.TYPE_SHIELD] = null
    @equipment[Item.TYPE_HAT] = null
    @equipment[Item.TYPE_ARMOR] = null
    @equipment[Item.TYPE_BOOTS] = null
    @equipment[Item.TYPE_AMULET] = null
    for obj in data.items
      item = new Item(Library.getItemTemplateByName(obj.template), obj.id, obj.bonus, obj.charges)
      @items.push(item)
    for k,id of data.equipment
      if (id)
        @equipment[k] = @getItemById(id)

  constructor: (@character) ->
    @level = 1
    @experience = 0
    attributes = [Util.statRoll(), Util.statRoll(), Util.statRoll(), Util.statRoll()]
    attributes.sort((a,b) -> a-b)
    best = attributes[3]
    attributes.pop()
    Util.shuffle(attributes)
    if (@character.bestAttribute == "strength")
      @strength = best
      @accuracy = attributes[0]
      @awareness = attributes[1]
      @constitution = attributes[2]
    else if (@character.bestAttribute == "accuracy")
      @accuracy = best
      @strength = attributes[0]
      @awareness = attributes[1]
      @constitution = attributes[2]
    else if (@character.bestAttribute == "awareness")
      @awareness = best
      @accuracy = attributes[0]
      @strength = attributes[1]
      @constitution = attributes[2]
    else if (@character.bestAttribute == "constitution")
      @constitution = best
      @accuracy = attributes[0]
      @awareness = attributes[1]
      @strength = attributes[2]
    if (@character.strength)
      @strength += @character.strength
    if (@character.accuracy)
      @accuracy += @character.accuracy
    if (@character.awareness)
      @awareness += @character.awareness
    if (@character.constitution)
      @constitution += @character.constitution
    if (@strength < 1)
      @strength = 1
    if (@accuracy < 1)
      @accuracy = 1
    if (@awareness < 1)
      @awareness = 1
    if (@constitution < 1)
      @constitution = 1
    @maxHitPoints = Math.max(4, @computeNextLevelHitPoints()) + @character.hitPoints
    if (Library.getSpellsForCharacterAndLevel(@character, 1).length > 0)
      @maxSpellPoints = Math.max(2, @computeNextLevelSpellPoints())
    else
      @maxSpellPoints = 0
    @healCompletely()
    @items = new Array()
    @equipment = {}
    @equipment[Item.TYPE_WEAPON] = null
    @equipment[Item.TYPE_SHIELD] = null
    @equipment[Item.TYPE_HAT] = null
    @equipment[Item.TYPE_ARMOR] = null
    @equipment[Item.TYPE_BOOTS] = null
    @equipment[Item.TYPE_AMULET] = null
    # todo - starting items

  getName : =>
    @character.name

  canCarryMoreItems: =>
    @items.length < Player.MAX_ITEMS

  numberOfItems : =>
    @items.length

  addItem: (item) =>
    if (@canCarryMoreItems())
      @items.push(item)

  getItemById : (id) =>
    for item in @items
      if (item.id == id)
        return item
    null

  equipItem: (item) =>
    type = item.template.type
    if (type != Item.TYPE_USE)
      @equipment[type] = item

  isItemEquipped: (item) =>
    type = item.template.type
    @equipment[type] and @equipment[type].id == item.id

  unequipItem: (item) =>
    if (@isItemEquipped(item))
      type = item.template.type
      @equipment[type] = null
      true
    else
      false

  unequipItemByType : (type) =>
    item = @equipment[type]
    if (item)
      @unequipItem(item)

  dropItem: (item) =>
    @unequipItem(item)
    for i in [0...@items.length]
      if (@items[i].id == item.id)
        @items.splice(i, 1)
        return true
    false

  hasItem : (name) =>
    for item in @items
      if (item.template.name == name)
        return true
    false

  canEmploy: (item) =>
    item.isFor(@character.type)

  hasUsableItem: (inCombat, melee = false, summon = false, combatant = null) =>
    for item in @items
      if (item.isUseable() and @canEmploy(item) or combatant and inCombat and item.getCombatSpell() and !combatant.isCombatSpellUsed(item))
        spell = item.getSpell()
        if (spell)
          if (inCombat)
            if (spell.type == "summon" and summon)
              return true
            if (spell.target != "touch" or melee or spell.type == "heal")
              return true
          else if (spell.type == "heal" and spell.healType != "remove")
            return true
    false

  getEquipableItemsByType: (type) =>
    result = new Array()
    for item in @items
      if (item.template.type == type and item.isEquipableBy(@character.type))
        result.push(item)
    result

  getEquippedItemByType: (type) =>
    @equipment[type]

  getWeapon: =>
    @getEquippedItemByType(Item.TYPE_WEAPON)

  getHitSpell : =>
    weapon = @getWeapon()
    if (weapon)
      weapon.getHitSpell()
    else
      null

  getAttributeBonus: (value) =>
    Util.trunc((value - 1) / 2.4 - 4)

  computeNextLevelHitPoints: =>
    Util.random(1, 8) + @getAttributeBonus(@getConstitution())

  computeNextLevelSpellPoints: =>
    Util.random(1, 5) + @getAttributeBonus(@getAwareness())

  isAlive: =>
    return @hitPoints > 0

  takeDamage: (amount) =>
    @hitPoints -= amount
    if (@hitPoints < 0)
      @hitPoints = 0
    @hitPoints

  isRestored : =>
    @spellPoints == @maxSpellPoints

  isHealed : =>
    @hitPoints == @maxHitPoints

  healCompletely: =>
    @hitPoints = @maxHitPoints
    @spellPoints = @maxSpellPoints

  heal: =>
    if (@hitPoints > 0)
      @hitPoints = Math.min(@maxHitPoints, @hitPoints + 1)
      @spellPoints = Math.min(@maxSpellPoints, @spellPoints + 1)

  getExtraMoves : =>
    moves = 0
    for k, item of @equipment
      if (item)
        moves += item.getExtraMoves()
    moves

  getExtraAttacks : =>
    attacks = 0
    for k, item of @equipment
      if (item)
        attacks += item.getExtraAttacks()
    attacks

  getArmorClass: =>
    ac = @getAttributeBonus(@getAwareness())
    for k, item of @equipment
      if (item)
        ac += item.getArmorClass()
    ac

  getResistance: =>
    r = @getAttributeBonus(@getConstitution())
    for k, item of @equipment
      if (item)
        r += item.getResistance()
    r

  getPotency : =>
    Math.floor(@level / 2)

  getToHitBonus: =>
    toHit = @getAttributeBonus(@getAccuracy())
    weapon = @equipment[Item.TYPE_WEAPON]
    if (weapon)
      toHit += weapon.getToHitBonus()
    toHit

  getStrength : =>
    strength = @strength
    for k, item of @equipment
      if (item)
        strength += item.getStrengthBonus()
    strength

  getAccuracy : =>
    accuracy = @accuracy
    for k, item of @equipment
      if (item)
        accuracy += item.getAccuracyBonus()
    accuracy

  getAwareness : =>
    awareness = @awareness
    for k, item of @equipment
      if (item)
        awareness += item.getAwarenessBonus()
    awareness

  getConstitution : =>
    constitution = @constitution
    for k, item of @equipment
      if (item)
        constitution += item.getConstitutionBonus()
    constitution

  canAttackRange: =>
    weapon = @equipment[Item.TYPE_WEAPON]
    weapon and weapon.isRangeWeapon()

  canAttackArea: =>
    weapon = @equipment[Item.TYPE_WEAPON]
    weapon and weapon.isAreaWeapon()

  canAttackMelee: =>
    weapon = @equipment[Item.TYPE_WEAPON]
    weapon and weapon.isMeleeWeapon()

  getMeleeDamageBounds: =>
    weapon = @equipment[Item.TYPE_WEAPON]
    if (!weapon)
      min = 1
      max = 1
    else if (weapon.isMeleeWeapon())
      min = weapon.getMeleeMinDamage()
      max = weapon.getMeleeMaxDamage()
    else
      min = weapon.getRangeMinDamage()
      max = weapon.getRangeMaxDamage()
    bonus = @getAttributeBonus(@getStrength())
    min = Math.max(min + bonus, 1)
    max = Math.max(max + bonus, 1)
    {min : min, max : max}

  getRangeDamageBounds: =>
    weapon = @equipment[Item.TYPE_WEAPON]
    bonus = @getAttributeBonus(@getStrength())
    if (weapon.isRangeWeapon())
      min = weapon.getRangeMinDamage() + bonus
      max = weapon.getRangeMaxDamage() + bonus
      min = Math.max(min, 1)
      max = Math.max(max, 1)
      {min : min, max : max}
    else
      {min : 0, max : 0}

  getSpellRange : (spell) =>
    bonus = @getAttributeBonus(@getAwareness())
    levelDiff = @level - spell.level
    if (levelDiff < 0)
      levelDiff = 0
    bonus += Math.round(spell.modifyAmount * levelDiff / 100)
    min = spell.minAmount + bonus
    max = spell.maxAmount + bonus
    if (min < 1)
      min = 1
    if (max < 1)
      max = 1
    {"min" : min, "max" : max}

  hasSpells : =>
    return @getSpells().length > 0

  getSpells : =>
    Library.getSpellsForCharacterAndLevel(@character, @level)
