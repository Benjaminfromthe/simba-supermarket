const fs = require('fs');
const https = require('https');

const fileId = '153V6KWOvGmDFd6MrG5861zVa_zYO0ue9';
const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
const dest = './colors_image.jpg';

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

downloadFile(url, dest)
  .then(() => console.log('Image downloaded successfully'))
  .catch(console.error);
