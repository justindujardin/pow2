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
  A basic resource loading manager.  Supports a basic api for requesting
  resources by file name, and uses registered types and file extension
  matching to create and load a resource.

  The manager instance triggers events to signal
###
class ResourceLoader
  constructor: (@game) ->
    @_resources = {}
    # Expose a few built-in types.
    @_types = {
      'png' : ImageResource
      'js'  : ScriptResource
      'json': JSONResource
    }

  registerResourceType: (extension,type) ->
    @_types[extension] = type

  getResourceExtension: (url) ->
    file = url.substr url.lastIndexOf '/'
    return null if not file
    file.substr(file.lastIndexOf('.') + 1)

  load: (sources,done) ->
    sources = [sources] if not Util.isArray(sources)
    loadQueue = 0
    for src in sources
      extension = @getResourceExtension src
      resourceType = @_types[extension]
      if not resourceType
        console.error "Unknown resource type: #{src}"
        continue
      res = @_resources[src]
      res = @_resources[src] = new resourceType(src) if not res
      res.extension = extension
      continue if res.isReady()
      loadQueue++
      res.once 'ready', (resource) =>
        console.log "Loaded asset: #{resource.url}"
        loadQueue--
        done() if done and loadQueue is 0
      res.once 'failed', (resource) =>
        console.log "Failed to load asset: #{resource.url}"
        loadQueue--
        done() if done and loadQueue is 0
      res.load()

  get: (url) ->
    @load url
    @_resources[url]
