import fetch from "node-fetch";

const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandom = (array) => {
    return array[getRandomInt(0, array.length - 1)];
};

const generateFilename = (length) => {
    let string = "";

    for (let i = 0; i < length; i++) {
        string += getRandom(charset);
    }

    return string;
};

const logToWebhook = (url, file, ip) => {
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: null,
            embeds: [
                {
                    color: null,
                    fields: [
                        {
                            name: "Filename",
                            value: file.filename,
                        },
                        {
                            name: "URL",
                            value: `[${file.name}](https://${process.env.DOMAIN}/${file.name})`,
                        },
                        {
                            name: "Size",
                            value: `${file.size} MB`,
                        },
                        {
                            name: "IP",
                            value: `||${ip}||`,
                        },
                    ],
                },
            ],
            username: "File Upload",
            avatar_url: "https://i.imgur.com/YzIGmLn.jpg",
        }),
    });
};

export { getRandomInt, getRandom, generateFilename, logToWebhook };
