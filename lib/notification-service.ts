/**
 * Notification Service
 *
 * Sends email notifications for marketplace contract events.
 * Uses SendGrid for email delivery.
 */

import sgMail from '@sendgrid/mail';

/**
 * Notification types
 */
export enum NotificationType {
  CONTRACT_CREATED = 'contract_created',
  CONTRACT_PAYMENT_RECEIVED = 'contract_payment_received',
  CONTRACT_INSCRIBED = 'contract_inscribed',
  MILESTONE_SUBMITTED = 'milestone_submitted',
  MILESTONE_APPROVED = 'milestone_approved',
  MILESTONE_REJECTED = 'milestone_rejected',
  PAYOUT_COMPLETED = 'payout_completed',
  CONTRACT_COMPLETED = 'contract_completed',
}

/**
 * Email template data
 */
interface EmailTemplateData {
  recipientEmail: string;
  recipientName: string;
  contractId: string;
  contractTitle: string;
  contractUrl: string;
  additionalData?: Record<string, any>;
}

/**
 * Initialize SendGrid
 */
let sendGridInitialized = false;

function initializeSendGrid() {
  if (sendGridInitialized) return;

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[notification-service] SENDGRID_API_KEY not configured. Email notifications disabled.');
    return;
  }

  sgMail.setApiKey(apiKey);
  sendGridInitialized = true;
}

/**
 * Generate email content based on notification type
 */
