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

class eburp.TileObjectRenderer
  render: (object,view) ->
    return if not object.image
    point = object.renderPoint or object.point

    if object.icon and object.iconCoords
      c = object.iconCoords
      width = view.unitSize * view.cameraScale
      height = view.unitSize * view.cameraScale
      x = point.x * width
      y = point.y * height
      view.context.drawImage(object.image, c.x, c.y,view.unitSize,view.unitSize,x,y,width,height)
    else
      width = object.image.width * view.cameraScale
      height = object.image.height * view.cameraScale
      x = point.x * width
      y = point.y * height
      view.context.drawImage(object.image,x,y,width,height)
