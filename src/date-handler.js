import { EmbedBuilder } from 'discord.js';
import { datesDb } from '../db.js';
import { client, msOffset, randomColor, defineDate } from './global/global.js';
import PastDate from './past-date.js';
import PastLong from './past-long.js';
import CountdownDate from './countdown-date.js';
import LongDate from './long-date.js';
import MultiDate from './multi-date.js';

export const dates = {};
const deprecatedDates = {};

CountdownDate.singleJob = (singleDate, guildId) => {
  return async () => {
    delDate(dates[guildId].indexOf(singleDate), guildId);
    const tag = await datesDb.findOne({ where: { guildId } });
    if (tag.noticeChannelId) {
      const channel = await client.channels.fetch(tag.noticeChannelId);
      await channel.send({ embeds: [singleDate.farewellNotice()] });
    }
  };
};

MultiDate.multiJob = async (multiDate, guildId) => {
  delDate(dates[guildId].indexOf(multiDate), guildId);
  const tag = await datesDb.findOne({ where: { guildId } });
  if (tag.noticeChannelId) {
    const channel = await client.channels.fetch(tag.noticeChannelId);
    await channel.send({ embeds: [multiDate.farewellNotice()] });
      
    const errMsg = multiDate.validate();
    if (errMsg) {
      channel.send(`Ошибка в мульти дате! ${errMsg}, ${multiDate.toLocaleString()}`);
      return;
    }
  }
  addDate(multiDate, guildId);
}

export async function initDates() {
  const tagList = await datesDb.findAll({ attributes: ['guildId', 'defaultOffset', 'PastDate', 'CountdownDate', 'LongDate', 'MultiDate'] });
  for (const tag of tagList) {
    dates[tag.guildId] = [];
    deprecatedDates[tag.guildId] = [];

    for (const p of JSON.parse(tag.PastDate))
      dates[tag.guildId].push(new PastDate(p.name, new Date(p.date), tag.defaultOffset, p.userOffset));
    
    const countdownDatesUpdated = [];
    for (const p of JSON.parse(tag.CountdownDate)) {
      const cd = new CountdownDate(p.name, new Date(p.date), tag.defaultOffset, p.userOffset, p.farewell);
      cd.cron = CountdownDate.singleJob(cd, tag.guildId);
      if (cd.validate())
        deprecatedDates[tag.guildId].push(cd);
      else {
        dates[tag.guildId].push(cd);
        countdownDatesUpdated.push(cd);
      }
    }

    const longDatesUpdated = [];
    for (const p of JSON.parse(tag.LongDate)) {
      const ld = new LongDate(p.name, new Date(p.date), tag.defaultOffset, p.userOffset, p.farewell);
      ld.cron = CountdownDate.singleJob(ld, tag.guildId);
      if (ld.validate())
        deprecatedDates[tag.guildId].push(ld);
      else {
        dates[tag.guildId].push(ld);
        longDatesUpdated.push(ld);
      }
    }

    const multiUpdated = [];
    for (const p of JSON.parse(tag.MultiDate)) {
      for (const d of p.dates)
        d.date = new Date(d.date);
      
      while (msOffset(p.dates[0].date, p.userOffset) <= new Date()) {
        const stopped = p.dates.shift();
        deprecatedDates[tag.guildId].push(new PastDate(stopped.name, new Date(stopped.date), tag.defaultOffset, stopped.userOffset));
        p.dates.push({ name: stopped.name, date: MultiDate.addDeltas(stopped.date.getFullYear(), stopped.date.getMonth(), stopped.date.getDate(), stopped.date.getHours(), stopped.date.getMinutes(), p.deltas), userOffset: stopped.userOffset, farewell: stopped.farewell });
      }
      const md = new MultiDate(p.dates.map(d => defineDate(d.name, d.date, tag.defaultOffset, d.userOffset, d.farewell)), p.deltas, tag.defaultOffset, tag.guildId);
      md.validate();
      multiUpdated.push(md);
      dates[tag.guildId].push(md);
    }
    dates[tag.guildId].sort((a, b) => Math.abs(a.secToDate()) - Math.abs(b.secToDate()));
    await datesDb.update({ CountdownDate: JSON.stringify(countdownDatesUpdated), LongDate: JSON.stringify(longDatesUpdated), MultiDate: JSON.stringify(multiUpdated) }, { where: { guildId: tag.guildId } });
  }
}

export function toDatesLen(number, guildId) {
  return number > dates[guildId].length ? dates[guildId].length - 1 : number - 1;
}

export async function addDate(newDate, guildId) {
  let insertOn = dates[guildId].length;
  for (let i = 0; i < dates[guildId].length; i++)
  if (Math.abs(dates[guildId][i].secToDate()) > Math.abs(newDate.secToDate())) {
    insertOn = i;
    break;
  }
  dates[guildId].splice(insertOn, 0, newDate);
  const toWrite = dates[guildId].filter(d => d.constructor.name === newDate.constructor.name);
  await datesDb.update({ [newDate.constructor.name]: JSON.stringify(toWrite) }, { where: { guildId } });
}

export function singleJob(guildId) {
  return singleDate => {
    
  };
}

export async function delDate(index, guildId) {
  dates[guildId][index].stop();
  const deleted = dates[guildId].splice(index, 1)[0];
  const toWrite = dates[guildId].filter(d => d.constructor.name === deleted.constructor.name);
  await datesDb.update({ [deleted.constructor.name]: JSON.stringify(toWrite) }, { where: { guildId } });
}

export async function sendDeprecated() {
  for (const tag of await datesDb.findAll({ attributes: ['guildId', 'noticeChannelId'] })) {
    if (!tag.noticeChannelId)
      continue;
  
    deprecatedDates[tag.guildId].sort((a, b) => a.date - b.date);

    const embed = new EmbedBuilder()
      .setColor(randomColor())
      .setTitle('Пока меня не было.....')
      .setDescription(deprecatedDates[tag.guildId].map(d => d.toLocaleString()).join('\n') || 'Ничего не произошло');

    const channel = await client.channels.fetch(tag.noticeChannelId);
    await channel.send({ embeds: [embed] });
  }
}
