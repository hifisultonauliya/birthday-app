import moment from 'moment';
import momenttz from 'moment-timezone';
import NotificationLog from '../models/notificationLog';
import NotificationMaster, { INotificationMaster } from '../models/notificationMaster';
import NotificationQueue, { INotificationQueue } from '../models/notificationQueue';
import { IUser } from '../models/user';

const notificationMastersInitial = [
    {
        name: "Birthday Event",
        repeat: "yearly",
        dateTime: new Date(new Date().setUTCHours(9, 0, 0, 0)).toUTCString(),
        userFieldName: "birthday",
        templateMessage: "Hey, {fullName} it’s your birthday",
    },
    {
        name: "Birthday Monthly Event",
        repeat: "monthly",
        dateTime: new Date(new Date().setUTCHours(12, 0, 0, 0)).toUTCString(),
        userFieldName: "birthday",
        templateMessage: "Hey, {fullName} it’s your monthly birthday",
    },
    {
        name: "Daily Event",
        repeat: "daily",
        dateTime: new Date(new Date().setUTCHours(17, 55, 0, 0)).toUTCString(),
        userFieldName: "",
        templateMessage: "Hey, {fullName} it’s your daily event",
    },
    {
        name: "Monthly Event",
        repeat: "monthly",
        dateTime: new Date(new Date().setUTCHours(8, 0, 0, 0)).toUTCString(),
        userFieldName: "",
        templateMessage: "Hey, {fullName} it’s your monthly event",
    },
]
const initiateNotificationMasters = async () => {
    try {
        for (const notificationMaster of notificationMastersInitial) {
            const existingEventMaster = await NotificationMaster.findOne({ name: notificationMaster.name });
            if (!existingEventMaster) {
                const notificationMasterMaster = new NotificationMaster(notificationMaster);
                await notificationMasterMaster.save();
                console.log(`Inserted notificationMaster name: ${notificationMaster.name}`);
            }
        }
        console.error("initiate notificationMasters been success")
    } catch (error) {
        console.error("failed to initiate notificationMasters")
    }
};

const generateNotificationQueue = async (user:IUser, notificationMaster:INotificationMaster) => {
    try{
        const notificationQueue = new NotificationQueue({
            user: user._id,
            notificationMaster: notificationMaster._id,
            lastStatus: 'success',
            repeat: 0,
            repeatInterval: notificationMaster.repeat,
            templateMessage: notificationMaster.templateMessage,
            location: user.location,
        });
        notificationQueue.dateNotification = await generateLastNotificationDate(user, notificationMaster)
        notificationQueue.dateNotificationLocalTime = momenttz.tz(notificationQueue.dateNotification, user.location).toString();
        console.log("location", user.location)
        console.log("result", momenttz.tz(notificationQueue.dateNotification, user.location))
        console.log(">> generateLastNotificationDate", notificationQueue)

        // generate dateNotification based on the latest Notification Date
        const newNotificationQueue = generateNextNotificationDate(notificationQueue)
        notificationQueue.dateNotification = (await newNotificationQueue).dateNotification
        notificationQueue.dateNotificationLocalTime = momenttz.tz(notificationQueue.dateNotification, user.location).toString();
        notificationQueue.lastStatus = (await newNotificationQueue).lastStatus
        notificationQueue.repeat = (await newNotificationQueue).repeat

        console.log(">> generateNextNotificationDate", notificationQueue)
    
        await notificationQueue.save();
    } catch (error) {
        console.error("Failed to generate notification queue");
        throw new Error("Failed to generate notification queue");
    }
};

const generateLastNotificationDate = async (user: IUser, notificationMaster: INotificationMaster): Promise<Date> => {
    try {
      let lastDateNotification: Date;
      const userFieldName = notificationMaster.userFieldName;
      const notificationDateTime = notificationMaster.dateTime;

      const notificationDate = momenttz.tz(notificationDateTime, user.location).format('YYYY-MM-DD');
      const notificationTime = moment(notificationDateTime).format('HH:mm:ss');
      const newnotificationDateTime = momenttz.tz(`${notificationDate}T${notificationTime}`, user.location).utc().toDate();
  
      if (!userFieldName || userFieldName === "") {
        // Use notificationMaster.dateTime directly
        lastDateNotification = newnotificationDateTime;
      } else {
        // Use the date from user[userFieldName], but with time from notificationMaster.dateTime
        const userDateValue = user[userFieldName];
  
        if (userDateValue && moment(userDateValue).isValid()) {
          // Combine the date from user[userFieldName] and the time from notificationMaster.dateTime
          const userDate = momenttz.tz(userDateValue, user.location).format('YYYY-MM-DD');
          const notificationTime = moment(notificationDateTime).format('HH:mm:ss');
          lastDateNotification = momenttz.tz(`${userDate}T${notificationTime}`, user.location).utc().toDate();
        } else {
          // Use notificationMaster.dateTime if user[userFieldName] is invalid or missing
          lastDateNotification = newnotificationDateTime;
        }
      }
  
      return lastDateNotification;
    } catch (error) {
      console.error("Failed to generate last notification date:", error);
      throw new Error("Failed to generate last notification date");
    }
};

