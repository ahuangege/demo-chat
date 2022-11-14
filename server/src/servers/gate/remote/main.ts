import { Application } from "mydog";
import { HallMgr } from "../../../app/hallMgr";

declare global {
    interface Rpc {
        gate: {
            main: Remote,
        }
    }
}

export default class Remote {
    private hallMgr: HallMgr;
    constructor(app: Application) {
        this.hallMgr = app.get<HallMgr>("hallMgr");
    }

    enterRoom(roomName: string, cb: (err: boolean, info: { "code": number, "uid": number, "roomId": number, "chatSvr": string }) => void) {
        this.hallMgr.enterRoom(roomName, cb);
    }

    delRoom(roomName: string) {
        this.hallMgr.delRoom(roomName);
    }
}