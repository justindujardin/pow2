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

class Font

  image: null
  fontHeight: 0

  constructor: (@glyphMap, imageSrc) ->
    @image = Preloader.getImage(imageSrc)
    @fontHeight = @glyphMap['A'].height

  drawChar: (ctx, c, x, y,scale=Screen.SCALE) ->
    glyph = @glyphMap[c]
    xx = x * scale
    yy = y * scale
    ctx.drawImage(@image, glyph.x, glyph.y, glyph.width, glyph.height, xx, yy, scale * glyph.width, scale * glyph.height)
    glyph.width

  drawText: (ctx, text, color, x, y,scale=Screen.SCALE) ->
    n = text.length
    width = @getWidth text
    ctx.fillStyle = color
    ctx.fillRect(x * scale, y * scale, width * scale, @fontHeight * scale)
    x += @drawChar(ctx, text.charAt(i), x, y,scale) for i in [0 ... n]

    text

  getWidth: (text) ->
    n = text.length
    width = 0;
    for i in [0 ... n]
      width += @glyphMap[text.charAt(i)].width
    width

  centerText: (ctx, text, color, x, y, w, h,scale=Screen.SCALE) ->
    width = @getWidth(text)
    offsetX = Math.floor((w - width) / 2)
    offsetY = Math.floor((h - @fontHeight) / 2)
    @drawText(ctx, text, color, x + offsetX, y + offsetY,scale)

  wrapText: (ctx, text, color, x, y, width, scale=Screen.SCALE) ->
    n = text.length
    start = 0
    last = 0
    i = 0
    w = 0
    totalLines = 1
    while (i < n)
      breakLine = false
      force = false
      newLine = false
      c = text.charAt(i)
      if (c == ' ')
        last = i
      else if (c == '\n')
        last = i
        breakLine = true
        newLine = true
      if (!breakLine)
        w += @glyphMap[text.charAt(i)].width
        if (w > width)
          breakLine = true
      if (breakLine)
        if (last == start and !newLine)
          last = i
          force = true
        line = text.substring(start, last)
        @drawText(ctx, line, color, x, y,scale)
        y += @fontHeight
        totalLines++
        if (force)
          start = last
        else
          start = last + 1
        last = start
        i = start
        w = 0
      else
        i++
    if (start < n - 1)
      line = text.substring(start)
      @drawText(ctx, line, color, x, y,scale)
    totalLines * @fontHeight
