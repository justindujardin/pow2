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

class Screen

  @SCALE : pixelWidth
  @SIZE : 128
  @GURK_BLUE : "#004c62"
  @UNIT : 16
  @HALF_UNIT : Screen.UNIT / 2
  @WIN_SIZE : 9
  @CENTER_OFFSET : 0
  @ICONS_PER_ROW : 7

  icons : null
  screen : null

  @MICRO_GLYPHS : {
      'A' : {x : 0, y : 0, width: 5, height: 8},
      'B' : {x : 5, y : 0, width: 5, height: 8},
      'C' : {x : 10, y : 0, width: 4, height: 8},
      'D' : {x : 14, y : 0, width: 5, height: 8},
      'E' : {x : 19, y : 0, width: 4, height: 8},
      'F' : {x : 23, y : 0, width: 4, height: 8},
      'G' : {x : 27, y : 0, width: 5, height: 8},
      'H' : {x : 32, y : 0, width: 5, height: 8},
      'I' : {x : 37, y : 0, width: 4, height: 8},
      'J' : {x : 41, y : 0, width: 5, height: 8},
      'K' : {x : 46, y : 0, width: 5, height: 8},
      'L' : {x : 51, y : 0, width: 4, height: 8},
      'M' : {x : 55, y : 0, width: 6, height: 8},
      'N' : {x : 61, y : 0, width: 5, height: 8},
      'O' : {x : 66, y : 0, width: 5, height: 8},
      'P' : {x : 71, y : 0, width: 5, height: 8},
      'Q' : {x : 76, y : 0, width: 5, height: 8},
      'R' : {x : 81, y : 0, width: 5, height: 8},
      'S' : {x : 86, y : 0, width: 5, height: 8},
      'T' : {x : 91, y : 0, width: 4, height: 8},
      'U' : {x : 95, y : 0, width: 5, height: 8},
      'V' : {x : 100, y : 0, width: 5, height: 8},
      'W' : {x : 105, y : 0, width: 6, height: 8},
      'X' : {x : 111, y : 0, width: 5, height: 8},
      'Y' : {x : 116, y : 0, width: 5, height: 8},
      'Z' : {x : 121, y : 0, width: 4, height: 8},
      'a' : {x : 0, y : 8, width: 5, height: 8},
      'b' : {x : 5, y : 8, width: 5, height: 8},
      'c' : {x : 10, y : 8, width: 4, height: 8},
      'd' : {x : 14, y : 8, width: 5, height: 8},
      'e' : {x : 19, y : 8, width: 5, height: 8},
      'f' : {x : 24, y : 8, width: 4, height: 8},
      'g' : {x : 28, y : 8, width: 5, height: 8},
      'h' : {x : 33, y : 8, width: 5, height: 8},
      'i' : {x : 38, y : 8, width: 2, height: 8},
      'j' : {x : 40, y : 8, width: 3, height: 8},
      'k' : {x : 43, y : 8, width: 5, height: 8},
      'l' : {x : 48, y : 8, width: 2, height: 8},
      'm' : {x : 50, y : 8, width: 6, height: 8},
      'n' : {x : 56, y : 8, width: 5, height: 8},
      'o' : {x : 61, y : 8, width: 5, height: 8},
      'p' : {x : 66, y : 8, width: 5, height: 8},
      'q' : {x : 71, y : 8, width: 5, height: 8},
      'r' : {x : 76, y : 8, width: 4, height: 8},
      's' : {x : 80, y : 8, width: 5, height: 8},
      't' : {x : 85, y : 8, width: 4, height: 8},
      'u' : {x : 89, y : 8, width: 5, height: 8},
      'v' : {x : 94, y : 8, width: 5, height: 8},
      'w' : {x : 99, y : 8, width: 6, height: 8},
      'x' : {x : 105, y : 8, width: 4, height: 8},
      'y' : {x : 109, y : 8, width: 5, height: 8},
      'z' : {x : 114, y : 8, width: 5, height: 8},
      '#' : {x : 119, y : 8, width: 6, height: 8},
      '1' : {x : 0, y : 17, width: 3, height: 8},
      '2' : {x : 3, y : 17, width: 5, height: 8},
      '3' : {x : 8, y : 17, width: 5, height: 8},
      '4' : {x : 13, y : 17, width: 5, height: 8},
      '5' : {x : 18, y : 17, width: 5, height: 8},
      '6' : {x : 23, y : 17, width: 5, height: 8},
      '7' : {x : 28, y : 17, width: 5, height: 8},
      '8' : {x : 33, y : 17, width: 5, height: 8},
      '9' : {x : 38, y : 17, width: 5, height: 8},
      '0' : {x : 43, y : 17, width: 5, height: 8},
      ',' : {x : 48, y : 17, width: 3, height: 8},
      '.' : {x : 51, y : 17, width: 2, height: 8},
      '?' : {x : 53, y : 17, width: 5, height: 8},
      '!' : {x : 58, y : 17, width: 2, height: 8},
      "'" : {x : 60, y : 17, width: 2, height: 8},
      '"' : {x : 65, y : 17, width: 4, height: 8},
      '/' : {x : 69, y : 17, width: 6, height: 8},
      '(' : {x : 81, y : 17, width: 3, height: 8},
      ')' : {x : 84, y : 17, width: 3, height: 8},
      '[' : {x : 87, y : 17, width: 3, height: 8},
      ']' : {x : 90, y : 17, width: 3, height: 8},
      ':' : {x : 103, y : 17, width: 2, height: 8},
      '-' : {x : 105, y : 17, width: 4, height: 8},
      '*' : {x : 109, y : 17, width: 4, height: 8},
      '+' : {x : 114, y : 17, width: 4, height: 8},
      ' ' : {x : 122, y : 17, width: 4, height: 8},
      '~' : {x : 0, y : 25, width: 10, height: 8}, # Move icon
      '`' : {x : 10, y : 25, width: 6, height: 8}, # Attack icon
      '=' : {x : 16, y : 25, width: 4, height: 8}, # Full spell
      '|' : {x : 20, y : 25, width: 4, height: 8}  # Half spell
    }

  @FONT : null

  constructor: (@canvas,@ctx) ->

    Screen.FONT = new Font(Screen.MICRO_GLYPHS, "images/font_micro.png")
    @icons = Screen.TEXTURES = {
        animation  : Preloader.getImage("images/animation.png")
        characters : Preloader.getImage("images/characters.png")
        creatures  : Preloader.getImage("images/creatures.png")
        environment: Preloader.getImage("images/environment.png")
        equipment  : Preloader.getImage("images/equipment.png")
        items      : Preloader.getImage("images/items.png")
        ui         : Preloader.getImage("images/ui.png")
    }
    Screen.CENTER_OFFSET = Math.floor(Screen.WIN_SIZE / 2);

  clear: =>
    @clearColor("#000")

  clearColor: (color) =>
    @ctx.fillStyle = color
    @ctx.fillRect(0, 0, Screen.WIN_SIZE * Screen.UNIT * Screen.SCALE, Screen.WIN_SIZE * Screen.UNIT * Screen.SCALE)

  drawScreen: =>
    @ctx.drawImage(@screen, 0, 0)

  drawIcon: (icon, x, y) =>
    coords = Data.sprites[icon];
    if not coords
      throw new Error("Missing image from map " + icon)
    k = Screen.UNIT * Screen.SCALE
    @ctx.drawImage(@icons[coords.source],coords.x, coords.y, Screen.UNIT, Screen.UNIT, x * Screen.SCALE, y * Screen.SCALE, k, k)

  drawImage: (image, x, y, width, height) =>
    @ctx.drawImage(image, x * Screen.SCALE, y * Screen.SCALE, width, height)

  drawText: (text, color, x, y) =>
    Screen.FONT.drawText(@ctx, text, color, x, y)

  drawTextCentered: (text, color, x, y, width, height) =>
    Screen.FONT.centerText(@ctx, text, color, x, y, width, height)

  wrapText: (text, color, x, y, width) =>
    Screen.FONT.wrapText(@ctx, text, color, x, y, width)

  setAlpha: (alpha) =>
    @ctx.globalAlpha = alpha

  drawPixel: (color, x, y) =>
    @ctx.fillStyle = color
    @ctx.fillRect(x * Screen.SCALE, y * Screen.SCALE, Screen.SCALE, Screen.SCALE)

  fillRect: (color, x, y, width, height) =>
    @ctx.fillStyle = color
    @ctx.fillRect(x * Screen.SCALE, y * Screen.SCALE, width * Screen.SCALE, height * Screen.SCALE)
