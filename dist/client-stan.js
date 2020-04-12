"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var ClientStan_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const constants_1 = require("@nestjs/microservices/constants");
const stan = require("node-nats-streaming");
const shortid_1 = require("shortid");
let ClientStan = ClientStan_1 = class ClientStan extends microservices_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new common_1.Logger(ClientStan_1.name);
        this.servers = [];
        this.url = options.url || 'nats://localhost:4222';
        this.servers = this.url.split(',');
        this.group = options.group;
        this.clientId = options.clientId;
        this.clusterId = options.clusterId;
    }
    close() {
        this.client && this.client.close();
        this.client = null;
        this.connection = null;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('Connecting...');
            if (this.client) {
                return this.connection;
            }
            this.client = yield this.createStanClient(`${this.clientId}-${shortid_1.generate()}`);
            this.handleError(this.client);
            this.connection = this.client;
            return this.connection;
        });
    }
    dispatchEvent(packet) {
        const pattern = this.normalizePattern(packet.pattern);
        delete packet.data.time;
        const serializedPacket = this.serialize(packet);
        this.logger.log('Pattern');
        this.logger.log(pattern);
        this.logger.log('Serial pack');
        this.logger.log(serializedPacket);
        return new Promise((resolve, reject) => this.client.publish(pattern, serializedPacket, (err, guid) => {
            let val = null;
            val = guid;
            return err ? reject(err) : resolve(val);
        }));
    }
    publish(partialPacket, callback) {
        const packet = this.assignPacketId(partialPacket);
        this.logger.log('Publish');
        return () => {
            this.client.publish(partialPacket.pattern, packet, err => err && callback({ err }));
        };
    }
    serialize(packet) {
        try {
            return JSON.stringify(packet.data);
        }
        catch (e) {
            return packet.data;
        }
    }
    createStanClient(clientId) {
        this.logger.log(`Trying connect to ${this.url}`);
        const client = stan.connect(this.clusterId, clientId, {
            servers: this.servers,
        });
        this.handleError(client);
        return new Promise(resolve => client.on('connect', () => {
            this.logger.log("Conectado");
            resolve(client);
        }));
    }
    handleError(client) {
        client.addListener(constants_1.ERROR_EVENT, (err) => this.logger.error(err));
    }
};
ClientStan = ClientStan_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], ClientStan);
exports.ClientStan = ClientStan;
