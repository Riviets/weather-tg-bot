import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const url = 'https://meteo.ua/';

export async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (e) {
        console.log("Помилка: " + e);
    }
}

export function fillFile(file) {
    fetchHTML(url).then(async (data) => {
        const $ = cheerio.load(data);
        let weather = [];
        $('a.info-tile').each((index, element) => {
            const city = $(element).find('.info-tile__city').text().trim();
            const tempDegree = $(element).find('.info-tile__degree').text().trim();
            const tempLabel = $(element).find('.info-tile__label').text().trim();
            const tempPercentage = $(element).find('.info-tile__value').text().trim();
            weather.push({
                city: city,
                tempDegree: tempDegree,
                tempLabel: tempLabel,
                tempPercentage: tempPercentage
            });
        });
        fs.writeFile(file, JSON.stringify(weather, null, 2), () => {});
    });
}

