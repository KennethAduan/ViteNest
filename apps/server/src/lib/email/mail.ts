import axios, { isAxiosError } from 'axios';
import { Logger } from '@nestjs/common';
import { env } from '../../config/env';

const logger = new Logger('Mail');

interface EmailAttachment {
  name: string;
  contentType: string;
  binaryContent: string;
}

interface SendEmailProps {
  recipients: string[];
  cc?: string[];
  subject: string;
  htmlContent: string;
  attachments?: EmailAttachment[];
}

function buildRecipients(recipients: string[], cc?: string[]) {
  if (!cc?.length) {
    return { To: recipients };
  }
  return { To: recipients, CC: cc };
}

function buildAttachments(attachments?: EmailAttachment[]) {
  if (!attachments?.length) return undefined;
  return attachments.map((attachment) => ({
    Name: attachment.name,
    ContentType: attachment.contentType,
    BinaryContent: attachment.binaryContent,
  }));
}

function buildEmailPayload({
  recipients,
  cc,
  subject,
  htmlContent,
  attachments,
  fromAddress,
}: SendEmailProps & { fromAddress: string }) {
  const attachmentPayload = buildAttachments(attachments);

  return {
    Recipients: buildRecipients(recipients, cc),
    Content: {
      From: fromAddress,
      Subject: subject,
      Body: [
        {
          ContentType: 'HTML',
          Content: htmlContent,
          Charset: 'utf-8',
        },
      ],
    },
    ...(attachmentPayload ? { Attachments: attachmentPayload } : {}),
  };
}

function buildEmailError(error: unknown) {
  if (isAxiosError(error) && error.response) {
    logger.error(
      `Failed to send email: ${JSON.stringify(error.response.data)}`,
    );
    return {
      success: false as const,
      message: 'Failed to send email.',
      error: error.response.data as unknown,
    };
  }

  logger.error(`Failed to send email: ${String(error)}`);
  return {
    success: false as const,
    message: 'Failed to send email',
  };
}

export const sendEmail = async (props: SendEmailProps) => {
  try {
    const response = await axios.post(
      env.ELASTIC_MAIL_API_URL,
      buildEmailPayload({ ...props, fromAddress: env.ELASTIC_MAIL_DOMAIN }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-ElasticEmail-ApiKey': env.ELASTIC_MAIL_API_KEY,
        },
      },
    );

    if (![200, 202].includes(response.status)) {
      logger.error(
        `Failed to send email. Status: ${response.status} ${JSON.stringify(response.data)}`,
      );
      return {
        success: false as const,
        message: 'Failed to send email. Status: ' + response.status,
        error: response.data as unknown,
      };
    }

    return {
      success: true as const,
      message: 'Email sent successfully.',
      data: response.data as unknown,
    };
  } catch (error) {
    return buildEmailError(error);
  }
};
