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

class ChooseCharacterView extends SelectView

  characters : null
  fiddles : 0

  constructor : (gurk, @type, @game) ->
    super(gurk, "CHOOSE", "DONE")

  doLayout : =>
    @characters = []
    for character in Data.characters
      if (character.type == @type)
        if (!character.after || Device.getSetting(character.after, false))
          @characters.push(character)
    @clearButton(7)
    @clearButton(9)
    @setButton(1, "INFO")
    @clear()
    y = 3;
    def = "a"
    if (@type == "archer")
      def = "an"
    @addLabelCentered("Choose #{def} #{Util.capitalize(@type)}", "#FFF", 0, y, 128, Screen.FONT.fontHeight)
    y += 8
    @addLabelCentered("(Press INFO to learn more)", "#A0A0A0", 0, y, 128, Screen.FONT.fontHeight)
    # bestAttribute = Util.capitalize(@characters[0].bestAttribute)
    y += 12
    for character in @characters
      @addIcon(character.icon, 2, y)
      @addOption(character.name, "#FFF", 20, y)
      y += 8
      @addLabel("Level 1 #{character.job}", "#A0A0A0", 20, y)
      # @doAttributes(y, character)
      y += 20

  itemSelected: (index, item) =>
    @gurk.pushView(new CharacterRollView(@gurk, @game, @characters[@selected]))

  itemHighlighted: (index, item) =>
    if (index == 0)
      @fiddles++
      if (@fiddles > 10)
        Device.setSetting("won", true)
        @doLayout()
        @fiddles = 0

  command : (text) =>
    if (text == "INFO")
      @gurk.pushView(new CharacterInfoView(@gurk, @characters[@selected]))
    else
      super(text)

  processResult : (result) =>
    if (result == "NEXT")
      @gurk.popView(result)
