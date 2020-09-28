import { Application } from "mydog";
import { DicObj } from "../config/someConfig";
import { Room } from "./room";

export class RoomMgr {
    private app: Application;
    private rooms: DicObj<Room> = {};
    constructor(app: Application) {
        this.app = app;
    }


    newRoom(roomId: number, roomName: string) {
        this.rooms[roomId] = new Room(this.app, roomId, roomName);
    }

    getRoom(roomId: number) {
        return this.rooms[roomId];
    }

    delRoom(roomId: number) {
        delete this.rooms[roomId];
    }

    getUserNum() {
        let num = 0;
        for (let x in this.rooms) {
            num += this.rooms[x].getUserNum();
        }
        return num;
    }
}