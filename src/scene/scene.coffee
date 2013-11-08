
class Scene
  constructor: (@options) ->
    @options = _.defaults @options or {}, {
      tickRateMS: 100
      debugRender: false
    }
    @objects = []
    @views = []
    @lastTime = 0
    @fps = 0
    @mspf = 5000
    @polyfillAnimationFrames()

  # Remove an object from a collection the the
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


  updateFPS: (elapsed) ->
    currFPS = if elapsed then 1000 / elapsed else 0
    @fps += (currFPS - @fps) / 10

  # Render a frame.
  #
  # This includes up to two passes of rendering over any `SceneView`s in
  # the scene.  The first call is to the view's `render` method, and then
  # a second pass is done to each view's `debugRender` method when the
  # scene option `debugRender` is true.
  renderFrame: (elapsed) ->
    view.render(@) for view in @views
    view.debugRender(@) for view in @views when this.options.debugRender
    @updateFPS(elapsed)

  # Stop the scene time from advancing
  stop: () -> @running = false

  # Start the scene ticking.
  #
  # TODO: This currently leaks milliseconds over time because
  # requestAnimationFrame doesn't always come back on the exact
  # target tick milliseconds.   If this is a problem for your game,
  # you need to accumulate the leftover MS when you call
  # .tickObjects, and add it up over time.  When you have more than
  # `@options.tickRateMS` accumulated, invoke the tick callback and reset
  # the accumulated leftover time to 0.
  start: () ->
    return if @running is true
    @running = true
    _frameCallback = (time) =>
      return if not this.running
      # Round to milliseconds.
      now = new Date().getMilliseconds()
      elapsed = Math.floor time - @lastTime
      if elapsed >= @options.tickRateMS
        #@leftOver += elapsed % this.options.tickRateMS
        @lastTime = time
        @tickObjects(elapsed)
      @renderFrame(elapsed)
      @mspf = new Date().getMilliseconds() - now
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
