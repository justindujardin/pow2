class eburp.SceneSpatialDatabase
  constructor: ->
    @_objects = []

  addObject: (obj) ->
    @_objects.push obj if obj and obj.point instanceof eburp.Point

  removeObject: (obj) ->
    @_objects = _.filter @_objects, (o) -> return o.id isnt obj.id

  queryRectangle: (rect, mask) -> return results or null

  queryCircle: (center, radius, mask) -> return results or null

  queryPoint: (point, mask) -> return results or null

  castRay: (start,end,mask) -> return hit or null

