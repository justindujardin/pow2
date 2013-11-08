
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

  worldToScreen: (value) ->
    if value instanceof Rect
      return new Rect(value).scale Screen.UNIT
    else if value instanceof Point
      return new Point(value).multiply Screen.UNIT
    value * Screen.UNIT

  screenToWorld: (value) ->
    if value instanceof Rect
      return new Rect(value).scale 1 / Screen.UNIT
    else if value instanceof Point
      return new Point(value).multiply 1 / Screen.UNIT
    value * (1 / Screen.UNIT)

  render: (object) ->

    # FPS Counter debug
#    @context.save()
#    @context.fillStyle = "rgba(255,255,255,0.7)";
#    @context.font = "bold 24px Arial";
#    @context.fillText("FPS: #{@scene.fps.toFixed(0)}",15,35);
#    @context.restore()

    # Camera Debug
#    @context.save()
#    @context.strokeStyle = "2px rgba(255,0,0,0.7)";
#    screenCamera = @worldToScreen @camera
#    @context.strokeRect(screenCamera.point.x,screenCamera.point.y,screenCamera.extent.x,screenCamera.extent.y);
#    @context.restore()