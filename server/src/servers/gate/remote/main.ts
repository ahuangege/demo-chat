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

    async enterRoom(roomName: string) {
        return this.hallMgr.enterRoom(roomName);
    }

    async delRoom(roomName: string) {
        this.hallMgr.delRoom(roomName);
    }
}