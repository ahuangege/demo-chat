export const enum cmd {
	/**
	 * 获取一个网关
	 */
	gate_main_getCon = 0,
	/**
	 * 进入房间
	 */
	connector_main_enterRoom = 1,
	/**
	 * 聊天
	 */
	chat_main_chat = 2,
	/**
	 * 聊天消息
	 */
	onChat = 3,
	/**
	 * 新玩家
	 */
	onNewPlayer = 4,
	/**
	 * 玩家离开房间
	 */
	onOneLeave = 5,
}