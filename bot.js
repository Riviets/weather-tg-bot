import { fillFile } from './parser.js'
import { fetchHTML } from './parser.js'
import TelegramBot from 'node-telegram-bot-api'
import * as cheerio from 'cheerio';
import fs from 'fs'

const token = '7599821718:AAGDWyT62x-cciRrAZzotcRxjMfA7PddN7U'
const bot = new TelegramBot(token, { polling: true })
const url = 'https://meteo.ua/'

fillFile('weather.json')

async function parseDetailedInfo(url) {
        const data = await fetchHTML(url);
        const $ = cheerio.load(data);
        const desc = $('.page-header-info__title').text().trim();
        let weekWeather = [];
        
        $('.menu-basic__item').each((index, element) => {
            const dayOfWeek = $(element).find('.menu-basic__day').text().trim().slice(0, 2) + ", " + $(element).find('.menu-basic__day').text().trim().slice(6, 7);
            const date = $(element).find('.menu-basic__month').text().trim();
            const day = `${dayOfWeek} ${date}`;
            const degree = $(element).find('.menu-basic__degree').text().trim();
            
            weekWeather.push({
                day: day,
                degree: degree
            });
        });

        return {
            desc: desc,
            weekWeather: weekWeather
        };
}


bot.setMyCommands([
    {command: '/khm', description: "Погода в Хмельницькому"},
    {command: '/ter', description: 'Погода в Тернополі'},
    {command: '/vin', description: "Погода в Вінниці"},
    {command: '/lviv', description: "Погода в Львові"},
])

function findWeatherForCity(cityName) {
    const data = fs.readFileSync('weather.json');
    const weatherData = JSON.parse(data);
    const cityWeather = weatherData.find(city => city.city.toLowerCase() === cityName.toLowerCase());

    if (cityWeather) {
        return `Погода у місті ${cityWeather.city}:\nТемпература: ${cityWeather.tempDegree}\nОпис: ${cityWeather.tempLabel}\nВологість: ${cityWeather.tempPercentage}`;
    }
    else {
        return `На жаль, інформації про місто ${cityName} не знайдено.`;
    }
}

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();
    if(text === '/start'){
        bot.sendMessage(chatId, "Ласкаво просимо!\nВведіть назву міста, яке вас цікавить.")
    }
    if (text.startsWith('/')) {
        return;
    }
    const weatherInfo = findWeatherForCity(text);
    bot.sendMessage(chatId, weatherInfo);
});


bot.onText(/\/ter/, async (msg) => {
    const chatId = msg.chat.id;
    const detailedInfo = await parseDetailedInfo('https://meteo.ua/ua/47/ternopol');
    let message = `Погода у Тернополі:\n${detailedInfo.desc}\n\nНа тиждень:\n`;
    detailedInfo.weekWeather.forEach(dayInfo => {
        message += `${dayInfo.day}: ${dayInfo.degree}\n`;
    });
    bot.sendMessage(chatId, message);
});

bot.onText(/\/lviv/, async (msg) => {
    const chatId = msg.chat.id;
    const detailedInfo = await parseDetailedInfo('https://meteo.ua/ua/44/lvov');
    let message = `Погода у Львові:\n${detailedInfo.desc}\n\nНа тиждень:\n`;
    detailedInfo.weekWeather.forEach(dayInfo => {
        message += `${dayInfo.day}: ${dayInfo.degree}\n`;
    });
    bot.sendMessage(chatId, message);
});

bot.onText(/\/khm/, async (msg) => {
    const chatId = msg.chat.id;
    const detailedInfo = await parseDetailedInfo('https://meteo.ua/ua/49/khmelnitskiy');
    let message = `Погода у Хмельницькому:\n${detailedInfo.desc}\n\nНа тиждень:\n`;
    detailedInfo.weekWeather.forEach(dayInfo => {
        message += `${dayInfo.day}: ${dayInfo.degree}\n`;
    });
    bot.sendMessage(chatId, message);
});

bot.onText(/\/vin/, async (msg) => {
    const chatId = msg.chat.id;
    const detailedInfo = await parseDetailedInfo('https://meteo.ua/ua/71/vinnitsa');
    let message = `Погода у Вінниці:\n${detailedInfo.desc}\n\nНа тиждень:\n`;
    detailedInfo.weekWeather.forEach(dayInfo => {
        message += `${dayInfo.day}: ${dayInfo.degree}\n`;
    });
    bot.sendMessage(chatId, message);
});
