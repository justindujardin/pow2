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

class View extends TileMapView
  @LEFT : "1"
  @UP : "2"
  @RIGHT : "3"
  @DOWN : "4"

  buttons : null
  name : "No Name"

  constructor: (@canvas, @gurk) ->
    super(@canvas,@gurk)
    @buttons = new Array(3)
    for y in [0..2]
      @buttons[y] = new Array(3)
      for x in [0..2]
        @buttons[y][x] = null
    true

  processResult: (result) =>
    # no-op, override to do something

  draw: =>
    @doDraw()

  doDraw: =>

#  renderFrame:() ->
#    @doDraw()

  doLayout: =>

  command: (text) =>
    # no-op

  setButtons: (grid) =>
    grid.clear()
    for y in [0..2]
      for x in [0..2]
        if (@buttons[y][x])
          grid.setButtonByPosition(x, y, @buttons[y][x])

  enableMovement: =>
    @buttons[1][0] = View.LEFT
    @buttons[0][1] = View.UP
    @buttons[1][2] = View.RIGHT
    @buttons[2][1] = View.DOWN
    if (@gurk.isCurrentView(this))
      @setButtons(@gurk.buttonGrid)

  @coords: (keyNum) =>
    keyNum--
    y = Math.floor(keyNum / 3)
    x = keyNum % 3
    [x, y]

  clearButton: (keyNum) =>
    [x, y] = View.coords(keyNum)
    @buttons[y][x] = null
    if (@gurk.isCurrentView(this))
      @gurk.buttonGrid.disableButtonByPosition(x, y)

  clearAllButtons : () =>
    for i in [1 .. 9]
      @clearButton(i)
    true

  setButton: (keyNum, text) =>
    [x, y] = View.coords(keyNum)
    @buttons[y][x] = text
    if (@gurk.isCurrentView(this))
      @gurk.buttonGrid.setButtonByPosition(x, y, text)

  getTextWidth : (text) =>
    Screen.FONT.getWidth(text)
