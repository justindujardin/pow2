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

  constructor : (@gurk, @mapName) ->
    super(@gurk.canvas,@gurk)
    @tileMap = new eburp.TileMap(@mapName)
    if @gurk.scene and @tileMap
      @gurk.scene.addObject @tileMap if not @gurk.scene.findObject @tileMap
    @setMap(@mapName, 0, 0)
    @enableMovement()

  setMap : (mapName, x, y) ->
    @mapName = mapName
    @map = Data.maps[@mapName]
    @height = @map.height
    @width = @map.width
    @posX = x
    @posY = y

  animateBlock : (anim, x, y, radius, rate, callback) ->
    frame = 0
    @playAnimation rate, (frame) =>
      @animateBlockFrame(anim,x,y,radius,frame, callback)

  animateBlockFrame : (anim, x, y, radius, frame, callback) ->
    frames = Data.sprites[anim].frames or 1
    if frame >= frames
      callback() if callback
      return true
    for yy in [y - radius .. y + radius]
      if (yy >= 0 and yy < @height)
        for xx in [x - radius .. x + radius]
          if (xx >= 0 and xx < @width)
            @drawAnim(anim, xx, yy, frame)
    false

  animate : (anim, x, y, rate, callback) ->
    frame = 0
    @playAnimation rate, (frame) =>
      @animateFrame(anim,x,y,frame, callback)

  animateFrame : (anim, x, y, frame, callback) ->
    spriteMeta = Data.sprites[anim]
    throw new Error "Unable to find animation sprite: #{anim}" if not spriteMeta
    frames = spriteMeta.frames or 1
    if frame >= frames
      callback() if callback
      return true
    @drawAnim(anim, x, y, frame)
    false

  fly : (anim, x1, x2, y1, y2, rate, callback, custom = null) ->

    n = Math.floor(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) * rate / 50) + 1
    frame = 0
    @playAnimation rate, (frame) =>
      @flyFrame(anim, x1, x2, y1, y2, rate, frame, n, callback, custom)

  flyFrame : (anim, x1, x2, y1, y2, rate, step, n, callback, custom) ->

    x = x1 + (x2 - x1) * step / n
    y = y1 + (y2 - y1) * step / n
    frames = Data.sprites[anim].frames or 1
    frame = step % frames
    if (custom)
      @drawCustomAnim(custom, x, y)
    else
      @drawAnim(anim, x, y, frame)
    if step > n
      callback() if callback
      return true
    false

  setBanner : (text) ->
    @banner = text
    @draw()

  clearBanner : ->
    @banner = null
    @draw()

  drawBanner : ->
    if (@banner)
      rect = @worldToScreen @camera.point
      x = @camera.point.x - 0.5
      y = @camera.point.y + @camera.extent.y - 1
      left = x
      middle = x+1
      middleWidth = @camera.extent.x - 1
      right = x + @camera.extent.x
      @drawTile(Data.icons.bannerLeft, left, y)
      @drawTileStretch(Data.icons.banner,middle,y,middleWidth,1)
      @drawTile(Data.icons.bannerRight, right, y)
      rect = new eburp.Rect(@camera.point.x, y, @camera.extent.x,1).scale(@unitSize)
      @gurk.screen.drawTextCentered(@banner, "#FFF", rect.point.x, rect.point.y, rect.extent.x, rect.extent.y,@cameraScale)

  setTopBanner : (numMoves, numAttacks, half = false) ->
    @topBanner = {"numMoves" : numMoves, "numAttacks" : numAttacks, "half" : half}

  clearTopBanner : ->
    @topBanner = null

  drawTopBanner : ->
    if (@topBanner)
      if (@topBannerLeft)
        leftX = -Screen.HALF_UNIT
      else
        leftX = (@camera.extent.x / 2) * @unitSize - Screen.HALF_UNIT
      y = 0
      x = leftX
      @gurk.screen.drawIcon(Data.icons.bannerLeft, x, y,@cameraScale)
      for i in [0...2]
        x += @unitSize
        @gurk.screen.drawIcon(Data.icons.banner, x, y,@cameraScale)
      x += @unitSize
      @gurk.screen.drawIcon(Data.icons.bannerRight, x, y,@cameraScale)
      x = leftX + Screen.HALF_UNIT + 5
      y = 5
      @gurk.screen.drawText("~", "#A0A0A0", x, y)
      x += 10
      @gurk.screen.drawText(":", "#A0A0A0", x, y)
      x += 3
      @gurk.screen.drawText("#{@topBanner.numMoves}", "#FFF", x, y,@cameraScale)
      x = leftX + Screen.HALF_UNIT + 25
      @gurk.screen.drawText("`", "#A0A0A0", x, y,@cameraScale)
      x += 6
      @gurk.screen.drawText(":", "#A0A0A0", x, y,@cameraScale)
      x += 3
      if (@topBanner.half)
        attacks = "#{@topBanner.numAttacks-1}|"
      else
        attacks = "#{@topBanner.numAttacks}"
      @gurk.screen.drawText("#{attacks}", "#FFF", x, y + Screen.HALF_UNIT,@cameraScale)
