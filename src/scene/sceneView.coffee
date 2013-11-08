
class SceneView
  constructor: (@canvas) ->
    @id = _.uniqueId 'view'
    throw new Error "A Canvas is required" if not @canvas
    @context = @canvas.getContext("2d")
    throw new Error "Could not retrieve Canvas context" if not @context
    @context.webkitImageSmoothingEnabled = false
    @context.mozImageSmoothingEnabled = false

    @camera = new Rect 10, 10, 10, 10
    @cameraZoom = 1.0

  # Convert a Rect/Point/Number from world coordinates (game units) to
  # screen coordinates (pixels)
  worldToScreen: (value) ->
    if value instanceof Rect
      return new Rect(value).scale Screen.UNIT
    else if value instanceof Point
      return new Point(value).multiply Screen.UNIT
    value * Screen.UNIT

  # Convert a Rect/Point/Number from screen coordinates (pixels) to
  # game world coordinates (game unit sizes)
  screenToWorld: (value) ->
    if value instanceof Rect
      return new Rect(value).scale 1 / Screen.UNIT
    else if value instanceof Point
      return new Point(value).multiply 1 / Screen.UNIT
    value * (1 / Screen.UNIT)


  # Convert a mouse event on the canvas into coordinates that are relative
  # to it, rather than to the DOM.
  canvasMousePosition: (event) ->
    canoffset = $(event.currentTarget).offset();
    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
    new Point x, y

  # Render the scene
  render: (scene) ->


  debugRender: (scene) ->
    # MSPF Counter debug
    @context.save()
    @context.fillStyle = "rgba(255,255,255,0.7)";
    @context.font = "bold 16px Arial";
    @context.fillText("MSPF: #{@scene.mspf}",12,25);
    @context.fillText("FPS: #{@scene.fps.toFixed(0)}",12,40);
    @context.restore()
