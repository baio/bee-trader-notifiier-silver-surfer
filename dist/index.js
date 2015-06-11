/// <reference path="../typings/tsd.d.ts" />
var Promise = require("bluebird");
var pubSub = require("da-helpers").pubSub;
var logger = require("da-helpers").logger;
var handler = require("./handler");
var rabbitUrl = process.env.RABBITMQ_PORT_5672_TCP_ADDR ? "amqp://#{process.env.RABBITMQ_PORT_5672_TCP_ADDR}:#{process.env.RABBITMQ_PORT_5672_TCP_PORT}" : process.env.RABBITMQ_URI;
var rabbitQueue = process.env.RABBITMQ_QUEUE;
var pubHub = new pubSub.PubSubRabbit();
var mongoUrl = process.env.MONGO_PORT_27017_TCP_ADDR ?
    "mongodb://#{process.env.MONGO_PORT_27017_TCP_ADDR}:#{process.env.MONGO_PORT_27017_TCP_PORT}" :
    process.env.MONGO_LOG_URI;
var log = new logger.LoggerCompose({ pack: require("../package.json"), tags: ["trader"] }, {
    loggly: { token: process.env.LOGGLY_KEY, subdomain: process.env.LOGGLY_SUBDOMAIN },
    mongo: { connection: mongoUrl, collection: process.env.MONGO_LOG_COLLECTION },
    console: true
});
log.write({ oper: "app_start", status: "success" });
var promise = Promise.resolve();
promise.then(function () {
    pubHub.connect({
        uri: rabbitUrl,
        queue: rabbitQueue,
        type: pubSub.PubSubTypes.pub
    });
}).then(function () {
    log.write({ oper: "amqp_connected", status: "success", queue: rabbitQueue, type: "pub" });
    handler.handle(log, pubHub);
}, function (err) {
    log.write({ oper: "amqp_connected", status: "error", error: err, queue: rabbitQueue, type: "pub" });
});
