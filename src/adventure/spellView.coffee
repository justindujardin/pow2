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

class SpellView extends SelectView

  @USE_NAME : "Use..."

  creature : null
  spells : null
  castable : null
  resultMode : null

  constructor : (gurk, @player, @inCombat = false, @melee = false, @hasSummonRoom = false, @combatant = null) ->
    super(gurk, "CAST", "X")
    if (@player.template)
      @creature = @player
    if (!@inCombat)
      @setButton(9, "EXIT")
      @setButton(7, "BACK")
    else
      @setButton(7, "CANCEL")
      @clearButton(9)
    @setButton(1, "INFO")

  doLayout : =>
    @clear()
    @spells = @player.getSpells()
    @castable = []
    # @addIcon(Data.icons.spell, 128 - 17, 1)
    if (@creature)
      @addLabelCentered("#{@creature.template.name}'s Spells (SP: #{@player.spellPoints})", "#A0A0A0", 0, 1, 128, 8)
    else
      @addLabelCentered("#{@player.character.name}'s Spells (SP: #{@player.spellPoints})", "#A0A0A0", 0, 1, 128, 8)
    y = 9
    spellPoints = @player.spellPoints
    index = 0
    for spell in @spells
      active = false
      if (spell.spellPoints <= spellPoints)
        if ((spell.type == "heal" and (@inCombat or spell.healType != "remove")) or ((spell.type == "enhance" or spell.type == "teleport") and @inCombat))
          active = true
        else if (@inCombat)
          if (spell.type == "summon" and @hasSummonRoom)
            active = true
          else if (spell.target == "touch" and @melee)
            active = true
          else if (spell.target == "range" or spell.target == "area")
            active = true
      @castable.push(active)
      color = if active then "#FFF" else "#888"
      if (active and @inCombat)
        if (spell.fast)
          @addLabel("|", "#A0A0A0", 1, y)
        else
          @addLabel("=", "#A0A0A0", 1, y)
      @addOption("#{spell.name} (#{spell.spellPoints})", color, 6, y)
      y += 8
      index++
    if (!@creature and @player.hasUsableItem(@inCombat, @melee, @hasSummonRoom, @combatant))
      @addOption(SpellView.USE_NAME, "#FFF", 6, y)
    @start()

  itemHighlighted: (index, item) =>
    if (item.text == SpellView.USE_NAME)
      @setButton(5, "USE")
    else if (@castable[index])
      @setButton(5, "CAST")
    else
      @clearButton(5)

  itemSelected: (index, item) =>
    if (@castable[index])
      if (@inCombat)
        @gurk.popView(@spells[index])
      else
        if (@gurk.game.playersNeedHealing())
          @gurk.pushView(new PlayerDialog(@gurk, PlayerDialog.ACTION_HEAL))
        else
          @gurk.pushView(new AlertView(@gurk, Data.icons.party, "Fully Healed", "There is nobody to target with that spell, all of the adventures are fully healed!", null))

  command: (text) =>
    @resultMode = "NORMAL"
    switch text
      when "BACK", "CANCEL" then @gurk.popView(null)
      when "EXIT" then @gurk.popToTopView(null)
      when "INFO" then @gurk.pushView(new SpellInfoView(@gurk, @player, @spells[@selected]))
      when "USE"
        @resultMode = "USE"
        @gurk.pushView(new ItemView(@gurk, @player, ItemView.ACTION_USE, @inCombat, @melee, @hasSummonRoom, @combatant))
      else super(text)

  processResult: (result) =>
    if (@resultMode == "USE")
      @gurk.popView(result)
    else
      target = @gurk.game.players[result]
      spell = @spells[@selected]
      @player.spellPoints -= spell.spellPoints
      bounds = @player.getSpellRange(spell)
      if (spell.healType == "restore")
        orgSpellPoints = target.spellPoints
        target.spellPoints += Util.random(bounds.min, bounds.max)
        if (target.spellPoints > target.maxSpellPoints)
          target.spellPoints = target.maxSpellPoints
        restoreAmount = target.spellPoints - orgSpellPoints
        @gurk.pushView(new AlertView(@gurk, target.character.icon, "Restored", "#{target.character.name} was restored for #{restoreAmount} points, now at #{target.spellPoints}/#{target.maxSpellPoints}.", null))
      else
        orgHitPoints = target.hitPoints
        target.hitPoints += Util.random(bounds.min, bounds.max)
        if (target.hitPoints > target.maxHitPoints)
          target.hitPoints = target.maxHitPoints
        healAmount = target.hitPoints - orgHitPoints
        @gurk.pushView(new AlertView(@gurk, target.character.icon, "Healed", "#{target.character.name} was healed for #{healAmount} points, now at #{target.hitPoints}/#{target.maxHitPoints}.", null))
