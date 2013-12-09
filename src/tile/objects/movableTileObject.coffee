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

class eburp.MovableTileObject extends eburp.TileObject
  constructor : (options) ->
    options = _.defaults options or {}, {
      velocity: new eburp.Point(0,0)
      tickRateMS: 350
      targetPoint: new eburp.Point(0,0)
      renderPoint: new eburp.Point(0,0)
    }
    @_elapsed = 0
    @collideBox = new eburp.Rect
    super(options)
    @

  collideMove: (x,y) ->
    results = []
    @collideBox.point.x = Math.floor x
    @collideBox.point.y = Math.floor y
    if @scene.db.queryRect(@collideBox,eburp.TileFeatureObject,results)
      for o in results
        console.log "Collide -> #{o.type}"
        return true if o.enter and o.enter(@) == false
    map = @scene.objectByType eburp.TileMap
    if map
      terrain = map.getTerrain(@collideBox.point.x,@collideBox.point.y)
      return true if not terrain or not terrain.passable
    false


  interpolateTick: (elapsed) ->
    # Interpolate position based on tickrate and elapsed time
    factor = @_elapsed / @tickRateMS
    @renderPoint.set(@point.x,@point.y)
    return if @velocity.isZero()

    @renderPoint.interpolate(@point,@targetPoint,factor)
    @renderPoint.x = @renderPoint.x.toPrecision(3)
    @renderPoint.y = @renderPoint.y.toPrecision(3)
    #console.log("INTERP Vel(#{@velocity.x},#{@velocity.y}) factor(#{factor})")
    #console.log("INTERP From(#{@point.x},#{@point.y}) to (#{@renderPoint.x},#{@renderPoint.y})")

  tick: (elapsed) ->
    @_elapsed += elapsed
    return if @_elapsed < @tickRateMS

    # Don't subtract elapsed here, but take the modulus so that
    # if for some reason we get a HUGE elapsed, it just does one
    # tick and keeps the remainder toward the next.
    @_elapsed = @_elapsed % @tickRateMS

    # Advance the object if it can be advanced.
    # Check that targetPoint != point first, because otherwsie if
    # we don't, the collide check will see if we collide with our
    # current position.
    isMove = not @targetPoint.equal(@point)
    @point.add @velocity if isMove and not @collideMove @targetPoint.x, @targetPoint.y


    # Update velocity
    @velocity.x = 0
    @velocity.x -= 1 if @scene.input.keyDown eburp.Input.Keys.LEFT
    @velocity.x += 1 if @scene.input.keyDown eburp.Input.Keys.RIGHT
    @velocity.y = 0
    @velocity.y -= 1 if @scene.input.keyDown eburp.Input.Keys.UP
    @velocity.y += 1 if @scene.input.keyDown eburp.Input.Keys.DOWN

    # If the next point won't collide then set the new target.
    @targetPoint.set(@point)
    if not @velocity.isZero()
      @targetPoint.add @velocity
      if @collideMove @targetPoint.x, @targetPoint.y
        @targetPoint.set(@point)







