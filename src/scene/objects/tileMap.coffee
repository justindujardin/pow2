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

class TileMap extends SceneObject
  map : null
  constructor : (mapName) ->
    super()
    @setMap(mapName, 0, 0)

  setMap : (mapName, x, y) ->
    @mapName = mapName
    @map = Data.maps[@mapName]
    @bounds = new Rect(x,y,@map.width,@map.height)

  getTerrain : (x, y) ->
    return null if not @bounds.pointInRect(x,y)
    index = y * @map.width + x
    c = @map.map.charAt(index)
    Data.tiles[c]

  getTerrainIcon : (x, y) ->
    terrain = @getTerrain(x, y)
    if terrain then terrain.icon else null
