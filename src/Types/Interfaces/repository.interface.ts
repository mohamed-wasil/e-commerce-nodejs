import { FilterQuery, PopulateOptions, Types, UpdateQuery } from "mongoose";

export interface IRepository<TDocument> {
    create(document: Partial<TDocument>): Promise<TDocument>;
    findById(_id: Types.ObjectId, options?: {
        select?: string;
        populate?: PopulateOptions;
    }): Promise<TDocument | null>;
    findOne({
        filters,
        select,
        populateArray
    }: IFindOneOptions<TDocument>): Promise<TDocument | null>

    find({
        filters,
        select,
        populateArray
    }: IFindOptions<TDocument>): Promise<TDocument[]>

    deleteOne({
        filters
    }: IFindOneOptions<TDocument>): Promise<Object>

    findOneAndDelete({
        filters,
        select,
        populateArray
    }: IFindOneOptions<TDocument>): Promise<TDocument | null>

    deleteMany({
        filters
    }: IFindOneOptions<TDocument>): Promise<Object>
}

export interface IBaseFindOptions<TDocument> {
    select?: string;
    populateArray?: PopulateOptions[];
}

export interface IFindOptions<TDocument> extends IBaseFindOptions<TDocument> {
    filters?: FilterQuery<TDocument>;
}

export interface IFindOneOptions<TDocument> extends IBaseFindOptions<TDocument> {
    filters: FilterQuery<TDocument>;
}

export interface IFindOneAndUpdate<TDocument> extends IFindOneOptions<TDocument> {
    setData?: Record<string, any>;
    pushData?: Record<string, any>;
    options?: Record<string, any>;
    pullData?: Record<string, any>;
    incData?: Record<string, number>;
    addToSetData?: Record<string, any>;
    unsetFields?: string[];
}

export interface IupdateManyOptions<TDocument> {
    filters: FilterQuery<TDocument>,
    setData?: UpdateQuery<TDocument>,
    unsetFields?: string[]
}
