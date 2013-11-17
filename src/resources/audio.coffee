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
  Use jQuery to load an Audio resource.
###
class AudioResource extends Resource
  types: {
    'mp3' : 'audio/mpeg'
    'ogg' : 'audio/ogg'
    'wav' : 'audio/wav'
  }
  load: () ->
    sources = _.keys(@types).length
    invalid = []
    incrementFailure = (path) =>
      sources--
      invalid.push(path)
      @failed("No valid sources at the following URLs\n   #{invalid.join('\n   ')}") if sources <= 0

    reference = document.createElement('audio');

    # Try all supported types, and accept the first valid one.
    _.each @types, (mime,extension) =>
      return if not reference.canPlayType "#{mime};"
      source = document.createElement('source');
      source.type = mime
      source.src = "#{@url}.#{extension}"
      source.addEventListener 'error', (e) ->
        incrementFailure(source.src)
        e.preventDefault()
        e.stopImmediatePropagation()
        return false
      reference.appendChild source
    reference.addEventListener 'canplaythrough', =>
      @data = reference
      @ready()
