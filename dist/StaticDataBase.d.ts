import { IExecuteFunctions } from 'n8n-workflow';
export declare abstract class StaticDataBase {
    private execFns;
    constructor(execFns: IExecuteFunctions);
    protected get global(): import("n8n-workflow").IDataObject;
    protected get node(): import("n8n-workflow").IDataObject;
}
