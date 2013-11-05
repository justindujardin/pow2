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

class InfoView extends View

  icons : null
  labels : null
  doneVerb : null

  constructor: (gurk, doneVerb = "DONE") ->
    super(gurk.getScreen(), gurk)
    @icons = new Array()
    @labels = new Array()
    @doneVerb = doneVerb
    @setButton(5, @doneVerb)

  clear: =>
    @icons = new Array()
    @labels = new Array()

  addIcon: (icon, x, y) =>
    @icons.push({"icon" : icon, "x" : x, "y" : y})
    @icons.length - 1

  changeIcon: (index, icon) =>
    @icons[index].icon = icon

  addLabel: (text, color, x, y) =>
    @labels.push({"text" : text, "color": color, "x" : x, "y" : y})
    @labels.length - 1

  addLabelCentered: (text, color, x, y, width, height) =>
    w = Screen.FONT.getWidth(text)
    h = Screen.FONT.fontHeight
    xx = x + Math.floor((width - w) / 2)
    yy = y + Math.floor((height - h) / 2)
    @addLabel(text, color, xx, yy)

  doDraw: =>
    @screen.clearColor(Screen.GURK_BLUE)
    for icon in @icons
      @screen.drawIcon(icon.icon, icon.x, icon.y);
    for label in @labels
      @screen.drawText(label.text, label.color, label.x, label.y)

  command: (text) =>
    switch text
      when @doneVerb then @gurk.popView(null)