function generateEmailContent(
  type: NotificationType,
  data: EmailTemplateData
): { subject: string; html: string; text: string } {
  const { recipientName, contractId, contractTitle, contractUrl, additionalData } = data;

  switch (type) {
    case NotificationType.CONTRACT_CREATED:
      return {
        subject: `Contract Created: ${contractTitle}`,
        html: `
          <h2>Contract Created</h2>
          <p>Hi ${recipientName},</p>
          <p>Your contract has been created successfully:</p>
          <ul>
            <li><strong>Contract ID:</strong> ${contractId}</li>
            <li><strong>Service:</strong> ${contractTitle}</li>
          </ul>
          <p>Next step: Complete payment to activate the contract.</p>
          <p><a href="${contractUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block;">View Contract</a></p>
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nYour contract has been created successfully.\n\nContract ID: ${contractId}\nService: ${contractTitle}\n\nNext step: Complete payment to activate the contract.\n\nView contract: ${contractUrl}\n\nBest,\nb0ase Team`,
      };

    case NotificationType.CONTRACT_PAYMENT_RECEIVED:
      return {
        subject: `Payment Received: ${contractTitle}`,
        html: `
          <h2>Payment Received</h2>
          <p>Hi ${recipientName},</p>
          <p>Payment has been received and held in escrow for your contract:</p>
          <ul>
            <li><strong>Contract ID:</strong> ${contractId}</li>
            <li><strong>Service:</strong> ${contractTitle}</li>
            <li><strong>Amount:</strong> ${additionalData?.amount || 'N/A'}</li>
          </ul>
          ${additionalData?.isDeveloper ? '<p>You can now start working on this contract.</p>' : '<p>The developer will begin work shortly.</p>'}
          <p><a href="${contractUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block;">View Contract</a></p>
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nPayment has been received and held in escrow.\n\nContract ID: ${contractId}\nService: ${contractTitle}\nAmount: ${additionalData?.amount || 'N/A'}\n\n${additionalData?.isDeveloper ? 'You can now start working on this contract.' : 'The developer will begin work shortly.'}\n\nView contract: ${contractUrl}\n\nBest,\nb0ase Team`,
      };

    case NotificationType.CONTRACT_INSCRIBED:
      return {
        subject: `Contract Inscribed on Blockchain: ${contractTitle}`,
        html: `
          <h2>Contract Inscribed on Blockchain</h2>
          <p>Hi ${recipientName},</p>
          <p>Your contract has been permanently inscribed on the BSV blockchain:</p>
          <ul>
            <li><strong>Contract ID:</strong> ${contractId}</li>
            <li><strong>Transaction ID:</strong> ${additionalData?.txid || 'N/A'}</li>
          </ul>
          <p>This provides immutable proof of the contract terms and parties.</p>
          <p><a href="${additionalData?.explorerUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block;">View on Blockchain</a></p>
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nYour contract has been permanently inscribed on the BSV blockchain.\n\nContract ID: ${contractId}\nTransaction ID: ${additionalData?.txid || 'N/A'}\n\nView on blockchain: ${additionalData?.explorerUrl}\n\nBest,\nb0ase Team`,
      };

    case NotificationType.MILESTONE_SUBMITTED:
      return {
        subject: `Milestone Submitted: ${contractTitle}`,
        html: `
          <h2>Milestone Submitted for Review</h2>
          <p>Hi ${recipientName},</p>
          <p>A milestone has been submitted for your review:</p>
          <ul>
            <li><strong>Contract:</strong> ${contractTitle}</li>
            <li><strong>Milestone:</strong> ${additionalData?.milestoneTitle || 'N/A'}</li>
          </ul>
          <p>${additionalData?.deliverableDescription || 'No description provided.'}</p>
          <p>Please review the deliverable and approve or request revision.</p>
          <p><a href="${contractUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block;">Review Milestone</a></p>
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nA milestone has been submitted for your review.\n\nContract: ${contractTitle}\nMilestone: ${additionalData?.milestoneTitle || 'N/A'}\n\nDescription: ${additionalData?.deliverableDescription || 'No description provided.'}\n\nReview milestone: ${contractUrl}\n\nBest,\nb0ase Team`,
      };

    case NotificationType.MILESTONE_APPROVED:
      return {
        subject: `Milestone Approved: ${contractTitle}`,
        html: `
          <h2>Milestone Approved</h2>
          <p>Hi ${recipientName},</p>
          <p>Your milestone has been approved:</p>
          <ul>
            <li><strong>Contract:</strong> ${contractTitle}</li>
            <li><strong>Milestone:</strong> ${additionalData?.milestoneTitle || 'N/A'}</li>
            <li><strong>Payout Amount:</strong> ${additionalData?.payoutAmount || 'N/A'}</li>
          </ul>
          ${additionalData?.feedback ? `<p><strong>Client Feedback:</strong> ${additionalData.feedback}</p>` : ''}
          ${additionalData?.rating ? `<p><strong>Rating:</strong> ${additionalData.rating}/5 stars</p>` : ''}
          <p>Payment has been released and will be processed shortly.</p>
          <p><a href="${contractUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block;">View Contract</a></p>
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nYour milestone has been approved.\n\nContract: ${contractTitle}\nMilestone: ${additionalData?.milestoneTitle || 'N/A'}\nPayout Amount: ${additionalData?.payoutAmount || 'N/A'}\n\n${additionalData?.feedback ? `Client Feedback: ${additionalData.feedback}\n` : ''}${additionalData?.rating ? `Rating: ${additionalData.rating}/5 stars\n` : ''}\nPayment has been released and will be processed shortly.\n\nView contract: ${contractUrl}\n\nBest,\nb0ase Team`,
      };

    case NotificationType.MILESTONE_REJECTED:
      return {
        subject: `Revision Requested: ${contractTitle}`,
        html: `
          <h2>Revision Requested</h2>
          <p>Hi ${recipientName},</p>
          <p>The client has requested revisions for your milestone:</p>
          <ul>
            <li><strong>Contract:</strong> ${contractTitle}</li>
            <li><strong>Milestone:</strong> ${additionalData?.milestoneTitle || 'N/A'}</li>
          </ul>
          <p><strong>Reason:</strong> ${additionalData?.rejectionReason || 'No reason provided.'}</p>
          <p><strong>Requested Changes:</strong> ${additionalData?.requestedChanges || 'No details provided.'}</p>
          <p>Please address the requested changes and resubmit the milestone.</p>
          <p><a href="${contractUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block;">View Details</a></p>
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nThe client has requested revisions for your milestone.\n\nContract: ${contractTitle}\nMilestone: ${additionalData?.milestoneTitle || 'N/A'}\n\nReason: ${additionalData?.rejectionReason || 'No reason provided.'}\nRequested Changes: ${additionalData?.requestedChanges || 'No details provided.'}\n\nPlease address the requested changes and resubmit.\n\nView details: ${contractUrl}\n\nBest,\nb0ase Team`,
      };

    case NotificationType.PAYOUT_COMPLETED:
      return {
        subject: `Payout Completed: ${contractTitle}`,
        html: `
          <h2>Payout Completed</h2>
          <p>Hi ${recipientName},</p>
          <p>Your payout has been completed:</p>
          <ul>
            <li><strong>Contract:</strong> ${contractTitle}</li>
            <li><strong>Amount:</strong> ${additionalData?.amount || 'N/A'}</li>
            <li><strong>Method:</strong> ${additionalData?.payoutMethod || 'N/A'}</li>
          </ul>
          <p>You should receive the funds within 1-3 business days depending on your payout method.</p>
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nYour payout has been completed.\n\nContract: ${contractTitle}\nAmount: ${additionalData?.amount || 'N/A'}\nMethod: ${additionalData?.payoutMethod || 'N/A'}\n\nYou should receive the funds within 1-3 business days.\n\nBest,\nb0ase Team`,
      };

    case NotificationType.CONTRACT_COMPLETED:
      return {
        subject: `Contract Completed: ${contractTitle}`,
        html: `
          <h2>Contract Completed</h2>
          <p>Hi ${recipientName},</p>
          <p>Your contract has been successfully completed:</p>
          <ul>
            <li><strong>Contract ID:</strong> ${contractId}</li>
            <li><strong>Service:</strong> ${contractTitle}</li>
          </ul>
          <p>Thank you for using b0ase marketplace. We hope to work with you again soon!</p>
          ${additionalData?.canReview ? '<p><a href="' + contractUrl + '" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block;">Leave a Review</a></p>' : ''}
          <p>Best,<br>b0ase Team</p>
        `,
        text: `Hi ${recipientName},\n\nYour contract has been successfully completed.\n\nContract ID: ${contractId}\nService: ${contractTitle}\n\nThank you for using b0ase marketplace!\n\n${additionalData?.canReview ? 'Leave a review: ' + contractUrl + '\n' : ''}\nBest,\nb0ase Team`,
      };

    default:
      return {
        subject: `Update: ${contractTitle}`,
        html: `<p>Hi ${recipientName},</p><p>There's an update on your contract: ${contractTitle}</p><p><a href="${contractUrl}">View Contract</a></p>`,
        text: `Hi ${recipientName},\n\nThere's an update on your contract: ${contractTitle}\n\nView contract: ${contractUrl}`,
      };
  }
}

/**
 * Send notification email
 */
export async function sendNotification(
  type: NotificationType,
  data: EmailTemplateData
): Promise<{ success: boolean; error?: string }> {
  try {
    initializeSendGrid();

    if (!sendGridInitialized) {
      console.warn('[notification-service] SendGrid not initialized. Skipping email.');
      return { success: false, error: 'SendGrid not configured' };
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@b0ase.com';
    const { subject, html, text } = generateEmailContent(type, data);

    const msg = {
      to: data.recipientEmail,
      from: fromEmail,
      subject,
      text,
      html,
    };

    await sgMail.send(msg);

    console.log(`[notification-service] Email sent: ${type} to ${data.recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error('[notification-service] Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send batch notifications
 */
export async function sendBatchNotifications(
  notifications: Array<{ type: NotificationType; data: EmailTemplateData }>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const notification of notifications) {
    const result = await sendNotification(notification.type, notification.data);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
