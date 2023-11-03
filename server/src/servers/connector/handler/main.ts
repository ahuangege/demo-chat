import { Application, Session, app } from "mydog";

export default class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 进入房间
     */
    async enterRoom(msg: { "roomName": string, "nickname": string, "headId": number }, session: Session, next: Function) {
        const info = await this.app.rpc("gate").gate.main.enterRoom(msg.roomName);

        let tmpMsg = {
            "roomId": info.roomId,
            "uid": info.uid,
            "sid": session.sid,
            "nickname": msg.nickname,
            "headId": msg.headId
        };
        const roomInfo = await this.app.rpc(info.chatSvr).chat.main.enterRoom(tmpMsg);
        session.bind(info.uid);
        session.set({ "svr": info.chatSvr, "roomId": info.roomId });
        next(roomInfo);
    }
}


export function onUserLeave(session: Session) {
    if (!session.uid) {
        return;
    }
    console.log("userleave", session.uid);
    app.rpc(session.get("svr"), true).chat.main.offline({ "roomId": session.get("roomId"), "uid": session.uid, "sid": session.sid });
}
