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

class CombatantView extends FlowView

  constructor : (gurk, @combatant) ->
    super(gurk, @combatant.getIcon(), @combatant.getName(), null)
    #           @gurk.pushView(new AlertView(@gurk, combatant.getIcon(), combatant.getName(), combatant.entity.template.description, null))
    @addParagraph("Hit Points: #{@combatant.hitPoints}/#{@combatant.getMaxHitPoints()}", "#FFF")
    if (@combatant.isPlayer)
      if (@combatant.entity.maxSpellPoints > 0)
        @addParagraph("Spell Points: #{@combatant.entity.spellPoints}/#{@combatant.entity.maxSpellPoints}", "#FFF")
    @addGap()
    effectsList = []
    for effect, value of @combatant.effects
      if (value)
        effectsList.push(effect)
    if (effectsList.length > 0)
      text = Util.arrayToString(effectsList)
      @addParagraph("Effects: " + text, "#FFF")
      @setButton(1, "EFFECTS")
    if (!@combatant.isPlayer)
      @addParagraph(@combatant.entity.template.description, "#A0A0A0")

  command: (text) =>
    switch text
      when "EFFECTS"
        flow = new FlowView(@gurk, @combatant.getIcon(), "Combat Effects", null)
        for effect, value of @combatant.effects
          if (value)
            flow.addParagraph(effect, "#FFF")
            flow.addParagraph(Data.effects[effect], "#A0A0A0")
            flow.addGap()
        @gurk.pushView(flow)
      else
        super(text)

