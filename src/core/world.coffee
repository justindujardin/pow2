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

# Encapsulate all the services a game might need to run.
class eburp.World
  constructor: (services) ->
    # Instantiate services, with any user passed options overriding them.
    services = _.defaults services or {}, {
      loader: new eburp.ResourceLoader
      time:   new eburp.Time autoStart: true
      scene:  new eburp.Scene
      input:  new eburp.Input
      sprites:new eburp.SpriteRender
    }
    _.extend @, services

    # Mark all the services with a world reference
    @mark s for k, s of services

  # Mark an object with a world reference.
  mark: (object)->
    if object
      object.world = @
      object.onAddToWorld(@) if object.onAddToWorld
    @

  # Remove a world reference from an object.
  erase: (object) ->
    if object
      delete object.world
      object.onRemoveFromWorld(@) if object.onRemoveFromWorld
    @
