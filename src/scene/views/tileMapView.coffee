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
    @$el = $ @canvas
    @$el.on 'mousewheel', (e) =>
      if e.originalEvent.wheelDeltaY > 0
        @cameraZoom -= 1
        @cameraZoom = Math.max(1,@cameraZoom)
      else
        @cameraZoom += 1
        @cameraZoom = Math.min(8,@cameraZoom)

    @$el.on 'mousemove', (e) => @hoverPos = @screenToWorld(@canvasMousePosition(e)).truncate()
    # DEBUG CODE REMOVE TODO
    $(window).on 'keydown', (e) =>
      return @camera.point.x -= 1 if e.keyCode is 37 # Left
      return @camera.point.y -= 1 if e.keyCode is 38 # Up
      return @camera.point.x += 1 if e.keyCode is 39 # Right
      return @camera.point.y += 1 if e.keyCode is 40 # Down

    #@camera.point.set 0, 0
    #@camera.extent.set @tileMap.bounds.extent.x, @tileMap.bounds.extent.y

  debugRender: () ->
    if @hoverPos
      renderPos = @worldToScreen(@hoverPos)
      renderUnitSize = Screen.UNIT * @cameraZoom
      @context.save()
      @context.strokeStyle = "rgba(255,0,0,0.85)"
      @context.fillStyle = "rgba(255,255,255,0.35)"
      @context.strokeRect(renderPos.x, renderPos.y, renderUnitSize, renderUnitSize)
      @context.fillRect(renderPos.x, renderPos.y, renderUnitSize, renderUnitSize)
      @context.restore()
    super()





  drawTile : (icon, x, y) =>
    coords = Data.sprites[icon];
    throw new Error "Missing sprite data for: #{icon}" if not coords
    image = Screen.TEXTURES[coords.source]
    throw new Error "Missing image: #{icon}" if not coords
    srcX = coords.x
    srcY = coords.y
    srcW = srcH = Screen.UNIT
    dstX = x * Screen.UNIT * @cameraZoom
    dstY = y * Screen.UNIT * @cameraZoom
    dstW = dstH = Screen.UNIT  * @cameraZoom
    @context.drawImage(image,srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH)

  render: () ->
    @context.save();
    @context.fillStyle = "rgb(0,0,0)"
    @context.fillRect(0, 0, @canvas.width, @canvas.height)

    clipRect = new Rect(@camera).clip @tileMap.bounds
    xStride = clipRect.point.x + clipRect.extent.x
    yStride = clipRect.point.y + clipRect.extent.y

    for y in [clipRect.point.y ... yStride]
      for x in [@camera.point.x ... xStride]
        tile = @tileMap.getTerrainIcon x, y
        @drawTile(tile, x, y) if tile
    for feature in @tileMap.map.features
      continue if not clipRect.pointInRect feature.x, feature.y
      @drawTile(feature.icon, feature.x, feature.y) if feature.icon

    @context.restore()
    super()
