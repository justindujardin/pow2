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

class SpellInfoView extends InfoView

  constructor : (gurk, @player, @spell) ->
    super(gurk, "DONE")
    range = @player.getSpellRange(@spell)
    @addIcon(Data.icons.spell, 3, 3)
    @addLabelCentered(@spell.name, "#FFF", 0, 4, 128, 16)
    y = 23
    x = 3
    @addLabel("Level: #{@spell.level}", "#FFF", x, y)
    y += 8
    @addLabel("Casting Cost: #{@spell.spellPoints} SP", "#FFF", x, y)
    y += 8
    speed = if @spell.fast then "| Fast" else "= Normal"
    @addLabel("Speed: #{speed}", "#FFF", x, y)
    y += 8
    if (@spell.type == "summon")
      @addLabel("Summons: #{@spell.creature}", "#FFF", x, y)
      y += 8
    else
      if (@spell.type == "damage")
        effect = "Damage #{range.min} - #{range.max}"
      else if (@spell.type == "drain")
        effect = "Drains Life #{range.min} - #{range.max}"
      else if (@spell.type == "heal")
        if (@spell.healType == "restore")
          effect = "Restore"
        else if (@spell.healType == "remove")
          effect = "Remove Afflictions"
        else
          effect = "Heal #{range.min} - #{range.max}"
      else if (@spell.type == "teleport")
        effect = "Teleport"
      else
        if (@spell.effect == "Poisoned")
          effect = "Poisoned (#{@spell.value})"
        else
          effect = @spell.effect
      @addLabel("Effect: #{effect}", "#FFF", x, y)
      y += 8
      if (@spell.target == "touch")
        target = "Touch"
      else if (@spell.target == "self")
        target = "Self"
      else if (@spell.target == "range")
        target = "Range"
      else if (@spell.target == "area")
        target = "Area"
      @addLabel("Target: #{target}", "#FFF", x, y)
      y += 8

