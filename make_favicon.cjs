const fs = require('fs'); 
const data = fs.readFileSync('public/jblack.png'); 
const b64 = data.toString('base64'); 
const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' fill='#ffff23'/><image href='data:image/png;base64,${b64}' x='100' y='100' width='312' height='312' /></svg>`; 
fs.writeFileSync('public/favicon.svg', svg);
