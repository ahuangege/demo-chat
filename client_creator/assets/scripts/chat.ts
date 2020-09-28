import { cmd } from "./cmdClient";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { I_enterBack } from "./login";
import { I_chatMsg, MsgPrefab } from "./msgPrefab";
import { network } from "./network";

const { ccclass, property } = cc._decorator;

@ccclass
export class Chat extends cc.Component {

    private players: { [uid: number]: { "uid": number, "nickname": string, "headId": number } } = {};
    private meUid = 0;
    private num = 0;
    @property(cc.Label)
    private numLabel: cc.Label = null;      // 人数label
    @property(cc.EditBox)
    private chatEdit: cc.EditBox = null;    // 消息输入框

    @property(cc.Prefab)
    private playerPrefab: cc.Node = null;   // 玩家名字prefab
    @property(cc.Node)
    private playerParent: cc.Node = null;     // 玩家名字父节点


    @property(cc.Prefab)
    private msgMePrefab: cc.Node = null;      // 我的消息prefab
    @property(cc.Prefab)
    private msgOtherPrefab: cc.Node = null;   // 他人消息prefab
    @property(cc.Node)
    private msgParent: cc.Node = null;      // 消息父节点


    init(msg: I_enterBack) {
        this.meUid = msg.uid;
        cc.find("top/roomName", this.node).getComponent(cc.Label).string = msg.roomName;

        for (let one of msg.players) {
            this.svr_onNewPlayer(one);
        }

        network.addHandler(cmd.onNewPlayer, this.svr_onNewPlayer, this);
        network.addHandler(cmd.onOneLeave, this.svr_onOneLeave, this);
        network.addHandler(cmd.onChat, this.svr_onChat, this);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    // 新玩家
    private svr_onNewPlayer(msg: { "uid": number, "nickname": string, "headId": number }) {
        this.players[msg.uid] = msg;

        let node = cc.instantiate(this.playerPrefab);
        node.parent = this.playerParent
        node.name = msg.uid.toString();
        node.getComponent(cc.Label).string = msg.nickname;
        this.num++;
        this.numLabel.string = this.num + "人";
    }

    // 玩家离开
    private svr_onOneLeave(msg: { "uid": number }) {
        delete this.players[msg.uid];

        let node = this.playerParent.getChildByName(msg.uid.toString());
        if (node) {
            node.destroy();
        }
        this.num--;
        this.numLabel.string = this.num + "人";
    }

    // 聊天消息
    private svr_onChat(msg: I_chatMsg) {
        let player = this.players[msg.uid];
        if (!player) {
            return;
        }
        msg.headId = player.headId;
        msg.nickname = player.nickname;
        let node = cc.instantiate(msg.uid === this.meUid ? this.msgMePrefab : this.msgOtherPrefab);
        node.parent = this.msgParent;
        node.getComponent(MsgPrefab).init(msg);

        let childs = this.msgParent.children;
        if (childs.length > 100) {
            for (let i = 0; i < 20; i++) {
                childs[i].destroy();
            }
        }
    }

    // 发送消息
    btn_send() {
        this.scheduleOnce(() => {
            this.chatEdit.focus();
        }, 0.2);

        if (this.chatEdit.string === "") {
            return;
        }
        network.sendMsg(cmd.chat_main_chat, { "msg": this.chatEdit.string });
        this.chatEdit.string = "";
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        if (event.keyCode === cc.macro.KEY.enter) {
            this.chatEdit.focus();
        }
    }

    onDestroy() {
        network.removeThisHandlers(this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }
}
