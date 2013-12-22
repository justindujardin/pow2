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

class CharacterInfoView extends InfoView

  @ATTRIBUTES = ["strength", "accuracy", "awareness", "constitution"]

  blurbY : 0

  constructor : (gurk, @character) ->
    super(gurk, "BACK")
    @addIcon(@character.icon, 3, 3)
    y = 4
    @addLabel("#{@character.name}", "#FFF", 20, y)
    y += 8
    @addLabel("Level 1 #{@character.job}", "#A0A0A0", 20, y)
    y += 12
    @blurbY =  @doAttributes(y) + 4

  doAttributes : (y) =>
    for attribute in CharacterInfoView.ATTRIBUTES
      if (@character[attribute])
        value = @character[attribute]
        if (value > 0)
          value = "+" + value
        name = Util.capitalize(attribute)
        if (name == "Constitution")
          name = "Toughness"
        @addLabel("#{name}: #{value}", "#FFF", 3, y)
        y += 8
    y

  doDraw : =>
    super()
    @gurk.screen.wrapText(@character.description, "#A0A0A0", 3, @blurbY, 122)