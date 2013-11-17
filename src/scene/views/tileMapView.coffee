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

class eburp.TileMapView extends eburp.SceneView

  constructor: (canvas,loader) ->
    super(canvas,loader)
    @screenOverlays = []
    if @gurk
      for i in [1..5]
        @screenOverlays.push @gurk.imageProcessor.isolateSprite("screen#{i}.png")
    @

  featureVisible: (feature) -> true
  tileVisible: (x,y) -> true

  # Clamp camera scale to integer values
  # -----------------------------------------------------------------------------
  processCamera: () ->
    super()
    @cameraScale = Math.round(@cameraScale)

  # Render Methods
  # -----------------------------------------------------------------------------

  setRenderState: () ->
    super()
    return if not @camera or not @context or not @tileMap
    # Adjust render position for camera.
    worldTilePos = @worldToScreen @tileMap.bounds.point
    worldCameraPos = @worldToScreen @camera.point
    @context.translate worldTilePos.x - worldCameraPos.x,worldTilePos.y - worldCameraPos.y

  renderFrame: (scene) ->
    return if not @tileMap
    clipRect = new eburp.Rect(@camera).clip @tileMap.bounds
    for x in [clipRect.point.x ... clipRect.getRight()]
      for y in [clipRect.point.y ... clipRect.getBottom()]
        tile = @tileMap.getTerrainIcon x, y
        @drawTile(tile, x, y) if tile and @tileVisible(x,y)
    @renderFeatures(clipRect)
    @

  renderPost: (scene) ->
    overlay = @screenOverlays[@cameraScale-1]
    return if not overlay
    @fillTiles(overlay)

  renderFeatures:(clipRect) ->
    if @tileMap.map.features
      for feature in @tileMap.map.features
        continue if not clipRect.pointInRect feature.x, feature.y
        continue if not @featureVisible(feature)
        @drawTile(feature.icon, feature.x, feature.y) if feature.icon
    @


  # Tile Rendering Utilities
  # -----------------------------------------------------------------------------

  # Draw a `unitSize` sized sprite at a given position.
  drawTile : (icon, pointOrX, yOrScale,scale=1.0) ->
    return if not @_validateImage icon
    if pointOrX instanceof eburp.Point
      x = pointOrX.x
      y = pointOrX.y
      scale = yOrScale or 1.0
    else
      x = pointOrX
      y = yOrScale
    desc = Data.sprites[icon]
    image = @getSpriteSheet desc.source
    return if not image or not image.isReady()
    srcX = desc.x
    srcY = desc.y
    srcW = srcH = @unitSize
    dstX = x * @unitSize * @cameraScale * scale
    dstY = y * @unitSize * @cameraScale * scale
    dstW = dstH = @unitSize  * @cameraScale * scale
    if scale isnt 1.0
      dstX += (dstW * scale) / 4
      dstY += (dstH * scale) / 4

    @context.drawImage(image.data,srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH)

  # Draw a `@unitSize` sized sprite, but stretched to fill a custom
  # destination width and height.
  drawTileStretch: (icon, x, y, width, height) ->
    return if not @_validateImage icon
    desc = Data.sprites[icon]
    image = @getSpriteSheet desc.source
    return if not image or not image.isReady()
    dstX = x * @unitSize * @cameraScale
    dstY = y * @unitSize * @cameraScale
    dstW = width * @unitSize * @cameraScale
    dstH = height * @unitSize * @cameraScale
    @context.drawImage(image.data, desc.x,desc.y,@unitSize,@unitSize,dstX, dstY, dstW, dstH)

  drawImage: (image, x, y, width, height) ->
    dstX = x * @unitSize * @cameraScale
    dstY = y * @unitSize * @cameraScale
    dstW = dstH = @unitSize  * @cameraScale
    @context.drawImage(image, x,y,width,height,dstX, dstY, dstW, dstH)

  # Draw an image that has been altered by the `ImageProcessor` class.
  #
  # The ImageProcessor pads out images by 2 pixels on all sides, for a
  # total of 4 along x and y axes.  Because of this we render the image
  # 2 pixels to the up and left and an extra 4 on the extents.
  drawCustom: (image, x, y) ->
    dstX = x * @unitSize * @cameraScale
    dstY = y * @unitSize * @cameraScale
    dstW = dstH = (@unitSize + 4) * @cameraScale
    shift = 2 * @cameraScale
    @context.drawImage(image, 0,0,@unitSize + 4,@unitSize + 4,dstX - shift,dstY - shift, dstW,dstH)

  drawPixel: (color, x, y) ->
    return false if not @context
    @context.fillStyle = color
    @context.fillRect(x * @cameraScale, y * @cameraScale, @cameraScale, @cameraScale)

  fillImage: (image) ->
    renderPos = @worldToScreen(@camera.point, @cameraScale)
    @context.drawImage(image, renderPos.x, renderPos.y, @$el.width(), @$el.height())

  fillTiles: (image) ->
    renderPos = @worldToScreen(@camera, @cameraScale)
    @context.save();
    @context.fillStyle = @context.createPattern image, 'repeat'
    @context.fillRect(renderPos.point.x,renderPos.point.y, renderPos.extent.x,renderPos.extent.y)
    @context.restore()

  drawAnim: (anim, x, y, frame) ->
    return if not @_validateImage(anim)
    desc = Data.sprites[anim]
    image = @getSpriteSheet desc.source
    srcX = desc.x + (frame * @unitSize)
    srcY = desc.y
    dstX = x * @unitSize * @cameraScale
    dstY = y * @unitSize * @cameraScale
    dstW = dstH = @unitSize * @cameraScale
    @context.drawImage(image.data, srcX, srcY, @unitSize, @unitSize, dstX,dstY,dstW,dstH)

  drawCustomAnim: (custom, x, y) ->
    @context.drawImage(custom, (x - 2) * @cameraScale, (y - 2) * @cameraScale)


  _validateImage: (name) ->
    desc = Data.sprites[name]
    throw new Error "Missing sprite data for: #{name}" if not desc
    desc
    image = @getSpriteSheet desc.source
    throw new Error "Missing image from source: #{desc.source}" if not image
    image.isReady()
