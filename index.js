const express = require('express')
const app = express()
const port = 3000

app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', async (req, res) => {
    // res.send('Hello World!')

    const { createCanvas, loadImage } = require('canvas')
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    let image = await loadImage('public/bg_01.png')
    ctx.drawImage(image, 0, 0, 200, 200)
    
    // Write "Awesome!"
    ctx.font = '30px Impact'
    // ctx.rotate(0.1)
    ctx.fillText('Awesome!', 50, 100)

    // Draw line under text
    var text = ctx.measureText('Awesome!')
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.lineTo(50, 102)
    ctx.lineTo(50 + text.width, 102)
    ctx.stroke()

    // console.log('<img src="' + canvas.toDataURL() + '" />')

    let imageData = `<img src="${canvas.toDataURL()}"/>`
    res.send(`${imageData}`)
})

app.get('/home', (req, res) => {
    res.render('index');
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

