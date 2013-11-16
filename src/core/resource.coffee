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

###*
  Basic asynchronous resource class.

  Supports loading and success/error handling. A resource is immediately
  available, and you can get at its internal data when `isReady` returns true.

  Resource objects trigger 'ready' and 'failed' events during their initial loading.
###
class Resource
  _.extend @prototype, Backbone.Events
  constructor: (@url,@data=null) ->
    @_ready = @data isnt null
  load: () -> console.log "Loading: #{@url}"
  isReady: () -> @data isnt null and @_ready is true
  ready:() ->
    @_ready = true
    @trigger 'ready', @
  failed:(error) ->
    @_ready = false
    @_error = error
    console.log "ERROR loading resource: #{@url}\n   -> #{error}"
    @trigger 'failed', @
