"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const microservices_1 = require("@nestjs/microservices");
const stan = require("node-nats-streaming");
const shortid_1 = require("shortid");
class ServerStan extends microservices_1.Server {
    constructor(options) {
        super();
        this.options = options;
        this.servers = [];
        this.url = options.url || 'nats://localhost:4222';
        this.servers = this.url.split(',');
        this.groupName = options.group;
        this.clusterId = options.clusterId;
        this.clientId = options.clientId;
    }
    close() {
        this.consumer && this.consumer.close();
    }
    listen(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.consumer = yield this.createStanClient(`${this.clientId}-${shortid_1.generate()}`);
            this.start(callback);
        });
    }
    start(callback) {
        this.bindEvents(this.consumer);
        callback();
    }
    bindEvents(consumer) {
        const registeredPatterns = Array.from(this.messageHandlers.keys());
        registeredPatterns.forEach(pattern => {
            const channel = pattern;
            const opts = this.consumer.subscriptionOptions();
            opts.setDeliverAllAvailable();
            opts.setDurableName('durable-' + pattern);
            const subscription = consumer.subscribe(channel, this.groupName, opts);
            subscription.on('message', (msg) => this.getMessageHandler(channel, this.consumer, msg));
        });
    }
    getMessageHandler(channel, client, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield this.handleMessage(channel, msg, client);
            return buffer;
        });
    }
    handleMessage(channel, rawMessage, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const pattern = channel;
            const message = this.serialize(rawMessage);
            const publish = this.getPublisher(client, 'ReplyMessageEvent', rawMessage.getSequence());
            const handler = this.getHandlerByPattern(channel);
            if (!handler) {
                this.logger.log('No hay manejador para el patron');
            }
            const response$ = this.transformToObservable(yield handler(message));
            response$ && this.send(response$, publish);
        });
    }
    getPublisher(publisher, replyTo, id) {
        return (response) => {
            Object.assign(response, { id });
            const outgoingResponse = this.serialize(response);
            return new Uint8Array();
        };
    }
    serialize(content) {
        try {
            return JSON.parse(content.getData());
        }
        catch (e) {
            return content;
        }
    }
    getResQueueName(pattern, id) {
        return `${pattern}_${id}_res`;
    }
    createStanClient(clientId) {
        this.logger.log(`Trying connect to ${this.url}`);
        const client = stan.connect(this.clusterId, clientId, {
            servers: this.servers,
        });
        this.handleError(client);
        return new Promise(resolve => client.on('connect', () => resolve(client)));
    }
    handleError(stream) {
        stream.on('error', err => this.logger.error(err));
    }
}
exports.ServerStan = ServerStan;
