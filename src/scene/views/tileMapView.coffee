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

class TileMapView extends SceneView
  constructor : (@canvas) ->
    super(@canvas)
    @$el = $ @canvas
    @camera = new Rect(0,0,9,9)
    @cameraScale = 1.0
    # DEBUG CODE REMOVE TODO
    $(window).on 'keydown', (e) =>
      return @camera.point.x -= 1 if e.keyCode is 37 # Left
      return @camera.point.y -= 1 if e.keyCode is 38 # Up
      return @camera.point.x += 1 if e.keyCode is 39 # Right
      return @camera.point.y += 1 if e.keyCode is 40 # Down

  drawTile : (icon, pointOrX, y) =>
    if pointOrX instanceof Point
      x = pointOrX.x
      y = pointOrX.y
    else
      x = pointOrX
    coords = Data.sprites[icon];
    throw new Error "Missing sprite data for: #{icon}" if not coords
    image = Screen.TEXTURES[coords.source]
    throw new Error "Missing image: #{icon}" if not coords
    srcX = coords.x
    srcY = coords.y
    srcW = srcH = Screen.UNIT
    dstX = x * Screen.UNIT * @cameraScale
    dstY = y * Screen.UNIT * @cameraScale
    dstW = dstH = Screen.UNIT  * @cameraScale
    @context.drawImage(image,srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH)

  drawImage: (image, x, y, width, height) =>
    dstX = x * Screen.UNIT * @cameraScale
    dstY = y * Screen.UNIT * @cameraScale
    dstW = dstH = Screen.UNIT  * @cameraScale
    @context.drawImage(image, x,y,width,height,dstX, dstY, dstW, dstH)

  # Draw an image that has been altered by the `ImageProcessor` class.
  #
  # The ImageProcessor pads out images by 2 pixels on all sides, for a
  # total of 4 along x and y axes.  Because of this we render the image
  # 2 pixels to the up and left and an extra 4 on the extents.
  drawCustom: (image, x, y) ->
    dstX = x * Screen.UNIT * @cameraScale
    dstY = y * Screen.UNIT * @cameraScale
    dstW = dstH = (Screen.UNIT + 4) * @cameraScale
    shift = 2 * @cameraScale
    @context.drawImage(image, 0,0,Screen.UNIT + 4,Screen.UNIT + 4,dstX - shift,dstY - shift, dstW,dstH)

  fillImage: (image) ->
    renderPos = @worldToScreen(@camera.point, @cameraScale)
    @context.drawImage(image, renderPos.x, renderPos.y, @$el.width(), @$el.height())


  featureVisible: (feature) -> true

  setRenderState: () ->
    super()
    return if not @camera or not @context or not @tileMap
    # Pin camera zoom to match canvas size
    @cameraScale = @screenToWorld(@$el.width()) / @camera.extent.x
    # Adjust render position for camera.
    worldTilePos = @worldToScreen(@tileMap.bounds.point,@cameraScale)
    worldCameraPos = @worldToScreen(@camera.point,@cameraScale)
    @context.translate(worldTilePos.x - worldCameraPos.x,worldTilePos.y - worldCameraPos.y)

  # Get the visible tile rectangle
  getVisibleRect:() ->
    if @tileMap then new Rect(@camera).clip @tileMap.bounds else null


  renderFrame: (scene) ->
    if @tileMap
      clipRect = @getVisibleRect()
      for y in [clipRect.point.y ... clipRect.getBottom()]
        for x in [clipRect.point.x ... clipRect.getRight()]
          tile = @tileMap.getTerrainIcon x, y
          @drawTile(tile, x, y) if tile
      if @tileMap.map.features
        for feature in @tileMap.map.features
          continue if not clipRect.pointInRect feature.x, feature.y
          continue if not @featureVisible(feature)
          @drawTile(feature.icon, feature.x, feature.y) if feature.icon

  renderPost: (scene) ->
    @screen = Preloader.getImage("images/screen" + Screen.SCALE + ".png")
    @fillImage(@screen)


  drawAnim: (anim, x, y, frame) =>
    coords = Data.sprites[anim];
    srcX = coords.x + (frame * Screen.UNIT)
    srcY = coords.y
    dstX = x * Screen.UNIT * @cameraScale
    dstY = y * Screen.UNIT * @cameraScale
    dstW = dstH = Screen.UNIT * @cameraScale
    @context.drawImage(Screen.TEXTURES[coords.source], srcX, srcY, Screen.UNIT, Screen.UNIT, dstX,dstY,dstW,dstH)

  drawCustomAnim: (custom, x, y) =>
    @context.drawImage(custom, (x - 2) * @cameraScale, (y - 2) * @cameraScale)
