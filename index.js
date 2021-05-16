const express = require('express')
const app = express()
const port = 3000

app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/api/generate', async (req, res) => {
    // res.send('Hello World!')
    console.log('/api/generate', req.body)

    const { createCanvas, loadImage } = require('canvas')
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    let image = await loadImage('public/bg_01.png')
    ctx.drawImage(image, 0, 0, 200, 200)
    
    let text = req.body.text || ''
    ctx.font = '30px Impact'
    ctx.fillText(text, 10, 100)

    // console.log('<img src="' + canvas.toDataURL() + '" />')
    res.json({image: canvas.toDataURL()})
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

