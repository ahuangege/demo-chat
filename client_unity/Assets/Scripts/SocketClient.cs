using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Text;
using UnityEngine;
using System.Timers;

/// <summary>
/// socket静态类
/// </summary>
public static class SocketClient
{
    private static SocketClientChild nowSocket = null;                                                //当前socket
    private static List<string> route = new List<string>();                                           //路由数组
    private static Dictionary<int, Action<string>> handlers = new Dictionary<int, Action<string>>();  //路由处理函数
    private static List<SocketMsg> msgCache = new List<SocketMsg>();                                  //缓存的消息列表
    private static object lockObj = new object();
    private static string md5 = "";     // route消息列表的md5

    enum SocketOpenOrClose
    {
        open = -1,
        close = -2
    }

    /// <summary>
    /// 注册路由
    /// </summary>
    /// <param name="cmd">路由名称</param>
    /// <param name="handler">路由函数</param>
    public static void AddHandler(string cmd, Action<string> handler)
    {
        int index = route.IndexOf(cmd);
        if (index == -1)
        {
            Debug.LogWarning("cmd not exists: " + cmd);
            return;
        }
        handlers[index] = handler;
    }

    /// <summary>
    /// 移除消息监听
    /// </summary>
    /// <param name="target"></param>
    public static void RemoveThisHandlers(object target)
    {
        List<int> dels = new List<int>();
        foreach (var one in handlers)
        {
            if (one.Value.Target == target)
            {
                dels.Add(one.Key);
            }
        }
        foreach (var index in dels)
        {
            handlers.Remove(index);
        }
    }

    /// <summary>
    /// socket关闭事件的回调
    /// </summary>
    /// <param name="handler">回调函数</param>
    public static void OnClose(Action<string> handler)
    {
        handlers[(int)SocketOpenOrClose.close] = handler;
    }

    /// <summary>
    /// 移除socket关闭事件的回调
    /// </summary>
    public static void OffClose()
    {
        handlers.Remove((int)SocketOpenOrClose.close);
    }

    /// <summary>
    ///  socket打开事件的回调
    /// </summary>
    /// <param name="handler">回调函数</param>
    public static void OnOpen(Action<string> handler)
    {
        handlers[(int)SocketOpenOrClose.open] = handler;
    }

    /// <summary>
    /// 移除socket打开事件的回调
    /// </summary>
    public static void OffOpen()
    {
        handlers.Remove((int)SocketOpenOrClose.open);
    }

    /// <summary>
    /// 断开socket连接
    /// </summary>
    public static void DisConnect()
    {
        if (nowSocket != null)
        {
            nowSocket.DisConnect();
        }
        lock (lockObj)
        {
            msgCache.Clear();
        }
    }

    /// <summary>
    /// 连接服务器
    /// </summary>
    /// <param name="host">ip</param>
    /// <param name="port">端口</param>
    public static void Connect(string host, int port)
    {
        DisConnect();
        nowSocket = new SocketClientChild();
        nowSocket.Connect(host, port);
    }

    /// <summary>
    /// 发送消息
    /// </summary>
    /// <param name="cmd">路由名称</param>
    /// <param name="data">数据</param>
    public static void SendMsg(string cmd, object data = null)
    {
        int cmdIndex = route.IndexOf(cmd);
        if (cmdIndex == -1)
        {
            Debug.Log("cmd not exists: " + cmd);
            return;
        }
        if (nowSocket == null)
        {
            Debug.Log("socket is null");
            return;
        }
        string msg;
        if (data == null)
        {
            msg = "null";
        }
        else
        {
            msg = JsonUtility.ToJson(data);
        }
        nowSocket.Send(cmdIndex, msg);
    }


    /// <summary>
    /// 读取消息
    /// </summary>
    public static void ReadMsg()
    {
        lock (lockObj)
        {
            if (msgCache.Count > 0)
            {
                SocketMsg msg = msgCache[0];
                msgCache.RemoveAt(0);
                if (handlers.ContainsKey(msg.msgId))
                {
                    handlers[msg.msgId](msg.msg);
                }
            }
        }
    }


