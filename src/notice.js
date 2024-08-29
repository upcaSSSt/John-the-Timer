import { EmbedBuilder } from 'discord.js';
import { MS_DAY, randomColor } from './global/global.js';
// ${offset === defaultOffset ? '' : ` (${offset < 0 ? '' : '+'}${offset})`}
const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export default function notice(offset, msgDefaultOffset, titles, fields) {
  const now = new Date();
  return new EmbedBuilder().setColor(randomColor()).setTitle(choice(titles))
    .addFields({ name: 'Сегодня',
      value: `${now.toLocaleString('ru-RU')}${msgDefaultOffset}. ${daysOfWeek[now.getDay()]} `
        + `(День ${Math.floor((now - new Date(now.getFullYear(), 0, 1)) / MS_DAY) + 1})` }).addFields(fields);
}

function choice(seq) {
  return seq[Math.floor(seq.length * Math.random())];
}
