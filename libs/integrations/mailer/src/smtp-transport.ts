import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}

/**
 * Creates a nodemailer SMTP transporter for sending outbound emails.
 *
 * TODO M5.1: add connection-pool configuration, DKIM signing support,
 * and retry logic for transient SMTP errors.
 */
export function createSmtpTransport(config: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
}
