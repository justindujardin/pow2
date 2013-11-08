
class SceneView
  constructor: (@canvas) ->
    @id = _.uniqueId 'view'
    throw new Error "A Canvas is required" if not @canvas
    @context = @canvas.getContext("2d")
    throw new Error "Could not retrieve Canvas context" if not @context
    @camera = new Rect(0,0,100,100)

  render: (object) ->

