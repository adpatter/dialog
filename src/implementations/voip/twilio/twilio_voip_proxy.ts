import { EventEmitter } from "node:events";
import { VoIP, VoIPEvents } from "../../../interfaces/voip/voip.js";
import { Peer } from "@far-analytics/port-peer";
import { Message } from "../../../interfaces/message/message.js";
import { TranscriptStatus, TwilioMetadata } from "./types.js";
import { UUID } from "node:crypto";
import { parentPort } from "node:worker_threads";

export class TwilioVoIPProxy
  extends EventEmitter<VoIPEvents<TwilioMetadata, TranscriptStatus>>
  implements VoIP<TwilioMetadata, TranscriptStatus>
{
  protected peer?: Peer;
  constructor() {
    super();
    if (parentPort) {
      this.peer = new Peer(parentPort);
      this.peer.register("propagate", this.propagate);
    }
  }

  protected propagate = (
    event: keyof VoIPEvents<TwilioMetadata, TranscriptStatus>,
    ...args: VoIPEvents<TwilioMetadata, TranscriptStatus>[keyof VoIPEvents<TwilioMetadata, TranscriptStatus>]
  ): void => {
    this.emit(event, ...args);
  };

  public post = (message: Message): void => {
    void this.peer?.call("post", message).catch((err: unknown) => this.emit("error", err));
  };

  public abort = (uuid: UUID): void => {
    void this.peer?.call("abort", uuid).catch((err: unknown) => this.emit("error", err));
  };

  public hangup = (): void => {
    void this.peer?.call("hangup").catch((err: unknown) => this.emit("error", err));
  };

  public transferTo = (tel: string): void => {
    void this.peer?.call("transferTo", tel).catch((err: unknown) => this.emit("error", err));
  };

  public startRecording = async (): Promise<void> => {
    await this.peer?.call("startRecording").catch((err: unknown) => this.emit("error", err));
  };

  public stopRecording = async (): Promise<void> => {
    await this.peer?.call("stopRecording").catch((err: unknown) => this.emit("error", err));
  };

  public removeRecording = async (): Promise<void> => {
    await this.peer?.call("removeRecording").catch((err: unknown) => this.emit("error", err));
  };

  public startTranscript = async (): Promise<void> => {
    await this.peer?.call("startTranscript").catch((err: unknown) => this.emit("error", err));
  };

  public dispose = (): void => {
    void this.peer?.call("dispose").catch((err: unknown) => this.emit("error", err));
  };
}
