import { SlashCommandBuilder } from 'discord.js';
import { datesDb } from '../../db.js';
import { defineDate } from '../global/global.js';
import { addCountdownDateOptions, parseCountdownDateOptions } from '../global/global-commands.js';
import MultiDate from '../multi-date.js';
import { dates, singleJob, toDatesLen, delDate, addDate } from '../date-handler.js';
import confirm from '../confirmation.js';

export const data = addCountdownDateOptions(new SlashCommandBuilder()
  .setName('edit')
  .setDescription('Редактирует дату, не указанные параметры оставляет прежними')
  .addIntegerOption(o => o.setName('number')
    .setDescription('Номер редактируемой даты')
    .setMinValue(1)
    .setRequired(true)
    .setAutocomplete(true)), '', false);

export async function execute(interaction) {
  const index = toDatesLen(interaction.options.getInteger('number'), interaction.guild.id);

  let newDate;
  const oldDate = dates[interaction.guild.id][index];

  const tag = await datesDb.findOne({ where: { guildId: interaction.guild.id } });
  const [oldNames, oldYears, oldMonths, oldDays, oldHours, oldMins, oldOffsets, oldFarewells, oldDeltasDay, oldDeltasMonth, oldDeltasYear, oldDeltasHour] = oldDate.oldValues();
  const [names, years, months, days, hours, mins, utcOffsets, farewells, deltasDay, deltasMonth, deltasYear, deltasHour] = parseCountdownDateOptions(
    interaction.options, tag.defaultOffset, oldNames, oldDays, oldMonths, oldYears, oldHours, oldMins, oldOffsets, oldFarewells ?? [], oldDeltasDay ?? [], oldDeltasMonth ?? [], oldDeltasYear ?? [], oldDeltasHour ?? []
  );

  if (deltasDay.reduce((pv, cv) => pv + cv) + deltasMonth.reduce((pv, cv) => pv + cv) + deltasYear.reduce((pv, cv) => pv + cv) + deltasHour.reduce((pv, cv) => pv + cv) > 0) {
    const newDates = [];
    const deltas = [];
    
    for (let i = 0; i < names.length; i++)
      newDates.push(defineDate(names[i], new Date(years[i], months[i], days[i], hours[i], mins[i]), tag.defaultOffset, utcOffsets[i], farewells[i]));
    
    for (let i = 0; i < newDates.length; i++)
      deltas.push({ day: deltasDay[i], month: deltasMonth[i], year: deltasYear[i], hour: deltasHour[i] });
    newDate = new MultiDate(newDates, deltas, tag.defaultOffset, interaction.guild.id);
  }
  else
    newDate = defineDate(names[0], new Date(years[0], months[0], days[0], hours[0], mins[0]), tag.defaultOffset, utcOffsets[0], farewells[0], singleJob(interaction.guild.id));
  
  await confirm(interaction, `Будет изменена дата ${oldDate.name} -- ${newDate.toLocaleString()}`,
    'Изменение даты отменено', async () => {
      delDate(index, interaction.guild.id);
      const errMsg = newDate.validate();
      if (errMsg)
        return `Ошибка! ${errMsg}, ${newDate.toLocaleString()}`;
      await addDate(newDate, interaction.guild.id);
      return `Изменена ${oldDate.type} дата ${oldDate.name} -- ${newDate.toLocaleString()}`;
    });
}
