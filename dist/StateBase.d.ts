import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { IState } from './interfaces';
export declare class StateBase implements IState {
    itemIndex: number;
    execFns: IExecuteFunctions;
    constructor(execFns: IExecuteFunctions);
    updateIndex(itemIndex: number): void;
    getParam(name: string): any;
    getAllParams(): IDataObject;
    applyPathParams(path: string): string;
    isParamExists(name: string): boolean;
    tryGetParam(name: string): any;
}
