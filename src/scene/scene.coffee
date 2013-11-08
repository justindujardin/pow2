
class Scene
  constructor: (@game, @tickRateMS=500) ->
    @objects = []
    @views = []
    @lastTime = 0
    @polyfillAnimationFrames()

  removeIt: (property,object) ->
    _.filter @[property], (obj) ->
      if obj.id == object.id
        obj.scene = null
        return false
      true
    this

  addView: (view) ->
    throw new Error "Object must implement be a SceneView" if view not instanceof SceneView
    @views.push(view)
    view.scene = @

  removeView: (object) ->
    @views = @removeIt 'views', object
    this

  # Add a `SceneObject` to the scene
  addObject: (object) ->
    throw new Error "Object must implement .tick()" if object not instanceof SceneObject
    @objects.push(object);
    object.scene = @

  # Remove an object from the scene
  removeObject: (object) ->
    @objects = @removeIt 'objects', object
    this

  # Update each object in the list because a tick of time has gone by.
  tickObjects: (elapsedMS) ->
    object.tick(elapsedMS) for object in @objects
    view.render() for view in @views

  # Stop the scene time from advancing
  stop: () -> @running = false

  # Start the scene ticking.
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
    self = this
    _frameCallback = (time) ->
      return if not self.running
      # Round to milliseconds.
      elapsed = Math.floor(time - self.lastTime)
      if elapsed >= self.tickRateMS
        self.lastTime = time
        self.tickObjects(elapsed)
      window.requestAnimationFrame _frameCallback
    _frameCallback 0


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
