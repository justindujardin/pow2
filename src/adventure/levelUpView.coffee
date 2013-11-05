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

class LevelUpView extends InfoView

  constructor : (gurk, upgrades, @nextAction) ->
    super(gurk, "OK")
    y = AlertView.ICON_Y
    textX = AlertView.ICON_X * 2 + Screen.UNIT
    @addLabelCentered("Levelling Up", "#FFF", 0, y, 128, y + 8)
    y += 12
    for upgrade in upgrades
      player = upgrade.player
      @addIcon(player.character.icon, AlertView.ICON_X, y)
      @addLabel("#{player.character.name}", "#FFF", textX, y)
      y += 8
      text = "HP +#{upgrade.hitPointBonus}"
      if (upgrade.spellPointBonus > 0)
        text += ", SP +#{upgrade.spellPointBonus}"
      if (upgrade.newSpells)
        text += " +spells"
        # @addLabel("New spells!", "#A0A0A0", textX, y)
      @addLabel(text, "#A0A0A0", textX, y)
      y += 8
      text = ""
      for i in [0 ... 4]
        attrBonus = upgrade.attrBonuses[i]
        if (attrBonus > 0)
          @addLabel("#{Player.ATTRIBUTES[i]} +#{attrBonus}", "#A0A0A0", textX, y)
          y += 8
      y += 4

  command: (text) =>
    @gurk.popView(@nextAction)
