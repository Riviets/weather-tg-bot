import { fillFile } from './parser.js';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';

const token = '7599821718:AAGDWyT62x-cciRrAZzotcRxjMfA7PddN7U';
const bot = new TelegramBot(token, { polling: true });

fillFile('weather.json');

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
    const cityName = msg.text.trim();
    const weatherInfo = findWeatherForCity(cityName);
    bot.sendMessage(chatId, weatherInfo);
});