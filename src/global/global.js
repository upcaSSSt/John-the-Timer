import { Client, GatewayIntentBits } from 'discord.js';
import PastDate from '../past-date.js';
import CountdownDate from '../countdown-date.js';
import LongDate from '../long-date.js';

export const MS_DAY = 60 * 60 * 24 * 1000; // 86_400
export const MS_HOUR = 60 * 60 * 1000; // 3_600
export const MS_MIN = 60 * 1000;

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.TOKEN);

export let noticeChannel;
export let defaultOffset;
export const notices = {};

export async function setNoticeChannel(id) {
  noticeChannel = id ? await client.channels.fetch(id) : null;
}

export function setDefaultOffset(offset) {
  defaultOffset = offset;
}

function msOffset2(dateOffset, hourOffset = 3) {
  return dateOffset * MS_MIN + MS_HOUR * hourOffset;
}

export function msOffset(date, hourOffset = 3) {
  return date - (date.getTimezoneOffset() * MS_MIN + MS_HOUR * hourOffset);
}

export function randomColor() {
  return Math.floor(Math.random() * (16_777_216 - 1_050_000) + 1_050_000);
}

export function defineDate(name, date, defaultOffset, utcOffset, farewell = 'Прощание отсутствует...', onFuture = fd => {}) {
  const now = new Date();
  if (msOffset(date, utcOffset) < now)
    return new PastDate(name, date, defaultOffset, utcOffset);
  let futureDate;
  if (new Date(date - now).getFullYear() - 1970 < 1)
    futureDate = new CountdownDate(name, date, defaultOffset, utcOffset, farewell);
  else
    futureDate = new LongDate(name, date, defaultOffset, utcOffset, farewell);
  onFuture(futureDate);
  return futureDate;
}

console.log(new Date().getTimezoneOffset());
