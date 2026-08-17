// Entry point for cPanel / Passenger, which needs a plain CommonJS startup file
// and supplies the port itself. Not used for local development (`npm run dev`)
// or for `npm start`.
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res).catch((error) => {
        console.error("Request failed:", error);
        res.statusCode = 500;
        res.end("Internal Server Error");
      });
    }).listen(port, () => {
      console.log(`Ready on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
