const fs = require('fs');

// We don't have canvas module, so let's generate a basic PBM/PPM or just raw BMP/PNG.
// Actually, generating a base64 SVG is easiest since we don't need external modules.

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">`;
for (let i = 0; i < 2000; i++) {
  let x = Math.floor(Math.random() * 100);
  let y = Math.floor(Math.random() * 100);
  let r = Math.random() > 0.5 ? 1 : 1.5;
  svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,0.4)" />`;
}
svg += `</svg>`;

const b64 = Buffer.from(svg).toString('base64');
const css = `background-image: url('data:image/svg+xml;base64,${b64}');\nbackground-size: 100px 100px;`;
fs.writeFileSync('noise_css.txt', css);
