
import { Application, connector, createApp, Session } from "mydog";
let app = createApp();

import { getCpuUsage } from "./app/cpuUsage";
import { HallMgr } from "./app/hallMgr";
import { RoomMgr } from "./app/roomMgr";
import { e_svrType } from "./config/someConfig";

app.appName = "chat demo"
app.setConfig("connector", { "connector": connector.connectorWs, "heartbeat": 20 });  // 注意： unity改为connectorTcp， creator改为connectorWs
app.setConfig("encodeDecode", { "msgDecode": msgDecode, "msgEncode": msgEncode });
app.setConfig("rpc", { "interval": 30 });
app.setConfig("logger", function (level, info) {
    if (level !== "info") {
        console.log(app.serverId, level, info)
    }
});
app.setConfig("mydogList", () => {
    let userNum = "--";
    if (app.serverType === e_svrType.connector) {
        userNum = app.clientNum.toString();
    } else if (app.serverType === e_svrType.chat) {
        userNum = app.get<RoomMgr>("roomMgr").getUserNum().toString();
    }
    return [{ "title": "cpu(%)", "value": getCpuUsage() }, { "title": "userNum", "value": userNum }];
});


app.configure(e_svrType.gate, () => {
    app.set("hallMgr", new HallMgr(app));
});
app.configure(e_svrType.connector, () => {
    app.route(e_svrType.chat, (app: Application, session: Session, serverType: string, cb) => {
        cb(session.get("svr"));
    });
});
app.configure(e_svrType.chat, () => {
    app.set("roomMgr", new RoomMgr(app));
});


app.start();

process.on("uncaughtException", function (err: any) {
    console.log(err)
});



function msgDecode(cmdId: number, msgBuf: Buffer) {
    let msgStr = msgBuf.toString();
    console.log("--->>>", app.routeConfig[cmdId], msgStr);
    return JSON.parse(msgStr);
}

function msgEncode(cmdId: number, msg: any): Buffer {
    let msgStr = JSON.stringify(msg);
    console.log("---<<<", app.routeConfig[cmdId], msgStr);
    return Buffer.from(msgStr);
}


