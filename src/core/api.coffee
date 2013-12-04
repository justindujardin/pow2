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

# The global namespace things should go in.  Working on this bit.
window.eburp =
  data: {}
  # Register data
  registerData : (key,value) ->
    eburp.data[key] = value

  getData : (key) -> eburp.data[key]

  # Register a map
  registerMap : (name,data) ->
    eburp.data.maps[name] = data;

  # Register a sprite sheet
  registerSprites : (name,data) ->
    for property of data
      if (data.hasOwnProperty(property))
        eburp.data.sprites[property] = data[property]

  # Map Accessors
  getMap : (name) -> eburp.data.maps[name]
  getMaps : () -> eburp.data.maps

  # Analytics tracking
  track: (name, properties) ->
    return if not window.mixpanel
    mixpanel.track name, properties

window.Data = eburp.data;