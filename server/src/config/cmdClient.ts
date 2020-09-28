export const enum cmd {
    /**
     * 获取一个网关
     */
    gate_main_getCon = "gate.main.getCon",
    /**
     * 进入房间
     */
    connector_main_enterRoom = "connector.main.enterRoom",
    /**
     * 聊天
     */
    chat_main_chat = "chat.main.chat",
    /**
     * 聊天消息
     */
    onChat = "onChat",
    /**
     * 新玩家
     */
    onNewPlayer = "onNewPlayer",
    /**
     * 玩家离开房间
     */
    onOneLeave = "onOneLeave",
}