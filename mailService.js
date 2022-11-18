const cron = require('node-cron');
const Task = require('./models/task');
const Mailjet = require('node-mailjet');
require('dotenv').config();

// cron.schedule('* * * * * * ', async function () { // jede Sekunde
cron.schedule('59 23 * * 3', async function () { // immer 59minuten, 23stunden, 0Tage, 0WOchen, dritter WOchentag
    console.log('---------------------');
    console.log('Running Cron Job');
    const tasks = await Task.find({done: false}).populate("user_id", {password: false});
    if (tasks != []) {
        tasks.forEach(task => {
            if (task.done === false) {
                const mailjet = Mailjet.apiConnect(process.env.PUBLICMAIL,
                    process.env.PRIVATEMAIL,
                    {
                        config: {},
                        options: {},
                    });
                const request = mailjet
                    .post('send', {version: 'v3.1'})
                    .request({
                        "Messages": [
                            {
                                "From": {
                                    "Email": "laskoferrari@gmail.com",
                                    "Name": "Fabian",
                                },
                                "To": [
                                    {
                                        "Email": `${task.user_id.email}`,
                                        "Name": `${task.usernamse}`,
                                    },
                                ],
                                "Subject": "Aufgabe noch nicht erledigt",
                                "TextPart":
                                `
                                Hey!, die Aufgabe Nr ${task._id} mit dem Titel ${task.title} wurde immer noch nicht erledigt
                                    <a href = "http://localhost:3000/tasks/${task._id}">
                                        Link zur Aufgabe
                                    </a>
                                `,
                                "HTMLPart":
                                `
                                Hey!, die Aufgabe Nr ${task._id} mit dem Titel ${task.title} wurde immer noch nicht erledigt
                                    <a href = "http://localhost:3000/tasks/${task._id}">
                                        Link zur Aufgabe
                                    </a>
                                `,
                                "CustomID": "AppGettingStartedTest",
                            },
                        ],
                    });

                request
                    .then((result) => {
                        console.log(result.body);
                    })
                    .catch((err) => {
                        console.log(err.statusCode);
                    });
            }
        });
    }
});