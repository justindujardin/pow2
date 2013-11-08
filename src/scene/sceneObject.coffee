
class SceneObject
  constructor: (@position=new Point) ->
    @id = _.uniqueId('eburp')
    this

  tick: (elapsed) ->
#    @position.x += 1
#    @position.x = 0 if @position.x > 30
#    console.log "#{@id} at : #{@position.x}, #{@position.y}"




