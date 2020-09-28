import { cmd } from "./cmdClient";
import { Main } from "./main";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { network } from "./network";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    private roomNameEdit: cc.EditBox = null;
    @property(cc.EditBox)
    private nicknameEdit: cc.EditBox = null;

    private isLogining = false;

    btn_enter() {
        if (this.roomNameEdit.string.length === 0) {
            return;
        }
        if (this.nicknameEdit.string.length === 0) {
            return;
        }
        if (this.isLogining) {
            return;
        }
        this.isLogining = true;
        network.onOpen(this.svr_onOpen_gate, this);
        network.onClose(this.svr_onClose_gate, this);
        network.connect(Main.instance.host, Main.instance.port);
    }

    // gate服连接成功，获取网关
    private svr_onOpen_gate() {
        network.addHandler(cmd.gate_main_getCon, this.svr_getConBack, this);
        network.sendMsg(cmd.gate_main_getCon);
    }
    // gate服连接断开
    private svr_onClose_gate() {
        console.log("gate close");
        this.isLogining = false;
    }

    // 获取网关成功，连接网关
    private svr_getConBack(msg: { "host": string, "port": number }) {
        network.onOpen(this.svr_onOpen_con, this);
        network.onClose(this.svr_onClose_con, this);
        network.connect(msg.host, msg.port);
    }

    // 网关服连接成功，请求登录
    private svr_onOpen_con() {
        let headParent = this.node.getChildByName("head");
        let headId = 1;
        for (let one of headParent.children) {
            if (one.getComponent(cc.Toggle).isChecked) {
                headId = parseInt(one.name);
                break;
            }
        }
        network.addHandler(cmd.connector_main_enterRoom, this.svr_enterBack, this);
        let msg = {
            "roomName": this.roomNameEdit.string,
            "nickname": this.nicknameEdit.string,
            "headId": headId,
        }
        network.sendMsg(cmd.connector_main_enterRoom, msg);
    }
    // 网关服连接断开
    private svr_onClose_con() {
        console.log("connector close");
        this.isLogining = false;
    }

    // 登录回调
    private svr_enterBack(msg: I_enterBack) {
        if (msg.code !== 0) {
            console.log("enter fail");
            network.disconnect();
            this.isLogining = false;
            return;
        }
        Main.instance.enterRoomOk(msg);
        this.node.destroy();
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}

export interface I_enterBack {
    code: number,
    uid: number,
    roomName: string,
    players: { "uid": number, "nickname": string, "headId": number }[],
}