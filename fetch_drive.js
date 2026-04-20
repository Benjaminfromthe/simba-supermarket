const https = require('https');

const fileId = '153V6KWOvGmDFd6MrG5861zVa_zYO0ue9';
const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
             console.log("Content-Type: ", res2.headers['content-type']);
             let data = '';
             if (res2.headers['content-type'].includes('text')) {
                res2.on('data', chunk => data += chunk);
                res2.on('end', () => console.log("Data:", data.substring(0, 500)));
             } else {
                console.log("File is not text.");
             }
        });
    } else {
        console.log("Content-Type: ", res.headers['content-type']);
    }
}).on('error', (e) => {
    console.error(e);
});
