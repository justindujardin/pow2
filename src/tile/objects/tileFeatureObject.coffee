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

# Not sure how to tie this in yet, maybe a state machine for dealing with
# different feature types?
class eburp.TileFeatureObject extends eburp.TileObject
  constructor : (options) ->
    super()
    _.extend @, _.defaults options or {}, {
      type : "",
      x : 0,
      y : 0,
      icon : ""
    }
    @point.x = @x
    @point.y = @y
    @

  onAddToScene: (scene) ->
    return if not @icon
    @iconCoords = @world.sprites.getSpriteCoords @icon
    @world.sprites.getSingleSprite @icon, (image) => @image = image
