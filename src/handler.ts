/// <reference path="../typings/tsd.d.ts" />
var request = require("request");
var moment = require("moment")

var latestSignal;
var pollInterval = parseInt(process.env.POLL_REQUEST_INTERVAL);

function handleOnce (log: logger.ILogger, pubHub: pubSub.IPubSub) {
  log.write({oper: "handle", status: "start"});
  console.log(">>>handler.ts:6", process.env.IMPORTIO_URL);
  request.get({url: process.env.IMPORTIO_URL, json: true}, (err, resp, body) => {
    if (!err) {
      log.write({oper: "handle", status: "received"});
      var data = body.results.map((m: any) => {
        return {
          "key" : m.value_1 + "_" + m.value_2 + "_" + m.value_3,
          "source" : "silver-surfer",
          data : {
            "time": moment.utc(m.value_1, "DD.MM.YYYY - HH:mm").toISOString(),
            "ticket": m.value_2,
            "oper": m.value_3 == "Продавать" ? "sell" : "buy",
            "stop": m.number ? m.number : null,
            "force": m.value_4 && m.value_4 != "Штиль" ? parseInt(m.value_4) : null
          }
        }
      });
      if (latestSignal)
        data = data.filter((f) => moment(f.data.time).isAfter(moment(latestSignal.data.time)));
      if (data.length) {
        latestSignal = data[0];
        log.write({oper: "handle", status: "filtered", data: data});
        data.forEach((m) => pubHub.pub(m));
      }
    }
  });
}

export function handle (log: logger.ILogger, pubHub: pubSub.IPubSub) {
  handleOnce(log, pubHub);
  setInterval(() => handleOnce(log, pubHub), pollInterval);
}

