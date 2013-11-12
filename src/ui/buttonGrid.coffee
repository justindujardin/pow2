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

class ButtonGrid extends SceneView

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

  @FONT : null
  @onImage: null
  @offImage: null
  @topImage: null

  buttons : null

  constructor: (@canvas, @gurk) ->
    super(@canvas)
    ButtonGrid.FONT = new Font(ButtonGrid.GURKOID_GLYPHS, "images/font_gurkoid.png")
    ButtonGrid.onImage = Preloader.getImage("images/button" + Screen.SCALE + ".png")
    ButtonGrid.offImage = Preloader.getImage("images/buttonoff" + Screen.SCALE + ".png")
    ButtonGrid.topImage = Preloader.getImage("images/buttontop" + Screen.SCALE + ".png")
    @buttons = new Array(3)
    @camera = new Rect(0,0,9,4)
    for y in [0..2]
      @buttons[y] = new Array(3)
      for x in [0..2]
        @buttons[y][x] = new Button new Rect
    # Set up and enable the directional arrows
    @enableMovement()
    false

  processCamera: () ->
    super()
    oneThird = new Point(@camera.extent).divide(3)
    for y in [0..2]
      for x in [0..2]
        button = @buttons[y][x]
        button.point.set oneThird.x * x, oneThird.y * y
        button.extent.set oneThird.x, oneThird.y
    @

  renderFrame: ->
    @clearRect()
    for y in [0..2]
      for x in [0..2]
        button = @buttons[y][x]
        image = if button.buttonOn then ButtonGrid.onImage else ButtonGrid.offImage
        renderPos = @worldToScreen button, @cameraScale
        image = if button.buttonOn then ButtonGrid.onImage else ButtonGrid.offImage
        @context.clearRect(renderPos.point.x,renderPos.point.y,renderPos.extent.x,renderPos.extent.y)
        @context.drawImage(image, renderPos.point.x, renderPos.point.y, renderPos.extent.x, renderPos.extent.y);

        if button.buttonOn and button.text
          renderRect = new Rect(button).scale(Screen.UNIT)
          ButtonGrid.FONT.centerText(@context, button.text, "transparent", renderRect.point.x, renderRect.point.y, renderRect.extent.x, renderRect.extent.y, @cameraScale)
    false

  clicked: (e) =>
    clickPoint = @screenToWorld new Point(e.x, e.y), @cameraScale
    for y in [0..2]
      for x in [0..2]
        if @buttons[y][x].pointInRect(clickPoint)
          if (@buttons[y][x].buttonOn)
            @gurk.buttonPressed(@buttons[y][x].text)
          return
    @

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

  enableMovement: =>
    @buttons[1][0].enable()
    @buttons[1][0].setText("1")
    @buttons[0][1].enable()
    @buttons[0][1].setText("2")
    @buttons[1][2].enable()
    @buttons[1][2].setText("3")
    @buttons[2][1].enable()
    @buttons[2][1].setText("4")

  # 1 2 3
  # 4 5 6
  # 7 8 9
  setButton: (keyNum, text) =>
    button = @getButtonByKeyNum(keyNum)
    button.setText(text)
    button.enable()

  setButtonByPosition: (x, y, text) =>
    button = @buttons[y][x]
    button.setText(text)
    button.enable()

  disableButtonByPosition: (x, y) =>
    button = @buttons[y][x]
    button.disable()
