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

class ConfirmView extends AlertView

  constructor: (gurk, icon, title, text, @yesResult, @noResult, altIcon = null) ->
    super(gurk, icon, title, text, noResult, altIcon)
    @clearButton(5)
    @setButton(1, "YES")
    @setButton(3, "NO")

  command: (text) =>
    switch text
      when "YES" then @gurk.popView(@yesResult)
      when "NO" then @gurk.popView(@noResult)
