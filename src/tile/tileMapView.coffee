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
    @renderer = new eburp.TileObjectRenderer
    @overlayPattern = null
    @

  # Object Tracking
  # -----------------------------------------------------------------------------
  trackObject: (tileObject) ->
    @tracking = tileObject

  # Features and visibility
  # -----------------------------------------------------------------------------
  featureVisible: (feature) -> true
  tileVisible: (x,y) -> true

  # Clamp camera scale to integer values
  # -----------------------------------------------------------------------------
  processCamera: () ->
    super()
    @cameraScale = Math.round(@cameraScale)
    if @tracking and @tracking instanceof eburp.TileObject
      @camera.setCenter @tracking.renderPoint or @tracking.point
    @

  # Return the current world camera clip rectangle
  getCameraClip: () ->
    return @camera if not @tileMap
    clipGrow = @camera.clone().round()
    clipRect = clipGrow.clip @tileMap.bounds
    clipRect.round()
    clipRect

  # Render Methods
  # -----------------------------------------------------------------------------

  setRenderState: () ->
    super()
    return if not @camera or not @context or not @tileMap
    # Adjust render position for camera.
    worldTilePos = @worldToScreen @tileMap.bounds.point
    worldCameraPos = @worldToScreen @camera.point
    @context.translate worldTilePos.x - worldCameraPos.x,worldTilePos.y - worldCameraPos.y

  renderFrame: (elapsed) ->
    @fillColor()
    return if not @tileMap
    clipRect = @getCameraClip()
    for x in [clipRect.point.x ... clipRect.getRight()]
      for y in [clipRect.point.y ... clipRect.getBottom()]
        tile = @tileMap.getTerrainIcon x, y
        @drawTile(tile, x, y) if tile and @tileVisible(x,y)
    @renderFeatures(clipRect)
    @renderObjects(clipRect,elapsed)
    @

  renderObjects:(clipRect,elapsed) ->
    objects = @scene.objectsByType eburp.TileFeatureObject
    _.each objects, (object) => @renderer.render object, @
    player = @scene.objectsByType eburp.MovableTileObject
    @renderer.render player[0], @ if player.length > 0
    @

  renderAnalog: () ->
    return if not @world or not @world.input
    if typeof @world.input.touches isnt 'undefined'
      screenCamera = @worldToScreen @camera.point
      touchStart = @world.input.touchStart.clone().add screenCamera
      touchCurrent = @world.input.touchCurrent.clone().add screenCamera

      @context.save();
      for touch in @world.input.touches 
        if (touch.identifier == @world.input.touchId)
           @context.beginPath();
           @context.strokeStyle = "cyan";
           @context.lineWidth = 6;
           @context.arc(touchStart.x, touchStart.y, 40, 0, Math.PI * 2, true);
           @context.stroke();
           @context.beginPath();
           @context.strokeStyle = "cyan";
           @context.lineWidth = 2;
           @context.arc(touchStart.x, touchStart.y, 60, 0, Math.PI * 2, true);
           @context.stroke();
           @context.beginPath();
           @context.strokeStyle = "cyan";
           @context.arc(touchCurrent.x, touchCurrent.y, 40, 0, Math.PI * 2, true);
           @context.stroke();
           @context.fillStyle = "white";
           @context.fillText("move vec -- x:" + @world.input.analogVector.x + " y:" + @world.input.analogVector.y, screenCamera.x + touch.gameX + 30, screenCamera.y + touch.gameY - 30);
      @context.restore();
    @

  renderPost: (scene) ->
    return if not @camera or not @context or not @tileMap
    @renderAnalog()

    overlay = @getScreenOverlay()
    return if not overlay
    @overlayPattern ?= @context.createPattern overlay, 'repeat'

    @fillTiles(overlay, @overlayPattern, @getCameraClip())

  renderFeatures:(clipRect) ->
    if false and @tileMap.map.features
      for feature in @tileMap.map.features
        continue if not clipRect.pointInRect feature.x, feature.y
        continue if not @featureVisible(feature)
        @drawTile(feature.icon, feature.x, feature.y) if feature.icon
        @drawImage(feature.image, feature.x, feature.y) if feature.image
    @

  debugRender: (debugStrings=[]) ->
    debugStrings.push "Camera: (#{@camera.point.x},#{@camera.point.y})"
    clipRect = @getCameraClip()
    @context.strokeStyle = "#FF2222"
    screenClip = @worldToScreen(clipRect)
    @context.strokeRect(screenClip.point.x,screenClip.point.y,screenClip.extent.x,screenClip.extent.y)
    for x in [clipRect.point.x ... clipRect.getRight()]
      for y in [clipRect.point.y ... clipRect.getBottom()]
        tile = @tileMap.getTerrain x, y
        if tile and not tile.passable
          @context.strokeStyle = "#FF2222"
          @context.strokeRect(x * @unitSize * @cameraScale, y * @unitSize * @cameraScale, @cameraScale * @unitSize, @cameraScale * @unitSize)


    tiles = @scene.objectsByType eburp.TileObject
    _.each tiles, (object) =>
      @context.strokeStyle = "#2222FF"
      point = object.renderPoint or object.point
      @context.strokeRect(point.x * @unitSize * @cameraScale, point.y * @unitSize * @cameraScale, @cameraScale * @unitSize, @cameraScale * @unitSize)
    @
    super(debugStrings)

  # Overlay to make scaled up pixel art look nice.
  getScreenOverlay: () ->
    if @imageProcessor and @screenOverlays.length == 0
      for i in [1..5]
        @screenOverlays.push @imageProcessor.isolateSprite("screen#{i}.png")
    @screenOverlays[3]

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

  drawImage: (image, x, y, width=@unitSize, height=@unitSize) ->
    dstX = x * @unitSize * @cameraScale
    dstY = y * @unitSize * @cameraScale
    dstW = dstH = @unitSize  * @cameraScale
    @context.drawImage(image, 0,0,width,height,dstX, dstY, dstW, dstH)

  # Draw an image that has been altered by the `eburp.ImageProcessor` class.
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

  fillTiles: (image, pattern, rect=@camera) ->
    renderPos = @worldToScreen(rect, @cameraScale)
    fillSave = @context.fillStyle
    @context.fillStyle = pattern
    @context.fillRect(renderPos.point.x,renderPos.point.y, renderPos.extent.x,renderPos.extent.y)
    @context.fillStyle = fillSave

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
