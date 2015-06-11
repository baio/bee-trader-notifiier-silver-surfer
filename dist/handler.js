/// <reference path="../typings/tsd.d.ts" />
var request = require("request");
function handle(log, pubHub) {
    log.write({ oper: "handle", status: "start" });
    console.log(">>>handler.ts:6", process.env.IMPORTIO_URL);
    request(process.env.IMPORTIO_URL, function (err, resp, body) {
        if (!err) {
            console.log(">>>handler.ts:8", body);
        }
    });
}
exports.handle = handle;
