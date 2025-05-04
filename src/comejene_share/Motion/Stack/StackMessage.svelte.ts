import type { ComejeneContent } from "../../type";
import type { ComejeneMotionMessage } from "../type";

export class StackMessage implements ComejeneMotionMessage {
  public node = $state<HTMLDivElement>(null!);

  public constructor(
    public readonly content: ComejeneContent
  ) { }
}
