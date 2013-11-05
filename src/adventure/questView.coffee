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

class QuestView extends SelectView

  constructor : (gurk) ->
    super(gurk, "VIEW", "EXIT")

  doLayout : =>
    @clear()
    @addLabelCentered("Quests", "#A0A0A0", 0, 1, 128, 8)
    haveQuests = false
    y = 9
    for quest,info of Data.quests
      if (@gurk.game.hasMarker(info.started))
        haveQuests = true
        if (@gurk.game.hasMarker(info.done))
          @addLabel("+", "#FFF", 1, y)
        @addOption(quest, "#FFF", 6, y)
        y += 8
    if (!haveQuests)
      @addLabel("(No quests yet)", "#FFF", 6, y)

  itemSelected: (index, label) =>
    questInfo = Data.quests[label.text]
    done = @gurk.game.hasMarker(questInfo.done)
    infoView = new AlertView(@gurk, questInfo.icon, label.text, questInfo.text, null)
    if (done)
      infoView.subtitle = "(Completed)"
    @gurk.pushView(infoView)

  command: (text) =>
    switch (text)
      when "EXIT" then @gurk.popToTopView(null)
      else super(text)

