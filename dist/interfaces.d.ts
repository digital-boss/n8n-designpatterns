import { OptionsWithUri } from 'request';
export interface IHttpClient {
    request: (opts: OptionsWithUri) => Promise<any>;
}
export declare type ItemExecFn = (itemIndex: number) => Promise<any>;
export interface IExecItemDependance {
    itemIndex: number;
    updateIndex: (itemIndex: number) => void;
}
