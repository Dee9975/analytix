import {Injectable, NotFoundException} from "@nestjs/common";
import {GameModel} from "./game.model";
import axios from "axios";
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import {OddsModel} from "./odds.model";

@Injectable()
export class GamesService {
    async formatData(source: string): Promise<GameModel[]> {
        const response = await axios.get(`http://${source}/x/feed/f_3_0_2_en_1`, {
            headers: {
                "X-Fsign": "SW9D1eZo"
            }
        });
        const data = response.data;
        let returnData = [];
        const splitData = data.split("~");
        splitData.forEach(((gameData) => {
            const singleData = [];
            gameData.split("¬").forEach(((game) => {
                game.split("\n").forEach(value => {
                    const row = value.split("÷");
                    singleData.push(row);
                });
            }));
            returnData.push(singleData);
        }));
        let fullData = [];
        returnData.forEach(rows => {
            let home_name = "";
            let away_name = "";
            let status_game;
            let status_game_code = 0;
            let home_scored_first = 0;
            let away_scored_first = 0;
            let home_scored_second = 0;
            let away_scored_second = 0;
            let home_scored_second3 = 0;
            let away_scored_second3 = 0;
            let home_scored_second4 = 0;
            let away_scored_second4 = 0;
            let match_date = "";
            let match_id = "";
            let sport_id = "";
            let tour_name = "";
            let country_id = "";
            rows.forEach(row => {
                switch (row[0]) {
                    case "AA":
                        match_id = row[1];
                        break;
                    case "AE":
                        home_name = row[1];
                        break;
                    case "AF":
                        away_name = row[1];
                        break;
                    case "AB":
                        status_game = row[1];
                        break;
                    case "AC":
                        status_game_code = row[1];
                        break;
                    case "AD":
                        const date = new Date(row[1] * 1000);
                        const hours = date.getHours();
                        const minutes = "0" + date.getMinutes();
                        const seconds = "0" + date.getSeconds();
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const month = months[date.getMonth()];
                        const day = date.getDay();
                        const year = date.getFullYear();
                        const formattedTime = day + "/" + month + "/" + year + " | " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                        match_date = formattedTime.toString();
                        break;
                    case "BA":
                        home_scored_first = row[1];
                        break;
                    case "BB":
                        away_scored_first = row[1];
                        break;
                    case "BC":
                        home_scored_second = row[1];
                        break;
                    case "BD":
                        away_scored_second = row[1];
                        break;
                    case "BE":
                        home_scored_second3 = row[1];
                        break;
                    case "BF":
                        away_scored_second3 = row[1];
                        break;
                    case "BG":
                        home_scored_second4 = row[1];
                        break;
                    case "BH":
                        away_scored_second4 = row[1];
                        break;
                    case "SA":
                        sport_id = "Unknown";
                        break;
                    case "ZA":
                        tour_name = row[1];
                        break;
                    case "ZB":
                        country_id = row[1];
                        break;
                }
            });
            if (typeof status_game != "undefined") {
                fullData.push(
                    new GameModel(
                        match_id,
                        home_name,
                        away_name,
                        status_game,
                        status_game_code,
                        home_scored_first,
                        home_scored_second,
                        home_scored_second3,
                        home_scored_second4,
                        away_scored_first,
                        away_scored_second,
                        away_scored_second3,
                        away_scored_second4,
                        sport_id,
                        tour_name,
                        country_id,
                        match_date.toString(),
                    ));
            }
        });
        return fullData;
    }

    async getChampionship(id: string) {

    }

    async getOdds(id: string, source: string): Promise<{}> {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setDefaultTimeout(65000);
            await page.goto(`http://${source}/match/${id}/#odds-comparison/over-under`, {waitUntil: "networkidle2"});
            // await page.click("#odds-comparison");
            // await page.waitForSelector("#block-moneyline-ft-include-ot");
            const content = await page.content();
            await browser.close();
            const $ = cheerio.load(content);
            let parsed;
            $("script").each(((index, element) => {
                if (typeof $(element).get()[0].children[0] !== "undefined") {
                    let script: string = $(element).get()[0].children[0].data;
                    if (script.includes("environment")) {
                        script = script.trim();
                        script = script.substr(0, script.length - 1);
                        script = script.replace("var environment =" , "");
                        parsed = JSON.parse(script);
                    }
                }
            }));
            const teams = parsed.participantsData;
            const bookmakers = parsed.odds.bookmakersData.default;

            return {
                teams,
                bookmakers,
            };
        } catch (e) {
            throw new NotFoundException(e.toString());
        }
    }


}
