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

# A view that renders a `Scene`.
#
# You should probably only have one of these per Canvas that you render to.
class eburp.SceneView
  @UNIT: 16
  constructor: (@canvas,@loader) ->
    @animations = []
    @id = _.uniqueId 'view'
    throw new Error "A Canvas is required" if not @canvas
    @$el = $ @canvas
    @context = @canvas.getContext("2d")
    throw new Error "Could not retrieve Canvas context" if not @context
    @context.webkitImageSmoothingEnabled = false
    @context.mozImageSmoothingEnabled = false
    @camera = new eburp.Rect(0,0,9,9)
    @cameraScale = 1.0
    @unitSize = eburp.SceneView.UNIT

  # Scene rendering interfaces
  # -----------------------------------------------------------------------------

  # Render a frame. Subclass this to do your specific rendering.
  renderFrame: (elapsed) ->

  # Render post effects
  renderPost: () ->

  # Set the render state for this scene view.
  setRenderState: () ->
    return false if not @context
    @context.save()

  # Restore the render state to what it was before a call to setRenderState.
  restoreRenderState: () ->
    return false if not @context
    @context.restore()

  # Public render invocation.
  render: () -> @_render(0)

  # Render the scene
  # @private
  _render: (elapsed) ->
    @interpolateTick(elapsed)
    @processCamera()
    @setRenderState()
    @renderFrame(elapsed)
    @renderAnimations(elapsed)
    @renderPost(elapsed)
    @debugRender() if @scene and @scene.options.debugRender

    @restoreRenderState()

  # Do any debug rendering for this view.
  debugRender: (debugStrings=[]) ->
    return false if not @context
    fontSize = 16
    debugStrings.push s for s in [
      "MSPF: #{@scene.mspf}"
      "FPS: #{@scene.fps.toFixed(0)}"
    ]
    # MSPF/FPS Counter debug
    @context.save()
    @context.font = "bold #{fontSize}px Arial";
    renderPos = @worldToScreen @camera.point
    x = renderPos.x + 20
    y = renderPos.y + 120
    for string in debugStrings
      @context.fillStyle = "rgba(0,0,0,0.8)";
      @context.fillText string, x + 2, y + 2
      @context.fillStyle = "rgba(255,255,255,1)";
      @context.fillText string, x, y
      y += fontSize
    @context.restore()

  interpolateTick: (elapsed) ->

  getSpriteSheet: (name, done=->) ->
    @loader.get "/images/#{name}.png", done

  # Scene Camera updates
  # -----------------------------------------------------------------------------
  processCamera: () -> @cameraScale = @screenToWorld(@context.canvas.width) / @camera.extent.x

  # Scene rendering utilities
  # -----------------------------------------------------------------------------

  # Clear the canvas context with a color
  fillColor: (color="rgb(0,0,0)") ->
    return false if not @context or not @context.canvas
    @context.fillStyle = color
    x = y = 0
    if @camera
      renderPos = @worldToScreen(@camera.point)
      x = renderPos.x
      y = renderPos.y
    @context.fillRect(x, y, @context.canvas.width, @context.canvas.height)

  clearRect: () ->
    x = y = 0
    if @camera
      renderPos = @worldToScreen(@camera.point)
      x = renderPos.x
      y = renderPos.y
    @context.clearRect(x, y, @context.canvas.width, @context.canvas.height)

  # Coordinate Conversions (World/Screen)
  # -----------------------------------------------------------------------------

  # Convert a Rect/Point/Number from world coordinates (game units) to
  # screen coordinates (pixels)
  worldToScreen: (value,scale=@cameraScale) ->
    if value instanceof eburp.Rect
      return new eburp.Rect(value).scale (@unitSize * scale)
    else if value instanceof eburp.Point
      return new eburp.Point(value).multiply (@unitSize * scale)
    value * (@unitSize * scale)

  # Convert a Rect/Point/Number from screen coordinates (pixels) to
  # game world coordinates (game unit sizes)
  screenToWorld: (value,scale=1) ->
    if value instanceof eburp.Rect
      return new eburp.Rect(value).scale 1 / (@unitSize * scale)
    else if value instanceof eburp.Point
      return new eburp.Point(value).multiply 1 / (@unitSize * scale)
    value * (1 / (@unitSize * scale))


  # Convert a mouse event on the canvas into coordinates that are relative
  # to it, rather than to the DOM.
  canvasMousePosition: (event) ->
    canoffset = $(event.currentTarget).offset();
    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
    new eburp.Point x, y

  # Animations
  # -----------------------------------------------------------------------------
  renderAnimations: () ->
    for animation in @animations
      animation.done = animation.fn(animation.frame)
      if @scene.time >= animation.time
        animation.frame += 1
        animation.time = @scene.time + animation.rate
    @animations = _.filter @animations, (a) -> a.done != true

  playAnimation: (tickRate, animFn) ->
    throw new Error "Cannot queue an animation for a view that has no scene" if not @scene
    @animations.push {
      frame: 0
      time: @scene.time + tickRate
      rate: tickRate
      fn: animFn
    }

