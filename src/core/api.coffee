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
window.eburp ?= {}

# Stub the data object
# TODO: Remove entirely, and file away somewhere safe, like window.eburp
window.Data ?= {}

# Register data on existing window.Data object.
window.eburp.registerData = (key,value) ->
  window.Data[key] = value

# Register a map on the existing window.Data.maps object.
window.eburp.registerMap = (name,data) ->
  window.Data.maps[name] = data;

# Register a sprite sheet
window.eburp.registerSprites = (name,data) ->
  for property of data
    if (data.hasOwnProperty(property))
      window.Data.sprites[property] = data[property];

# Abstract away getting a map, to make getting rid of window.Data easier in the future.
window.eburp.getMap = (name) -> window.Data.maps[name]
window.eburp.getMaps = (name) -> window.Data.maps