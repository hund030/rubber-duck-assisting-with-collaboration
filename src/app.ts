import * as restify from "restify";
import * as fs from "fs";
import send from "send";

//Create HTTP server.
const server = restify.createServer({
  key: process.env.SSL_KEY_FILE ? fs.readFileSync(process.env.SSL_KEY_FILE) : undefined,
  certificate: process.env.SSL_CRT_FILE ? fs.readFileSync(process.env.SSL_CRT_FILE) : undefined,
  formatters: {
    "text/html": (req, res, body) => {
      return body;
    },
  },
});

server.use(restify.plugins.bodyParser());

server.get(
  "/static/*",
  restify.plugins.serveStatic({
    directory: __dirname,
  })
);


server.listen(process.env.port || process.env.PORT || 3333, function () {
  console.log(`\n${server.name} listening to ${server.url}`);
});

// Adding tabs to our app. This will setup routes to various views
// Setup home page
server.get("/", (req, res, next) => {
  send(req, __dirname + "/views/hello.html").pipe(res);
});

// Setup the static tab
server.get("/tab", (req, res, next) => {
  send(req, __dirname + "/views/hello.html").pipe(res);
});

server.get("/config", (req, res, next) => {
  send(req, __dirname + "/views/configure.html").pipe(res);
});

let rubberDuck = "";
server.post("/take", (req, res, next) => {
  if (rubberDuck) {
    res.send(409);
    return;
  }
  if (!req?.body?.name) {
    res.send(400);
    return;
  }
  rubberDuck = req.body.name;
  res.send(200);
});

server.post("/return", (req, res, next) => {
  if (rubberDuck !== req?.body?.name) {
    res.send(409);
    return;
  }
  rubberDuck = "";
  res.send(200);
});

server.get("/duck", (req, res, next) => {
  res.send(200, rubberDuck);
});
