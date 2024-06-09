import { SlashCommandBuilder } from 'discord.js';
import { dates, toDatesLen } from '../date-handler.js';

export const data = new SlashCommandBuilder()
  .setName('echo')
  .setDescription('Выводит оставшееся время')
  .addIntegerOption(o => o.setName('number')
    .setDescription('Номер выводимой даты')
    .setMinValue(1)
    .setAutocomplete(true));

export async function execute(interaction) {
  const number = interaction.options.getInteger('number');
  if (number)
    await interaction.reply(dates[interaction.guild.id][toDatesLen(number, interaction.guild.id)].echo());
  else
    await interaction.reply(`>>> ${dates[interaction.guild.id].map(d => d.echo()).join('\n')}`);
}
