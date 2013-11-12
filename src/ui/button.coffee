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

class Button extends Rect

  buttonOn : false
  text : null

  draw: (context,view) =>
    context.save()
    image = if @buttonOn then ButtonGrid.onImage else ButtonGrid.offImage
    context.clearRect(@point.x,@point.y,@extent.x,@extent.y)
    context.drawImage(image, @point.x, @point.y, @extent.x, @extent.y);
    if (@buttonOn)
      #centerText: (ctx, text, color, x, y, w, h,scale=1) ->
      switch view.gurk.media
        when eburp.Gurk.MEDIA.SMALL then scale = 2
        when eburp.Gurk.MEDIA.MEDIUM then scale = 2
        when eburp.Gurk.MEDIA.LARGE then scale = 3
        when eburp.Gurk.MEDIA.HUGE then scale = 3.8
      width = ButtonGrid.FONT.getWidth(@text,scale)
      offsetX = Math.floor((@extent.x - width) / 2)
      offsetY = Math.floor((@extent.y - ButtonGrid.FONT.fontHeight * scale) / 2)
      ButtonGrid.FONT.drawText(context, @text, "transparent", @point.x + offsetX, @point.y + offsetY,scale)

  enable: =>
    @buttonOn = true

  disable: =>
    @buttonOn = false

  isEnabled: =>
    @buttonOn

  setText: (text) =>
    @text = text
