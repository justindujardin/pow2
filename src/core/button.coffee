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
