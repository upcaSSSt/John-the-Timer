import { CronJob, CronTime } from 'cron';
import { defineDate } from './global/global.js';
import AbstractDate from './abstract-date.js';

export default class MultiDate extends AbstractDate {
  #defaultOffset;
  
  #dates;
  #deltas;

  static multiJob;

  constructor(dates, deltas, defaultOffset, guildId) {
    super();
    this.#dates = dates;
    this.#deltas = deltas;
    this.#defaultOffset = defaultOffset;
    const job = async () => {
      const stopped = this.#dates.shift().oldValues().flat();
      this.#dates.push(defineDate(stopped[0], this.constructor.addDeltas(stopped[1], stopped[2], stopped[3], stopped[4], stopped[5], this.#deltas), this.#defaultOffset, stopped[6], stopped[7]));
      this.#dates[0].cron = job;
      await this.constructor.multiJob(this, guildId);
    };
    this.#dates[0].cron = job;
  }

  get type() {
    return 'мульти';
  }
  
  get name() {
    return this.#dates[0].name;
  }
  
  get date() {
    return this.#dates[0].date;
  }

  static addDeltas(year, month, day, hour, min, deltas) {
    deltas.push(deltas.shift());
    return new Date(year + deltas.at(-1).year, month + deltas.at(-1).month, day + deltas.at(-1).day, hour + deltas.at(-1).hour, min);
  }
  
  toJSON() {
    return {
      dates: this.#dates.map(d => d.toJSON()),
      deltas: this.#deltas,
    };
  }

  secToDate() {
    return this.#dates[0].secToDate();
  }

  oldValues() {
    const res = Array(12).fill([]);
    for (let i = 0; i < this.#dates.length; i++) {
      const old = this.#dates[i].oldValues();
      old.push(...Object.values(this.#deltas[i]));
      for (let j = 0; j < old.length; j++)
        res[j].push(old[j]);
    }
    return res;
  }
  
  switchDefaultOffset(defaultOffset) {
    for (const date of this.#dates)
      date.switchDefaultOffset(defaultOffset);
    this.#defaultOffset = defaultOffset;
  }
  
  shiftTimezone() {
    return this.#dates[0].shiftTimezone();
  }
  
  farewellNotice() {
    return this.#dates.at(-1).farewellNotice();
  }

  validate() {
    return this.#dates[0].validate();
  }
  
  stop() {
    this.#dates[0].stop();
  }
  
  toLocaleString() {
    return `${this.#dates.map(d => d.toLocaleString()).join('/')} ${this.#deltas.map(d => Object.values(d).join('-')).join('/')}`;
  }

  async count(interaction) {
    await this.#dates[0].count(interaction);
  }
  
  echo(sep = ': ', style = '**') {
    return this.#dates[0].echo(sep, style);
  }
}
