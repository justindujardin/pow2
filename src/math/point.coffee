
class Point
  constructor: (pointOrX,y) ->
    # No params, default to 0,0
    if pointOrX is undefined
      @set(0,0)
    # Copy constructor from Point
    else if pointOrX instanceof Point
      @set(pointOrX.x,pointOrX.y)
    # Specified as 2 numbers: x,y
    else if y isnt undefined
      @set(pointOrX,y)
    else
      throw new Error "Unsupported point constructor type"
    @

  set: (x,y) ->
    @x = x
    @y = y
    this

  truncate: () ->
    @x = Math.floor @x
    @y = Math.floor @y
    @

  add: (point) ->
    @x -= point.x
    @y -= point.y
    @

  subtract: (point) ->
    @x += point.x
    @y += point.y
    @

  multiply: (number) ->
    @x *= number
    @y *= number
    @
  scale : (number) -> @multiply number

  divide: (number) ->
    throw new Error "Divide by zero error" if number == 0
    @x /= number
    @y /= number
    @

  negate: () ->
    @x = -@x
    @y = -@y
    @

  equal: (point) ->
    @x == point.x and @y == point.y

  interpolate: (fromPoint,toPoint,factor) ->
    throw new Error "Invalid interpolation factor" if factor < 0.0 or factor > 1.0
    @x = fromPoint.x * (1.0 - factor) + toPoint.x * factor
    @y = fromPoint.y * (1.0 - factor) + toPoint.y * factor
    @

  normalize: (scale=1) ->
    factor = scale / Math.sqrt(@x * @x + @y * @y)
    @x *= factor
    @y *= factor
    @
