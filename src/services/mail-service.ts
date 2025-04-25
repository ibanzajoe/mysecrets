import FormData from 'form-data';
import Mailgun from 'mailgun.js';
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_KEY || '',
});

export class MailService {
    async sendEmail(to: string, subject: string, text: string, html: string) {
        mg.messages
          .create('mail.reflexclothing.com', {
            from: 'Reflex <mail@reflexclothing.com>',
            to: [to],
            subject,
            text,
            html,
          })
          .then((msg) => console.log(msg)) // logs response data
          .catch((err) => console.log(err)); //
      }
    
      async sendOrderEmail(
        to: string,
        subject: string,
        text: string,
        orderId: string,
      ) {
        mg.messages
          .create('mail.reflexclothing.com', {
            from: 'Reflex <mail@reflexclothing.com>',
            to: [to],
            subject,
            text,
            template: 'order placed',
            'h:X-Mailgun-Variables': JSON.stringify({
              orderId,
            }),
          })
          .then((msg) => console.log(msg)) // logs response data
          .catch((err) => console.log(err)); //
      }
    
      async welcomeEmail(
        to: string,
        subject: string,
        text: string,
        userName: string,
      ) {
        mg.messages
          .create('mail.reflexclothing.com', {
            from: 'Reflex <mail@reflexclothing.com>',
            to: [to],
            subject,
            text,
            template: 'welcome',
            'h:X-Mailgun-Variables': JSON.stringify({
              userName,
            }),
          })
          .then((msg) => console.log(msg))
          .catch((err) => {
            console.log('Error: ', err);
            throw new Error(`Error sending welcome email: ${err}`);
          });
      }
    
      async sendOrderShippedEmail(
        to: string,
        subject: string,
        text: string,
        tracking_no: string,
      ) {
        mg.messages
          .create('mail.reflexclothing.com', {
            from: 'Reflex <mail@reflexclothing.com>',
            to: [to],
            subject,
            text,
            template: 'order shipped',
            'h:X-Mailgun-Variables': JSON.stringify({
              tracking_no,
            }),
          })
          .then((msg) => console.log(msg)) // logs response data
          .catch((err) => console.log(err)); //
      }
}