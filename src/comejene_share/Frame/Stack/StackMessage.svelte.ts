import type { ComejeneContent } from "../../type";
import type { ComejeneFrameMessage } from "../type";

export class StackMessage implements ComejeneFrameMessage {
  public node = $state<HTMLDivElement>(null!);

  public constructor(
    public readonly content: ComejeneContent
  ) { }
}
