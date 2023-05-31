import * as restify from "restify";
import * as fs from "fs";
import send from "send";
import { getDuck, insertOrReplace } from "./storage";

//Create HTTP server.
const server = restify.createServer({
  key: process.env.SSL_KEY_FILE
    ? fs.readFileSync(process.env.SSL_KEY_FILE)
    : undefined,
  certificate: process.env.SSL_CRT_FILE
    ? fs.readFileSync(process.env.SSL_CRT_FILE)
    : undefined,
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

server.post("/take", (req, res, next) => {
  if (!req?.body?.name || !req?.body?.channelId) {
    res.send(400);
    return;
  }
  const name = req.body.name;
  const channelId = req.body.channelId;
  getDuck(channelId).then((duck) => {
    if (duck) {
      res.send(409);
      return;
    }
    insertOrReplace(name, channelId).then(() => {
      res.send(200); 
    });
  });
});

server.post("/return", (req, res, next) => {
  if (!req?.body?.name || !req?.body?.channelId) {
    res.send(400);
    return;
  }
  const name = req.body.name;
  const channelId = req.body.channelId;
  getDuck(channelId).then((duck) => {
    if (duck !== name) {
      res.send(409);
      return;
    }
    insertOrReplace("", channelId).then(() => {
      res.send(200);
    });
  });
});

server.get("/duck/:channelId", (req, res, next) => {
  const channelId = req?.params?.channelId;
  if (!channelId) {
    res.send(400);
    return;
  }
  getDuck(channelId).then((name) => {
    res.send(200, { name, channelId });
  });
});
