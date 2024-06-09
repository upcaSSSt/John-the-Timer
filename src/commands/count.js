import { SlashCommandBuilder } from 'discord.js';
import { dates, toDatesLen } from '../date-handler.js';

export const data = new SlashCommandBuilder()
  .setName('count')
  .setDescription('Начинает/останавливает обратный отсчет')
  .addIntegerOption(o => o.setName('number')
    .setDescription('Номер отсчитываемой даты, по умолчанию 1')
    .setMinValue(1)
    .setAutocomplete(true));

export async function execute(interaction) {
  const index = toDatesLen(interaction.options.getInteger('number') ?? 1, interaction.guild.id);
  await dates[interaction.guild.id][index].count(interaction);
}
