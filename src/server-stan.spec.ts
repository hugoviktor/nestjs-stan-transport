import { ServerStan } from './server-stan';

describe('ServerStan', () => {
  it('should be defined', () => {
    expect(new ServerStan({url: "nats://localhost:4222", clientId: "libspec", clusterId: "test-cluster", group: "libs"})).toBeDefined();
  });
});
