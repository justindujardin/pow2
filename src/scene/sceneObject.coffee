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

# An object that may exist in a `Scene`, has a unique `id` and receives ticked updates.
class eburp.SceneObject
  constructor: (options) ->
    _.extend @, _.defaults options or {}, {
      id: _.uniqueId('eburp')
      name: null
      world: null
    }
    @

  # Perform any updates to this object's state, after a tick of time has passed.
  tick: (elapsed) -> @


  interpolateTick: (elapsed) -> @


  destroy: () -> @scene.removeObject @ if @scene