const generateNextNotificationDate = async (notificationQueue: INotificationQueue): Promise<INotificationQueue> => {
    // lastStatus == success, repeat = 0
    // lastStatus == pending/failed, repeat += 1

    // generate next notification date (dateNotification)
    // - notificationQueue.lastStatus == success
    // -- daily: lastDateNotification + 1 day until it > today utc
    // -- monthly: lastDateNotification + 1 month until it > today utc
    // -- yearly: lastDateNotification + 1 year until it > today utc
    // - notificationQueue.lastStatus == pending / failed
    // -- based on the notificationQueue.repeat, 
    // --- 1 will be 
    // -- if it already maximum it will followed lastStatus == success

    let nextDateNotification = momenttz.tz(notificationQueue.dateNotification, notificationQueue.location);

    if (notificationQueue.lastStatus === 'success') {
        // Calculate the next date based on the repeat interval
        switch (notificationQueue.repeatInterval) {
          case 'daily':
            nextDateNotification = nextDateNotification.add(1, 'days');
            while (nextDateNotification.isBefore(moment())) {
              nextDateNotification = nextDateNotification.add(1, 'days');
            }
            break;
          case 'monthly':
            nextDateNotification = nextDateNotification.add(1, 'months');
            while (nextDateNotification.isBefore(moment())) {
              nextDateNotification = nextDateNotification.add(1, 'months');
            }
            break;
          case 'yearly':
            nextDateNotification = nextDateNotification.add(1, 'years');
            while (nextDateNotification.isBefore(moment())) {
              nextDateNotification = nextDateNotification.add(1, 'years');
            }
            break;
        }
    } else if (notificationQueue.lastStatus === 'pending' || notificationQueue.lastStatus === 'failed') {
        while (nextDateNotification.isBefore(moment())) {
            notificationQueue.repeat += 1

            // Calculate the next date based on the repeat count
            switch (true) {
            case (notificationQueue.repeat < 3): // will repeate 3 times every 15min
                nextDateNotification = nextDateNotification.add(15, 'minutes');
                break;
            case (notificationQueue.repeat < 6): // will repeate 3 times every an hours
                nextDateNotification = nextDateNotification.add(1, 'hours');
                break;
            case (notificationQueue.repeat < 9): // will repeate 3 times every a days
                nextDateNotification = nextDateNotification.add(1, 'days');
                break;
            case (notificationQueue.repeat < 12): // will repeate 3 times every a month
                nextDateNotification = nextDateNotification.add(1, 'months');
                break;
            default:
                // If repeat is greater than 4, treat it as success and use the repeat interval logic
                notificationQueue.lastStatus = "success"
                notificationQueue.repeat = 0
                return generateNextNotificationDate(notificationQueue);
            }
        }
    }
    const notificationDate = momenttz.tz(nextDateNotification, notificationQueue.location).format('YYYY-MM-DD');
    const notificationTime = moment(nextDateNotification).format('HH:mm:ss');

    notificationQueue.dateNotification = momenttz.tz(`${notificationDate}T${notificationTime}`, notificationQueue.location).utc().toDate();

    return notificationQueue
}

const generateNotificationLogsAndUpdateNextNotificationQueue = async (notificationQueue: INotificationQueue, error: string) => {
    try {
        // get next date
        const newNotificationQueue = generateNextNotificationDate(notificationQueue)

        // generate logs
        const notificationLog = new NotificationLog({
            notificationQueue: notificationQueue._id,
            dateNotification: notificationQueue.dateNotification,
            nextDateNotification: (await newNotificationQueue).dateNotification,
            status: notificationQueue.lastStatus,
            error: error,
            createdDate: new Date(),
        })
        await notificationLog.save();
        console.log(">> notificationLog", notificationLog);

        // generate new queue
        notificationQueue.dateNotification = (await newNotificationQueue).dateNotification
        notificationQueue.dateNotificationLocalTime = momenttz.tz(notificationQueue.dateNotification, notificationQueue.location).toString();
        notificationQueue.lastStatus = (await newNotificationQueue).lastStatus
        notificationQueue.repeat = (await newNotificationQueue).repeat
        await notificationQueue.save();
        console.log(">> notificationQueue", notificationQueue);

        console.log(`Success create logs`);
    } catch (error) {
        console.error(`Failed to create logs:`, error);
        throw error;
    } 
}

export { generateNotificationLogsAndUpdateNextNotificationQueue, generateNotificationQueue, initiateNotificationMasters };

