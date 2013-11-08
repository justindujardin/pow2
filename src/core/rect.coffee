
class Rect
  constructor: (rectOrPointOrX,extentOrY,width,height) ->
    @set(rectOrPointOrX,extentOrY,width,height)

  set: (rectOrPointOrX,extentOrY,width,height) ->
    if rectOrPointOrX instanceof Rect
      @point = new Point(rectOrPointOrX.point)
      @extent = new Point(rectOrPointOrX.extent)
    else if width and height
      @point = new Point(rectOrPointOrX,extentOrY)
      @extent = new Point(width,height)
    else if rectOrPointOrX instanceof Point and extentOrY instanceof Point
      @point = rectOrPointOrX
      @extent = extentOrY
    else
      @point = new Point
      @extent = new Point 1, 1

  clip: (clipRect) ->
    right = @point.x + @extent.x
    bottom = @point.y + @extent.y

    @point.x = Math.max clipRect.point.x, @point.x
    @extent.x = Math.min(clipRect.point.x + clipRect.extent.x, right) - @point.x
    @point.y = Math.max clipRect.point.y, @point.y
    @extent.y = Math.min(clipRect.point.y + clipRect.extent.y, bottom) - @point.y
    @

  intersect: (clipRect) ->
    bottomLX = Math.min @point.x + @extent.x, clipRect.point.x + clipRect.extent.x
    bottomLY = Math.min @point.y + @extent.y, clipRect.point.y + clipRect.extent.y
    @point.x = Math.max @point.x, clipRect.point.x
    @point.y = Math.max @point.y, clipRect.point.y
    @extent.x = bottomLX - @point.x
    @extent.y = bottomLY - @point.y
    @isValid()

  isValid: () ->
    @extent.x >= 0 and @extent.y >= 0

  pointInRect: (pointOrX,y) ->
    if pointOrX instanceof Point
      x = pointOrX.x
      y = pointOrX.y
    else
      x = pointOrX
    return false if x < @point.x or y < @point.y
    return false if x >= @point.x + @extent.x or y >= @point.y + @extent.y
    true

  center: () ->
    new Point(@point.x + (@extent.x * 0.5),@point.y + (@extent.y * 0.5))

  setCenter: (pointOrX,y) ->
    if pointOrX instanceof Point
      x = pointOrX.x
      y = pointOrX.y
    else
      x = pointOrX
    @point.x = Math.ceil(x - @extent.x / 2)
    @point.y = Math.ceil(y - @extent.y / 2)

  scale: (scale) ->
    @point.x *= scale
    @point.y *= scale
    @extent.x *= scale
    @extent.y *= scale
    @

  getLeft:()  -> @point.x
  getRight:() -> @point.x + @extent.x
  getTop:()   -> @point.y
  getBottom:()-> @point.y + @extent.y