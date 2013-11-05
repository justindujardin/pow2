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

class TileView extends View

  width: 0
  height: 0

  posX: 0
  posY: 0

  offsetX : 0
  offsetY : 0

  map : null
  animation : null
  interval : null

  banner : null
  centerBanner : false

  topBanner : null
  topBannerLeft : false

  constructor : (gurk, @mapName) ->
    super(gurk.getScreen(), gurk)
    @setMap(@mapName, 0, 0)
    @enableMovement()
    @centerBanner = false

  setMap : (mapName, x, y) =>
    @mapName = mapName
    @map = Data.maps[@mapName]
    @height = @map.height
    @width = @map.width
    @posX = x
    @posY = y

  drawTile : (icon, x, y) =>
    @screen.drawIcon(icon, x * Screen.UNIT + @offsetX, y * Screen.UNIT + @offsetY)

  drawCustom : (image, x, y) =>
    @screen.drawImage(image, x * Screen.UNIT + @offsetX - 2, y * Screen.UNIT + @offsetY - 2)

  getTerrain : (x, y) =>
    index = y * @map.width + x
    c = @map.map.charAt(index)
    Data.tiles[c]

  getTerrainIcon : (x, y) =>
    @getTerrain(x, y).icon

  animateBlock : (anim, x, y, radius, rate, callback) =>
    anim = Util.getPath(anim)
    step = 0
    fn = () => @animateBlockFrame(anim, x, y, radius, rate, step++, callback)
    fn();
    @interval = setInterval(fn, rate)

  animateBlockFrame : (anim, x, y, radius, rate, frame, callback) =>
    anim = Util.getPath(anim)
    frames = Icons[anim].frames
    if (!frames)
      frames = 1
    @draw()
    if (frame == frames)
      clearInterval(@interval)
      callback()
    else
      for yy in [y - radius .. y + radius]
        if (yy >= 0 and yy < @height)
          for xx in [x - radius .. x + radius]
            if (xx >= 0 and xx < @width)
              @screen.drawAnim(anim, xx * Screen.UNIT + @offsetX, yy * Screen.UNIT + @offsetY, frame)

  animate : (anim, x, y, rate, callback) =>
    anim = Util.getPath(anim)
    step = 0
    fn = () => @animateFrame(anim, x * Screen.UNIT + @offsetX, y * Screen.UNIT + @offsetY, rate, step++, callback)
    fn();
    @interval = setInterval(fn, rate)

  animateFrame : (anim, x, y, rate, frame, callback) =>
    anim = Util.getPath(anim)
    frames = Icons[anim].frames
    if (!frames)
      frames = 1
    @draw()
    if (frame == frames)
      clearInterval(@interval)
      callback()
    else
      @screen.drawAnim(anim, x, y, frame)

  fly : (anim, x1, x2, y1, y2, rate, callback, custom = null) =>
    anim = Util.getPath(anim)
    n = Math.floor(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) * rate / 50) + 1
    step = 0
    fn = () => @flyFrame(anim, x1 * Screen.UNIT + @offsetX, x2 * Screen.UNIT + @offsetX, y1 * Screen.UNIT + @offsetY, y2 * Screen.UNIT + @offsetY, rate, step++, n, callback, custom)
    fn();
    @interval = setInterval(fn, rate)

  flyFrame : (anim, x1, x2, y1, y2, rate, step, n, callback, custom) =>
    anim = Util.getPath(anim)
    x = Math.floor(x1 + (x2 - x1) * step / n)
    y = Math.floor(y1 + (y2 - y1) * step / n)
    frames = Icons[anim].frames
    if (!frames)
      frames = 1
    frame = step % frames
    @draw()
    if (custom)
      @screen.drawCustomAnim(custom, x, y)
    else
      @screen.drawAnim(anim, x, y, frame)
    if (step > n)
      clearInterval(@interval)
      @draw()
      callback()

  setBanner : (text) =>
    @banner = text
    @draw()

  clearBanner : =>
    @banner = null
    @draw()

  drawBanner : =>
    if (@banner)
      x = -Screen.HALF_UNIT
      y = 7 * Screen.UNIT
      @screen.drawIcon(Data.icons.bannerLeft, x, y)
      for i in [0...7]
        x += Screen.UNIT
        @screen.drawIcon(Data.icons.banner, x, y)
      x += Screen.UNIT
      @screen.drawIcon(Data.icons.bannerRight, x, y)
      if (@centerBanner)
        @screen.drawTextCentered(@banner, "#FFF", 0, y + 5, 128, 8)
      else
        @screen.drawText(@banner, "#FFF", 4, y + 5)

  setTopBanner : (numMoves, numAttacks, half = false) =>
    @topBanner = {"numMoves" : numMoves, "numAttacks" : numAttacks, "half" : half}

  clearTopBanner : =>
    @topBanner = null

  drawTopBanner : =>
    if (@topBanner)
      if (@topBannerLeft)
        leftX = -Screen.HALF_UNIT
      else
        leftX = 5 * Screen.UNIT - Screen.HALF_UNIT
      y = 0
      x = leftX
      @screen.drawIcon(Data.icons.bannerLeft, x, y)
      for i in [0...2]
        x += Screen.UNIT
        @screen.drawIcon(Data.icons.banner, x, y)
      x += Screen.UNIT
      @screen.drawIcon(Data.icons.bannerRight, x, y)
      x = leftX + Screen.HALF_UNIT + 5
      y = 5
      @screen.drawText("~", "#A0A0A0", x, y)
      x += 10
      @screen.drawText(":", "#A0A0A0", x, y)
      x += 3
      @screen.drawText("#{@topBanner.numMoves}", "#FFF", x, y)
      x = leftX + Screen.HALF_UNIT + 25
      @screen.drawText("`", "#A0A0A0", x, y)
      x += 6
      @screen.drawText(":", "#A0A0A0", x, y)
      x += 3
      if (@topBanner.half)
        attacks = "#{@topBanner.numAttacks-1}|"
      else
        attacks = "#{@topBanner.numAttacks}"
      @screen.drawText("#{attacks}", "#FFF", x, y)
