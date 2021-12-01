const path = require("path");
const express = require("express");
const logger = require("morgan");
const fs = require("fs");
const { PORT } = require("./config");

const app = express();

app.use(logger("dev"));

const testPages = fs.readdirSync(path.join(__dirname, "pages"));

for (var i = 1; i <= testPages.length; i++) {
  console.log(`${i}`);
  app.route(`/test/${i}`).get((req, res) => {
    res.sendFile(path.join(__dirname, `pages/page_${i}.html`), (err) => {
      if (err) {
        console.log(err);
        throw err;
      }
    });
  });
}

// app.route(`/test/1`).get((req, res) => {
//   res.sendFile(path.join(__dirname, `pages/page_1.html`), (err) => {
//     if (err) {
//       console.log(err);
//       throw err;
//     }
//   });
// });

app.listen(PORT);
console.log(
  `see-link's test server fired up and files served on the port ${PORT}`
);
