import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface RequestEmailData {
  employeeName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  workingDays: number;
}

@Injectable()
export class NotificationsService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged to console');
    }
    this.fromEmail = this.config.get<string>('EMAIL_FROM') ?? 'Recharge <noreply@recharge.ro>';
  }

  async sendRequestSubmitted(managerEmail: string, data: RequestEmailData) {
    const subject = `New leave request from ${data.employeeName}`;
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 500px;">
        <h2 style="color: #0B7A75;">New Leave Request</h2>
        <p><strong>${data.employeeName}</strong> has submitted a leave request:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; color: #666;">Type</td><td style="padding: 8px;">${data.leaveTypeName}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Dates</td><td style="padding: 8px;">${data.startDate} — ${data.endDate}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Working Days</td><td style="padding: 8px;">${data.workingDays}</td></tr>
        </table>
        <p>Please log in to approve or decline this request.</p>
      </div>
    `;
    await this.send(managerEmail, subject, html);
  }

  async sendRequestApproved(employeeEmail: string, data: RequestEmailData) {
    const subject = `Leave request approved — ${data.leaveTypeName}`;
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 500px;">
        <h2 style="color: #4CAF50;">Request Approved</h2>
        <p>Your leave request has been <strong>approved</strong>:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; color: #666;">Type</td><td style="padding: 8px;">${data.leaveTypeName}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Dates</td><td style="padding: 8px;">${data.startDate} — ${data.endDate}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Working Days</td><td style="padding: 8px;">${data.workingDays}</td></tr>
        </table>
      </div>
    `;
    await this.send(employeeEmail, subject, html);
  }

  async sendRequestDeclined(employeeEmail: string, data: RequestEmailData) {
    const subject = `Leave request declined — ${data.leaveTypeName}`;
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 500px;">
        <h2 style="color: #F44336;">Request Declined</h2>
        <p>Your leave request has been <strong>declined</strong>:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; color: #666;">Type</td><td style="padding: 8px;">${data.leaveTypeName}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Dates</td><td style="padding: 8px;">${data.startDate} — ${data.endDate}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Working Days</td><td style="padding: 8px;">${data.workingDays}</td></tr>
        </table>
      </div>
    `;
    await this.send(employeeEmail, subject, html);
  }

  async sendInviteEmail(email: string, companyName: string, token: string) {
    const webUrl = this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';
    const inviteUrl = `${webUrl}/invite/${token}`;
    const subject = `You've been invited to join ${companyName} on Recharge`;
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 500px;">
        <h2 style="color: #0B7A75;">You're Invited!</h2>
        <p>You've been invited to join <strong>${companyName}</strong> on Recharge, a leave management platform.</p>
        <p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #0B7A75; color: white; text-decoration: none; border-radius: 8px;">
            Accept Invite
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This invite expires in 72 hours.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`[Email] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err}`);
    }
  }
}
