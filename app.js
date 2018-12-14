const {Storage} = require('@google-cloud/storage');
const gcs = new Storage({
    projectId: 'xxxxx',
    keyFilename: 'xxxxx.json'
});

const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

require('date-utils');

app.use(async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.send('Please provide URL as GET parameter, for example: <a href="/?url=https://example.com">?url=https://example.com</a>');
  }
  
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url);
  const imageBuffer = await page.screenshot();
  browser.close();
  
  const bucket = gcs.bucket('xxxxx');
  
  var dt = new Date();
　　　　var formatted = dt.toFormat("YYYYMMDDHH24MISS");
  
  const blob = bucket.file(formatted + '.png');
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: 'image/png'
    }
  });
  blobStream.end(imageBuffer);      

  res.set('Content-Type', 'image/png');
  res.send(imageBuffer);
});

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});
