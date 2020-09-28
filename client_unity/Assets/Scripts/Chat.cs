using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Chat : MonoBehaviour
{
    public static Chat instance = null;
    private Dictionary<int, Proto.PlayerInfo> players = new Dictionary<int, Proto.PlayerInfo>();
    public int meUid = 0;
    private int num = 0;
    public Text numText;                // 人数Text
    public InputField chatInput;        // 消息输入框

    public GameObject playerPrefab;  // 玩家名字prefab
    public Transform playerParent;  // 玩家名字父节点

    public GameObject msgMePrefab;     // 我的消息prefab
    public GameObject msgOtherPrefab; // 他人消息prefab
    public Transform msgParent;   // 消息父节点

    private void Awake()
    {
        instance = this;
    }

    public void Init(Proto.EnterRoomRsp msg)
    {
        meUid = msg.uid;
        transform.Find("top/roomName").GetComponent<Text>().text = msg.roomName;

        foreach (var one in msg.players)
        {
            NewPlayer(one);
        }

        SocketClient.AddHandler(Cmd.onNewPlayer, Svr_onNewPlayer);
        SocketClient.AddHandler(Cmd.onOneLeave, Svr_onOneLeave);
        SocketClient.AddHandler(Cmd.onChat, Svr_onChat);

    }

    // 新玩家
    private void Svr_onNewPlayer(string _msg)
    {
        var msg = JsonUtility.FromJson<Proto.PlayerInfo>(_msg);
        NewPlayer(msg);
    }

    private void NewPlayer(Proto.PlayerInfo msg)
    {
        players[msg.uid] = msg;
        var trsm = Instantiate(playerPrefab, playerParent).transform;
        trsm.name = msg.uid.ToString();
        trsm.GetComponent<Text>().text = msg.nickname;
        num++;
        numText.text = num + "人";
    }

    // 玩家离开
    private void Svr_onOneLeave(string _msg)
    {
        var msg = JsonUtility.FromJson<Proto.OneLeave>(_msg);
        players.Remove(msg.uid);
        var trsm = playerParent.Find(msg.uid.ToString());
        if (trsm)
        {
            Destroy(trsm.gameObject);
        }
        num--;
        numText.text = num + "人";
    }

    // 聊天消息
    private void Svr_onChat(string _msg)
    {
        var msg = JsonUtility.FromJson<Proto.ChatMsg>(_msg);
        if (!players.ContainsKey(msg.uid))
        {
            return;
        }
        var player = players[msg.uid];
        msg.headId = player.headId;
        msg.nickname = player.nickname;
        var trsm = Instantiate(msg.uid == meUid ? msgMePrefab : msgOtherPrefab, msgParent).transform;
        trsm.GetComponent<MsgPrefab>().Init(msg);

        if (msgParent.childCount > 100)
        {
            for (int i = 0; i < 20; i++)
            {
                Destroy(msgParent.GetChild(i).gameObject);
            }
        }
    }

    public void Btn_send()
    {
        if (chatInput.text == "")
        {
            return;
        }
        var msg = new Proto.MsgSend();
        msg.msg = chatInput.text;
        SocketClient.SendMsg(Cmd.chat_main_chat, msg);
        chatInput.text = "";
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Return))
        {
            if (EventSystem.current.currentSelectedGameObject != chatInput.gameObject)
            {
                chatInput.ActivateInputField();
            }
        }
    }

    private void OnDestroy()
    {
        SocketClient.RemoveThisHandlers(this);
    }
}
