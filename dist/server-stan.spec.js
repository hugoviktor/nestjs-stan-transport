"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_stan_1 = require("./server-stan");
describe('ServerStan', () => {
    it('should be defined', () => {
        expect(new server_stan_1.ServerStan({ url: "nats://localhost:4222", clientId: "libspec", clusterId: "test-cluster", group: "libs" })).toBeDefined();
    });
});
