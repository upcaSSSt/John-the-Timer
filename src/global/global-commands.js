export function addCountdownDateOptions(slashCommand, msgByDefault = ', по умолчанию ', requireName = true) {
  let msgDefaultOne;
  let msgDefaultCur;
  let msgDefaultZero;
  let msgDefaultOffset;

  if (msgByDefault) {
    msgDefaultOne = '1';
    msgDefaultCur = 'текущий';
    msgDefaultZero = '00';
    msgDefaultOffset = 'default-offset';
  }
  else {
    msgDefaultOne = '';
    msgDefaultCur = '';
    msgDefaultZero = '';
    msgDefaultOffset = '';
  }
  
  slashCommand.addStringOption(o => o.setName('name')
    .setDescription('Названия дат, разделенные /')
    .setRequired(requireName))
  .addStringOption(o => o.setName('farewell')
    .setDescription('Прощания дат, разделенные /'));
  addDateOptions(slashCommand, msgByDefault, msgDefaultOne, msgDefaultCur, msgDefaultZero, msgDefaultOffset)
  .addStringOption(o => o.setName('delta-day')
    .setDescription(`Кол-во дней, разделенных пробелом, после которых дата повторится${msgByDefault}${msgDefaultZero.slice(-1)}`))
  .addStringOption(o => o.setName('delta-month')
    .setDescription(`Кол-во месяцев, разделенных пробелом, после которых дата повторится${msgByDefault}${msgDefaultZero.slice(-1)}`))
  .addStringOption(o => o.setName('delta-year')
    .setDescription(`Кол-во лет, разделенных пробелом, после которых дата повторится${msgByDefault}${msgDefaultZero.slice(-1)}`))
  .addStringOption(o => o.setName('delta-hour')
    .setDescription(`Кол-во часов, разделенных пробелом, после которых дата повторится${msgByDefault}${msgDefaultZero.slice(-1)}`));
  return slashCommand;
}

export function addDateOptions(slashCommand, msgByDefault = ', по умолчанию ', msgDefaultOne = '1',
  msgDefaultCur = 'текущий', msgDefaultZero = '00', msgDefaultOffset = 'default-offset') {
  return slashCommand.addStringOption(o => o.setName('day')
    .setDescription(`День${msgByDefault}${msgDefaultOne}`))
  .addStringOption(o => o.setName('month')
    .setDescription(`Месяц${msgByDefault}${msgDefaultCur}`))
  .addStringOption(o => o.setName('year')
    .setDescription(`Год${msgByDefault}${msgDefaultCur}`))
  .addStringOption(o => o.setName('hour')
    .setDescription(`Час${msgByDefault}${msgDefaultZero}`))
  .addStringOption(o => o.setName('min')
    .setDescription(`Минута${msgByDefault}${msgDefaultZero}`))
  .addStringOption(o => o.setName('utc-offset')
    .setDescription(`UTC-смещение в часах${msgByDefault}${msgDefaultOffset}`))
}

export function parseCountdownDateOptions(options, defaultOffset, oldNames = [], oldDays = [], oldMonths = [], oldYears = [], oldHours = [], oldMins = [], oldOffsets = [], oldFarewells = [], oldDeltasDay = [], oldDeltasMonth = [], oldDeltasYear = [], oldDeltasHour = []) {
  const names = options.getString('name') ? options.getString('name').split('/') : [];
  names.push(...oldNames.slice(names.length));
  const farewells = parse(options, 'farewell', oldFarewells, names.length, 'Прощание отсутствует...', '/', o => o);
  const deltasDay = parse(options, 'delta-day', oldDeltasDay, names.length, 0);
  const deltasMonth = parse(options, 'delta-month', oldDeltasMonth, names.length, 0);
  const deltasYear = parse(options, 'delta-year', oldDeltasYear, names.length, 0);
  const deltasHour = parse(options, 'delta-hour', oldDeltasHour, names.length, 0);
  return [names, ...parseDateOptions(options, names.length, defaultOffset, oldDays, oldMonths, oldYears, oldHours, oldMins, oldOffsets), farewells, deltasDay, deltasMonth, deltasYear, deltasHour];
}

function parse(options, name, oldValues, nDates, defaultValue, splitter = ' ', parser = s => isNaN(s) ? defaultValue : +s) {
  const splitted = options.getString(name) ? options.getString(name).split(splitter).map(parser) : [];
  splitted.push(...oldValues.slice(splitted.length));
  splitted.push(...Array(Math.max(0, nDates - splitted.length)).fill(defaultValue));
  return splitted;
}

export function parseDateOptions(options, nDates, defaultOffset, oldDays = [], oldMonths = [], oldYears = [], oldHours = [], oldMins = [], oldOffsets = []) {
  const now = new Date();
  const days = parse(options, 'day', oldDays, nDates, 1);
  const months = parse(options, 'month', oldMonths, nDates, now.getMonth(), ' ', m => +m - 1);
  const years = parse(options, 'year', oldYears, nDates, now.getFullYear());
  const hours = parse(options, 'hour', oldHours, nDates, 0);
  const mins = parse(options, 'min', oldMins, nDates, 0);
  const utcOffsets = parse(options, 'utc-offset', oldOffsets, nDates, defaultOffset);
  return [years, months, days, hours, mins, utcOffsets];
}
