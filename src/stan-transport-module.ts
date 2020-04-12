import {DynamicModule, Module} from "@nestjs/common";
import {ClientStan} from "./client-stan";
import {StanTransportOptions} from "./stan-transport-options.interface";

@Module({})
export class StanTransportModule {
    static forRoot(
        options: StanTransportOptions
    ): DynamicModule
    {
        const providers = [{
            provide: ClientStan,
            useValue: new ClientStan(options)
        }];

        return {
            providers,
            exports: providers,
            module: StanTransportModule
        };
    }
}
