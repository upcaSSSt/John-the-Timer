import { msOffset } from './global/global.js';
import { parseDateOptions } from './global/global-commands.js';
import CountdownDate from './countdown-date.js';

export default class DoubleDate extends CountdownDate {
  #secondName;
  #secondFarewell;
  #secondDate;

  #deltas;
  #secondDeltas;

  constructor(name, secondName, farewell, secondFarewell, year, deltaYear, secondYear, secondDeltaYear,
    month = 0, deltaMonth = 0, secondMonth = 0, secondDeltaMonth = 0, day = 1, deltaDay = 0, secondDay = 1,
    secondDeltaDay = 0, hour = 0, deltaHour = 0, secondHour = 0, secondDeltaHour = 0,
    min = 0, secondMin = 0, countdownOffset = 3, isLocalDate = true) {
    super(name, farewell, new Date(year, month, day, hour, min), countdownOffset, isLocalDate);

    this.#secondName = secondName;
    this.#secondFarewell = secondFarewell;
    this.#secondDate = new Date(secondYear, secondMonth, secondDay, secondHour, secondMin);

    this.#deltas = {
      day: deltaDay,
      month: deltaMonth,
      year: deltaYear,
      hour: deltaHour,
    };
    this.#secondDeltas = {
      day: secondDeltaDay,
      month: secondDeltaMonth,
      year: secondDeltaYear,
      hour: secondDeltaHour,
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...{
        secondName: this.#secondName,
        secondFarewell: this.#secondFarewell,
        secondYear: this.#secondDate.getFullYear(),
        secondMonth: this.#secondDate.getMonth(),
        secondDay: this.#secondDate.getDate(),
        secondHour: this.#secondDate.getHours(),
        secondMin: this.#secondDate.getMinutes(),
        deltaDay: this.#deltas.day,
        deltaMonth: this.#deltas.month,
        deltaYear: this.#deltas.year,
        deltaHour: this.#deltas.hour,
        secondDeltaDay: this.#secondDeltas.day,
        seconfDeltaMonth: this.#secondDeltas.month,
        secondDeltaYear: this.#secondDeltas.year,
        secondDeltaHour: this.#secondDeltas.hour,
      },
    };
  }

  parseEdit(options) {
    return parseDateOptions(options, this._date.getMonth(), this._date.getFullYear(), '', this._name,
      this._farewell, this._date.getDate(), this._date.getHours(), this._date.getMinutes(), this.#deltas)
      .concat(parseDateOptions(options, this.#secondDate.getMonth(), this.#secondDate.getFullYear(), 'second-',
        this.#secondName, this.#secondFarewell, this.#secondDate.getDate(), this.#secondDate.getHours(),
        this.#secondDate.getMinutes(), this.#secondDeltas));
  }

  validate() {
    if (Object.values(this.#deltas).reduce((a, b) => a + b, 0) < 1
      || Object.values(this.#secondDeltas).reduce((a, b) => a + b, 0) < 1)
      return 'Отсутствуют дельты у двойной даты';
    if (!super.isFuture())
      return 'Первая дата уже прошла';
    if (this.#secondDate - msOffset(this.#secondDate.getTimezoneOffset(), this._userOffset)
      < super.shiftTimezone())
      return 'Вторая дата раньше первой';
    return null;
  }

  stop() {
    super.stop();
    return new DoubleDate(
      this.#secondName, this._name,
      this.#secondFarewell, this._farewell,
      this.#secondDate.getFullYear(), this.#secondDeltas.year, this._date.getFullYear() + this.#deltas.year,
      this.#deltas.year, this.#secondDate.getMonth(), this.#secondDeltas.month,
      this._date.getMonth() + this.#deltas.month, this.#deltas.month, this.#secondDate.getDate(),
      this.#secondDeltas.day, this._date.getDate() + this.#deltas.day, this.#deltas.day,
      this.#secondDate.getHours(), this.#secondDeltas.hour, this._date.getHours() + this.#deltas.hour,
      this.#deltas.hour, this.#secondDate.getMinutes(), this._date.getMinutes(),
      this._userOffset, this._isLocalDate);
  }

  toLocaleString() {
    return `${super.toLocaleString()} ${this.#deltas.day}-${this.#deltas.month}-${this.#deltas.year}-`
      + `${this.#deltas.hour}/${this.#secondName} на ${this.#secondDate.toLocaleString('ru-RU')} `
      + `${this.#secondDeltas.day}-${this.#secondDeltas.month}-${this.#secondDeltas.year}-`
      + `${this.#secondDeltas.hour}`;
  }
}
