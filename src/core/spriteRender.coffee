# -----------------------------------------------------------------------------
#
# Copyright (C) 2013 by Justin DuJardin
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

# Extract a sprite from a sprite sheet, and render it to an HTML Image.
class eburp.SpriteRender
  constructor: () ->
    @canvas = document.createElement('canvas');
    @canvas.width = 16
    @canvas.height = 16
    @context = @canvas.getContext("2d");
    @context.webkitImageSmoothingEnabled = false
    @context.mozImageSmoothingEnabled = false

  getSpriteSheet: (name, done=->) ->
    @world?.loader.get "/images/#{name}.png", done

  # Pick a single sprite out of a sheet, and return an image that contains only that sprite.
  getSingleSprite: (spriteName, done) ->
    coords = Data.sprites[spriteName]
    throw new Error "Cannot find sprite sheet for : #{spriteName}" if not coords
    @getSpriteSheet coords.source, (image) =>
      @context.clearRect(0, 0, @canvas.width, @canvas.width)
      @context.drawImage(image.data,coords.x,coords.y,@canvas.width,@canvas.height,0,0,@canvas.width,@canvas.height)
      src = @canvas.toDataURL()
      result = new Image()
      result.src = src
      result.onload = () ->
        done(result)
    @


  getSpriteCoords: (name) ->
    desc = Data.sprites[name]
    throw new Error "Missing sprite data for: #{name}" if not desc
    desc

