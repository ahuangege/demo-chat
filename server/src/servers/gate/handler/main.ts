import { Application, Session } from "mydog";
import { e_svrType } from "../../../config/someConfig";


export default class Handler {
    private app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 获取网关服
     */
    getCon(msg: any, session: Session, next: Function) {
        let svrs = this.app.getServersByType(e_svrType.connector);
        let svr = svrs[Math.floor(Math.random() * svrs.length)];
        next({ "code": 0, "host": svr.clientHost, "port": svr.clientPort });
    }

}