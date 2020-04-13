✨ NATS Streaming Server and Client transport modules for NestJS
=====

[![](https://badgen.net/npm/v/nestjs-stan-transport)](https://www.npmjs.com/package/nestjs-stan-transport) ![](https://badgen.net/npm/dt/nestjs-stan-transport) 

Library that implements NATS Streaming server(subscriber) and client(publisher) transport using NestJS and his Microservices library.

## ⭐️ Features
* **ClientStan**: A class that implements Nest's ClientProxy to emit event to NATS Streaming.
* **ServerStan**: A class that implements Nest's CustomTransportStrategy to listen to events from NATS Streaming.



## 📖 Contents

- [Installation](#-installation)
- [Usage](#usage)
  - [Importing](#importing)
  - [Event emitter](#event-emitter)
  - [Event Listener](#event-listener)


## 🛠 Installation
```bash
npm install nestjs-stan-transport --save
```

## Usage

### Importing

For publishing:

app.module.ts
```ts
import { Module } from '@nestjs/common';
import { StanTransportModule } from 'nestjs-stan-transport';

@Module({
  imports: [
    StanTransportModule.forRoot({
            url: 'nats://localhost:4222',
            group: 'user.workers',
            clusterId: 'test-cluster',
            clientId: 'user-service-publisher',
        },
  ],
})
export class ApplicationModule {}
```

For custom transport strategy(subscriber)
main.ts
```ts


import {NestFactory} from '@nestjs/core';
import {ServerStan} from "nestjs-stan-transport";
import {AppModule} from './app.module';

async function bootstrap() {

    const options = {
        strategy: new ServerStan({
            url: 'nats://localhost:4222',
            group: 'user.workers',
            clusterId: 'test-cluster',
            clientId: 'user-service',
        })
    }

    const app = await NestFactory.createMicroservice(AppModule, options)
    await app.listen(() => logger.log('Microservice is listening'));
}

bootstrap();

```
For Cluster connection provide a comma-separated URL string:
```ts
const options = {
        strategy: new ServerStan({
            url: 'nats://server1:4222,nats://server2:4222',
            group: 'user.workers',
            clusterId: 'test-cluster',
            clientId: 'user-service',
        })
    }
```





### Event emitter
For emit events to NATS Streaming inject the ClientStan instance:

```ts
import { ClientStan } from "nestjs-stan-transport";

export class UserPublisherService  {

    constructor(
        private readonly client: ClientStan,
    ) {}

    async execute(event: UserCreatedEventModel) {
        this.client.emit('UserCreatedEventSubject', event);
    }

}
```

### Event Listener
Use @EventPattern annotation if you want to listen a specific event.

```ts
import { EventPattern } from '@nestjs/microservices';

export class UserHanlderService  {

   
    @EventPattern('UserCreatedEventSubject')
    async handleEvent(event: UserCreatedDto) {
        this.client.emit('UserCreatedEventSubject', event);
    }

}
```

## 📝 Stay in touch

- Author - [VictorHugo](https://twitter.com/victicod)
