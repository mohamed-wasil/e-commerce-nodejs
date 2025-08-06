import { DeleteResult, Document, Model, Types } from "mongoose";
import { IBaseFindOptions, IFindOneAndUpdate, IFindOneOptions, IFindOptions, IRepository, IupdateManyOptions } from "../Types/Interfaces";



abstract class DatabaseService<TDocument> implements IRepository<TDocument> {
    constructor(protected __model: Model<TDocument>) { }

    async create(document: Partial<TDocument>): Promise<TDocument> {
        return await this.__model.create(document)
    }

    async findById(_id: Types.ObjectId, {
        select = '',
        populateArray = []
    }: IBaseFindOptions<TDocument> = {}): Promise<TDocument | null> {
        return await this.__model.findById(_id).select(select || '').populate(populateArray)
    }
    async findOne({
        filters,
        select = '',
        populateArray = []
    }: IFindOneOptions<TDocument>): Promise<TDocument | null> {
        return await this.__model.findOne(filters).select(select).populate(populateArray)
    }

    async find({
        filters,
        select = '',
        populateArray = []
    }: IFindOptions<TDocument>): Promise<TDocument[]> {
        return await this.__model.find(filters || {}).select(select).populate(populateArray)
    }

    async deleteOne({
        filters
    }: IFindOneOptions<TDocument>): Promise<Object> {
        return await this.__model.deleteOne(filters)
    }
    async findOneAndDelete({
        filters,
        select = '',
        populateArray = []
    }: IFindOneOptions<TDocument>): Promise<TDocument | null> {
        return await this.__model.findOneAndDelete(filters).select(select).populate(populateArray)
    }
    async findOneAndUpdate({
        filters,
        setData = {},
        pushData = {},
        pullData = {},
        unsetFields = [],
        incData = {},
        addToSetData = {},
        options = {},
        select = '',
        populateArray = []
    }: IFindOneAndUpdate<TDocument>): Promise<TDocument | null> {
        const updateQuery: any = {};

        if (Object.keys(setData).length) updateQuery.$set = setData;
        if (Object.keys(pushData).length) updateQuery.$push = pushData;
        if (Object.keys(pullData).length) updateQuery.$pull = pullData;
        if (Object.keys(incData).length) updateQuery.$inc = incData;
        if (Object.keys(addToSetData).length) updateQuery.$addToSet = addToSetData;

        if (unsetFields.length) {
            updateQuery.$unset = unsetFields.reduce((acc, field) => {
                acc[field] = "";
                return acc;
            }, {} as Record<string, string>);
        }

        return await this.__model
            .findOneAndUpdate(filters, updateQuery, { new: true, ...options })
            .select(select)
            .populate(populateArray);
    }

    async deleteMany({
        filters
    }: IFindOneOptions<TDocument>): Promise<DeleteResult> {
        return await this.__model.deleteMany(filters)
    }

    async updateMany({
        filters,
        setData = {},
        unsetFields = []
    }: IupdateManyOptions<TDocument>): Promise<Object> {
        const unsetObject = unsetFields.reduce((acc, field) => {
            acc[field] = "";
            return acc;
        }, {} as Record<string, string>);

        return await this.__model.updateMany(filters, {
            ...(Object.keys(setData).length && { $set: setData }),
            ...(unsetFields.length && { $unset: unsetObject })
        });
    }

}

export default DatabaseService;