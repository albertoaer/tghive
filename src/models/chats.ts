import { Document } from "mongodb";
import TelegramBot, { Chat } from "node-telegram-bot-api";
import { SavableModel } from "./common";

export interface DbGroup {
    groupName?: string;
}

export interface DbUser {
    firstName?: string;
    lastName?: string;
}

export type DbChat = {
    name?: string;
    alias?: string;
    id: number;
    via: TelegramBot.ChatType;
    knownBots: string[]
} & (DbGroup | DbUser) & Document;

export class Chats extends SavableModel<DbChat, Chat> {
    convert(item: Chat): DbChat {
        const base = {
            id: item.id,
            via: item.type,
            name: item.username,
            knownBots: []
        };
        if (item.type === 'private') {
            return {
                ...base,
                firstName: item.first_name,
                lastName: item.last_name
            }
        } else {
            return { ...base, groupName: item.title}
        }
    }

    async knowsBot(filter: Partial<Chat>, botToken: string): Promise<boolean> {
        return (await this.find(filter))?.knownChats.includes(botToken) ?? false;
    }

    async includeBot(filter: Partial<Chat>, botToken: string): Promise<void> {
        await this.collection.updateOne(filter, {$addToSet: {knownBots: botToken}});
    }
}