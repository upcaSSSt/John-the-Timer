import { msOffset } from './global/global.js';
import PastLong from './past-long.js';
import CountdownDate from './countdown-date.js';

export default class LongDate extends CountdownDate {
  get type() {
    return 'длинная';
  }
  
  echo(sep = ': ', style = '**') {
    const now = new Date();
    const years = new Date(this.shiftTimezone() - now).getFullYear() - 1970;
    const sec = this.secToDate();
    const hours = this._rounder(sec / 3600);
    const min = this._rounder(sec / 60);
    const d2 = new Date(msOffset(new Date(this._date.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()), this._userOffset));

    return `${style}${this._name}${style}${sep}${years}г ${this._rounder((this._date - d2) / 86_400_000)}дн ${hours % 24}ч ${min % 60}мин ${sec % 60}сек\n`
      + `(${this._rounder(sec / 86_400).toLocaleString('ru')}дн ${hours.toLocaleString('ru-RU')}ч ${min.toLocaleString('ru-RU')}мин ${sec.toLocaleString('ru-RU')}сек)`;
  }
}
