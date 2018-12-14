const express = require("express");

const app = express()
  .use(express.static("./public"));

module.exports = app;
