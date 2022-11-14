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

    newRoom(roomId: number, roomName: string, cb: (err: boolean) => void) {
        this.roomMgr.newRoom(roomId, roomName);
        cb(false);
    }

    enterRoom(info: { "roomId": number, "uid": number, "sid": string, "nickname": string, "headId": number }, cb: (err: boolean, info: any) => void) {
        let room = this.roomMgr.getRoom(info.roomId);
        cb(false, room.enterRoom(info));
    }

    offline(info: { roomId: number, uid: number, sid: string }) {
        let room = this.roomMgr.getRoom(info.roomId);
        room.offline(info);
    }
}