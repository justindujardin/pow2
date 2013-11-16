# -----------------------------------------------------------------------------
#
# The entry point for the game, including game data validation.
#
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

class eburp.Gurk extends SceneView

  stack: null
  view : null
  screen : null
  buttonGrid : null
  game : null
  imageProcessor : null
  music : null

  @MEDIA:
    SMALL  : "(max-width:480px)" # 288
    MEDIUM : "(min-width:481px) and (max-width:600px)" # 432
    LARGE  : "(min-width:601px) and (max-width:900px)" # 576
    HUGE   : "(min-width:760px)" # 720

  @requires = [
    "images/animation.png"
    "images/characters.png"
    "images/creatures.png"
    "images/environment.png"
    "images/equipment.png"
    "images/items.png"
    "images/ui.png"
    "images/font_micro.png"
    "images/font_gurkoid.png"
    "images/button" + Screen.SCALE + ".png"
    "images/buttonoff" + Screen.SCALE + ".png"
    "images/buttontop" + Screen.SCALE + ".png"
    "images/shadow.png"
  ]


  constructor: (canvas) ->
    super(canvas)
    @media = eburp.Gurk.MEDIA.SMALL
    #@setSize("normal")
    # Get all the images in here
    #Screen.SCALE = 4
    console.log "Preloading Images at scale: #{Screen.SCALE}"
    eburp.resources = new ResourceLoader()
    eburp.resources.load eburp.Gurk.requires, => @start()


  makeResponsive: ()->
    disableSmoothing = () =>
      @context.webkitImageSmoothingEnabled = @context.mozImageSmoothingEnabled = false
      @controlContext.webkitImageSmoothingEnabled = @controlContext.mozImageSmoothingEnabled = false

    enquire.register Gurk.MEDIA.SMALL, () =>
      @media = Gurk.MEDIA.SMALL
      @controlContext.canvas.width = @context.canvas.width = @context.canvas.height = 288
      @controlContext.canvas.height = 144
      disableSmoothing()
    enquire.register Gurk.MEDIA.MEDIUM, () =>
      @media = Gurk.MEDIA.MEDIUM
      @controlContext.canvas.width = @context.canvas.width = @context.canvas.height = 432
      @controlContext.canvas.height = 216
      disableSmoothing()
    enquire.register Gurk.MEDIA.LARGE, () =>
      @media = Gurk.MEDIA.LARGE
      @controlContext.canvas.width = @context.canvas.width = @context.canvas.height = 576
      @controlContext.canvas.height = 288
      disableSmoothing()
    enquire.register Gurk.MEDIA.HUGE, () =>
      @media = Gurk.MEDIA.HUGE
      @controlContext.canvas.width = @context.canvas.width = @context.canvas.height = 720
      @controlContext.canvas.height = 360
      disableSmoothing()

  # Game initialization/loading
  # -----------------------------------------------------------------------------
  startSavedGame: =>
    @game = new Game()
    @game.loadGame(Device.loadGame())
    mapView = new MapView(this)
    @setView(mapView)

  startNewGame : (game) =>
    @game = game
    club = @game.createItem(Library.getItemTemplateByName("Crude Club"))
    sling = @game.createItem(Library.getItemTemplateByName("Sling"))
    shortStaff = @game.createItem(Library.getItemTemplateByName("Short Staff"))

    @game.players[0].addItem(club)
    @game.players[0].equipItem(club)
    @game.players[1].addItem(sling)
    @game.players[1].equipItem(sling)
    @game.players[2].addItem(shortStaff)
    @game.players[2].equipItem(shortStaff)

    mapView = new MapView(this)
    @setView(mapView)


  start: =>
    @screenCanvas = document.getElementById("screenID");
    ctx = @screenCanvas.getContext("2d")
    ctx.webkitImageSmoothingEnabled = false
    ctx.mozImageSmoothingEnabled = false;
    canvasWork = document.getElementById("workID")
    ctxWork = canvasWork.getContext("2d")
    @screen = new Screen(@screenCanvas,ctx)
    @imageProcessor = new ImageProcessor(canvasWork, ctxWork, @screen.icons)

    #
    # Create a scene, and add this view to it.
    @scene = new Scene {
      game: @game
      debugRender: false
      autoStart:true
    }
    @scene.addView @

    # Construct the Gurk UI and view stack.
    $(window).keydown(@windowKeyPress)
    @stack = new Array()

    @controlCanvas = document.getElementById("controlID")
    @controlContext = @controlCanvas.getContext("2d")
    @controlContext.webkitImageSmoothingEnabled = false
    @controlContext.mozImageSmoothingEnabled = false;
    @buttonGrid = new ButtonGrid(@controlCanvas, this)
    @scene.addView @buttonGrid


    @makeResponsive()

    # Play music and show splash view
    @setView new SplashView @
    @playMusic Data.splashMusic

  # SceneView implementation
  # -----------------------------------------------------------------------------
  renderFrame: () ->
    @fillColor()
    @view.scene = @scene if @view and not @view.scene
    @view.render() if @view

  # View utilities
  # -----------------------------------------------------------------------------
  setView: (view) =>
    @scene.removeView(@view) if @view
    console.log("Set View: " + view)
    @stack = new Array()
    @view = view
    @showView()


  showView: () =>
    #console.log("View: #{@view.name}")
    @view.doLayout()
    @view.setButtons(@buttonGrid)
    @view.draw()

  pushView: (view) =>
    @stack.unshift(@view)
    @view = view
    @showView()

  popView: (result) =>
    @scene.removeView @view
    parent = @stack.shift()
    if (parent != null)
      @view = parent
      if (result != null)
        @view.processResult(result)
      @showView()

  swapView: (result) =>
    @view = view
    if (result != null)
      @view.processResult(result)
    @showView()

  popToTopView: (result) =>
    if (@stack.length > 0)
      @view = @stack.shift()
      while (@stack.length > 0)
        @view = @stack.shift()
      if (result != null)
        @view.processResult(result)
      @showView()

  isCurrentView: (view) =>
    return @view == view

  getScreen: () =>
    @screen

  windowKeyPress: (event) =>
    switch event.keyCode
      when 37 then @buttonGrid.forceClick(4)
      when 38 then @buttonGrid.forceClick(2)
      when 39 then @buttonGrid.forceClick(6)
      when 40 then @buttonGrid.forceClick(8)
      when 13 then @buttonGrid.forceClick(5) # Enter
      when 81 then @buttonGrid.forceClick(1) # Q
      when 87 then @buttonGrid.forceClick(2) # W
      when 69 then @buttonGrid.forceClick(3) # E
      when 65 then @buttonGrid.forceClick(4) # A
      when 83 then @buttonGrid.forceClick(5) # S
      when 68 then @buttonGrid.forceClick(6) # D
      when 90 then @buttonGrid.forceClick(7) # Z
      when 88 then @buttonGrid.forceClick(8) # X
      when 67 then @buttonGrid.forceClick(9) # C
      when 96 then @buttonGrid.forceClick(5) # Num Pad 0
      when 97 then @buttonGrid.forceClick(7) # Num Pad 1
      when 98 then @buttonGrid.forceClick(8) # Num Pad 2
      when 99 then @buttonGrid.forceClick(9) # Num Pad 3
      when 100 then @buttonGrid.forceClick(4) # Num Pad 4
      when 101 then @buttonGrid.forceClick(5) # Num Pad 5
      when 102 then @buttonGrid.forceClick(6) # Num Pad 6
      when 103 then @buttonGrid.forceClick(1) # Num Pad 7
      when 104 then @buttonGrid.forceClick(2) # Num Pad 8
      when 105 then @buttonGrid.forceClick(3) # Num Pad 9
      when 71 then @view.processResult("debug1") # Debug hook 1
      when 72 then @view.processResult("debug2") # Debug hook 2
      else
        return true
    event.stopImmediatePropagation()
    return false

  getSoundSetting : =>
    Device.getSetting("sound", true)

  setSoundSetting : (value) =>
    Device.setSetting("sound", value)

  getMusicSetting : =>
    Device.getSetting("music", true)

  setMusicSetting : (value) =>
    Device.setSetting("music", value)
    if (value)
      @resumeMusic()
    else
      @stopMusic()

  getCombatMusicSetting : =>
    Device.getSetting("combatMusic", true)

  setCombatMusicSetting : (value) =>
    Device.setSetting("combatMusic", value)

  getFastSetting : =>
    Device.getSetting("fast", false)

  setFastSetting : (value) =>
    Device.setSetting("fast", value)

  playSound : (sound) =>
    if (@getSoundSetting())
      playAudio(sound)

  playMusic : (track) =>
    @music = track
    console.log("Music setting: '" + @getMusicSetting() + "'.")
    if (@getMusicSetting())
      console.log("Play track '" + track + "'.")
      playTrack(track)

  playCombatMusic : =>
    if (@getCombatMusicSetting())
      playTrack(Data.combatMusic)

  stopMusic : =>
    stopTrack()

  resumeMusic : =>
    if (@music)
      @playMusic(@music)

  phoneClick: (e, offsetX = 0, offsetY = 0) =>
    relMouse = (event) ->
      canoffset = $(event.currentTarget).offset();
      x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
      y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
      return {"x":x, "y":y};
    point = relMouse(e)
    point.x -= offsetX
    point.y -= offsetY
    @buttonGrid.clicked(point)

  showSettings : () =>
    @pushView(new SettingsView(this))

  buttonPressed: (text) =>
    @view?.command(text)

  showAlert: (icon, title, text, result) =>
    alert = new AlertView(this, icon, title, text, result)
    @pushView(alert)

  showConfirm: (icon, title, text, yesResult, noResult) =>
    confirm = new ConfirmView(this, icon, title, text, yesResult, noResult)
    @pushView(confirm)

# -----------------------------------------------------------------------------