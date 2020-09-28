import { Application, RpcClass, rpcErr } from "mydog";
import { RoomMgr } from "../../../app/roomMgr";

declare global {
    interface Rpc {
        chat: {
            main: RpcClass<Remote>,
        }
    }
}

export default class Remote {
    private roomMgr: RoomMgr;
    constructor(app: Application) {
        this.roomMgr = app.get<RoomMgr>("roomMgr");
    }

    newRoom(roomId: number, roomName: string, cb: (err: rpcErr) => void) {
        this.roomMgr.newRoom(roomId, roomName);
        cb(0);
    }

    enterRoom(info: { "roomId": number, "uid": number, "sid": string, "nickname": string, "headId": number }, cb: (err: rpcErr, info: any) => void) {
        let room = this.roomMgr.getRoom(info.roomId);
        cb(0, room.enterRoom(info));
    }

    offline(info: { roomId: number, uid: number, sid: string }) {
        let room = this.roomMgr.getRoom(info.roomId);
        room.offline(info);
    }
}