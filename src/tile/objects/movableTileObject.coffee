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
      tickRateMS: 150
      impulse: new eburp.Point(0,0)
    }
    @_elapsed = 0
    super(options)
    @

  tick: (elapsed) ->
    # Early out if no velocity
    return if @velocity.isZero() and @impulse.isZero()
    @_elapsed += elapsed
    return if @_elapsed < @tickRateMS
    @_elapsed -= @tickRateMS

    map = @scene.objectByType eburp.TileMap
    toAdd = if @impulse.isZero() then @velocity else @impulse
    if map
      tx = @point.x + toAdd.x
      ty = @point.y + toAdd.y
      terrain = map.getTerrain(tx,ty)
      if not terrain or !terrain.passable
        @impulse.zero()
        return
    @point.add toAdd
    @impulse.zero()

  moveLeft: () -> @velocity.x = @impulse.x = -1
  moveRight: () -> @velocity.x = @impulse.x = 1
  moveUp: () -> @velocity.y = @impulse.y = -1
  moveDown: () -> @velocity.y = @impulse.y = 1


