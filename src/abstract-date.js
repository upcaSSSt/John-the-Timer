export default class AbstractDate {
  constructor() {
    if (this.constructor === AbstractDate)
      throw new TypeError(`Abstract class ${this.constructor.name} can't be instantiated`);
  }

  get type() {
    throw new TypeError(`Abstract method ${this.type.name} is not implemented`);
  }

  get name() {
    throw new Error(`Abstract method ${this.name.name} is not implemented`);
  }

  get date() {
    throw new Error(`Abstract method ${this.date.name} is not implemented`);
  }

  validate() {
    return '';
  }
  
  oldValues() {
    throw new Error(`Abstract method ${this.oldValues.name} is not implemented`);
  }
  
  switchDefaultOffset(defaultOffset) {
    throw new Error(`Abstract method ${this.switchDefaultOffset.name} is not implemented`);
  }
  
  shiftTimezone() {
    throw new Error(`Abstract method ${this.shiftTimezone.name} is not implemented`);
  }

  stop() {
    throw new Error(`Abstract method ${this.shiftTimezone.name} is not implemented`);
  }

  toLocaleString() {
    throw new Error(`Abstract method ${this.toLocaleString.name} is not implemented`);
  }

  async count(interaction) {
    throw new Error(`Abstract method ${this.count.name} is not implemented`);
  }

  echo(sep = ': ', style = '**') {
    throw new Error(`Abstract method ${this.echo.name} is not implemented`);
  }
}
