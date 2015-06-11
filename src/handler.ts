/// <reference path="../typings/tsd.d.ts" />
var request = require("request");

export function handle (log: logger.ILogger, pubHub: pubSub.IPubSub) {
  log.write({oper: "handle", status: "start"});
  console.log(">>>handler.ts:6", process.env.IMPORTIO_URL);
  request(process.env.IMPORTIO_URL, (err, resp, body) => {
    if (!err) {
      console.log(">>>handler.ts:8", body);
    }
  });
  //pubHub.pub();
}

