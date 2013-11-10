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
    @x = Math.floor x
    @y = Math.floor y
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
    @x = Math.floor @x * number
    @y = Math.floor @y * number
    @
  scale : (number) -> @multiply number

  divide: (number) ->
    throw new Error "Divide by zero error" if number == 0
    @x = Math.floor @x / number
    @y = Math.floor @y / number
    @

  negate: () ->
    @x = -@x
    @y = -@y
    @

  equal: (point) ->
    @x == point.x and @y == point.y

  normalize: (scale=1) ->
    factor = scale / Math.sqrt(@x * @x + @y * @y)
    @x = Math.floor factor
    @y = Math.floor factor
    @
