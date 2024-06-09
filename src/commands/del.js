import { SlashCommandBuilder } from 'discord.js';
import { dates, toDatesLen, delDate } from '../date-handler.js';
import confirm from '../confirmation.js';

export const data = new SlashCommandBuilder()
  .setName('del')
  .setDescription('Удаляет дату')
  .addIntegerOption(o => o.setName('number')
    .setDescription('Номер удаляемой даты')
    .setMinValue(1)
    .setAutocomplete(true));

export async function execute(interaction) {
  let number = interaction.options.getInteger('number');

  if (number) {
    number = toDatesLen(number, interaction.guild.id);

    await confirm(interaction, `Вы уверены, что хотите удалить ${dates[interaction.guild.id][number].name}?`,
      'Удаление отменено', () => {
        const name = dates[interaction.guild.id][number].name;
        delDate(number, interaction.guild.id);
        return `Удалено ${name}`;
      });
  }
  else {
    await confirm(interaction, 'Вы уверены, что хотите удалить **ВСЕ** даты?', 'Удаление отменено',
      () => {
        for (let i = 0; i < dates[interaction.guild.id].length; i++)
          delDate(i, interaction.guild.id);
        return 'Даты удалены';
      });
  }
}
