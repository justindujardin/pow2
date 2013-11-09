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
class SceneView
  constructor: (@canvas) ->
    @id = _.uniqueId 'view'
    throw new Error "A Canvas is required" if not @canvas
    @context = @canvas.getContext("2d")
    throw new Error "Could not retrieve Canvas context" if not @context
    @context.webkitImageSmoothingEnabled = false
    @context.mozImageSmoothingEnabled = false

  # Scene rendering interfaces
  # -----------------------------------------------------------------------------

  # Render a frame. Subclass this to do your specific rendering.
  renderFrame: () ->

  # Set the render state for this scene view.
  setRenderState: () ->
    return false if not @context
    @context.save()

  # Restore the render state to what it was before a call to setRenderState.
  restoreRenderState: () ->
    return false if not @context
    @context.restore()

  # Public render invocation.
  render: () -> @_render()

  # Render the scene
  # @private
  _render: () ->
    @setRenderState()
    @renderFrame(@scene)
    @debugRender(@scene) if @scene and @scene.options.debugRender

    @restoreRenderState()

  # Do any debug rendering for this view.
  debugRender: (scene) ->
    return false if not @context
    # MSPF/FPS Counter debug
    @context.save()
    @context.fillStyle = "rgba(255,255,255,0.7)";
    @context.font = "bold 16px Arial";
    @context.fillText("MSPF: #{@scene.mspf}",12,25);
    @context.fillText("FPS: #{@scene.fps.toFixed(0)}",12,40);
    @context.restore()

  # Scene rendering utilities
  # -----------------------------------------------------------------------------

  # Clear the canvas context with a color
  clear: (color="rgb(0,0,0)") ->
    return false if not @context
    # Pin camera zoom to match canvas size
    @context.fillStyle = color
    @context.fillRect(0, 0, @canvas.width, @canvas.height)


  # Coordinate Conversions (World/Screen)
  # -----------------------------------------------------------------------------

  # Convert a Rect/Point/Number from world coordinates (game units) to
  # screen coordinates (pixels)
  worldToScreen: (value,scale=1) ->
    if value instanceof Rect
      return new Rect(value).multiply (Screen.UNIT * scale)
    else if value instanceof Point
      return new Point(value).multiply (Screen.UNIT * scale)
    value * (Screen.UNIT * scale)

  # Convert a Rect/Point/Number from screen coordinates (pixels) to
  # game world coordinates (game unit sizes)
  screenToWorld: (value,scale=1) ->
    if value instanceof Rect
      return new Rect(value).multiply 1 / (Screen.UNIT * scale)
    else if value instanceof Point
      return new Point(value).multiply 1 / (Screen.UNIT * scale)
    value * (1 / (Screen.UNIT * scale))


  # Convert a mouse event on the canvas into coordinates that are relative
  # to it, rather than to the DOM.
  canvasMousePosition: (event) ->
    canoffset = $(event.currentTarget).offset();
    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
    new Point x, y
