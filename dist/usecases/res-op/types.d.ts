import { INodeProperties } from 'n8n-workflow';
export interface INodeDescrBase<TRes extends IResourceBase<TOp>, TOp extends IOperationBase> {
    resources: Record<string, TRes>;
    models: Record<string, Array<Partial<INodeProperties>>>;
}
export interface IResourceBase<TOp extends IOperationBase> {
    operations: Record<string, TOp>;
    display?: string;
    defaultOperation?: string;
}
export interface IOperationBase {
    params: INodeProperties[];
    display?: string;
    notImplemented?: boolean;
    desc?: string;
}
export declare type TypeName = 'Root' | 'Resource' | 'Operation' | 'Param' | 'Option' | 'PropCollection';
