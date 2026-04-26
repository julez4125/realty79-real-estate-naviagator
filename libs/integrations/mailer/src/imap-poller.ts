import { ImapFlow } from 'imapflow';
import type { FetchMessageObject } from 'imapflow';

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}

export type MessageCallback = (msg: FetchMessageObject) => void | Promise<void>;

/**
 * Polls an IMAP mailbox for new messages using imapflow.
 *
 * TODO M5.1: implement idle-based push polling, reconnection logic,
 * seen-flag tracking, and graceful shutdown.
 */
export class ImapPoller {
  private client: ImapFlow;
  private callbacks: MessageCallback[] = [];

  constructor(config: ImapConfig) {
    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      logger: false,
    });
  }

  onMessage(cb: MessageCallback): void {
    this.callbacks.push(cb);
  }

  /**
   * Start polling the INBOX for new messages.
   * TODO M5.1: implement full idle/poll loop. Will set internal running flag, register imapflow listeners, and dispatch to this.callbacks.
   */
  async start(): Promise<void> {
    throw new Error('ImapPoller.start not yet implemented — see M5.1');
  }

  /**
   * Stop the poller and close the IMAP connection.
   */
  async stop(): Promise<void> {
    await this.client.logout();
  }
}
