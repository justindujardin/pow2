# -----------------------------------------------------------------------------
#
# Copyright (C) 2013 by John Watkinson
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

class Util

  @random: (min, max) ->
    diff = max - min + 1
    Math.floor(Math.random() * diff) + min

  @randomChance: (num, den) ->
    Math.random() * den < num

  @randomElement: (array) ->
    n = array.length
    x = Util.random(0, n-1)
    array[x]

  @isEmpty: (object) ->
    for x, y of object
      return false
    true

  @statRoll: ->
    Util.random(1,6) + Util.random(1,6) + Util.random(1,6)

  @shuffle: (a) ->
    b = a.length
    while (b)
      c = Math.floor(Math.random() * b)
      d = a[--b]
      a[b] = a[c]
      a[c] = d
    a

  @hasAllProperties: (obj, properties) ->
    if (properties instanceof Array)
      for a in properties
        if (!obj[a])
          return false
    else
      if (!obj[properties])
        return false
    true

  @hasCommonElements: (array1, array2) ->
    array1 = [].concat(array1)
    array2 = [].concat(array2)
    for a in array1
      for b in array2
        if (a == b)
          return true
    false

  @hasElement: (array, element) ->
    for a in array
      if (a == element)
        return true
    false

  @indexOfElement: (array, element) ->
    index = 0
    for a in array
      if (a == element)
        return index
      index++
    -1

  @trunc: (x) ->
    x | 0

  @create2DArray: (width, height) ->
    a = []
    for y in [0 ... height]
      b = []
      a.push(b)
      for x in [0 ... width]
        b.push([])
    a

  @removeElement: (array, element) ->
    index = 0
    for a in array
      if (a == element)
        array.splice(index, 1)
        return true
      index++
    false

  @copyProperties: (source, dest) ->
    for k,v of source
      dest[k] = v

  @rgb : (red, green, blue) ->
    {"red" : red, "green" : green, "blue" : blue}

  @blendColors : (color1, color2, p1, p2) ->
    red = Math.round(color1.red * p1 + color2.red * p2)
    green = Math.round(color1.green * p1 + color2.green * p2)
    blue = Math.round(color1.blue * p1 + color2.blue * p2)
    {"red" : red, "green" : green, "blue" : blue}

  @capitalize : (word) ->
    word.charAt(0).toUpperCase() + word.slice(1)

  @arrayToString : (array) ->
    if (!array or array.length == 0)
      null
    else
      first = true
      text = ""
      for item in array
        if (first)
          text += item
          first = false
        else
          text += ", " + item
      text

  @getPath: (file) ->
    @_resolvedPathCache ?= {}
    @_resolvedPathCache[file] = file.substr file.lastIndexOf('/') + 1 if not @_resolvedPathCache[file]
    @_resolvedPathCache[file]
