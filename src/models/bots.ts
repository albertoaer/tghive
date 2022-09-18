import { Document } from "mongodb";
import { Model } from "./common";

export type DbBot = {
    name: string;
    token: string;
} & Document;

export class Bots extends Model<DbBot> {
    async tokenOf(name: string): Promise<string | null> {
        const bot = await this.find({name});
        if (bot) return bot.token;
        return null;
    }
}