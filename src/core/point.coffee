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
class eburp.Point
  constructor: (pointOrX,y) ->
    # No params, default to 0,0
    if pointOrX is undefined
      @set(0,0)
    # Copy constructor from Point
    else if pointOrX instanceof eburp.Point
      @set(pointOrX.x,pointOrX.y)
    # Specified as 2 numbers: x,y
    else if y isnt undefined
      @set(pointOrX,y)
    else
      throw new Error "Unsupported point constructor type"
    @

  clone: -> new eburp.Point @x, @y
  copy: (point) ->
    @x = point.x
    @y = point.y
    @

  set: (x,y) ->
    if x instanceof eburp.Point
      @x = x.x
      @y = x.y
    else
      @x = x
      @y = y
    @

  truncate: () ->
    @x = Math.floor @x
    @y = Math.floor @y
    @


  round: () ->
    @x = Math.floor @x
    @y = Math.floor @y
    @

  add: (point) ->
    @x += point.x
    @y += point.y
    @

  subtract: (point) ->
    @x -= point.x
    @y -= point.y
    @

  multiply: (number) ->
    @x = @x * number
    @y = @y * number
    @
  scale : (number) -> @multiply number

  divide: (number) ->
    throw new Error "Divide by zero error" if number == 0
    @x = @x / number
    @y = @y / number
    @

  inverse: () ->
    @x = -@x
    @y = -@y
    @

  equal: (point) ->
    @x == point.x and @y == point.y

  isZero: () -> @x == 0 and @y == 0

  zero: () ->
    @x = @y = 0
    @

  interpolate: (from,to,factor) ->
    factor = Math.min Math.max(factor,0), 1
    @x = (from.x * (1.0 - factor)) + (to.x * factor)
    @y = (from.y * (1.0 - factor)) + (to.y * factor)
    @

  magnitude : () -> Math.sqrt @x * @x + @y * @y
  magnitudeSquared: () -> @x * @x + @y * @y

  normalize : () ->
    m = this.magnitude()
    if m > 0
      @x /= m
      @y /= m
    @

