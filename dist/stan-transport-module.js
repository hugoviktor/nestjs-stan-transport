"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StanTransportModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_stan_1 = require("./client-stan");
let StanTransportModule = StanTransportModule_1 = class StanTransportModule {
    static forRoot(options) {
        const providers = [{
                provide: client_stan_1.ClientStan,
                useValue: new client_stan_1.ClientStan(options)
            }];
        return {
            providers,
            exports: providers,
            module: StanTransportModule_1
        };
    }
};
StanTransportModule = StanTransportModule_1 = __decorate([
    common_1.Module({})
], StanTransportModule);
exports.StanTransportModule = StanTransportModule;
