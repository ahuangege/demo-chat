import { Application, Session } from "mydog";

export default class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 进入房间
     */
    enterRoom(msg: { "roomName": string, "nickname": string, "headId": number }, session: Session, next: Function) {
        this.app.rpc("gate").gate.main.enterRoom(msg.roomName, (err, info) => {
            if (err || info.code !== 0) {
                return next({ "code": 1, "info": "服务器错误" });
            }
            let tmpMsg = {
                "roomId": info.roomId,
                "uid": info.uid,
                "sid": session.sid,
                "nickname": msg.nickname,
                "headId": msg.headId
            };
            this.app.rpc(info.chatSvr).chat.main.enterRoom(tmpMsg, (err, roomInfo) => {
                if (err) {
                    return next({ "code": 1, "info": "服务器错误" });
                }

                session.bind(info.uid);
                session.set({ "svr": info.chatSvr, "roomId": info.roomId });
                session.setCloseCb(onUserLeave);
                next(roomInfo);
            });
        });
    }
}


function onUserLeave(app: Application, session: Session) {
    if (!session.uid) {
        return;
    }
    console.log("userleave")
    app.rpc(session.get("svr")).chat.main.offline({ "roomId": session.get("roomId"), "uid": session.uid, "sid": session.sid });
}
