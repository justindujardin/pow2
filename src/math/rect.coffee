
class Rect
  constructor: (rectOrPointOrX,extentOrY,width,height) ->
    @set(rectOrPointOrX,extentOrY,width,height)

  set: (rectOrPointOrX,extentOrY,width,height) ->
    if rectOrPointOrX instanceof Rect
      @point.set(rectOrPointOrX.point)
      @extent.set(rectOrPointOrX.extent)
    if width and height
      @point = new Point(rectOrPointOrX,extentOrY)
      @extent = new Point(width,height)
    else if rectOrPointOrX instanceof Point and extentOrY instanceof Point
      @point = rectOrPointOrX
      @extent = extentOrY
    else
      throw new Error "Unsupported parameters to Rect set"

  intersect: (clipRect) ->
    bottomLX = Math.min @point.x + @extent.x, clipRect.point.x + clipRect.extent.x
    bottomLY = Math.min @point.y + @extent.y, clipRect.point.y + clipRect.extent.y
    @point.x = Math.max @point.x, clipRect.point.x
    @point.y = Math.max @point.y, clipRect.point.y
    @extent.x = bottomLX - @point.x
    @extent.y = bottomLY - @point.y
    @isValidRect()

  pointInRect: (point) ->
    return false if point.x <= @point.x or point.y <= @point.y
    return false if point.x >= @point.x + @extent.x or point.y >= @point.y + @extent.y
    true

  center: () ->
    new Point(@point.x + (@extent.x * 0.5),@point.y + (@extent.y * 0.5))