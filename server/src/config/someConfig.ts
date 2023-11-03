export interface Dic<T = any> {
    [key: string]: T
}

export const enum e_svrType {
    gate = "gate",
    connector = "connector",
    chat = "chat",
}