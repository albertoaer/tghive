import { Model } from "./common";
import { Document } from "mongodb";

export interface HiveEvent {
    sessionId: string,
    topic: string,
    data: Document,
    timestamp: number
}

export class HiveEvents extends Model<HiveEvent> {
    async retrieve(requester: string, startTime: number): Promise<HiveEvent[]> {
        return await this.findAll({
            sessionId: { $ne: requester },
            timestamp: { $gt: startTime }
        });
    }
}