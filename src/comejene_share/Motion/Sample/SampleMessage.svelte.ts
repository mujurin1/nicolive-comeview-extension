import type { ComejeneContent } from "../../type";
import type { ComejeneMotionMessage } from "../type";

export class SampleMessage implements ComejeneMotionMessage {
  public node = $state<HTMLDivElement>(null!);

  public constructor(
    public readonly content: ComejeneContent
  ) { }
}
