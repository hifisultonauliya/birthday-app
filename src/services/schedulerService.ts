import moment from 'moment-timezone';
import cron from 'node-cron';
import NotificationQueue from '../models/notificationQueue';
import User from '../models/user';
import sendEmail from './emailService';
import { generateNotificationLogsAndUpdateNextNotificationQueue } from './notificationService';

const scheduleBirthdayEmails = () => {
    console.log("start cron schedule...")
    cron.schedule('* * * * *', async () => { //*/15 * * * *
        try {
            console.log("0>>> cron run on:", moment().toString())
            const NotificationQueues = await NotificationQueue.find();
            for (const nq of NotificationQueues) {
                const user = await User.findById(nq.user);

                console.log("nq", nq.dateNotification)
                console.log(">>>> issend", moment().isSame(nq.dateNotification, 'minute'))
                
                nq.lastStatus = "pending"
                if (user && moment().isSame(nq.dateNotification, 'minute')) {
                    try {
                        await sendEmail(`${user.firstName} ${user.lastName}`, user.email, nq.templateMessage);

                        nq.lastStatus = "success"
                        await generateNotificationLogsAndUpdateNextNotificationQueue(nq, "")
                    } catch (error) {
                        // Handle failure to send email (e.g., log for retry)
                        console.error("Failed to send email notification, queid:", nq._id, ", email:", user.email);

                        nq.lastStatus = "failed"
                        await generateNotificationLogsAndUpdateNextNotificationQueue(nq, "Failed to send email notification")
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    });
};

export default scheduleBirthdayEmails;
