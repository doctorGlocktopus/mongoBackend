const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Task = require('./models/task');
require('dotenv').config();

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// cron.schedule('59 23 * * 3', function () { // immer 59minuten, 23stunden, 0Tage, 0WOchen, dritter WOchentag
cron.schedule('* * * * * *', async function () {
    console.log('---------------------');
    console.log('Running Cron Job');
    const tasks = await Task.find({done: false}).populate("user_id", {password: false});
    if (tasks != []) {
        tasks.forEach(task => {
            if (task.done === false) {
                let mailOptions = {
                    from: 'reactLearn@anche.no', // Sender address
                    to: task.user_id.email, // List of recipients
                    subject: 'Warnung!', // Subject line
                    html:
                    `
                    Hey!, die Aufgabe Nr ${task._id} mit dem Titel ${task.title} wurde immer noch nicht erledigt
                    <a href = "http://localhost:3000/tasks/${task._id}">
                        Link zur Aufgabe
                    </a>
                    `,
                };

                transport.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                    }
                });
            }
        });
    }
});
