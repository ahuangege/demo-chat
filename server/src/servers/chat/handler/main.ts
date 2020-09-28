import { Application, Session } from "mydog";
import { RoomMgr } from "../../../app/roomMgr";

export default class Handler {
    private roomMgr: RoomMgr;
    constructor(app: Application) {
        this.roomMgr = app.get<RoomMgr>("roomMgr");
    }

    /**
     * 聊天
     */
    chat(msg: { "msg": string }, session: Session, next: Function) {
        let room = this.roomMgr.getRoom(session.get("roomId"));
        room.chat({ "uid": session.uid, "msg": msg.msg });
    }
}
