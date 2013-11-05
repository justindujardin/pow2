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

# This class is deprecated-- just hanging around for some demo code
class Map extends TileView

  constructor: (gurk, @mapName) ->
    super(gurk, @mapName)
    @setButton(1, "NEW")
    @setButton(3, "HIT")
    @setButton(7, "WOW")
    @setButton(9, "SHOOT")
    @setBanner("Sir Rugnar (HP: 8)")

  command: (text) =>
    switch text
      when View.LEFT then @move(-1, 0)
      when View.UP then @move(0, -1)
      when View.RIGHT then @move(1, 0)
      when View.DOWN then @move(0, 1)
      when "NEW" then @gurk.showConfirm(Data.icons.party, "New Game", "Erase your old saved game and make a new one? You won't be able to recover your old game!", {}, {})
      # when "LOAD" then @gurk.showAlert("party.png", "Test Alert", "Thanks for doing this, it has been a great test of functionality. All the best.", {})
      when "HIT"
        @animate(Data.icons.animation, 4, 4, 200, @animDone)
      when "WOW"
        view = new SelectView(@gurk, "SELECT")
        view.addIcon(Data.icons.party, 3, 3)
        view.addLabel("Blammo!", "#FFF", 22, 12)
        y = 3 + 19
        view.addIcon("grass.png", 3, y)
        view.addOption("Grass", "#880", 22, y + 9)
        y += 19
        view.addIcon("tree.png", 3, y)
        view.addOption("Forest", "#080", 22, y + 9)
        y += 19
        view.addIcon("water.png", 3, y)
        view.addOption("Water", "#44F", 22, y + 9)
        @gurk.pushView(view)
      when "SHOOT"
        # no-op
        abc = 0
  animDone: =>

  doDraw: =>
    for y in [0..Screen.WIN_SIZE]
      yy = y + @posY - Screen.CENTER_OFFSET
      if (yy >= 0 and yy < @height)
        for x in [0..Screen.WIN_SIZE]
          xx = x + @posX - Screen.CENTER_OFFSET
          if (xx >= 0 and xx < @width)
            tile = @getTerrainIcon(xx, yy)
            @drawTile(tile, x, y)
    @drawTile(Data.icons.party, Screen.CENTER_OFFSET, Screen.CENTER_OFFSET)
    @drawBanner()
    # Test drawing
    # @screen.clearColor(Screen.GURK_BLUE)
    # @screen.drawText("(\"Oopla!\" 'Quoi?')", "#FF0000", 20, 20)
    # @screen.wrapText("Here is a long paragraph that is going to have to be wrapped, y'all! It's super long and now two line breaks approach.\n\nMore stuff here, because why not? And we'll get it to break too, haha. 123456789012345678901234567890123456789012345678901234567890", "#FFFFFF", 0, 0, 128)

  move: (x, y) =>
    @posX += x
    @posY += y
    if (@posX < 0) then @posX = 0 else if (@posX >= @width) then @posX = @width - 1
    if (@posY < 0) then @posY = 0 else if (@posY >= @height) then @posY = @height - 1
    @draw();
