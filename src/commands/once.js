import { SlashCommandBuilder } from 'discord.js';
import { datesDb } from '../../db.js';
import { defineDate } from '../global/global.js';
import { addDateOptions, parseDateOptions } from '../global/global-commands.js';

export const data = addDateOptions(
  new SlashCommandBuilder()
    .setName('once')
    .setDescription('Выводит оставшееся время до указанной даты 1 раз'));

export async function execute(interaction) {
  const tag = await datesDb.findOne({ where: { guildId: interaction.guild.id } });
  const [year, month, day, hour, min, utcOffset] = parseDateOptions(interaction.options, 1, tag.defaultOffset);

  const date = defineDate('', new Date(year[0], month[0], day[0], hour[0], min[0]), tag.defaultOffset, utcOffset[0], true);
  await interaction.reply(`${date.date.toLocaleString('ru-RU')} ${date.echo(':\n', '')}`);
}
