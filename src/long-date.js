import { msOffset } from './global/global.js';
import PastLong from './past-long.js';
import CountdownDate from './countdown-date.js';

export default class LongDate extends CountdownDate {
  get type() {
    return 'длинная';
  }
  
  echo(sep = ': ', style = '**') {
    const now = new Date();
    const years = new Date(this.secToDate()).getFullYear() - 1970;
    const sec = Math.trunc(this.secToDate() / 1000);
    const hours = this._rounder(sec / 3600);
    const min = this._rounder(sec / 60);
    // Если дата прошла в этом году, то ставим следующий год, иначе текущий
    const d2 = new Date(msOffset(new Date(now.getFullYear() + 1, this._date.getMonth(), this._date.getDate(), this._date.getHours(), this._date.getMinutes()), this._userOffset));
    
    return `${style}${this._name}${style}${sep}${years}г ${this._rounder((this._date - d2) / 86_400_000)}дн ${hours % 24}ч ${min % 60}мин ${sec % 60}сек\n`
      + `(${this._rounder(sec / 86_400).toLocaleString('ru')}дн ${hours.toLocaleString('ru-RU')}ч ${min.toLocaleString('ru-RU')}мин ${sec.toLocaleString('ru-RU')}сек)`;
  }
}
