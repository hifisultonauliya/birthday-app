

<p>Birthday App</p>

## About Birthday App
This is simple apps made by typescript, its a simple api that run schedule as a cron to send notification eg: birthday. 
this using mongodb as a databases. 

## Requirement
-   need to install nodejs in youre machine
-   need to install docker in youre machine

## How to Install
```
git clone https://github.com/hifisultonauliya/birthday-app.git
cd birthday-app
npm install
docker compose up -d --build

#note: all notification masters, notification queue, notification logs, and able to check on databases directly 
```

## App Features
- ATM, initiate notification master is hardcoded in the code. there are 4 sample:
  > yearly repeate, based on the birthday date.
  > monthly repeate, based on the birhday date.
  > daily repeate, based on the date in master
  > monthly repeate, based on the date in master.
- create user, will automatic initiate notification Queue
- delete user, will automatic remove notification Queue
- cron will run every 15min (*/15 * * * *). but in the code was every minutes (for testing purpose)
- api can be access thru localhost:3000

## License
The Birthday App is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Author
Hifi Sulton Auliya **[hifisultonauliya@gmail.com](https://github.com/hifisultonauliya)**
