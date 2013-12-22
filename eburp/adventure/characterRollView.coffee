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

class CharacterRollView extends InfoView

  player : null

  constructor : (gurk, @game, @character) ->
    super(gurk, "KEEP")
    @setButton(1, "REROLL")
    @setButton(7, "BACK")
    @roll()

  getBonusColor: (value) ->
    if value < 0 then "#FF8080" else "#80FF80"

  roll : =>
    @player = new Player(@character)
    @clear()
    @addIcon(@player.character.icon, 3, 3)
    y = 4
    @addLabel(@player.character.name, "#FFF", 20, y)
    y += 8
    @addLabel("Level #{@player.level} #{@player.character.job}", "#FFF", 20, y)
    y += 8
    levelUp = eburp.data.levels[@player.level + 1]
    @addLabel("XP: #{@player.experience}/#{levelUp}", "#FFF", 20, y)
    y += 8
    if (@player.maxSpellPoints > 0)
      @addLabel("HP: #{@player.hitPoints}/#{@player.maxHitPoints}, SP: #{@player.spellPoints}/#{@player.maxSpellPoints}", "#FFF", 20, y)
    else
      @addLabel("Hit Points: #{@player.hitPoints}/#{@player.maxHitPoints}", "#FFF", 20, y)
#    y += 8
#    @addLabel("Armor Class: #{@player.getArmorClass()}", "#FFF", 20, y)
    y += 16
    @addLabel("Strength: #{@player.getStrength()}", "#FFF", 20, y)
    y += 8
    strengthBonus = @player.getAttributeBonus(@player.getStrength())
    if (strengthBonus != 0)
      @addLabel("Damage Bonus: #{strengthBonus}", @getBonusColor(strengthBonus), 28, y)
    y += 10
    @addLabel("Accuracy: #{@player.getAccuracy()}", "#FFF", 20, y)
    y += 8
    accuracyBonus = @player.getAttributeBonus(@player.getAccuracy())
    if (accuracyBonus != 0)
      @addLabel("To-Hit Bonus: #{accuracyBonus}", @getBonusColor(accuracyBonus), 28, y)
    y += 10
    @addLabel("Awareness: #{@player.getAwareness()}", "#FFF", 20, y)
    y += 8
    awarenessBonus = @player.getAttributeBonus(@player.getAwareness())
    if (awarenessBonus != 0)
      @addLabel("Armor Class Bonus: #{awarenessBonus}", @getBonusColor(awarenessBonus), 28, y)
    y += 10
    @addLabel("Toughness: #{@player.getConstitution()}", "#FFF", 20, y)
    y += 8
    constitutionBonus = @player.getAttributeBonus(@player.getConstitution())
    if (constitutionBonus != 0)
      @addLabel("HP Bonus/Level: #{constitutionBonus}", @getBonusColor(constitutionBonus), 28, y)

  command : (text) =>
    switch (text)
      when "KEEP"
        @game.addPlayer(@player)
        @gurk.popView("NEXT")
      when "BACK"
        @gurk.popView("BACK")
      when "REROLL"
        @roll()
        @draw()
