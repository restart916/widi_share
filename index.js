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
    res.render('index');
})

app.post('/api/generate/tweet', async (req, res) => {
  // res.send('Hello World!')
  console.log('/api/generate/tweet', req.body)

  const background = req.body.image || 'bg_01'
  const tweet = req.body.tweet

  const tweetInfo = await loadTweet(tweet)
  const tweetUserInfo = await loadTweetUser(tweetInfo.author_id)
  
  const image = await generate(tweetInfo.text, background, tweetUserInfo)

  // console.log('<img src="' + canvas.toDataURL() + '" />')
  res.json({image})
})

app.post('/api/generate', async (req, res) => {
    // res.send('Hello World!')
    console.log('/api/generate', req.body)

    const background = req.body.image || 'bg_01'
    const text = req.body.text || ''
    
    const image = await generate(text, background)

    // console.log('<img src="' + canvas.toDataURL() + '" />')
    res.json({image})
})

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

const generate = async (mainText, backgroundImage, userInfo = {}) => {
  const { createCanvas, loadImage, registerFont } = require('canvas')
  const canvas = createCanvas(800, 800)
  const ctx = canvas.getContext('2d')

  let image = await loadImage(`public/${backgroundImage}.png`)
  ctx.drawImage(image, 0, 0, 800, 800)
  
  registerFont('public/font/ridi_batang.otf', { family: 'RIDIBatang' })
  ctx.font = '32px "RIDIBatang"'
  ctx.fillStyle = "#ffffff"

  const maxWidth = 700;
  const lineHeight = 58;
  const x = (canvas.width - maxWidth) / 2;
  const y = 180;
  let lastHeight = wrapText(ctx, mainText, x, y, maxWidth, lineHeight);

  ctx.font = '28px "RIDIBatang"'
  ctx.fillText(userInfo.name, x, lastHeight + 86)

  ctx.font = '26px "RIDIBatang"'
  ctx.fillText(`@${userInfo.username}`, x, lastHeight + 126)

  return canvas.toDataURL()
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

