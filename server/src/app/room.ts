import { Application } from "mydog";
import { cmd } from "../config/cmd";
import { DicObj } from "../config/someConfig";
import { RoomMgr } from "./roomMgr";


export class Room {
    private app: Application;
    private roomId: number;
    private roomName: string;
    private num = 0;
    private players: DicObj<{ "uid": number, "nickname": string, "headId": number }> = {};
    private msgGroup: DicObj<number[]> = {};

    constructor(app: Application, roomId: number, roomName: string) {
        this.app = app;
        this.roomId = roomId;
        this.roomName = roomName;
    }

    /**
     * 进入房间
     */
    enterRoom(info: { "uid": number, "sid": string, "nickname": string, "headId": number }) {
        let one = { "uid": info.uid, "nickname": info.nickname, "headId": info.headId };
        this.getMsg(cmd.onNewPlayer, one);

        this.players[one.uid] = one;
        this.num++;

        let arr = this.msgGroup[info.sid];
        if (!arr) {
            arr = [];
            this.msgGroup[info.sid] = arr;
        }
        arr.push(info.uid);

        let playerArr: any[] = [];
        for (let x in this.players) {
            playerArr.push(this.players[x]);
        }
        return {
            "code": 0,
            "uid": info.uid,
            "roomName": this.roomName,
            "players": playerArr,
        };
    }

    /**
     * 离开房间
     */
    offline(info: { "uid": number, "sid": string }) {
        delete this.players[info.uid];
        this.num--;
        let arr = this.msgGroup[info.sid];
        if (arr) {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i] === info.uid) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
        this.getMsg(cmd.onOneLeave, { "uid": info.uid });

        if (this.num === 0) {
            this.app.get<RoomMgr>("roomMgr").delRoom(this.roomId);
            this.app.rpc("gate").gate.main.delRoom(this.roomName);
        }
    }

    /**
     * 聊天
     */
    chat(info: { "uid": number, "msg": string }) {
        this.getMsg(cmd.onChat, info);
    }

    /**
     * 获取人数
     */
    getUserNum() {
        return this.num;
    }

    private getMsg(route: cmd, msg: any = null) {
        this.app.sendMsgByGroup(route, msg, this.msgGroup);
    }
}