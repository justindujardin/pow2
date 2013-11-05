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

class PlayerView extends InfoView

  constructor : (gurk, @player) ->
    super(gurk, "X")
    @setButton(7, "BACK")
    @setButton(9, "EXIT")
    @setButton(5, "GEAR")
    @setButton(1, "ITEMS")

  doLayout : =>
    hasSpells = @player.hasSpells()
    hasUse = @player.hasUsableItem(false)
    if (@player.isAlive())
      if (hasSpells and hasUse)
        @setButton(3, "CAST/USE")
      else if (hasSpells)
        @setButton(3, "SPELLS")
      else if (hasUse)
        @setButton(3, "USE")
    # Warning-- the below is repeated in CreateView verbatim, find way to merge?
    @clear()
    @addIcon(@player.character.icon, 3, 3)
    y = 4
    @addLabel(@player.character.name, "#FFF", 20, y)
    y += 8
    @addLabel("Level #{@player.level} #{@player.character.job}", "#FFF", 20, y)
    y += 8
    levelUp = Data.levels[@player.level]
    @addLabel("XP: #{@player.experience}/#{levelUp}", "#FFF", 20, y)
    y += 8
    # todo - add spell points if there are any, use HP, SP
    if (@player.maxSpellPoints > 0)
      @addLabel("HP: #{@player.hitPoints}/#{@player.maxHitPoints}, SP: #{@player.spellPoints}/#{@player.maxSpellPoints}", "#FFF", 20, y)
    else
      @addLabel("Hit Points: #{@player.hitPoints}/#{@player.maxHitPoints}", "#FFF", 20, y)
    y += 8
    @addLabel("Armor Class: #{@player.getArmorClass()}", "#FFF", 20, y)
    y += 8
    @addLabel("Resistance: #{@player.getResistance()}", "#FFF", 20, y)
    y += 12
    @addLabel("Strength: #{@player.getStrength()}", "#FFF", 20, y)
    y += 8
    strengthBonus = @player.getAttributeBonus(@player.getStrength())
    if (strengthBonus != 0)
      @addLabel("Damage Bonus: #{strengthBonus}", "#A0A0A0", 28, y)
    y += 10
    @addLabel("Accuracy: #{@player.getAccuracy()}", "#FFF", 20, y)
    y += 8
    accuracyBonus = @player.getAttributeBonus(@player.getAccuracy())
    if (accuracyBonus != 0)
      @addLabel("To-Hit Bonus: #{accuracyBonus}", "#A0A0A0", 28, y)
    y += 10
    @addLabel("Awareness: #{@player.getAwareness()}", "#FFF", 20, y)
    y += 8
    awarenessBonus = @player.getAttributeBonus(@player.getAwareness())
    if (awarenessBonus != 0)
      @addLabel("Armor Class Bonus: #{awarenessBonus}", "#A0A0A0", 28, y)
    y += 10
    @addLabel("Toughness: #{@player.getConstitution()}", "#FFF", 20, y)
    y += 8
    constitutionBonus = @player.getAttributeBonus(@player.getConstitution())
    if (constitutionBonus != 0)
      @addLabel("Resistance Bonus: #{constitutionBonus}", "#A0A0A0", 28, y)

  command: (text) =>
    switch text
      when "ITEMS" then @gurk.pushView(new ItemView(@gurk, @player, ItemView.ACTION_INFO))
      when "GEAR" then @gurk.pushView(new GearView(@gurk, @player))
      when "SPELLS", "CAST/USE" then @gurk.pushView(new SpellView(@gurk, @player))
      when "USE" then @gurk.pushView(new ItemView(@gurk, @player, ItemView.ACTION_USE, false))
      when "BACK" then @gurk.popView(null)
      when "EXIT" then @gurk.popToTopView(null)
