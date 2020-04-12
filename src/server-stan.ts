import {CustomTransportStrategy, PacketId, ReadPacket, Server} from '@nestjs/microservices';
import * as stan from 'node-nats-streaming';
// tslint:disable-next-line:no-duplicate-imports
import {Message} from "node-nats-streaming";
import {Observable} from 'rxjs';
import { generate } from 'shortid';
import {StanTransportOptions} from "./stan-transport-options.interface";


export class ServerStan extends Server implements CustomTransportStrategy {
    private readonly url: string;
    private readonly groupName: string;
    private readonly clusterId: string;
    private readonly clientId: string;
    private consumer: stan.Stan;
    private readonly servers: string[] = [];

    constructor(private readonly options: StanTransportOptions) {
        super();
        this.url = options.url || 'nats://localhost:4222';
        this.servers = this.url.split(',');
        this.groupName = options.group;
        this.clusterId = options.clusterId;
        this.clientId = options.clientId;
    }

    public close() {
        // tslint:disable-next-line:no-unused-expression
        this.consumer && this.consumer.close();
    }

    public async listen(callback: () => void) {
        this.consumer = await this.createStanClient(`${this.clientId}-${generate()}`);

        this.start(callback);
    }

    public start(callback?: () => void) {
        this.bindEvents(this.consumer);
        callback();
    }

    public bindEvents(consumer: stan.Stan) {
        const registeredPatterns = Array.from(this.messageHandlers.keys());
        registeredPatterns.forEach(pattern => {
            const channel = pattern;

            // TODO: Add opts
            const opts = this.consumer.subscriptionOptions()
            opts.setDeliverAllAvailable()
            opts.setDurableName('durable-' + pattern)
            const subscription = consumer.subscribe(channel, this.groupName, opts);
            subscription.on(
                'message',
                (msg) =>
                    this.getMessageHandler(channel, this.consumer, msg)
                ,
            );
        });
    }


    /*public getMessageHandler(channel: string, client: stan.Stan, buffer: Message): Function {
          this.handleMessage(channel, buffer, client);
    }*/

    public async getMessageHandler(channel: string, client: stan.Stan, msg: Message) {
        const buffer =  await this.handleMessage(channel, msg, client);
        return buffer
    }

    public async handleMessage(
        channel: string,
        rawMessage: Message,
        client: stan.Stan,
    ) {
        const pattern = channel;
        const message = this.serialize(rawMessage);
        const publish = this.getPublisher(
            client,
            'ReplyMessageEvent',
            rawMessage.getSequence(),
        );

        const handler = this.getHandlerByPattern(channel);
        if (!handler) {
            this.logger.log('No hay manejador para el patron')
            // return publish({id: message.id, status, err: 'No hay manejador para el patron'});
        }

        const response$ = this.transformToObservable(
            await handler(message),
        ) as Observable<any>;
        // tslint:disable-next-line:no-unused-expression
        response$ && this.send(response$, publish);
    }

    public getPublisher(publisher: stan.Stan, replyTo: string, id: number) {
        return (response: any) => {
            Object.assign(response, { id });
            const outgoingResponse = this.serialize(response);
            // const res =  publisher.publish(replyTo, outgoingResponse);
            return new Uint8Array();
        };
    }

    /*public getPublisher(publisher: stan.Stan, replyTo: string, id: number) {
        return response =>
            publisher.publish(this.getResQueueName(replyTo, id+''), Object.assign(
                response,
                { id },
            ) as any);
    }*/


    public serialize(content): any {
        try {
            return JSON.parse(content.getData());
        } catch (e) {
            return content;
        }
    }



    /* public getAckQueueName(pattern: string): string {
         return `${pattern}_ack`;
     }
*/
    public getResQueueName(pattern: string, id: string): string {
        return `${pattern}_${id}_res`;
    }

    public createStanClient(clientId: string): Promise<stan.Stan> {
        this.logger.log(`Trying connect to ${this.url}`)
        const client = stan.connect(this.clusterId, clientId, {
            servers: this.servers,
        });
        this.handleError(client);
        return new Promise(resolve =>
            client.on('connect', () => resolve(client)),
        );
    }

    public handleError(stream) {
        stream.on('error', err => this.logger.error(err));
    }
}
