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

class ItemView extends SelectView

  @ACTION_EQUIP : "EQUIP"
  @ACTION_INFO : "INFO"
  @ACTION_BUY : "BUY"
  @ACTION_SELL : "SELL"
  @ACTION_GIVE : "GIVE"
  @ACTION_USE : "USE"
  @ACTION_DROP : "DROP"

  @NONE : "(none)"

  @itemType : null
  @items : null
  @shop : null
  @buyRate : 0
  @sellRate : 0

  @selectAction : null
  @sellingPlayer : null
  @inCombat : false

  constructor : (gurk, @player, @itemAction, @param = null, @melee = null, @summon = null, @combatant = null) ->
    super(gurk, @itemAction, "X")
    if (@itemAction == ItemView.ACTION_GIVE)
      @items = @param
    else if (@itemAction == ItemView.ACTION_BUY)
      @shop = @param
      @items = gurk.game.getShopItems(@shop.x, @shop.y)
      @buyRate = @shop.buyRate;
      @sellRate = @shop.sellRate;
    else if (@itemAction == ItemView.ACTION_SELL)
      @shop = @param
      @buyRate = @shop.buyRate
      @sellRate = @shop.sellRate
      @items = @player.items
    else if (@itemAction == ItemView.ACTION_USE)
      @inCombat = @param

  doLayout : =>
    @clear()
    switch (@itemAction)
      when ItemView.ACTION_EQUIP
        @addLabelCentered("#{@player.getName()}'s Items", "#A0A0A0", 0, 1, 128, 8)
        @setButton(1, "INFO")
        @setButton(7, "BACK")
        if (@melee) # True if this is an in-combat wield
          @clearButton(9)
        else
          @setButton(9, "EXIT")
        @items = @player.getEquipableItemsByType(Item.TYPES[@param])
        @items.push(ItemView.NONE)
      when ItemView.ACTION_INFO
        @addLabelCentered("#{@player.getName()}'s Items", "#A0A0A0", 0, 1, 128, 8)
        @setButton(9, "EXIT")
        @setButton(7, "BACK")
        @setButton(3, "GIVE")
        @setButton(1, "DROP")
        # todo - add "USE" option here that is enabled for healing items
        @items = @player.items
      when ItemView.ACTION_GIVE
        @addLabelCentered("Items", "#A0A0A0", 0, 1, 128, 8)
        @setButton(1, "INFO")
        @setButton(9, "EXIT")
      when ItemView.ACTION_BUY
        @addLabelCentered("Gold: #{@gurk.game.gold}", "#E8C627", 0, 1, 128, 8)
        @setButton(1, "INFO")
        @setButton(3, "SELL...")
        @setButton(9, "EXIT")
      when ItemView.ACTION_SELL
        @addLabelCentered("#{@player.getName()}'s Items", "#A0A0A0", 0, 1, 128, 8)
        @setButton(1, "INFO")
        @setButton(7, "BACK")
        @setButton(9, "EXIT")
      when ItemView.ACTION_USE
        @addLabelCentered("Choose Item to Use", "#A0A0A0", 0, 1, 128, 8)
        @setButton(1, "INFO")
        @setButton(7, "BACK")
        if (!@inCombat)
          @setButton(9, "EXIT")
        else
          @clearButton(9)
        @items = []
        for item in @player.items
          if (@player.canEmploy(item) and (item.isUseable() or (@combatant and @inCombat and item.getCombatSpell() and @player.isItemEquipped(item) and !@combatant.isCombatSpellUsed(item))))
            canUse = false
            if (@inCombat)
              spell = item.getSpell()
              if (spell.type == "summon" and @summon)
                canUse = true
              else if (spell.target != "touch" or @melee or spell.type == "heal")
                canUse = true
            else if (item.canUseOutsideOfCombat())
              canUse = true
            if (canUse)
              @items.push(item)
        if (@items.length == 0)
          @gurk.popView(null)
    @addIcon(eburp.data.icons.blank, Screen.SIZE - (Screen.UNIT + Screen.HALF_UNIT), Screen.HALF_UNIT)
    y = 9
    if (@items.length > 0)
      for item in @items
        if (item == ItemView.NONE)
          @addOption(ItemView.NONE, "#A0A0A0", 6, y)
        else
          color = item.getColor()
          if (@player and @player.isItemEquipped(item) and !@inCombat)
            @addLabel("+", "#FFF", 1, y)
          name = item.name
          spell = null
          if (item.charges > 0)
            name = name + " [#{item.charges}]"
            spell = item.getSpell()
          else if (item.getCombatSpell() and @inCombat)
            name = name + " [+]"
            spell = item.getCombatSpell()
          if (spell and @inCombat)
            if (spell.fast)
              @addLabel("|", "#A0A0A0", 1, y)
            else
              @addLabel("=", "#A0A0A0", 1, y)
          if (@itemAction == ItemView.ACTION_BUY)
            option = "#{name} (#{item.getShopValue(@buyRate)})"
            @addOption(option, "#FFF", 1, y)
            offset = 1
          else if (@itemAction == ItemView.ACTION_SELL)
            option = "#{name} (#{item.getShopValue(@sellRate)})"
            @addOption(option, "#FFF", 6, y)
            offset = 6
          else
            option = name
            @addOption(name, "#FFF", 6, y)
            offset = 6
          if (item.template.legendary)
            optionWidth = @getTextWidth(option)
            @addLabel("=", color, offset + optionWidth + 1, y)
        y += 8
    else
      @addLabel("(No items)", "#FFF", 6, y)
      @clearButton(1)
      @clearButton(3)
      @clearButton(5)
    @start()

  itemHighlighted: (index, item) =>
    if (item.text == ItemView.NONE)
      @changeIcon(0, GearView.slotIcons[@param])
    else
      @changeIcon(0, @items[index].template.icon)
      if (@itemAction == ItemView.ACTION_BUY)
        if (@gurk.game.gold >= @items[index].getShopValue(@buyRate))
          @setButton(5, "BUY")
        else
          @clearButton(5)

  itemSelected: (index, label) =>
    if (label == ItemView.NONE)
      @gurk.popView(label)
    else
      item = @items[index]
      if (@itemAction == ItemView.ACTION_EQUIP)
        @gurk.popView(item)
      if (@itemAction == ItemView.ACTION_SELL)
        price = item.getShopValue(@sellRate)
        @gurk.pushView(new ConfirmView(@gurk, item.template.icon, "Confirm Sale", "Sell #{item.name} for #{price} gold pieces?", "SELL_YES", "SELL_NO"))
      if (@itemAction == ItemView.ACTION_USE)
        if (@inCombat)
          @gurk.popView(item)
        else
          if (item.getSpell().healType == "restore")
            @gurk.pushView(new PlayerDialog(@gurk, PlayerDialog.ACTION_RESTORE, @player))
          else
            @gurk.pushView(new PlayerDialog(@gurk, PlayerDialog.ACTION_HEAL, @player))

  command: (text) =>
    @selectAction = text
    switch text
      when "BACK" then @gurk.popView(null)
      when "EXIT" then @gurk.popToTopView(null)
      when "INFO" then @gurk.pushView(new ItemInfoView(@gurk, @items[@selected]))
      when "GIVE", "BUY"
        @gurk.pushView(new PlayerDialog(@gurk, "GIVE"))
      when "SELL..."
        @gurk.pushView(new PlayerDialog(@gurk, "SELL"))
      when "DROP"
        item = @items[@selected]
        @gurk.pushView(new ConfirmView(@gurk, item.template.icon, "Confirm Drop", "Drop #{item.name}? It will be gone forever!", "DROP_YES", "DROP_NO"))
      else super(text)

  processResult: (param) =>
    item = @items[@selected]
    if param is "SELL_YES"
      @gurk.game.gold += item.getShopValue(@sellRate)
      @player.dropItem(item)
      @doLayout()
    else if (param == "DROP_YES")
      @player.dropItem(item)
      @doLayout()
    else if (param == "DROP_NO")
      # no-op
      false
    else if (param == "SELL_NO")
      # no-op
      false
    else if (@selectAction == "SELL...")
      @selectAction = "SELL"
      if (param == 3)
        @sellingPlayer = @gurk.game.bag
      else
        @sellingPlayer = @gurk.game.players[param]
      @gurk.pushView(new ItemView(@gurk, @sellingPlayer, "SELL", @shop))
    else if (@selectAction == "USE")
      target = @gurk.game.players[param]
      spell = item.getSpell()
      bounds = item.getSpellRange()
      item.charges--
      if (item.charges == 0)
        @player.dropItem(item)
      if (spell.healType == "restore")
        orgSpellPoints = target.spellPoints
        target.spellPoints += Util.random(bounds.min, bounds.max)
        if (target.spellPoints > target.maxSpellPoints)
          target.spellPoints = target.maxSpellPoints
        restoreAmount = target.spellPoints - orgSpellPoints
        @gurk.pushView(new AlertView(@gurk, target.character.icon, "Restored", "#{target.character.name} was restored for #{restoreAmount} points.", null))
      else
        orgHitPoints = target.hitPoints
        target.hitPoints += Util.random(bounds.min, bounds.max)
        if (target.hitPoints > target.maxHitPoints)
          target.hitPoints = target.maxHitPoints
        healAmount = target.hitPoints - orgHitPoints
        @gurk.pushView(new AlertView(@gurk, target.character.icon, "Healed", "#{target.character.name} was healed for #{healAmount} points.", null))
    else # GIVE
      if (param == 3)
        target = @gurk.game.bag
      else
        target = @gurk.game.players[param]
      if (target)
        if (@player != target)
          item = @items[@selected]
          if (@player)
            @player.dropItem(item)
          else
            @items.splice(@selected, 1)
            if (@itemAction == ItemView.ACTION_BUY)
              oldGold = @gurk.game.gold
              @gurk.game.gold -= item.getShopValue(@buyRate)
              eburp.track 'Buy Item',
                name: item.name,
                id: item.id,
                type: item.template.type,
                value: item.template.baseValue
                playerBefore:oldGold
                playerAfter:@gurk.game.gold
          target.addItem(item)
          if (@items.length == 0)
            @gurk.popView(null)
