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


class eburp.Time
  constructor: (options) ->
    _.extend @, _.defaults options or {},
      tickRateMS: 32
      autoStart: false
      world:null
      lastTime:0
      time:0
      running:false
      objects: []
    @polyfillAnimationFrames()
    @start() if @autoStart

  # Start time tracking.
  #
  # TODO: This currently leaks milliseconds over time because
  # requestAnimationFrame doesn't always come back on the exact
  # target tick milliseconds.   If this is a problem for your game,
  # you need to accumulate the leftover MS when you call
  # .tickObjects, and add it up over time.  When you have more than
  # `@tickRateMS` accumulated, invoke the tick callback and reset
  # the accumulated leftover time to 0.
  start: () ->
    return if @running is true
    @running = true
    _frameCallback = (time) =>
      @time = Math.floor(time)
      return if not this.running
      # Round to milliseconds.
      now = new Date().getMilliseconds()
      elapsed = Math.floor time - @lastTime
      if elapsed >= @tickRateMS
        @lastTime = time
        @tickObjects(elapsed)
      @processFrame(elapsed)
      @mspf = new Date().getMilliseconds() - now
      window.requestAnimationFrame _frameCallback
    _frameCallback 0

  # Stop the scene time from advancing
  stop: () -> @running = false


  # Remove an object
  removeObject: (object) ->
    @objects = _.filter @objects, (obj) =>
      if obj.id == object.id
        return false
      true

  addObject: (object) -> @objects.push object

  # Update each object in the list because a tick of time has gone by.
  tickObjects: (elapsedMS) -> o.tick(elapsedMS) for o in @objects when o.tick
  processFrame: (elapsedMS) -> o.processFrame(elapsedMS) for o in @objects when o.processFrame

  # http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  # http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  # requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
  # MIT license
  polyfillAnimationFrames: () ->
    lastTime = 0
    vendors = ['ms', 'moz', 'webkit', 'o']
    for vendor in vendors
      return if window.requestAnimationFrame
      window.requestAnimationFrame = window[vendor+'RequestAnimationFrame']
    if not window.requestAnimationFrame
      window.requestAnimationFrame = (callback) ->
        currTime = new Date().getTime()
        timeToCall = Math.max(0, 16 - (currTime - lastTime))
        tickListener = () -> callback currTime + timeToCall
        id = window.setTimeout tickListener, timeToCall
        lastTime = currTime + timeToCall
        return id
