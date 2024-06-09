import { CronJob } from 'cron';
import { msOffset } from './global/global.js';
import PastDate from './past-date.js';
import notice from './notice.js';

export default class CountdownDate extends PastDate {
  static #farewellGreetings = ['Наступила дата', 'Время пришло', '🥳'];

  #farewell;
  #cron;

  static singleJob;

  constructor(name, date, defaultOffset, userOffset = 3, farewell = 'Прощание отсутствует...') {
    super(name, date, defaultOffset, userOffset, Math.floor);
    this.#farewell = farewell;
  }

  get type() {
    return 'одиночная';
  }

  set cron(job) {
    this.#cron = new CronJob(new Date(this.shiftTimezone()), job);
  }

  toJSON() {
    return Object.assign(super.toJSON(), { farewell: this.#farewell });
  }
  
  oldValues() {
    const res = super.oldValues();
    res.push([this.#farewell]);
    return res;
  }

  farewellNotice() {
    return notice(this._userOffset, this._msgUserOffset, CountdownDate.#farewellGreetings, { name: this.name, value: this.#farewell });
  }

  switchDate(delta) {
    this._date = new Date(this._date.getFullYear() + delta.year, this._date.getMonth() + delta.month, this._date.getDate() + delta.day, this._date.getHours() + delta.hour, this._date.getMinutes());
  }

  validate() {
    if (this.shiftTimezone() <= new Date().getTime())
      return 'Дата уже прошла и не является прошлой';
    this.#cron.start();
    return '';
  }

  stop() {
    super.stop();
    console.log(this.#cron ? 'не нал' : 'нал');
    this.#cron?.stop(); ////
  }
}
