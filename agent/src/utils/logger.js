/**
 * Logger utility
 */

class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }

  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  error(message) {
    console.error(`❌ Error: ${message}`);
  }

  warn(message) {
    console.warn(`⚠️ Warning: ${message}`);
  }
}

module.exports = Logger;
