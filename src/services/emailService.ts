import axios from 'axios';

const sendEmail = async (fullName: string, email: string, message: string) => {
  try {
    await axios.post('https://email-service.digitalenvision.com.au/send', {
      email: email,
      message: message,
    });
    console.log(`Email sent to ${fullName}`);
  } catch (error) {
    console.error(`Failed to send email to ${fullName}:`, error);
    throw error;
  }
};

export default sendEmail;
