import type { ExtMessageType, ExtUserType } from ".";

export interface ExtentionUser extends ExtUserType<"extention"> {
}

export interface ExtentionMessage extends ExtMessageType<"extention"> {
}
