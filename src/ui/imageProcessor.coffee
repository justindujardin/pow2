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

class ImageProcessor

  @UP : 0
  @RIGHT : 90
  @DOWN : 180
  @LEFT : 270

  constructor : (@canvas, @ctx, @icons) ->
    # No-op

  drawIcon : (icon, x=2,y=2) ->
    coords = Data.sprites[icon];
    throw new Error "Cannot find sprite sheet for : #{icon}" if not coords
    @ctx.drawImage(@icons[coords.source].data, coords.x, coords.y, SceneView.UNIT, SceneView.UNIT, x, y, SceneView.UNIT, SceneView.UNIT)

  # Pick a single sprite out of a sheet, and return an image that contains only that sprite.
  isolateSprite: (icon) ->
    saveW = @canvas.width
    saveH = @canvas.height
    @canvas.width = SceneView.UNIT
    @canvas.height = SceneView.UNIT
    @ctx.clearRect(0, 0, SceneView.UNIT, SceneView.UNIT)
    @drawIcon(icon,0,0)
    src = @canvas.toDataURL()
    result = new Image()
    result.src = src
    @canvas.width = saveW
    @canvas.height = saveH

    result
  drawRotated : (icon, degrees) ->
    @ctx.save();
    t = (Screen.HALF_UNIT + 2)
    @ctx.translate(t, t)
    @ctx.rotate(degrees * Math.PI / 180)
    @ctx.translate(-t, -t)
    @drawIcon(icon)
    @ctx.restore();

  clearRect : ->
    @ctx.clearRect(0, 0, (SceneView.UNIT + 4), (SceneView.UNIT + 4))

  paint : (colors) ->
    arcs = ImageProcessor.computeArcs(colors, 12)
    size = (SceneView.UNIT + 4)
    img = @ctx.getImageData(0, 0, size, size).data
    for y in [0 ... SceneView.UNIT]
      yy = (y + 2)
      for x in [0 ... SceneView.UNIT]
        xx = (x + 2)
        i = (yy * size + xx) * 4
        r = img[i]
        g = img[i + 1]
        b = img[i + 2]
        a = img[i + 3]
        if a > 0 and (r > 0 or g > 0 or b > 0)
          c = ImageProcessor.blend(colors, arcs, Screen.HALF_UNIT - y, Screen.HALF_UNIT - x)
          r = if c.red > 0 then Math.min(255, r + c.red) else Math.max(0, r + c.red)
          g = if c.green > 0 then Math.min(255, g + c.green) else Math.max(0, g + c.green)
          b = if c.blue > 0 then Math.min(255, b + c.blue) else Math.max(0, b + c.blue)
          @ctx.fillStyle = "rgba(#{r},#{g},#{b},#{a})"
          @ctx.fillRect(xx, yy, 1, 1)
    src = @canvas.toDataURL()
    result = new Image()
    result.src = src
    result

  @blend : (colors, arcs, x, y) ->
    if (colors.length == 1)
      return colors[0]
    max = -2 * Math.PI
    min = 2 * Math.PI
    for yy in [y, y + 1]
      for xx in [x, x + 1]
        angle = Math.atan2(yy, xx)
        if (angle > max)
          max = angle
        if (angle < min)
          min = angle
    if (min < 0)
      min += 2 * Math.PI
    if (max < 0)
      max += 2 * Math.PI
    a1 = Math.floor(min * arcs / Math.PI / 2)
    a2 = Math.floor(max * arcs / Math.PI / 2)
    if (a1 == a2)
      return colors[a1 % colors.length]
    else
      p1 = a2 - min * arcs / Math.PI / 2
      p2 = max * arcs / Math.PI / 2 - a2
      return Util.blendColors(colors[a1 % colors.length], colors[a2 % colors.length], p1 / (p1 + p2), p2 / (p1 + p2))

  @computeArcs : (colors, target) ->
    n = colors.length
    if (n == 1)
      return 1
    else
      k = Math.round(target / n)
      return k * n

  glow : (colors, intensity) ->
    arcs = ImageProcessor.computeArcs(colors, 30)
    length = SceneView.UNIT + 4
    cells = Util.create2DArray(length, length)
    size = length
    img = @ctx.getImageData(0, 0, size, size).data
    for y in [0 ... length - 2]
      yy = y
      for x in [0 ... length]
        xx = x
        i = (yy * size + xx) * 4
        a = img[i + 3]
        if (a > 0)
          cells[y][x] = 3
        else
          cells[y][x] = 0
    for y in [0 ... length - 3]
      for x in [0 ... length]
        if (cells[y][x] == 0)
          if (x > 0)
            if (cells[y][x-1] == 3)
              cells[y][x] = 2
          if (x + 1 < length)
            if (cells[y][x+1] == 3)
              cells[y][x] = 2
          if (y > 0)
            if (cells[y-1][x] == 3)
              cells[y][x] = 2
          if (y + 1 < length)
            if (cells[y+1][x] == 3)
              cells[y][x] = 2
    for y in [0 ... length - 2]
      for x in [0 ... length]
        if (cells[y][x] == 0)
          if (x > 0)
            if (cells[y][x-1] == 2)
              cells[y][x] = 1
          if (x + 1 < length)
            if (cells[y][x+1] == 2)
              cells[y][x] = 1
          if (y > 0)
            if (cells[y-1][x] == 2)
              cells[y][x] = 1
          if (y + 1 < length)
            if (cells[y+1][x] == 2)
              cells[y][x] = 1
    for y in [0 ... length - 2]
      yy = y
      for x in [0 ... length]
        if (cells[y][x] > 0 and cells[y][x] < 3)
          xx = x
          i = (yy * size + xx) * 4
          if (cells[y][x] == 1)
            @ctx.globalAlpha = intensity / 100 / 3
          else
            @ctx.globalAlpha = intensity / 100
          c = ImageProcessor.blend(colors, arcs, length / 2 - y, length / 2 - x)
          @ctx.fillStyle = "rgba(#{c.red},#{c.green},#{c.blue},255)"
          @ctx.fillRect(xx, yy, 1, 1)
    @ctx.globalAlpha = 1
    src = @canvas.toDataURL()
    result = new Image()
    result.src = src
    result

  shade : (icon, colors) ->
    @clearRect()
    @drawIcon(icon)
    @paint(colors)

  halo : (icon, colors, intensity) ->
    @clearRect()
    @drawIcon(icon)
    @glow(colors, intensity)

  process : (icon, shadeColors, haloColors) ->
    @clearRect()
    @drawIcon(icon)
    result = null
    if (shadeColors and shadeColors.length > 0)
      result = @paint(shadeColors)
    if (haloColors and haloColors.length > 0)
      result = @glow(haloColors, 80)
    result

  rotate : (icon, direction) ->
    @clearRect()
    @drawRotated(icon, direction)
    src = @canvas.toDataURL()
    result = new Image()
    result.src = src
    result
