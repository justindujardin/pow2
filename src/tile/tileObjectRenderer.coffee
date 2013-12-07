class eburp.TileObjectRenderer extends eburp.SceneObjectRenderer
  render: (object,view) ->
    return if not object.image
    point = object.renderPoint or object.point

    width = object.image.width * view.cameraScale
    height = object.image.height * view.cameraScale
    x = point.x * width
    y = point.y * height

    # Simple, no rotation, just draw.
    return view.context.drawImage(object.image,x,y,width,height) if object.rotation is 0

    # Rotate around center
    center = new eburp.Point x + width / 2, y + height / 2
    view.context.strokeRect(x,y,width,height)
    view.context.translate center.x, center.y
    view.context.rotate object.rotation
    view.context.drawImage object.image, -width/2, -height/2, width, height
    view.context.rotate -object.rotation
    view.context.translate -center.x, -center.y

