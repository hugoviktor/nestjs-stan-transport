import {Injectable, Logger} from '@nestjs/common';
import {ClientProxy, ReadPacket, WritePacket} from '@nestjs/microservices';
// tslint:disable-next-line:no-submodule-imports
import {ERROR_EVENT} from '@nestjs/microservices/constants';
import * as stan from 'node-nats-streaming';

import {generate} from 'shortid';
import {StanTransportOptions} from "./stan-transport-options.interface";


@Injectable()
export class ClientStan extends ClientProxy {
    private readonly logger = new Logger(ClientStan.name);
    private readonly url: string;
    private readonly clientId: string;
    private readonly clusterId: string;
    private client: stan.Stan;
    private readonly group: string;
    protected connection: stan.Stan;
    private readonly servers: string[] = [];

    constructor(private readonly options: StanTransportOptions) {
        super();
        this.url = options.url || 'nats://localhost:4222';
        this.servers = this.url.split(',')

        this.group = options.group;
        this.clientId = options.clientId;
        this.clusterId = options.clusterId;
    }

    close(): any {
        this.client && this.client.close();
        this.client = null;
        this.connection = null;
    }

    async connect(): Promise<any> {
        this.logger.log('Connecting...');
        if (this.client) {
            return this.connection;
        }
        this.client = await this.createStanClient(`${this.clientId}-${generate()}`);
        this.handleError(this.client);

        this.connection = this.client
        return this.connection;
    }

    protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T> {
        const pattern = this.normalizePattern(packet.pattern);
        delete packet.data.time
        const serializedPacket = this.serialize(packet);
        this.logger.log('Pattern');
        this.logger.log(pattern);
        this.logger.log('Serial pack');
        this.logger.log(serializedPacket);

        return new Promise((resolve, reject) =>
            this.client.publish(pattern, serializedPacket as any, (err, guid) => {
                    let val: any = null;
                    val = guid;
                    return err ? reject(err) : resolve(val);
                }
            ),
        );
    }

    protected publish(partialPacket: ReadPacket<any>, callback: (packet: WritePacket) => any,
    ): Function {
        const packet = this.assignPacketId(partialPacket);
        this.logger.log('Publish');
        return () => {
            this.client.publish(
                partialPacket.pattern,
                packet as any,
                err => err && callback({err}),
            );
        };
    }

    public serialize(packet: ReadPacket): any {
        try {
            return JSON.stringify(packet.data);
        } catch (e) {
            return packet.data;
        }
    }

    public createStanClient(clientId: string): Promise<stan.Stan> {
        this.logger.log(`Trying connect to ${this.url}`);

        const client = stan.connect(this.clusterId, clientId, {
            servers: this.servers,
        });
        this.handleError(client);
        return new Promise(resolve =>
            client.on('connect', () => {
                    this.logger.log("Conectado");
                    resolve(client)
                }
            ),
        );
    }

    public handleError(client: stan.Stan) {
        client.addListener(
            ERROR_EVENT,
            (err: any) => this.logger.error(err),
        );
    }


}
