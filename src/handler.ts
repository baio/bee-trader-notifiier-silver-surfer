/// <reference path="../typings/tsd.d.ts" />
var request = require("request");

export function handle (log: logger.ILogger, pubHub: pubSub.IPubSub) {
  log.write({oper: "handle", status: "start"});
  console.log(">>>handler.ts:6", process.env.IMPORTIO_URL);
  request.get({url: process.env.IMPORTIO_URL, json: true}, (err, resp, body) => {
    if (!err) {
      log.write({oper: "handle", status: "received"});
      console.log(">>>handler.ts:10", body);
      var data = body.results.map((m: any) => {
        return {
          "id" : m.value_1 + "_" + m.value_2 + "_" + m.value_3,
          "source" : "silver-surfer",
          data : {
            "time": m.value_1,
            "ticket": m.value_2,
            "oper": m.value_3 == "Продавать" ? "sell" : "buy",
            "stop": m.number ? m.number : null,
            "force": m.value_4 && m.value_4 != "Штиль" ? parseInt(m.value_4) : null
          }
        }
      });

      log.write({oper: "handle", status: "mapped", data : data});
      data.forEach((m) => pubHub.pub(m));

    }
  });

}

