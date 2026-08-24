function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="font-family: Arial, Helvetica, sans-serif; background: #f4f4f5; padding: 24px; margin: 0;">
    <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="padding: 32px;">
          <h1 style="font-size: 18px; margin: 0 0 16px;">${title}</h1>
          ${bodyHtml}
          <p style="color: #71717a; font-size: 12px; margin-top: 32px;">ViteNest</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; margin: 16px 0;">${label}</a>`;
}

export function verifyEmailTemplate(url: string): string {
  return layout(
    'Verify your email',
    `<p style="font-size: 14px; color: #3f3f46;">Confirm your email address to finish setting up your ViteNest account.</p>
     ${button(url, 'Verify email')}
     <p style="font-size: 12px; color: #71717a;">If you didn't create this account, you can ignore this email.</p>`,
  );
}

export function resetPasswordTemplate(url: string): string {
  return layout(
    'Reset your password',
    `<p style="font-size: 14px; color: #3f3f46;">We received a request to reset your ViteNest password. This link expires in 1 hour.</p>
     ${button(url, 'Reset password')}
     <p style="font-size: 12px; color: #71717a;">If you didn't request this, you can ignore this email.</p>`,
  );
}
