import { SlashCommandBuilder } from 'discord.js';
import { datesDb } from '../../db.js'
import { client, notices, noticeChannel, defaultOffset } from '../global/global.js';
import { dates, toDatesLen } from '../date-handler.js';

export const data = new SlashCommandBuilder()
  .setName('conf')
  .setDescription('Выводит настройки')
  .addIntegerOption(o => o.setName('number')
    .setDescription('Номер выводимой даты')
    .setMinValue(1)
    .setAutocomplete(true));

export async function execute(interaction) {
  const number = interaction.options.getInteger('number');
  if (number)
    await interaction.reply(dates[interaction.guild.id][toDatesLen(number, interaction.guild.id)].toLocaleString());
  else {
    const tag = await datesDb.findOne({ where: { guildId: interaction.guild.id } });
    const noticesConf = Object.entries(notices[interaction.guild.id]).map(n => `${n[0]}: ${Object.keys(n[1].cronTime.hour)[0]}:${Object.keys(n[1].cronTime.minute)[0]}\n`).join('');
    const datesConf = dates[interaction.guild.id].map((d, i) => `${i + 1} - ${d.toLocaleString()}`).join('\n');
    await interaction.reply(`>>> ${tag.noticeChannelId ? await client.channels.fetch(tag.noticeChannelId) : 'Уведомления отключены'} (${tag.defaultOffset})\n${noticesConf}\n${datesConf}`);
  }
}
