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

class Preloader

  @images: null
  @loadedCount: 0
  @addedCount: 0
  @images: {}
  @callback: null

  @reset: () =>
    Preloader.addedCount = 0
    Preloader.loadedCount = 0

  @imageLoaded: () =>
    Preloader.loadedCount++;
    console.log("Preloading loading finished: #{Preloader.loadedCount}/#{Preloader.addedCount} done.")
    if (Preloader.loadedCount + 1 == Preloader.addedCount and Preloader.callback)
      console.log("Preloading calling back.")
      Preloader.callback()

  @load: (sources) =>
    sources = [sources] if not Util.isArray(sources)
    for src in sources
      continue if Preloader.images[src]
      Preloader.addedCount++
      console.log("Loading: (#{Preloader.addedCount}) : #{src}")
      item = new Image()
      Preloader.images[src] = item
      item.onload=Preloader.imageLoaded
      item.src = src
      item

  @setCallback: (callback) =>
    console.log("Preloader callback set.")
    Preloader.callback = callback
    if (Preloader.loadedCount == Preloader.addedCount)
      callback()

  @getImage: (src) =>
    Preloader.load(src) if not Preloader.images[src]
    Preloader.images[src]
