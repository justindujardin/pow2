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

class PartyView extends SelectView

  game : null

  constructor : (gurk) ->
    super(gurk, "VIEW", "EXIT")
    @game = @gurk.game
    @setButton(1, "OPTIONS")

  doLayout : =>
    @clear()
    for marker, key of Data.keys
      if (@gurk.game.hasMarker(marker) and !@gurk.game.hasMarker(key.until))
        @addIcon(key.icon, 110, 10)
    y = 2;
    @addLabelCentered("The Adventurers", "#FFF", 0, y, 128, Screen.FONT.fontHeight)
    y += 10
    map = eburp.getMap @game.map
    @addLabel("In: #{map.name}", "#FFF", 3, y)
    y += 8
    @addLabel("Gold: #{@game.gold}", "#E8C627", 3, y)
    y += 10
    for player in @game.players
      @addIcon(player.character.icon, 2, y)
      color = if player.isAlive() then "#FFF" else "#999"
      @addOption(player.character.name, color, 20, y)
      y += 8
      @addLabel("Level #{player.level} #{player.character.job}", "#FFF", 20, y)
      stats = "HP: #{player.hitPoints}/#{player.maxHitPoints}"
      if (player.maxSpellPoints > 0)
        stats = stats + " SP: #{player.spellPoints}/#{player.maxSpellPoints}"
      y += 8
      @addLabel(stats, "#FFF", 20, y)
      y += 10
    if (@game.bag)
      @addIcon(@game.bag.character.icon, 2, y)
      @addOption(@game.bag.character.name, "#BBB", 20, y)
      y += 8
      if (@game.bag.items.length == 0)
        @addLabel("Empty", "#FFF", 20, y)
      else if (@game.bag.items.length == 1)
        @addLabel("1 item", "#FFF", 20, y)
      else
        @addLabel("#{@game.bag.items.length} items", "#FFF", 20, y)

  itemSelected: (index, item) =>
    if (index == 3)
      @gurk.pushView(new ItemView(@gurk, @gurk.game.bag, ItemView.ACTION_INFO))
    else
      @gurk.pushView(new PlayerView(@gurk, @game.players[index]))

  command: (text) =>
    if (text == "OPTIONS")
      @gurk.showSettings()
    else
      super(text)
