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

class Combatant

  @EFFECT_COLORS =
    {
      "Berserk" : {type : "glow", color : Util.rgb(108, 255, 108)},
      "Strong" : {type : "glow", color : Util.rgb(255, 108, 108)},
      "Protected" : {type : "glow", color : Util.rgb(108, 108, 255)},
      "Blessed" : {type : "glow", color : Util.rgb(255, 255, 255)},
      "Quick" : {type : "glow", color : Util.rgb(255, 192, 64)},
      "Eagle-eyed" : {type : "glow", color : Util.rgb(255, 108, 255)},
      "Resistant" : {type : "glow", color : Util.rgb(108, 255, 255)},
      "Paralyzed" : {type : "shade", color : Util.rgb(-64, -64, 96)},
      "Rooted" : {type : "shade", color : Util.rgb(32, 32, -96)},
      "Poisoned" : {type : "shade", color : Util.rgb(-64, 96, -64)},
      "Weakened" : {type : "shade", color : Util.rgb(72, 72, -64)},
      "Blinded" : {type : "shade", color : Util.rgb(-64, -64, -64)},
      "Sluggish" : {type : "shade", color : Util.rgb(-64, 72, 72)},
    }

  hitPoints : 0
  lastTarget : null
  customImage : null
  numMoves : 1
  numAttacks : 1
  movesLeft : 0
  attacksLeft : 0
  effects : null
  usedCombatSpells : null
  halfAttack : false
  didAttack : false
  invisible : false

  constructor : (@entity, @isPlayer, @good, @x = -1, @y = -1) ->
    @hitPoints = @entity.hitPoints
    @effects = {}
    @usedCombatSpells = {}

  startTurn : =>
    if (@isPlayer)
      # todo - testing
      @numMoves = 1 + @entity.getExtraMoves()
      @numAttacks = 1 + @entity.getExtraAttacks()
    else
      @numMoves = @entity.template.numMoves ? 1
      @numAttacks = @entity.template.numAttacks ? 1
    if (@hasEffect("Berserk"))
      @numAttacks++
    if (@hasEffect("Quick"))
      @numMoves += @getEffect("Quick").value
    @movesLeft = @numMoves
    @attacksLeft = @numAttacks
    @halfAttack = false
    @didAttack = false
    @drainAmount = 0
    @usingItem = null

  notDone : =>
    return @movesLeft > 0 or @attacksLeft > 0

  useCombatSpell : (item) =>
    @usedCombatSpells[item.id] = true

  isCombatSpellUsed : (item) =>
    @usedCombatSpells[item.id] ? false

  doDamage : (damage) =>
    if (@hasEffect("Blessed"))
      damage = Math.round(damage / @getEffect("Blessed").value)
      if (damage < 1)
        damage = 1
    @hitPoints = Math.max(0, @hitPoints - damage)
    if (@isPlayer)
      @entity.hitPoints = @hitPoints
    if (@hitPoints == 0) then true else false

  doHeal : (amount, healType, imageProcessor, callback) =>
    if (healType == "remove")
      @clearAllAfflictions(imageProcessor, callback)
    else if (healType == "restore")
      @entity.spellPoints = Math.min(@entity.maxSpellPoints, @entity.spellPoints + amount)
    else
      @hitPoints = Math.min(@getMaxHitPoints(), @hitPoints + amount)
      if (@isPlayer)
        @entity.hitPoints = @hitPoints

  getName : =>
    @entity.getName()

  getBanner : =>
    name = @getName()
    for k, v of @effects
      if (v)
        name = "[#{k}]"
    name

  getIcon : =>
    if (@isPlayer)
      @entity.character.icon
    else
      @entity.template.icon

  getMaxHitPoints : =>
    @entity.maxHitPoints

  getResistance : =>
    r = @entity.getResistance()
    if (@hasEffect("Resistant"))
      r += @getEffect("Resistant").value
    r

  getPotency : =>
    @entity.getPotency()

  isFullyHealed : =>
    return @hitPoints == @getMaxHitPoints()

  canAttackRange : =>
    @entity.canAttackRange()

  canAttackArea : =>
    @entity.canAttackArea()

  getToHitBonus : =>
    toHit = @entity.getToHitBonus()
    if (@hasEffect("Eagle-eyed"))
      toHit += @getEffect("Eagle-eyed").value
    if (@hasEffect("Blinded"))
      toHit -= @getEffect("Blinded").value
    toHit

  getArmorClass : =>
    ac = @entity.getArmorClass()
    if (@hasEffect("Protected"))
      ac += @getEffect("Protected").value
    if (@hasEffect("Sluggish"))
      ac -= @getEffect("Sluggish").value
    ac

  getMeleeDamageBounds : =>
    bounds = @entity.getMeleeDamageBounds()
    @computeDamageBounds(bounds)

  getRangeDamageBounds : =>
    bounds = @entity.getRangeDamageBounds()
    @computeDamageBounds(bounds)

  getHitSpell : =>
    @entity.getHitSpell()

  isParalyzed : =>
    @hasEffect("Paralyzed")

  isRooted : =>
    @hasEffect("Rooted")

  isPoisoned : =>
    @hasEffect("Poisoned")

  computeDamageBounds : (bounds) =>
    if (@hasEffect("Strong"))
      value = @getEffect("Strong").value
      bounds.min = Math.round(bounds.min * value)
      bounds.max = Math.round(bounds.max * value)
    if (@hasEffect("Weakened"))
      value = @getEffect("Weakened").value
      bounds.min = Math.round(bounds.min / value)
      bounds.max = Math.round(bounds.max / value)
      if (bounds.min < 1)
        bounds.min = 1
      if (bounds.max < 1)
        bounds.max = 1
    bounds

  getRangeAnimation : =>
    if (@isPlayer)
      @entity.getWeapon().template.rangeAnimation
    else
      @entity.template.rangeAnimation

  canSummon : =>
    if (@isPlayer)
      false
    else
      if (@entity.template.summons)
        true
      else
        false

  addEffect : (effect, value, duration, caster) =>
    already = @hasEffect(effect)
    @effects[effect] = {"value" : value, "duration" : duration}
    if (caster == this and !already)
      if (effect == "Berserk")
        @attacksLeft += value;
      else if (effect == "Quick")
        @movesLeft += value;

  removeEffect : (effect) =>
    # todo - delete instead of nullify?
    @effects[effect] = null

  hasEffect : (effect) =>
    !!@effects[effect]

  getEffect : (effect) =>
    @effects[effect]

  clearAllAfflictions : (imageProcessor, callback) =>
    for effect, value of @effects
      if (Combatant.EFFECT_COLORS[effect].type == "shade")
        @removeEffect(effect)
    @drawIcon(imageProcessor, callback)

  incrementEffects : (imageProcessor, callback) =>
    removeList = []
    for effect, info of @effects
      if (effect == "Berserk")
        if (!@didAttack)
          removeList.push(effect)
      else if (info)
        info.duration--
        if (info.duration <= 0)
          removeList.push(effect)
    if (removeList.length > 0)
      for effect in removeList
        @removeEffect(effect)
      @drawIcon(imageProcessor, callback)

  drawIcon : (imageProcessor, callback) =>
    if (!doCustomDraws())
      @customImage = null
      callback() if callback
      return
    shadeColors = []
    haloColors = []
    for effect, value of @effects
      if (value)
        info = Combatant.EFFECT_COLORS[effect]
        if (info.type == "shade")
          shadeColors.push(info.color)
        else
          haloColors.push(info.color)
    if (shadeColors.length == 0 and haloColors.length == 0)
      @customImage = null
      callback() if callback
    else
      @customImage = imageProcessor.process(@getIcon(), shadeColors, haloColors)

