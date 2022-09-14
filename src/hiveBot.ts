import TelegramBot from "node-telegram-bot-api";
import { openHive, HiveConfig, HiveResult, defaultHiveConfig } from "./hive";
import { onExit, Config, fillConfig, ValidConfig } from "./utils";

export interface HiveBotConfig extends HiveConfig {
    keepChat: boolean,
    keepMessages: boolean,
}

export const defaultHiveBotConfig = {
    keepChat: true,
    keepMessages: false,
    ...defaultHiveConfig
}

function getTgBot(token: string, config: ValidConfig<HiveBotConfig>): TelegramBot {
    const tg = new TelegramBot(token, { polling: true });

    if (config.keepChat) tg.on('message', msg => config.db.chats.saveOrUpdate(msg.chat, 'chatId'));
    if (config.keepMessages) tg.on('message', msg => config.db.messages.save(msg));

    onExit(async () => {
        await tg.stopPolling();
        await tg.close();
    });

    return tg;
}

export interface HiveBotResult extends HiveResult {
    tgBot: TelegramBot;
}

export async function hiveBot(name: string, config: Config<HiveBotConfig, typeof defaultHiveBotConfig>): Promise<HiveBotResult> {
    const filledConfig = fillConfig(config, { ...defaultHiveBotConfig });
    const token = await config.db.bots.tokenOf(name);
    if (!token)
        throw new Error("Bot does not exists");
    return { tgBot: getTgBot(token, filledConfig), ...await openHive(config) };
}