import { DynamicModule } from "@nestjs/common";
import { StanTransportOptions } from "./stan-transport-options.interface";
export declare class StanTransportModule {
    static forRoot(options: StanTransportOptions): DynamicModule;
}
