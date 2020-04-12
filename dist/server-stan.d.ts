import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import * as stan from 'node-nats-streaming';
import { Message } from "node-nats-streaming";
import { StanTransportOptions } from "./stan-transport-options.interface";
export declare class ServerStan extends Server implements CustomTransportStrategy {
    private readonly options;
    private readonly url;
    private readonly groupName;
    private readonly clusterId;
    private readonly clientId;
    private consumer;
    private readonly servers;
    constructor(options: StanTransportOptions);
    close(): void;
    listen(callback: () => void): Promise<void>;
    start(callback?: () => void): void;
    bindEvents(consumer: stan.Stan): void;
    getMessageHandler(channel: string, client: stan.Stan, msg: Message): Promise<void>;
    handleMessage(channel: string, rawMessage: Message, client: stan.Stan): Promise<void>;
    getPublisher(publisher: stan.Stan, replyTo: string, id: number): (response: any) => Uint8Array;
    serialize(content: any): any;
    getResQueueName(pattern: string, id: string): string;
    createStanClient(clientId: string): Promise<stan.Stan>;
    handleError(stream: any): void;
}
