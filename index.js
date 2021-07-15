const express = require('express')
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const path = require("path")

const app = express()
const port = process.env.PORT || 3000


dotenv.config({
  path: path.resolve(
    process.cwd(),
    ".env"
  )
});

app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get('/', (req, res) => {
    const text = req.query.text || ''
    const name = req.query.name || ''
    const username = req.query.username || ''
    res.render('index', {text, name, username});
})

app.post('/api/get/tweet', async (req, res) => {
  const tweet = req.body.tweet

  const tweetInfo = await loadTweet(tweet)
  const tweetUserInfo = await loadTweetUser(tweetInfo.author_id)

  res.json({
    text: tweetInfo.text,
    name: tweetUserInfo.name,
    username: tweetUserInfo.username
  })
})

app.post('/api/generate/tweet', async (req, res) => {
  // res.send('Hello World!')
  console.log('/api/generate/tweet', req.body)

  const background = req.body.image || 'bg_01'
  const font = req.body.font || 'RIDIBatang'
  const color = req.body.color || '#FFFFFF'
  const tweet = req.body.tweet

  const tweetInfo = await loadTweet(tweet)
  const tweetUserInfo = await loadTweetUser(tweetInfo.author_id)
  
  const image = await generate(tweetInfo.text, background, font, color, tweetUserInfo)

  // console.log('<img src="' + canvas.toDataURL() + '" />')
  res.json({image})
})

app.get('/test', async (req, res) => {
  // res.send('Hello World!')
  
  // const background = req.body.image || 'bg_01'
  // const font = req.body.font || 'RIDIBatang'
  // const color = req.body.color || '#FFFFFF'
  // const tweet = req.body.tweet
  
  const background = 'bg_02'
  const font = 'RIDIBatang'
  const color = '#FFFFFF'
  const tweet = '1396705389744254976'

  const tweetInfo = await loadTweet(tweet)
  const tweetUserInfo = await loadTweetUser(tweetInfo.author_id)
  
  const image = await generate(tweetInfo.text, background, font, color, tweetUserInfo)

  const im = image.split(",")[1];
  const img = Buffer.from(im, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.end(img); 
})

// app.post('/api/generate', async (req, res) => {
//     // res.send('Hello World!')
//     console.log('/api/generate', req.body)

//     const background = req.body.image || 'bg_01'
//     const text = req.body.text || ''
    
//     const image = await generate(text, background)

//     // console.log('<img src="' + canvas.toDataURL() + '" />')
//     res.json({image})
// })

const loadTweetUser = async (userId) => {
  const url = `https://api.twitter.com/2/users/${userId}?user.fields=profile_image_url`
  const authorization = `Bearer ${process.env.TWEET_TOKEN}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': authorization
    }
  });

  const data = await response.json()
  
  return data.data
}

const loadTweet = async (tweet) => {
  const url = `https://api.twitter.com/2/tweets/${tweet}?tweet.fields=attachments,author_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld`
  const authorization = `Bearer ${process.env.TWEET_TOKEN}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': authorization
    }
  });

  const data = await response.json()
  
  return data.data
}

const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
  replaceText = text.replace(/\n/g, ' ')
  let words = replaceText.split(' ');

  let line = '';
  for(let n = 0; n < words.length; n++) {
    let word = words[n]
    // TODO : line break
    // if (word.includes('\n')) {
    // }

    let testLine = line + words[n] + ' ';
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);

  return y
}

const generate = async (mainText, backgroundImage, font, color, userInfo = {}) => {
  const { createCanvas, loadImage, registerFont } = require('canvas')
  const canvas = createCanvas(1200, 1200)
  const ctx = canvas.getContext('2d')

  let image = await loadImage(`public/image/${backgroundImage}.png`)
  ctx.drawImage(image, 0, 0, 1200, 1200)

  let logo = await loadImage(`public/image/logo.png`)
  ctx.drawImage(logo, 1200-(48+125), 1200-(48+62), 125, 62)
  
  registerFont('public/font/ridi_batang.otf', { family: 'RIDIBatang' })
  registerFont('public/font/kopub_batang.ttf', { family: 'KopubBatang' })
  registerFont('public/font/notosans_light.otf', { family: 'NotoSans' })

  ctx.font = `52px "${font}"`
  ctx.fillStyle = color

  const maxWidth = 1050;
  const lineHeight = 78;
  const x = (canvas.width - maxWidth) / 2;
  const y = 280;
  let lastHeight = wrapText(ctx, mainText, x, y, maxWidth, lineHeight);

  ctx.font = '44px "NotoSans"'
  ctx.fillText(userInfo.name, x, lastHeight + 122)

  ctx.fillStyle = '#FFFFFF80'
  ctx.font = '40px "NotoSans"'
  ctx.fillText(`@${userInfo.username}`, x, lastHeight + 190)

  return canvas.toDataURL()
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

