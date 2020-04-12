import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import * as stan from 'node-nats-streaming';
import { StanTransportOptions } from "./stan-transport-options.interface";
export declare class ClientStan extends ClientProxy {
    private readonly options;
    private readonly logger;
    private readonly url;
    private readonly clientId;
    private readonly clusterId;
    private client;
    private readonly group;
    protected connection: stan.Stan;
    private readonly servers;
    constructor(options: StanTransportOptions);
    close(): any;
    connect(): Promise<any>;
    protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T>;
    protected publish(partialPacket: ReadPacket<any>, callback: (packet: WritePacket) => any): Function;
    serialize(packet: ReadPacket): any;
    createStanClient(clientId: string): Promise<stan.Stan>;
    handleError(client: stan.Stan): void;
}
