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

class PlayerDialog extends SelectView

  @ACTION_HEAL : "HEAL"
  @ACTION_RESTORE : "RESTORE"
  @ACTION_GIVE : "GIVE"
  @ACTION_SELL : "SELL"

  game : null
  canSelect : null

  constructor : (gurk, @action, @preselect = null) ->
    super(gurk, @action, "CANCEL")
    @game = @gurk.game
    @canSelect = []
    y = 3;
    showBag = false
    switch (@action)
      when PlayerDialog.ACTION_HEAL
        message = "Heal which Adventurer?"
      when PlayerDialog.ACTION_RESTORE
        message = "Restore which Adventurer?"
      when PlayerDialog.ACTION_GIVE
        message = "Give to which Adventurer?"
        showBag = true
      when PlayerDialog.ACTION_SELL
        message = "Which Adenturer will Sell?"
        showBag = true
      else
        message = "Choose an Adventurer"
    @addLabelCentered(message, "#FFF", 0, y, 128, Screen.FONT.fontHeight)
    y += 12
    index = 0
    selectIndex = -1
    for player in @game.players
      @addIcon(player.character.icon, 2, y)
      active = true
      if (@action == PlayerDialog.ACTION_HEAL)
        if (!player.isAlive() or player.isHealed())
          active = false
      else if (@action == PlayerDialog.ACTION_RESTORE)
        if (!player.isAlive() or player.isRestored())
          active = false
      else if (@action == PlayerDialog.ACTION_GIVE)
        if (!player.canCarryMoreItems())
          active = false
      else if (@action == PlayerDialog.ACTION_SELL)
        if (player.numberOfItems() == 0)
          active = false
      @canSelect.push(active)
      if (active and @preselect and @preselect == player)
        selectIndex = index
      color = if active then "#FFF" else "#999"
      @addOption(player.character.name, color, 20, y)
      y += 8
      switch (@action)
        when PlayerDialog.ACTION_HEAL
          @addLabel("Hit Points: #{player.hitPoints}/#{player.maxHitPoints}", "#999", 20, y)
        when PlayerDialog.ACTION_RESTORE
          @addLabel("Spell Points: #{player.spellPoints}/#{player.maxSpellPoints}", "#999", 20, y)
        when PlayerDialog.ACTION_GIVE
          @addLabel("Can carry #{Player.MAX_ITEMS - player.numberOfItems()} more items.", "#999", 20, y)
        when PlayerDialog.ACTION_SELL
          @addLabel("Carrying #{player.numberOfItems()} items.", "#999", 20, y)
      y += 20
      index++
    if (showBag)
      bag = @gurk.game.bag
      if (bag)
        @addIcon(bag.character.icon, 2, y)
        active = true
        switch (@action)
          when PlayerDialog.ACTION_GIVE
            if (!bag.canCarryMoreItems())
              active = false
          when PlayerDialog.ACTION_SELL
            if (bag.numberOfItems() == 0)
              active = false
        @canSelect.push(active)
        color = if active then "#FFF" else "#999"
        @addOption(bag.character.name, color, 20, y)
        y += 8
        switch (@action)
          when PlayerDialog.ACTION_GIVE
            @addLabel("Room for #{Player.MAX_ITEMS - bag.numberOfItems()} more items.", "#999", 20, y)
          when PlayerDialog.ACTION_SELL
            @addLabel("Carrying #{bag.numberOfItems()} items.", "#999", 20, y)
    if (selectIndex >= 0)
      @selected = selectIndex
    @start()

  itemHighlighted: (index, item) =>
    if (@canSelect[index])
      @setSelectVerb(@action)
    else
      @turnOffSelection()

  itemSelected: (index, item) =>
    @gurk.popView(index)
