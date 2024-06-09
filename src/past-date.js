import { MS_DAY, MS_HOUR, msOffset } from './global/global.js';
import AbstractDate from './abstract-date.js';

export default class PastDate extends AbstractDate {
  _name;
  _date;
  _userOffset;

  _msgUserOffset;
  #switcher;
  #countInterval;

  _rounder;

  constructor(name, date, defaultOffset, userOffset = 3, rounder = Math.ceil) {
    super();
    
    this._name = name;
    this._date = date;
    this._userOffset = userOffset;

    this.switchDefaultOffset(defaultOffset);
    this.#switcher = true;

    this._rounder = rounder;
  }

  get type() {
    return 'прошлая';
  }

  get name() {
    return `${this._name}${this._msgUserOffset}`;
  }

  get date() {
    return this._date;
  }

  toJSON() {
    return {
      name: this._name,
      date: this._date,
      userOffset: this._userOffset,
    };
  }

  secToDate() {
    return msOffset(this._date, this._userOffset) - new Date();
  }
  
  oldValues() {
    return [[this._name], [this._date.getFullYear()], [this._date.getMonth()], [this._date.getDate()], [this._date.getHours()], [this._date.getMinutes()], [this._userOffset]];
  }

  switchDefaultOffset(defaultOffset) {
    if (this._userOffset === defaultOffset)
      this._msgUserOffset = '';
    else {
      const plus = this._userOffset >= 0 ? '+' : '';
      this._msgUserOffset = ` (${plus}${this._userOffset})`;
    }
  }
  
  shiftTimezone() {
    return msOffset(this._date, this._userOffset);
  }
  
  stop() {
    clearInterval(this.#countInterval);
  }

  toLocaleString() {
    return `${this.name} на ${this._date.toLocaleString('ru-RU')}`;
  }

  async count(interaction) {
    if (this.#switcher) {
      await interaction.reply(`Начат обратный отсчет!!! ${this.toLocaleString()}`);
      const msg = await interaction.followUp(this._rounder(this.secToDate() / 1000).toLocaleString('ru-RU'));
      this.#countInterval = setInterval(() => msg.edit(this._rounder(this.secToDate() / 1000).toLocaleString('ru-RU')), 1000);
      this.#switcher = false;
    }
    else {
      clearInterval(this.#countInterval);
      await interaction.reply(`Отсчет остановлен ${this.toLocaleString()}`);
      this.#switcher = true;
    }
  }

  echo(sep = ': ', style = '**') {
    const sec = this._rounder(this.secToDate() / 1000);
    const hours = this._rounder(sec / (MS_HOUR / 1000));
    const min = this._rounder(sec / 60);
    return `${style}${this.name}${style}${sep}${this._rounder(sec / (MS_DAY / 1000))}дн ${hours % 24}ч ${min % 60}мин ${sec % 60}сек\n`
      + `(${hours.toLocaleString('ru-RU')}ч ${min.toLocaleString('ru-RU')}мин ${sec.toLocaleString('ru-RU')}сек)`;
  }
}
