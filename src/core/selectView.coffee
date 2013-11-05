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

class SelectView extends InfoView

  @BASIC_COLOR : "#FFF"
  @SELECT_COLOR : "#0FF"

  options : null
  selected : 0
  selectVerb : null
  cancelVerb : null

  constructor: (gurk, selectVerb = "SELECT", cancelVerb = "CANCEL") ->
    super(gurk)
    @selectVerb = selectVerb
    @cancelVerb = cancelVerb
    @options = new Array()
    # Use up/down for selection
    @setButton(2, View.UP)
    @setButton(8, View.DOWN)
    @setButton(5, @selectVerb)
    if (@cancelVerb)
      @setButton(9, @cancelVerb)
    else
      @clearButton(9)

  clear: =>
    super();
    @options = new Array()

  start: =>
    if (@selected >= @options.length)
      @selected = 0
    if (@options.length > 0)
      @itemHighlighted(@selected, @options[@selected])

  setSelectVerb : (verb) =>
    @selectVerb = verb
    @setButton(5, @selectVerb)

  turnOffSelection : =>
    @clearButton(5)

  cancelled: =>
    # Override to respond to cancellation differently
    @gurk.popView(null)

  itemSelected: (index, item) =>
    # Override to respond to selection differently
    @gurk.popView(item)

  itemHighlighted: (index, item) =>
    # no-op, override to respond to highlight

  addOption: (text, color, x, y, highlightColor = SelectView.SELECT_COLOR) =>
    @options.push({"text" : text, "color": color, "highlightColor" : highlightColor, "x" : x, "y" : y})
    @options.length - 1

  changeOption: (index, text, color) =>
    option = @options[index]
    option.text = text
    option.color = color

  moveUp: =>
    if (@options.length > 0)
      @selected--
      if (@selected < 0)
        @selected = @options.length - 1
      @itemHighlighted(@selected, @options[@selected])
      @draw()

  moveDown: =>
    if (@options.length > 0)
      @selected++
      if (@selected >= @options.length)
        @selected = 0
      @itemHighlighted(@selected, @options[@selected])
      @draw()

  makeSelection: =>
    if (@options.length > 0)
      @itemSelected(@selected, @options[@selected])

  command: (text) =>
    switch text
      when View.UP then @moveUp()
      when View.DOWN then @moveDown()
      when @selectVerb then @makeSelection()
      when @cancelVerb then @cancelled()

  doDraw: =>
    super()
    @screen.clearColor(Screen.GURK_BLUE)
    for icon in @icons
      @screen.drawIcon(icon.icon, icon.x, icon.y);
    for label in @labels
      @screen.drawText(label.text, label.color, label.x, label.y)
    for option, i in @options
      color = if (i == @selected) then option.highlightColor else option.color
      @screen.drawText(option.text, color, option.x, option.y)
