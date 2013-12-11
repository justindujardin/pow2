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
    @collideBox.point.x = x
    @collideBox.point.y = y
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
    @renderPoint.x = @renderPoint.x.toPrecision(4)
    @renderPoint.y = @renderPoint.y.toPrecision(4)
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
    #
    # Check that targetPoint != point first, because or else
    # the collision check will see be against the current position.
    if not @targetPoint.equal(@point) and not @collideMove @targetPoint.x, @targetPoint.y
      @point.set @targetPoint


    # Touch movement
    if document.createTouch and @world.input.analogVector instanceof eburp.Point
      @velocity.x = 0
      if @scene.input.analogVector.x < -20
        @velocity.x -= 1
      else if @scene.input.analogVector.x > 20
        @velocity.x += 1
      @velocity.y = 0
      if @scene.input.analogVector.y < -20
        @velocity.y -= 1
      else if @scene.input.analogVector.y > 20
        @velocity.y += 1
    # Keyboard input
    else
      @velocity.x = 0
      @velocity.x -= 1 if @scene.input.keyDown eburp.Input.Keys.LEFT
      @velocity.x += 1 if @scene.input.keyDown eburp.Input.Keys.RIGHT
      @velocity.y = 0
      @velocity.y -= 1 if @scene.input.keyDown eburp.Input.Keys.UP
      @velocity.y += 1 if @scene.input.keyDown eburp.Input.Keys.DOWN

    # If the next point won't collide then set the new target.
    @targetPoint.set(@point)
    return if @velocity.isZero()
    # Check to see if both axes can advance by simply going to the
    # target point.
    @targetPoint.add @velocity
    return if not @collideMove @targetPoint.x, @targetPoint.y

    # If not, can we move only along the y axis?
    if not @collideMove @point.x, @targetPoint.y
      @targetPoint.x = @point.x
      return

    # How about the X axis?  We'll take any axis we can get.
    if not @collideMove @targetPoint.x, @point.y
      @targetPoint.y = @point.y
      return

    # Nope, collisions in all directions, just reset the target point
    @targetPoint.set(@point)
#
#
#      if @collideMove @targetPoint.x, @targetPoint.y
#        @targetPoint.set(@point)







