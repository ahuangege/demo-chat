using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class Main : MonoBehaviour
{
    public static Main instance = null;

    public string host = "127.0.0.1";
    public int port = 4001;

    public Sprite headImg1;
    public Sprite headImg2;

    void Awake()
    {
        instance = this;
        transform.Find("loginPanel").gameObject.SetActive(true);
        transform.Find("chatPanel").gameObject.SetActive(false);
    }

    // Update is called once per frame
    void Update()
    {
        SocketClient.ReadMsg();
    }

    public void EnterRoomBack(Proto.EnterRoomRsp msg)
    {
        SocketClient.OnClose(Svr_onClose);
        var trsm = transform.Find("chatPanel");
        trsm.gameObject.SetActive(true);
        trsm.GetComponent<Chat>().Init(msg);
    }

    private void Svr_onClose(string msg)
    {
        print("网路断开");
        SceneManager.LoadScene("main");
    }

    public Sprite GetHeadImg(int headId)
    {
        return headId == 1 ? headImg1 : headImg2;
    }

    private void OnApplicationQuit()
    {
        SocketClient.DisConnect();
    }

    private void OnDestroy()
    {
        SocketClient.RemoveThisHandlers(this);
    }
}
