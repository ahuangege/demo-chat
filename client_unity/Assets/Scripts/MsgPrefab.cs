using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class MsgPrefab : MonoBehaviour
{

    public void Init(Proto.ChatMsg info)
    {
        transform.Find("head").GetComponent<Image>().sprite = Main.instance.GetHeadImg(info.headId);
        transform.Find("name").GetComponent<Text>().text = info.nickname;

        Text msgText = transform.Find("msg").GetComponent<Text>();
        msgText.text = info.msg.Replace(" ", "\u00A0");

        bool isMe = Chat.instance.meUid == info.uid;
        float width = msgText.preferredWidth;
        if (width > 631)
        {
            msgText.horizontalOverflow = HorizontalWrapMode.Wrap;
            msgText.GetComponent<RectTransform>().sizeDelta = new Vector2(630, 30);
            width = 630;
        }
        else if (isMe)
        {
            msgText.GetComponent<RectTransform>().sizeDelta = new Vector2(msgText.preferredWidth, msgText.preferredHeight);
        }
        transform.Find("msgBg").GetComponent<RectTransform>().sizeDelta = new Vector2(width + 10, msgText.preferredHeight + 10);
        var rectT = GetComponent<RectTransform>();
        rectT.sizeDelta = new Vector2(rectT.sizeDelta.x, msgText.preferredHeight + 10 + 30);
    }
}

