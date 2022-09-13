import { Collection, Document, Filter, MatchKeysAndValues } from "mongodb";

export abstract class Model<T extends Document> {
    constructor(protected collection: Collection<T>) {

    }

    async find(query?: Filter<T>): Promise<T | null> {
        return await this.collection.findOne(query || {}) as T | null;
    }

    async findAll(query?: Filter<T>): Promise<T[]> {
        return await this.collection.find(query || {}).toArray() as T[];
    }

    async insert(data: T): Promise<void> {
        await this.collection.insertOne(data as any);
    }

    async insertMany(data: T[]): Promise<void> {
        await this.collection.insertMany(data as any[]);
    }

    async update(query: Filter<T>, changes: MatchKeysAndValues<T>) {
        await this.collection.updateOne(query, {"$set": changes})
    }
    
    async updateAll(query: Filter<T>, changes: MatchKeysAndValues<T>) {
        await this.collection.updateMany(query, {"$set": changes})
    }
}

export abstract class SavableModel<T extends Document, K> extends Model<T> {
    abstract convert(item: K): T;

    async save(item: K): Promise<void> {
        await this.insert(this.convert(item) as any);
    }

    async saveMany(items: K[]): Promise<void> {
        await this.insertMany(items.map(this.convert.bind(this)) as any[]);
    }

    async saveOnce(item: K, ref: keyof T): Promise<void> {
        const s = this.convert(item);
        const query: Partial<T> = {};
        query[ref] = s[ref];
        if (!await this.find(query)) this.insert(s);
    }

    async saveOrUpdate(item: K, ref: keyof T): Promise<void> {
        const s = this.convert(item);
        const query: Partial<T> = {};
        query[ref] = s[ref];
        if (!await this.find(query)) this.insert(s);
        else this.update(query, s);
    }
}