// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Main } from "./main";

const { ccclass, property } = cc._decorator;

@ccclass
export class MsgPrefab extends cc.Component {

    init(info: I_chatMsg) {
        this.node.getChildByName("head").getComponent(cc.Sprite).spriteFrame = Main.instance.getHeadImg(info.headId);
        this.node.getChildByName("name").getComponent(cc.Label).string = info.nickname;

        let msgLabel = this.node.getChildByName("msg").getComponent(cc.Label);
        msgLabel.string = info.msg;
        (msgLabel as any)._forceUpdateRenderData(true);
        let labelNode = msgLabel.node;
        if (labelNode.width > 631) {
            msgLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            labelNode.width = 630;
            (msgLabel as any)._forceUpdateRenderData(true);
        }
        this.node.getChildByName("msgBg").setContentSize(labelNode.width + 10, labelNode.height + 10);
        this.node.height = labelNode.height + 10 + 30;
    }
}

export interface I_chatMsg {
    uid: number,
    headId: number,
    nickname: string,
    msg: string,
}