    private class SocketClientChild
    {
        private Socket mySocket = null;         //原生socket
        private bool isDead = false;            //是否已被弃用
        private Timer heartbeatTimer = null;    // 心跳
        private Timer heartbeatTimeoutTimer = null;    // 心跳回应超时

        public void DisConnect()
        {
            if (!isDead)
            {
                nowSocket = null;
                isDead = true;
                if (heartbeatTimer != null)
                {
                    heartbeatTimer.Enabled = false;
                    heartbeatTimer.Dispose();
                }
                if (heartbeatTimeoutTimer != null)
                {
                    heartbeatTimeoutTimer.Enabled = false;
                    heartbeatTimeoutTimer.Dispose();
                }
                try
                {
                    mySocket.Shutdown(SocketShutdown.Both);
                    mySocket.Close();
                }
                catch (Exception e)
                {
                    Debug.Log(e);
                }
            }
        }

        public void Send(int cmdIndex, string data)
        {
            byte[] bytes = Encode(cmdIndex, data);
            try
            {
                mySocket.BeginSend(bytes, 0, bytes.Length, SocketFlags.None, null, null);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        public void Connect(string host, int port)
        {
            try
            {
                mySocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                mySocket.BeginConnect(host, port, AsyncConnectCallback, mySocket);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        private void AsyncConnectCallback(IAsyncResult result)
        {

            try
            {   // 异步写入结束 
                mySocket.EndConnect(result);
                Recive();

                // 握手
                Proto_Handshake_req msgReq = new Proto_Handshake_req();
                msgReq.md5 = md5;
                byte[] byteMsg = Encoding.UTF8.GetBytes(JsonUtility.ToJson(msgReq));
                byte[] bytes = new byte[5 + byteMsg.Length];
                int msgLen = byteMsg.Length + 1;
                bytes[0] = (byte)(msgLen >> 24 & 0xff);
                bytes[1] = (byte)(msgLen >> 16 & 0xff);
                bytes[2] = (byte)(msgLen >> 8 & 0xff);
                bytes[3] = (byte)(msgLen & 0xff);
                bytes[4] = 2 & 0xff;
                for (int i = 0; i < byteMsg.Length; i++)
                {
                    bytes[i + 5] = byteMsg[i];
                }
                mySocket.BeginSend(bytes, 0, bytes.Length, SocketFlags.None, null, null);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        private byte[] Encode(int cmd, string data)
        {
            byte[] byteMsg = Encoding.UTF8.GetBytes(data);
            int len = byteMsg.Length + 3;
            List<byte> byteSource = new List<byte>();
            byteSource.Add((byte)(len >> 24 & 0xff));
            byteSource.Add((byte)(len >> 16 & 0xff));
            byteSource.Add((byte)(len >> 8 & 0xff));
            byteSource.Add((byte)(len & 0xff));
            byteSource.Add((byte)(1 & 0xff));
            byteSource.Add((byte)(cmd >> 8 & 0xff));
            byteSource.Add((byte)(cmd & 0xff));
            byteSource.AddRange(byteMsg);
            return byteSource.ToArray();
        }

        private int msgLen = 0;
        private List<byte> msgBytes = new List<byte>();
        private byte[] data = new byte[1024];
        private void Recive()
        {
            try
            {
                //开始接收数据  
                mySocket.BeginReceive(data, 0, data.Length, SocketFlags.None,
                asyncResult =>
                {
                    int length = mySocket.EndReceive(asyncResult);
                    ReadData(length);
                    Recive();
                }, null);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        private void ReadData(int length)
        {
            int readLen = 0;
            while (readLen < length)
            {
                if (msgLen == 0)    //数据长度未确定
                {
                    msgBytes.Add(data[readLen]);
                    if (msgBytes.Count == 4)
                    {
                        msgLen = (msgBytes[0] << 24) | (msgBytes[1] << 16) | (msgBytes[2] << 8) | msgBytes[3];
                        msgBytes.Clear();
                    }
                    readLen++;
                }
                else if (length - readLen < msgLen) //数据未全部到达
                {
                    for (int i = readLen; i < length; i++)
                    {
                        msgBytes.Add(data[i]);
                    }
                    msgLen -= (length - readLen);
                    readLen = length;
                }
                else
                {
                    for (int i = readLen; i < readLen + msgLen; i++)
                    {
                        msgBytes.Add(data[i]);
                    }
                    readLen += msgLen;
                    msgLen = 0;
                    List<byte> tmpBytes = msgBytes;
                    msgBytes = new List<byte>();

                    HandleMsg(tmpBytes);
                }
            }

        }

        private void HandleMsg(List<byte> tmpBytes)
        {

            try
            {

                if (tmpBytes[0] == 1)   // 自定义消息
                {
                    SocketMsg msg = new SocketMsg();
                    msg.msgId = (tmpBytes[1] << 8) | tmpBytes[2];
                    msg.msg = Encoding.UTF8.GetString(tmpBytes.GetRange(3, tmpBytes.Count - 3).ToArray());
                    pushMsg(msg);
                }
                else if (tmpBytes[0] == 2)   // 握手回调
                {
                    string tmpStr = Encoding.UTF8.GetString(tmpBytes.GetRange(1, tmpBytes.Count - 1).ToArray());
                    Proto_Handshake_rsp handshakeMsg = JsonUtility.FromJson<Proto_Handshake_rsp>(tmpStr);
                    DealHandshake(handshakeMsg);
                }
                else if (tmpBytes[0] == 3)  // 心跳回调
                {
                    if (heartbeatTimeoutTimer != null)
                    {
                        heartbeatTimeoutTimer.Stop();
                    }
                }
            }
            catch (Exception e1)
            {
                Debug.Log(e1);
                SocketClose();
            }
        }

        private void DealHandshake(Proto_Handshake_rsp msg)
        {
            if (msg.heartbeat > 0)
            {
                heartbeatTimer = new Timer();
                heartbeatTimer.Elapsed += SendHeartbeat;
                heartbeatTimer.Interval = msg.heartbeat * 1000;
                heartbeatTimer.Enabled = true;

                heartbeatTimeoutTimer = new Timer();
                heartbeatTimeoutTimer.Elapsed += HeartbeatTimeout;
                heartbeatTimeoutTimer.AutoReset = false;
                heartbeatTimeoutTimer.Interval = 4 * 1000;
            }
            md5 = msg.md5;
            if (msg.route != null)
            {
                route = new List<string>();
                for (int i = 0; i < msg.route.Length; i++)
                {
                    route.Add(msg.route[i]);
                }
            }

            SocketMsg openMsg = new SocketMsg();
            openMsg.msgId = (int)SocketOpenOrClose.open;
            pushMsg(openMsg);
        }

        private void SendHeartbeat(object source, ElapsedEventArgs e)
        {
            // 心跳
            byte[] bytes = new byte[5];
            bytes[0] = 1 >> 24 & 0xff;
            bytes[1] = 1 >> 16 & 0xff;
            bytes[2] = 1 >> 8 & 0xff;
            bytes[3] = 1 & 0xff;
            bytes[4] = 3 & 0xff;
            try
            {
                mySocket.BeginSend(bytes, 0, bytes.Length, SocketFlags.None, null, null);
                heartbeatTimeoutTimer.Start();
            }
            catch (Exception e1)
            {
                Debug.Log(e1);
                SocketClose();
            }

        }

        private void HeartbeatTimeout(object source, ElapsedEventArgs e)
        {
            SocketClose();
        }

        private void SocketClose()
        {
            if (!isDead)
            {
                SocketMsg msg = new SocketMsg();
                msg.msgId = (int)SocketOpenOrClose.close;
                pushMsg(msg);
                DisConnect();
            }
        }
        private void pushMsg(SocketMsg msg)
        {
            lock (lockObj)
            {
                msgCache.Add(msg);
            }
        }
    }

    /// <summary>
    /// 自定义消息
    /// </summary>
    private class SocketMsg
    {
        public int msgId = 0;
        public string msg = "";
    }

    /// <summary>
    /// 握手消息
    /// </summary>
    [Serializable]
    private class Proto_Handshake_req
    {
        public string md5 = "";
    }

    /// <summary>
    /// 握手消息
    /// </summary>
    [Serializable]
    private class Proto_Handshake_rsp
    {
        public float heartbeat = 0;
        public string md5 = "";
        public string[] route = null;
    }
}
