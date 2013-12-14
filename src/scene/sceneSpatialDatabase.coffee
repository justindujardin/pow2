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

# Very, very simple spatial database.  Because all the game objects have
# an extent of 1 unit, we can just do a point in rect to determine object hits.
class eburp.SceneSpatialDatabase
  constructor: ->
    @_objects = []

  addObject: (obj) ->
    @_objects.push obj if obj and obj.point instanceof eburp.Point

  removeObject: (obj) ->
    @_objects = _.filter @_objects, (o) -> return o.id isnt obj.id

  queryRect: (rect, type, results) ->
    throw new Error("Results array must be provided to query scene spatial database") if not results
    foundAny = false
    for o in @_objects
      continue if type and o not instanceof type
      if o.point and @pointInRect rect, o.point
        results.push o
        foundAny = true
    foundAny

  pointInRect: (rect,point) ->
    return false if point.x < rect.point.x or point.y < rect.point.y
    return false if point.x >= rect.point.x + rect.extent.x or point.y >= rect.point.y + rect.extent.y
    true
