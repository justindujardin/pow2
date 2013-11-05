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

class FlowView extends AlertView

  @ICON_X: 3
  @ICON_Y: 3
  @TITLE_Y: 7

  paragraphs : null

  constructor: (gurk, icon, title, result, altIcon = null) ->
    super(gurk, icon, title, "", result, altIcon)
    @paragraphs = new Array()

  addParagraph : (text, color) =>
    @paragraphs.push({"text" : text, "color" : color})

  addGap : =>
    @paragraphs.push({"text" : null})

  doDraw : =>
    super()
    y = AlertView.ICON_Y * 2 + Screen.UNIT
    x = AlertView.ICON_X
    for paragraph in @paragraphs
      if (!paragraph.text)
        y += 4
      else
        y += @screen.wrapText(paragraph.text, paragraph.color, x, y, Screen.SIZE - 2 * x)
