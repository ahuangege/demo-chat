import { Application } from "mydog";
import { DicObj, e_svrType } from "../config/someConfig";


export class HallMgr {
    private app: Application;
    private uid: number = 1;
    private roomId: number = 1;
    private rooms: DicObj<{ "roomId": number, "chatSvr": string }> = {};

    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 请求进入房间
     */
    enterRoom(roomName: string, cb: (err: boolean, info: { "code": number, "uid": number, "roomId": number, "chatSvr": string }) => void) {
        let room = this.rooms[roomName];
        if (room) {
            return cb(false, { "code": 0, "uid": this.uid++, "roomId": room.roomId, "chatSvr": room.chatSvr });
        }

        let svrs = this.app.getServersByType(e_svrType.chat);
        let svr = svrs[Math.floor(Math.random() * svrs.length)];
        let roomId = this.roomId++;
        let uid = this.uid++;
        this.app.rpc(svr.id).chat.main.newRoom(roomId, roomName, (err) => {
            if (err) {
                return cb(false, { "code": 1 } as any);
            }
            this.rooms[roomName] = { "roomId": roomId, "chatSvr": svr.id };
            cb(false, { "code": 0, "uid": uid, "roomId": roomId, "chatSvr": svr.id });
        });
    }

    /**
     * 删除房间
     */
    delRoom(roomName: string) {
        delete this.rooms[roomName];
    }
}