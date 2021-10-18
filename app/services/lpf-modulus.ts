export class LPF {
  private smoothing: number;
  private buffer: number[];
  private bufferMaxSize: number;

  constructor(smoothing: number) {
    this.smoothing = smoothing || 0.5; // must be smaller than 1
    this.buffer = []; // FIFO queue
    this.bufferMaxSize = 10;
  }

  /**
   * Init buffer with array of values
   *
   * @param {array} values
   * @returns {array}
   * @access public
   */
  public init(values: number[]) {
    for (var i = 0; i < values.length; i++) {
      this.__push(values[i]);
    }
    return this.buffer;
  }

  /**
  * Smooth value from stream
  *
  * @param {integer|float} nextValue
  * @returns {integer|float}
  * @access public
  */
  public next(nextValue: number) {
    var self = this;
    // push new value to the end, and remove oldest one
    var removed = this.__push(nextValue);
    // smooth value using all values from buffer
    var result = this.buffer.reduce(function (last, current) {
      return self.smoothing * current + (1 - self.smoothing) * (last || 0);
    }, removed);
    // replace smoothed value
    this.buffer[this.buffer.length - 1] = result || 0;
    return result;
  }

  public shiftBuffer(modulusShift: number) {
    // Shift all buffer except the last value
    for (let i = 0; i <= Math.max(this.buffer.length - 2, 0); i++) {
      this.buffer[i] = this.buffer[i] + modulusShift;
    }
  }


  public nextModulus(nextValue: number, modulus: number): number {
    var self = this;
    // push new value to the end, and remove oldest one
    let lastValue = this.buffer[this.buffer.length - 1];
    let removed = this.__push(nextValue);

    if (nextValue - lastValue >= 0.9 * modulus) {
      this.shiftBuffer(modulus);
    }
    if (nextValue - lastValue < -0.9 * modulus) {
      this.shiftBuffer(-modulus);
    }

    // smooth value using all values from buffer
    var result = this.buffer.reduce((last, current) => {
      last = last || 0;

      return self.smoothing * current + (1 - self.smoothing) * last;
    }, removed);
    // replace smoothed value
    this.buffer[this.buffer.length - 1] = result || 0;
    return result as number;
  }

  /**
   * Smooth array of values
   *
   * @param {array} values
   * @returns {undefined}
   * @access public
   */
  public smoothArray(values: number[]) {
    var value = values[0];
    for (var i = 1; i < values.length; i++) {
      var currentValue = values[i];
      value += (currentValue - value) * this.smoothing;
      values[i] = Math.round(value);
    }
    return values;
  }

  /**
   * Add new value to buffer (FIFO queue)
   *
   * @param {integer|float} value
   * @returns {integer|float}
   * @access private
   */
  private __push(value: number) {
    var removed = (this.buffer.length === this.bufferMaxSize)
      ? this.buffer.shift()
      : 0;

    this.buffer.push(value);
    return removed;
  }
}
