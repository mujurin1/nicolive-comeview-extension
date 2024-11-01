import type { ReceiveContents } from "../../type";
import type { MotionMessage } from "../Interface";

export class SampleMotionMessage implements MotionMessage {
  public node = $state<HTMLDivElement>(null!);

  public constructor(
    public readonly contents: ReceiveContents
  ) { }
}
