import { ClientStan } from '../src/client-stan';

describe('ClientStan', () => {
  const client = new ClientStan({url: "nats://localhost:4222", clientId: "libspec", clusterId: "test-cluster", group: "libs"});

  const pattern = 'TestEvent';
  const msg = { pattern, data: 'data' };

  describe('publish' ,() => {
    client.emit<any>(pattern, msg)

  })
});

