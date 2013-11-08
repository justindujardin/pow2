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

class TileMapView extends SceneView
  constructor : (@canvas, @tileMap) ->
    super(@canvas)
    @game = new Game()

  drawTile : (icon, x, y) =>
    coords = Data.sprites[icon];
    if not coords
      throw new Error("Missing image from map " + icon)
    k = Screen.UNIT * Screen.SCALE
    x *= Screen.SCALE
    y *= Screen.SCALE

    srcX = coords.x
    srcY = coords.y
    srcW = srcH = Screen.UNIT

    dstX = x * Screen.UNIT
    dstY = y * Screen.UNIT
    dstW = dstH = k

    image = Screen.TEXTURES[coords.source]
    @context.drawImage(image,srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH)

  render: () ->
    @context.fillStyle = "rgb(0,0,0)"
    @context.fillRect(0, 0, @canvas.width, @canvas.height)
    for y in [0 ... @tileMap.height]
      for x in [0 ... @tileMap.width]
        tile = @tileMap.getTerrainIcon(x, y)
        @drawTile(tile, x, y)
    for feature in @tileMap.map.features
      @drawTile(feature.icon, feature.x, feature.y) if feature.icon

