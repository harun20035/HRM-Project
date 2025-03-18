const nodemailer = require('nodemailer');

const createTestAccount = async () => {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    return { transporter, testAccount };
};

const sendEmail = async (to, subject, text) => {
    const { transporter, testAccount } = await createTestAccount();

    const mailOptions = {
        from: `"Test Sender" <${testAccount.user}>`,
        to,
        subject,
        text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    return {
        messageId: info.messageId,
        previewURL: nodemailer.getTestMessageUrl(info),
    };
};

module.exports = sendEmail; // Ovo mora postojati
