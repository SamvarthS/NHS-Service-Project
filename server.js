import express from "express";
import apiApp from "./api/index.js";

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";

app.use(apiApp);
app.use(express.static(".", { dotfiles: "ignore", index: "index.html" }));

app.listen(port, host, () => {
  console.log(`AI Math Tutor is running on http://${host}:${port}`);
});
