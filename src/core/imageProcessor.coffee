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

  drawIcon : (icon) =>
    x = 2;
    y = 2;
    coords = Data.sprites[icon];
    k = Screen.UNIT * Screen.SCALE
    @ctx.drawImage(@icons[coords.block], k * coords.x, k * coords.y, k, k, x * Screen.SCALE, y * Screen.SCALE, k, k)

  drawRotated : (icon, degrees) =>
    @ctx.save();
    t = (Screen.HALF_UNIT + 2) * Screen.SCALE
    @ctx.translate(t, t)
    @ctx.rotate(degrees * Math.PI / 180)
    @ctx.translate(-t, -t)
    @drawIcon(icon)
    @ctx.restore();

  clear : =>
    @ctx.clearRect(0, 0, (Screen.UNIT + 4) * Screen.SCALE, (Screen.UNIT + 4) * Screen.SCALE)

  paint : (colors) =>
    arcs = ImageProcessor.computeArcs(colors, 12)
    size = (Screen.UNIT + 4) * Screen.SCALE
    img = @ctx.getImageData(0, 0, size, size).data
    for y in [0 ... Screen.UNIT]
      yy = (y + 2) * Screen.SCALE
      for x in [0 ... Screen.UNIT]
        xx = (x + 2) * Screen.SCALE
        i = (yy * size + xx) * 4
        r = img[i]
        g = img[i + 1]
        b = img[i + 2]
        a = img[i + 3]
        if (a > 0 and (r > 0 or g > 0 or b > 0))
          c = ImageProcessor.blend(colors, arcs, Screen.HALF_UNIT - y, Screen.HALF_UNIT - x)
          if (c.red > 0)
            r = Math.min(255, r + c.red)
          else
            r = Math.max(0, r + c.red)
          if (c.green > 0)
            g = Math.min(255, g + c.green)
          else
            g = Math.max(0, g + c.green)
          if (c.blue > 0)
            b = Math.min(255, b + c.blue)
          else
            b = Math.max(0, b + c.blue)
          @ctx.fillStyle = "rgba(#{r},#{g},#{b},#{a})"
          @ctx.fillRect(xx, yy, Screen.SCALE, Screen.SCALE)
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

  glow : (colors, intensity) =>
    arcs = ImageProcessor.computeArcs(colors, 30)
    length = Screen.UNIT + 4
    cells = Util.create2DArray(length, length)
    size = length * Screen.SCALE
    img = @ctx.getImageData(0, 0, size, size).data
    for y in [0 ... length - 2]
      yy = y * Screen.SCALE
      for x in [0 ... length]
        xx = x * Screen.SCALE
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
      yy = y * Screen.SCALE
      for x in [0 ... length]
        if (cells[y][x] > 0 and cells[y][x] < 3)
          xx = x * Screen.SCALE
          i = (yy * size + xx) * 4
          if (cells[y][x] == 1)
            @ctx.globalAlpha = intensity / 100 / 3
          else
            @ctx.globalAlpha = intensity / 100
          c = ImageProcessor.blend(colors, arcs, length / 2 - y, length / 2 - x)
          @ctx.fillStyle = "rgba(#{c.red},#{c.green},#{c.blue},255)"
          @ctx.fillRect(xx, yy, Screen.SCALE, Screen.SCALE)
    @ctx.globalAlpha = 1
    src = @canvas.toDataURL()
    result = new Image()
    result.src = src
    result

  shade : (icon, colors) =>
    @clear()
    @drawIcon(icon)
    @paint(colors)

  halo : (icon, colors, intensity) =>
    @clear()
    @drawIcon(icon)
    @glow(colors, intensity)

  process : (icon, shadeColors, haloColors) =>
    @clear()
    @drawIcon(icon)
    result = null
    if (shadeColors and shadeColors.length > 0)
      result = @paint(shadeColors)
    if (haloColors and haloColors.length > 0)
      result = @glow(haloColors, 80)
    result

  rotate : (icon, direction) =>
    @clear()
    @drawRotated(icon, direction)
    src = @canvas.toDataURL()
    result = new Image()
    result.src = src
    result
