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

class eburp.TileMap extends eburp.SceneObject
  map : null
  constructor : (mapName) ->
    super()
    @tiles = eburp.getData "tiles"
    @setMap(mapName, 0, 0)


  #
  # Scene Object Lifetime
  #
  onAddToScene: (scene) -> @addFeaturesToScene()
  onRemoveFromScene: (scene) -> @removeFeaturesFromScene()


  getObjectForFeature: (feature) ->
    options = _.extend {}, feature, {tileMap:@}
    name = feature.type
    name = name.charAt(0).toUpperCase() + name.slice(1)
    instanceType = eburp.TileFeatureObject
    typeName = "Tile#{name}Feature"
    instanceType = eburp[typeName] if typeof eburp[typeName] isnt 'undefined'
    new instanceType options

  # Construct
  addFeaturesToScene: ->
    # This is to prevent the old game from constructing TileFeatureObjects
    # and adding them to the scene.  It doesn't interact with them, so don't
    # bother.
    return if not @world
    return if not @scene
    for k,v of @features
      for k,f of v
        f.object = @getObjectForFeature(f)
        @scene.addObject f.object
    @

  removeFeaturesFromScene: ->
    for k,v of @features
      for k,f of v when f.object
        f.object.destroy()
        delete f.object
    @features = {}

  setMap : (mapName) ->
    newMap = eburp.getMap mapName
    return false if not newMap
    @map = newMap
    @mapName = mapName
    @bounds = new eburp.Rect(0,0,@map.width,@map.height)
    @buildFeatures()

  getTerrain : (x, y) ->
    return null if not @bounds.pointInRect(x,y)
    index = y * @map.width + x
    c = @map.map.charAt(index)
    @tiles[c]

  getTerrainIcon : (x, y) ->
    terrain = @getTerrain(x, y)
    if terrain then terrain.icon else null

  featureKey: (x,y) -> "" + x + "_" + y

  buildFeatures : ->
    @removeFeaturesFromScene()
    return false if not @map
    list = @map.features

    return if not list
    for feature in list
      x = feature.x
      y = feature.y
      key = @featureKey(x, y)
      object = @features[key]
      if (!object)
        object = {}
        @features[key] = object

      object[feature.type] = feature
    @addFeaturesToScene() if @scene
    @
  getFeature: (x,y) ->
    return {} if not @features
    return @features[@featureKey(x,y)]
  getFeatures: () -> @features

