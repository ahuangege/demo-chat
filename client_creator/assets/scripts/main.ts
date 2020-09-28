import { Chat } from "./chat";
import { I_enterBack } from "./login";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { network } from "./network";

const { ccclass, property } = cc._decorator;

@ccclass
export class Main extends cc.Component {
    public static instance: Main = null;

    @property(cc.String)
    host: string = "127.0.0.1";
    @property(cc.String)
    port: number = 4001;

    @property(cc.SpriteFrame)
    private headImg1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private headImg2: cc.SpriteFrame = null;

    onLoad() {
        Main.instance = this;
        this.node.getChildByName("loginPanel").active = true;
        this.node.getChildByName("chatPanel").active = false;
    }

    update(dt) {
        network.readMsg();
    }


    enterRoomOk(msg: I_enterBack) {
        network.onClose(this.svr_onClose, this);
        let node = this.node.getChildByName("chatPanel");
        node.active = true;
        node.getComponent(Chat).init(msg);
    }

    private svr_onClose() {
        console.log("网络断开");
        cc.director.loadScene("main");
    }

    getHeadImg(headId: number) {
        return headId === 1 ? this.headImg1 : this.headImg2;
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}
