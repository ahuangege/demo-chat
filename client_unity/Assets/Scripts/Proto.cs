using System.Collections;
using System.Collections.Generic;
using System;

namespace Proto
{
    [Serializable]
    public class GetConBack
    {
        public string host;
        public int port;
    }

    [Serializable]
    public class EnterRoomReq
    {
        public string roomName;
        public string nickname;
        public int headId;
    }

    [Serializable]
    public class EnterRoomRsp
    {
        public int code;
        public int uid;
        public string roomName;
        public List<PlayerInfo> players = new List<PlayerInfo>();
    }

    [Serializable]
    public class PlayerInfo
    {
        public int uid;
        public string nickname;
        public int headId;
    }

    [Serializable]
    public class MsgSend
    {
        public string msg;
    }

    [Serializable]
    public class ChatMsg
    {
        public int uid;
        public int headId;
        public string nickname;
        public string msg;
    }

    [Serializable]
    public class OneLeave
    {
        public int uid;
    }
}

