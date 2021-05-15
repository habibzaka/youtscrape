const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const fetch = require("node-fetch");
const fs = require('fs');
dotenv.config();

const BASE_URL = "https://instagram.com/";
const PROFIL_URL = (username) => `https://instagram.com/${username}/?__a=1`;
const URL_VIDEO = (shortCode) => `https://www.instagram.com/p/${shortCode}/?__a=1`;
var scrapedData = [];

const insta = {
    browser: null,
    page: null,

    initialize: async() => {

        insta.browser = await puppeteer.launch({
            headless: false
        });

        insta.page = await insta.browser.newPage();

        await insta.page.goto(BASE_URL, { waitUntil: "networkidle2" });
    },


    login: async() => {

        await insta.page.goto(BASE_URL, { waitUntil: "networkidle2" });

        const jaccepteSelector = 'body > div.RnEpo.Yx5HN._4Yzd2 > div > div > button.aOOlW.bIiDR';
        await insta.page.waitForSelector(jaccepteSelector);
        await insta.page.click(jaccepteSelector);

        await insta.page.waitFor(1000);

        await insta.page.type('input[name="username"]', process.env.IG_USERNAME, { delay: 50 });
        await insta.page.type('input[name="password"]', process.env.IG_PASSWORD, { delay: 50 });

        const loginSelector = '#loginForm > div > div:nth-child(3) > button > div';
        await insta.page.waitForSelector(loginSelector);
        await insta.page.click(loginSelector);

        const homeSelector = '#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.oJZym > a > div > div > img';
        await insta.page.waitForSelector(homeSelector);
        await insta.page.waitFor(4000);


    },

    getVideoProcess: async(usernames = []) => {

        for (let username of usernames) {

            await insta.page.goto(PROFIL_URL(username), { waitUntil: "networkidle2" });

            let profilUrlResponse = await insta.page.content();
            let profilUrlResponseJson = JSON.parse(profilUrlResponse.replace(/<[^>]*>?/gm, ''));
            let videoNodes = profilUrlResponseJson.graphql.user.edge_felix_video_timeline.edges;

            for (let videoNode of videoNodes) {



                await insta.page.goto(URL_VIDEO(videoNode.node.shortcode), { waitUntil: "networkidle2" });
                let urlVideoResponse = await insta.page.content();
                let urlVideoResponseJson = JSON.parse(urlVideoResponse.replace(/<[^>]*>?/gm, ''));
                let videoUrl = urlVideoResponseJson.graphql.shortcode_media.video_url.split('amp;').join('');

                scrapedData.push({
                    "name": profilUrlResponseJson.graphql.user.full_name,
                    "shortcode": videoNode.node.shortcode,
                    "title": videoNode.node.title,
                    "video_url": videoUrl
                });
            }



            //await insta.browser.close()

            // await insta.page.goto(scrapedData[0].video_url, { waitUntil: "networkidle2" });



        }

        // console.log(scrapedData);

        // const response = await fetch('https://scontent-cdg2-1.cdninstagram.com/v/t50.2886-16/10000000_903178453851352_354375975715698124_n.mp4?_nc_ht=scontent-cdg2-1.cdninstagram.com&_nc_cat=104&_nc_ohc=Rcb4cD-TlqEAX9PPbxQ&edm=AABBvjUBAAAA&ccb=7-4&oe=60A21BBF&oh=6a76e397aee487cb3ff7953ccb8e9dbd&_nc_sid=83d603');
        // const buffer = await response.buffer();
        // fs.writeFile(`./name.mp4`, buffer, () =>
        //     console.log('finished downloading video!'));



    }
}


module.exports = insta;