import { Application } from "mydog";
import { RoomMgr } from "../../../app/roomMgr";

declare global {
    interface Rpc {
        chat: {
            main: Remote,
        }
    }
}

export default class Remote {
    private roomMgr: RoomMgr;
    constructor(app: Application) {
        this.roomMgr = app.get<RoomMgr>("roomMgr");
    }

    async newRoom(roomId: number, roomName: string) {
        this.roomMgr.newRoom(roomId, roomName);
        return true;
    }

    async enterRoom(info: { "roomId": number, "uid": number, "sid": string, "nickname": string, "headId": number }) {
        let room = this.roomMgr.getRoom(info.roomId);
        return room.enterRoom(info);
    }

    async offline(info: { roomId: number, uid: number, sid: string }) {
        let room = this.roomMgr.getRoom(info.roomId);
        room.offline(info);
    }
}