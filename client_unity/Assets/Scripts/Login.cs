using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Login : MonoBehaviour
{
    public InputField roomNameInput;
    public InputField nicknameInput;

    private bool isLogining = false;

    public void Btn_enter()
    {
        if (roomNameInput.text.Length == 0)
        {
            return;
        }
        if (nicknameInput.text.Length == 0)
        {
            return;
        }
        if (isLogining)
        {
            return;
        }
        isLogining = true;
        SocketClient.OnOpen(Svr_onGateOpen);
        SocketClient.OnClose(Svr_onGateClose);
        SocketClient.Connect(Main.instance.host, Main.instance.port);
    }


    // gate服连接成功，获取网关
    private void Svr_onGateOpen(string msg)
    {
        SocketClient.AddHandler(Cmd.gate_main_getCon, Svr_getConBack);
        SocketClient.SendMsg(Cmd.gate_main_getCon);
    }
    // gate服连接断开
    private void Svr_onGateClose(string msg)
    {
        print("gate close");
        isLogining = false;
    }

    // 获取网关成功，连接网关
    private void Svr_getConBack(string _msg)
    {
        var msg = JsonUtility.FromJson<Proto.GetConBack>(_msg);
        SocketClient.OnOpen(Svr_onConOpen);
        SocketClient.OnClose(Svr_onConClose);
        SocketClient.Connect(msg.host, msg.port);
    }
    // 网关服连接成功，请求登录
    private void Svr_onConOpen(string msg)
    {
        SocketClient.AddHandler(Cmd.connector_main_enterRoom, Svr_enterBack);
        int headId = 1;
        foreach (Transform trsm in transform.Find("head"))
        {
            if (trsm.GetComponent<Toggle>().isOn)
            {
                headId = int.Parse(trsm.name);
                break;
            }
        }

        var data = new Proto.EnterRoomReq();
        data.roomName = roomNameInput.text;
        data.nickname = nicknameInput.text;
        data.headId = headId;
        SocketClient.SendMsg(Cmd.connector_main_enterRoom, data);
    }
    // 网关服连接断开
    private void Svr_onConClose(string msg)
    {
        print("connector close");
        isLogining = false;
    }
    // 登录回调
    private void Svr_enterBack(string _msg)
    {
        var msg = JsonUtility.FromJson<Proto.EnterRoomRsp>(_msg);
        if (msg.code != 0)
        {
            print("登录失败");
            isLogining = false;
            SocketClient.DisConnect();
            return;
        }
        Main.instance.EnterRoomBack(msg);
        Destroy(gameObject);
    }

    private void OnDestroy()
    {
        SocketClient.RemoveThisHandlers(this);
    }
}
