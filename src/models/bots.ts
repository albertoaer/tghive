import { Model } from "./common";

export interface DbBot {
    name: string;
    token: string;
}

export class Bots extends Model<DbBot> {
    async tokenOf(name: string): Promise<string | null> {
        const bot = await this.find({name});
        if (bot) return bot.token;
        return null;
    }
}