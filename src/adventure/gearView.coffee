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

class GearView extends SelectView

  @slotIcons : []

  constructor : (gurk, @player) ->
    GearView.slotIcons = [
      Data.icons.noWeapon,
      Data.icons.noShield,
      Data.icons.noHat,
      Data.icons.noArmor,
      Data.icons.noBoots,
      Data.icons.noAmulet
    ]
    super(gurk, "EQUIP", "X")
    @setButton(7, "BACK")
    @setButton(9, "EXIT")

  doLayout : =>
    @clear()
    @addIcon(@player.character.icon, 2, 2)
    @addLabelCentered("#{@player.character.name}'s Gear", "#FFF", 0, 4, 128, 16)
    y = 2 + 16 + 2
    index = 0
    for k, item of @player.equipment
      color = "#FFF"
      if (item)
        icon = item.template.icon
        label = item.name
        color = item.getColor()
      else
        icon = GearView.slotIcons[index]
        label = "(none)"
      @addIcon(icon, 2, y)
      @addOption(label, color, 21, y + 4)
      index++
      y += 18
    @start()

  itemSelected: (index, item) =>
    @gurk.pushView(new ItemView(@gurk, @player, ItemView.ACTION_EQUIP, index))

  itemHighlighted: (index, item) =>
    type = Item.TYPES[index]
    if (@player.getEquipableItemsByType(type).length > 0)
      @setButton(5, "EQUIP")
    else
      @clearButton(5)
    if (@player.getEquippedItemByType(type))
      @setButton(1, "INFO")
    else
      @clearButton(1)

  command: (text) =>
    switch text
      when "BACK" then @gurk.popView(null)
      when "EXIT" then @gurk.popToTopView(null)
      when "INFO" then @gurk.pushView(new ItemInfoView(@gurk, @player.getEquippedItemByType(Item.TYPES[@selected])))
      else super(text)

  processResult: (item) =>
    if (item)
      if (item == ItemView.NONE)
        @player.unequipItemByType(Item.TYPES[@selected])
      else
        @player.equipItem(item)
        @changeIcon(@selected + 1, item.template.icon)
        @changeOption(@selected, item.name, "#FFF")
