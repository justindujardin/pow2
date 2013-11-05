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

class BasicStrategy

  constructor : (@combat) ->

  getCastableSpells : (me) =>
    spells = me.entity.template.spells
    casts = []
    if (spells)
      for spellInfo in spells
        spell = Library.getSpellByName(spellInfo.name)
        if (spell.type == "summon")
          if (@combat.canSummon(me))
            result = {
              "spell" : spell,
              "weight" : spellInfo.weight
              "targets" : null
            }
            casts.push(result)
        else
          isHeal = spell.type == "heal"
          isFriendly = spell.type == "heal" or spell.type == "enhance" or spell.type == "teleport"
          isRange = spell.target == "area" or spell.target == "range"
          includeSelf = spell.type == "heal" or spell.type == "teleport"
          if (spell.target == "self")
            if (@combat.canTargetWithSpell(me, me, isFriendly, isHeal, spell.effect))
              targets = [me]
            else
              targets = []
          else if (spell.target == "area")
            target = @combat.getBestAreaTarget(me, !isFriendly)
            if (target)
              targets = [target]
          else
            targets = @combat.getSpellTargets(me, isRange, isFriendly, isHeal)
          if (targets.length > 0)
            result = {
              "spell" : spell,
              "weight" : spellInfo.weight,
              "targets" : targets
            }
            casts.push(result)
    casts

  doTurn : (me, numMoves, numAttacks) =>
    @combat.clearSelection()
    @combat.usingItem = null
    ## Get all castable spells (if any)
    casts = @getCastableSpells(me)
    canAttackMelee = @combat.canAttackMelee(me)
    canAttackRange = me.canAttackRange()
    canAttackArea = me.canAttackArea()
    if (canAttackMelee)
      moveWeight = 0
      attackWeight = me.entity.template.attackWeight ? 75
    else
      moveWeight = me.entity.template.moveWeight ? 25
      if (canAttackRange)
        attackWeight = me.entity.template.attackWeight ? 75
      else
        attackWeight = 0
    if (numAttacks == 0)
      attackWeight = 0
    if (numMoves == 0)
      moveWeight = 0
    totalWeight = attackWeight + moveWeight
    for cast in casts
      totalWeight += cast.weight
    k = Util.random(0, totalWeight - 1)
    didAction = false
    if (k < attackWeight)
      if (canAttackArea)
        target = @combat.getBestAreaTarget(me, true)
        if (target)
          numMoves = 0
          numAttacks--
          me.didAttack = true
          @combat.setTarget(target)
          @combat.queueFly(me.x, me.y, target.x, target.y, me.getRangeAnimation(), "AI Area Projectile Fly")
          @combat.addAction(@combat.doAreaAttack, "Run AI Area Attack")
          didAction = true
      else
        nearest = @combat.getNearestAttackTarget(me)
        if (me.lastTarget and @combat.isStillAlive(me.lastTarget) and @combat.canAttack(me, me.lastTarget))
          target = me.lastTarget
        else
          if (canAttackRange)
            target = @combat.getRandomEnemy(me)
          else
            target = @combat.getNearestAttackTarget(me)
        if (@combat.isInMeleeRange(me, nearest) and !@combat.isInMeleeRange(me, target))
          target = nearest
        me.lastTarget = target
        # Can't move after attacking
        numMoves = 0
        numAttacks--
        me.didAttack = true
        @combat.setTarget(target)
        if (canAttackMelee)
          @combat.addAction(@combat.runAttack, "Run AI Melee Attack")
        else if (canAttackRange)
          @combat.queueFly(me.x, me.y, target.x, target.y, me.getRangeAnimation(), "AI Projectile Fly")
          @combat.addAction(@combat.runAttack, "Run AI Range Attack")
        didAction = true
    else
      k -= attackWeight
    if (!didAction and k < moveWeight)
      target = @combat.getNearestEnemy(me)
      numMoves--
      if (numMoves == 0)
        numAttacks = 0
      f = => @moveTowards(me, target)
      @combat.addAction(f, "Do Move")
      didAction = true
    else
      k -= moveWeight
    if (!didAction)
      for cast in casts
        if (!didAction and k < cast.weight)
          couldCast = true
          spell = cast.spell
          @combat.castingSpell = spell
          if (spell.type == "summon")
            target = @combat.getSuggestedSummonSquare(me)
            if (target != null)
              @combat.targetX = target.x
              @combat.targetY = target.y
          else
            target = Util.randomElement(cast.targets)
            if (spell.type == "teleport")
              enemy = @combat.getRandomEnemy(me)
              destination = @combat.getSuggestedSummonSquare(enemy)
              if (destination == null)
                destination = @combat.getRandomSquare()
                if (destination == null)
                  couldCast = false
              if (destination != null)
                @combat.teleportTarget = target
                @combat.targetX = destination.x
                @combat.targetY = destination.y
            else
              @combat.targetX = target.x
              @combat.targetY = target.y
          if (couldCast)
            @combat.addSound("spell", "AI Cast Sound")
            @combat.queueAnimation(me.x, me.y, Data.icons.animSpellCast, "Enemy Cast Animation")
            if (spell.target == "range" or spell.target == "area")
              @combat.queueFly(me.x, me.y, target.x, target.y, spell.animation, "Enemy Spell Range Animation")
            if (spell.fast)
              if (me.halfAttack)
                numMoves = 0
                numAttacks--
                me.halfAttack = false
              else
                me.halfAttack = true
            else
              numMoves = 0
              numAttacks--
            @combat.selectMode = CombatView.SELECT_TARGETED
            f = => @combat.doSpellResult()
            @combat.addAction(f, "Do Enemy Spell Result")
            didAction = true
        else
          k -= cast.weight
    if (!didAction)
      numMoves = 0
      numAttacks = 0
    if (numMoves == 0 and numAttacks == 0)
      @combat.endTurn()
    else
      g = => @reselect(me)
      @combat.addAction(g, "AI Reselect")
      @combat.addPause("AI Action Pause")
      f = => @doTurn(me, numMoves, numAttacks)
      @combat.addAction(f, "AI Turn Continuation")
    return
    # END

  reselect : (me) =>
    @combat.select(me.x, me.y, CombatView.SELECT_ACTIVE)

  moveTowards : (me, target) =>
    dx = target.x - me.x
    dy = target.y - me.y
    sx = if dx > 0 then 1 else if dx < 0 then -1 else 0
    sy = if dy > 0 then 1 else if dy < 0 then -1 else 0
    moved = false
    if (Math.abs(dy) >= Math.abs(dx))
      if (@combat.isClear(me.x, me.y + sy))
        @combat.moveCombatant(me.x, me.y, me.x, me.y + sy)
        moved = true
      else if (@combat.isClear(me.x + sx, me.y))
        @combat.moveCombatant(me.x, me.y, me.x + sx, me.y)
        moved = true
    else
      if (@combat.isClear(me.x + sx, me.y))
        @combat.moveCombatant(me.x, me.y, me.x + sx, me.y)
        moved = true
      else if (@combat.isClear(me.x, me.y + sy))
        @combat.moveCombatant(me.x, me.y, me.x, me.y + sy)
        moved = true
    if (moved)
      @combat.addSound("move", "AI Move Sound")
    @combat.draw()
