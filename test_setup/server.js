/**
 * see-link
 * by Bharat Sharma - https ://www.bharatsharma.me
 * 
 * License
 * -------
 * Copyright (c) Bharat Sharma
 * Released under the MIT License
 * https://raw.githubusercontent.com/bharat-1809/see-link/main/LICENSE
 */

const path = require("path");
const express = require("express");
const logger = require("morgan");
const { PORT } = require("./config");

const app = express();

app.use(logger("dev"));

app.route(`/test:pagenum`).get((req, res) => {
  res.sendFile(path.join(__dirname, `pages/page_${req.params.pagenum.substring(1)}.html`), (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
});

app.listen(PORT);
console.log(
  `see-link's test server fired up and files served on the port ${PORT}`
);
