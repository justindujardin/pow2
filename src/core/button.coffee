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

class Button

  buttonOn : false
  text : null

  constructor: (@index, @x, @y) ->
    @text = "BLAM"

  draw: (ctx) =>
    image = if @buttonOn then ButtonGrid.onImage else ButtonGrid.offImage
    ctx.drawImage(image, Screen.SCALE * @x, Screen.SCALE * @y);
    if (@buttonOn)
      ButtonGrid.FONT.centerText(ctx, @text, "transparent", @x + 1, @y, ButtonGrid.BUTTON_WIDTH, ButtonGrid.BUTTON_HEIGHT)
    ctx.drawImage(ButtonGrid.topImage, Screen.SCALE * @x, Screen.SCALE * @y);
    false

  enable: =>
    @buttonOn = true

  disable: =>
    @buttonOn = false

  isEnabled: =>
    @buttonOn

  setText: (text) =>
    @text = text

class ButtonGrid

  @GURKOID_GLYPHS : {
      'A' : {x : 1, y : 1, width: 5, height: 9},
      'B' : {x : 6, y : 1, width: 5, height: 9},
      'C' : {x : 11, y : 1, width: 5, height: 9},
      'D' : {x : 16, y : 1, width: 5, height: 9},
      'E' : {x : 21, y : 1, width: 4, height: 9},
      'F' : {x : 25, y : 1, width: 4, height: 9},
      'G' : {x : 29, y : 1, width: 5, height: 9},
      'H' : {x : 34, y : 1, width: 5, height: 9},
      'I' : {x : 39, y : 1, width: 4, height: 9},
      'J' : {x : 43, y : 1, width: 4, height: 9},
      'K' : {x : 47, y : 1, width: 5, height: 9},
      'L' : {x : 52, y : 1, width: 5, height: 9},
      'M' : {x : 57, y : 1, width: 6, height: 9},
      'N' : {x : 63, y : 1, width: 6, height: 9},
      'O' : {x : 69, y : 1, width: 5, height: 9},
      'P' : {x : 74, y : 1, width: 5, height: 9},
      'Q' : {x : 79, y : 1, width: 5, height: 9},
      'R' : {x : 84, y : 1, width: 5, height: 9},
      'S' : {x : 89, y : 1, width: 5, height: 9},
      'T' : {x : 94, y : 1, width: 6, height: 9},
      'U' : {x : 100, y : 1, width: 5, height: 9},
      'V' : {x : 105, y : 1, width: 5, height: 9},
      'W' : {x : 110, y : 1, width: 6, height: 9},
      'X' : {x : 116, y : 1, width: 6, height: 9},
      'Y' : {x : 122, y : 1, width: 6, height: 9},
      'Z' : {x : 128, y : 1, width: 5, height: 9},
      '1' : {x : 133, y : 1, width: 8, height: 9},
      '2' : {x : 141, y : 1, width: 10, height: 9},
      '3' : {x : 151, y : 1, width: 8, height: 9},
      '4' : {x : 159, y : 1, width: 10, height: 9},
      '/' : {x : 169, y : 1, width: 2, height: 9},
      '.' : {x : 171, y : 1, width: 2, height: 9}
      ' ' : {x : 173, y : 1, width: 4, height: 9}
    }

  #@GRID_WIDTH : 160
  #@GRID_HEIGHT : 85
  @BUTTON_WIDTH : 45
  @BUTTON_HEIGHT : 23

  @FONT : null
  @onImage: null
  @offImage: null
  @topImage: null

  buttons : null

  constructor: (@ctx, @gurk) ->
    ButtonGrid.FONT = new Font(ButtonGrid.GURKOID_GLYPHS, "images/font_gurkoid" + Screen.SCALE + ".png")
    ButtonGrid.onImage = Preloader.getImage("images/button" + Screen.SCALE + ".png")
    ButtonGrid.offImage = Preloader.getImage("images/buttonoff" + Screen.SCALE + ".png")
    ButtonGrid.topImage = Preloader.getImage("images/buttontop" + Screen.SCALE + ".png")
    #gapWidth = (ButtonGrid.GRID_WIDTH - 3 * ButtonGrid.BUTTON_WIDTH) / 4
    #gapHeight = (ButtonGrid.GRID_HEIGHT - 3 * ButtonGrid.BUTTON_HEIGHT) / 2
    index = 1
    yy = GAP_Y
    @buttons = new Array(3)
    for y in [0..2]
      @buttons[y] = new Array(3)
      xx = GAP_X
      for x in [0..2]
        @buttons[y][x] = new Button(index, xx, yy)
        index++
        xx += ButtonGrid.BUTTON_WIDTH + GAP_X
      yy += GAP_Y + ButtonGrid.BUTTON_HEIGHT
    # Set up and enable the directional arrows
    @enableMovement()
    false

  draw: =>
    f = =>
      @ctx.clearRect(0, 0, Screen.SCALE * GRID_WIDTH, Screen.SCALE * GRID_HEIGHT)
      for y in [0..2]
        for x in [0..2]
          @buttons[y][x].draw(@ctx)
    f();
    if (drawHack)
      setTimeout(f, 50);
    false

  clicked: (e) =>
    #console.log("e.x: " + e.x + ", e.y: " + e.y)
    # todo - dead zones between buttons?
    x = Math.floor(e.x * 3 / Screen.SCALE / GRID_WIDTH)
    y = Math.floor(e.y * 3 / Screen.SCALE / GRID_HEIGHT)
    #console.log("X: " + x + ", Y: " + y)
    # if @buttons[y][x].isEnabled() then @buttons[y][x].disable() else @buttons[y][x].enable()
    # @draw()
    button = @buttons[y][x]
    if (button.buttonOn)
      @gurk.buttonPressed(@buttons[y][x].text)

  getButtonByKeyNum: (keyNum) =>
    keyNum--
    y = Math.floor(keyNum / 3)
    x = keyNum % 3
    @buttons[y][x]

  forceClick: (keyNum) =>
    button = @getButtonByKeyNum(keyNum)
    if (button.buttonOn)
      @gurk.buttonPressed(button.text)


  clear: =>
    for y in [0..2]
      for x in [0..2]
        @buttons[y][x].disable()
    @draw()

  enableMovement: =>
    @buttons[1][0].enable()
    @buttons[1][0].setText("1")
    @buttons[0][1].enable()
    @buttons[0][1].setText("2")
    @buttons[1][2].enable()
    @buttons[1][2].setText("3")
    @buttons[2][1].enable()
    @buttons[2][1].setText("4")
    @draw()

  # 1 2 3
  # 4 5 6
  # 7 8 9
  setButton: (keyNum, text) =>
    button = @getButtonByKeyNum(keyNum)
    button.setText(text)
    button.enable()
    @draw()

  setButtonByPosition: (x, y, text) =>
    button = @buttons[y][x]
    button.setText(text)
    button.enable()
    @draw()

  disableButtonByPosition: (x, y) =>
    button = @buttons[y][x]
    button.disable()
    @draw()
