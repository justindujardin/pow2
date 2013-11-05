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

class CreateView extends InfoView

  index : 0
  charIndex : 0
  types : null
  characters : null
  player : null
  game : null

  constructor : (gurk) ->
    super(gurk, "KEEP")
    @types = ["warrior", "archer", "mage"]
    @index = 0
    @setButton(1, "REROLL")
    @game = new Game()
    @getCharacters()
    @roll()

  getCharacters : =>
    @characters = []
    type = @types[@index]
    for character in Data.characters
      if (character.type == type)
        @characters.push(character)
    @charIndex = 0

  roll : =>
    character = @characters[@charIndex]
    @player = new Player(character)
    @clear()
    @addIcon(@player.character.icon, 3, 3)
    y = 4
    @addLabel(@player.character.name, "#FFF", 20, y)
    y += 8
    @addLabel("Level #{@player.level} #{@player.character.job}", "#FFF", 20, y)
    y += 8
    levelUp = Data.levels[@player.level + 1]
    @addLabel("XP: #{@player.experience}/#{levelUp}", "#FFF", 20, y)
    y += 8
    # todo - add spell points if there are any, use HP, SP
    if (@player.maxSpellPoints > 0)
      @addLabel("HP: #{@player.hitPoints}/#{@player.maxHitPoints}, SP: #{@player.spellPoints}/#{@player.maxSpellPoints}", "#FFF", 20, y)
    else
      @addLabel("Hit Points: #{@player.hitPoints}/#{@player.maxHitPoints}", "#FFF", 20, y)
    y += 8
    @addLabel("Armor Class: #{@player.getArmorClass()}", "#FFF", 20, y)
    y += 16
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
      @addLabel("HP Bonus/Level: #{constitutionBonus}", "#A0A0A0", 28, y)

  command : (text) =>
    switch (text)
      when "KEEP"
        @game.addPlayer(@player)
        @index++
        if (@index == @types.length)
          @gurk.startNewGame(@game)
        else
          @getCharacters()
          @roll()
          @draw()
      when "REROLL"
        @charIndex++
        if (@charIndex == @characters.length)
          @charIndex = 0
        @roll()
        @draw()
