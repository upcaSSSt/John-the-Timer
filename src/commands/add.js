import { SlashCommandBuilder } from 'discord.js';
import { datesDb } from '../../db.js';
import { defineDate } from '../global/global.js';
import { addCountdownDateOptions, parseCountdownDateOptions } from '../global/global-commands.js';
import CountdownDate from '../countdown-date.js';
import MultiDate from '../multi-date.js';
import { addDate, singleJob } from '../date-handler.js';
import confirm from '../confirmation.js';

export const data = addCountdownDateOptions(new SlashCommandBuilder()
  .setName('add')
  .setDescription('Создает дату, при указании нескольких имен - мульти дату'));

export async function execute(interaction) {
  let newDate;

  const tag = await datesDb.findOne({ where: { guildId: interaction.guild.id } });
  const [names, years, months, days, hours, mins, utcOffsets, farewells, deltasDay, deltasMonth, deltasYear, deltasHour] = parseCountdownDateOptions(interaction.options, tag.defaultOffset);
  
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
    newDate = defineDate(names[0], new Date(years[0], months[0], days[0], hours[0], mins[0]), tag.defaultOffset, utcOffsets[0], farewells[0], fd => fd.cron = CountdownDate.singleJob(fd, interaction.guild.id));

  await confirm(interaction, `Будет добавлена дата ${newDate.toLocaleString()}`, 'Добавление даты отменено', async () => {
    const errMsg = newDate.validate();
    if (errMsg)
      return `Ошибка! ${errMsg}, ${newDate.toLocaleString()}`;
    await addDate(newDate, interaction.guild.id);
    return `Успешно добавлена ${newDate.type} дата ${newDate.toLocaleString()}`;
  });
}
