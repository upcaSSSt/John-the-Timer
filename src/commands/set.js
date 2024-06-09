import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { CronJob } from 'cron';
import { datesDb } from '../../db.js';
import { client, notices } from '../global/global.js';
import notice from '../notice.js';
import { dates } from '../date-handler.js';

const tagList = await datesDb.findAll({ attributes: ['guildId', 'noticeChannelId', 'defaultOffset', 'notices'] });

for (const tag of tagList) {
  notices[tag.guildId] = {};
  const parsedNotices = JSON.parse(tag.notices);
  for (const offset in parsedNotices)
    addNotice(parsedNotices[offset], tag.guildId, tag.noticeChannelId, +offset, tag.defaultOffset);
}

const dailyGreetings = [
  'Доброе утро!',
  'Добро пожаловать в Сити 17',
  'Привет ✋',
  '👨‍💼',
  'Вечер в хату',
];

export const data = new SlashCommandBuilder()
  .setName('set')
  .setDescription('Задает канал для сообщений')
  .addChannelOption(o => o.setName('channel')
    .setDescription('Канал для сообщений')
    .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread))
  .addIntegerOption(o => o.setName('hour')
    .setDescription('Час, в который будут отправляться уведомления')
    .setMinValue(0)
    .setMaxValue(23))
  .addIntegerOption(o => o.setName('min')
    .setDescription('Минута, в которую будут отправляться уведомления')
    .setMinValue(0)
    .setMaxValue(59))
  .addIntegerOption(o => o.setName('utc-offset')
    .setDescription('Смещение в часах от Гринвича')
    .setMinValue(-12)
    .setMaxValue(12))
  .addIntegerOption(o => o.setName('default-offset')
    .setDescription('Смещение в часах от Гринвича по умолчанию для всего бота')
    .setMinValue(-12)
    .setMaxValue(12));

export async function execute(interaction) {
  let msg;
  let id = null;
  const tag = await datesDb.findOne({ where: { guildId: interaction.guild.id } });
    // attributes: ['guildId', 'noticeChannelId', 'defaultOffset', 'notices']
  
  const channel = interaction.options.getChannel('channel');
  const hour = interaction.options.getInteger('hour');
  const min = interaction.options.getInteger('min');
  const offsetOpt = interaction.options.getInteger('utc-offset');
  const defaultOffsetOpt = interaction.options.getInteger('default-offset') ?? tag.defaultOffset;

  if (channel) {
    id = channel.id;
    msg = `Сообщения будут отправляться в ${channel}`;
    if (offsetOpt !== null) {
      if (hour !== null && min !== null) {
        notices[interaction.guild.id][offsetOpt]?.stop();
        addNotice(`0 ${min} ${hour} * * *`, interaction.guild.id, tag.noticeChannelId, offsetOpt, defaultOffsetOpt);
        msg += `. Добавлено уведомление на ${addZero(hour)}:${addZero(min)} `
          + `(${offsetOpt >= 0 ? '+' : ''}${offsetOpt})`;
      }
      else {
        const source = notices[offsetOpt].cronTime.source.split(' ');
        delNotice(interaction.guild.id, offsetOpt);
        msg += `. Удалено уведомление на ${addZero(source[2])}:${addZero(source[1])} `
          + `(${offsetOpt >= 0 ? '+' : ''}${offsetOpt})`;
      }
    }
  }
  else {
    for (const offset in notices[interaction.guild.id])
      delNotice(interaction.guild.id, offset);
    msg = 'Отправка сообщений и уведомлений отключена';
  }

  const noticesToWrite = {};
  for (const offset in notices[interaction.guild.id])
    noticesToWrite[offset] = notices[interaction.guild.id][offset].cronTime.source;

  for (const date of dates[interaction.guild.id])
    date.switchDefaultOffset(defaultOffsetOpt);
  // setNoticeChannel(id);
  // setDefaultOffset(defaultOffsetOpt);
  await tag.update({ noticeChannelId: id, defaultOffset: defaultOffsetOpt, notices: JSON.stringify(noticesToWrite) });
  /*writeFileSync(join('src', 'db', 'set.json'),
    JSON.stringify({
      noticeChannelId: id,
      defaultOffset,
      notices: noticesToWrite }));*/
  await interaction.reply(msg);
}

function delNotice(guildId, offset) {
  notices[guildId][offset].stop();
  delete notices[guildId][offset];
}

function addZero(toAdd) {
  return toAdd < 10 ? `0${toAdd}` : String(toAdd);
}

function addNotice(source, guildId, noticeChannelId, offset, defaultOffset) {
  notices[guildId][offset] = new CronJob(source, async () => {
    const msgDefaultOffset = `${offset === defaultOffset ? '' : ` (${offset < 0 ? '' : '+'}${offset})`}`;
    const channel = await client.channels.fetch(noticeChannelId);
    const noticeEmbed = notice(offset, msgDefaultOffset, dailyGreetings,
      { name: '\u200B', value: dates[guildId].map(d => d.echo('\n')).join('\n') || 'Ничего не произошло' });
    await channel.send({ embeds: [noticeEmbed] });
  }, null, true, null, null, null, offset * 60);
}
