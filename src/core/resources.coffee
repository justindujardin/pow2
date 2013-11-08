
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
