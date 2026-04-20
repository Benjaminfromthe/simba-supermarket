const getColors = require('get-image-colors')

getColors('colors_image.jpg').then(colors => {
  console.log(colors.map(color => color.hex()))
})
