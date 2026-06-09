const ColorThief = require('color-thief-node');
const path = require('path');

const imgPath = path.resolve(__dirname, 'public', 'hulk-logo.png');

ColorThief.getColor(imgPath)
    .then(color => {
        console.log(`Dominant color RGB: ${color}`);
        return ColorThief.getPalette(imgPath, 5);
    })
    .then(palette => {
        console.log(`Palette RGBs:`);
        palette.forEach(c => console.log(c));
    })
    .catch(err => {
        console.error(err);
    });
