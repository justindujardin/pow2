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

class AlertView extends View

  @ICON_X: 3
  @ICON_Y: 3
  @TITLE_Y: 7

  subtitle : null

  constructor: (gurk, @icon, @title, @text, @result, @altIcon = null) ->
    super(gurk.canvas, gurk)
    @setButton(5, "OK")

  renderFrame: =>
    @fillColor(Screen.GURK_BLUE)
    @gurk.screen.drawIcon(@icon, AlertView.ICON_X, AlertView.ICON_Y)
    if (@altIcon)
      @gurk.screen.drawIcon(@altIcon, Screen.SIZE - Screen.UNIT - AlertView.ICON_X, AlertView.ICON_Y)
    if (@subtitle)
      @gurk.screen.drawTextCentered(@title, "#FFF", 0, 1, Screen.SIZE, Screen.UNIT)
      @gurk.screen.drawTextCentered(@subtitle, "#A0A0A0", 0, 9, Screen.SIZE, Screen.UNIT)
    else
      @gurk.screen.drawTextCentered(@title, "#FFF", 0, AlertView.ICON_Y + 1, Screen.SIZE, Screen.UNIT)
    @gurk.screen.wrapText(@text, "#FFF", AlertView.ICON_X, AlertView.ICON_Y * 2 + Screen.UNIT, Screen.SIZE - 2 * AlertView.ICON_X)

  command: (text) =>
    switch text
      when "OK" then @gurk.popView(@result)
