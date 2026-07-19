const https = require('https');
const fs = require('fs');

https.get('https://sharkiller.ddns.net/nopixel_minigame/hackingdevice/', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    fs.writeFileSync('d:\\dev\\web\\malacasystemgtarp\\scraped.html', data);
    console.log('done html');
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
