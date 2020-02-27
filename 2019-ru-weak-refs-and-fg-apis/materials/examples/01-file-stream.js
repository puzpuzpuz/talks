// source: https://github.com/tc39/proposal-weakrefs
'use strict';

class FileStream {
  static _cleanUp(holdings) {
    for (const file of holdings) {
      console.error(`File leaked: ${file}!`);
    }
  }

  static _registry = new FinalizationRegistry(this._cleanUp);
  _file;

  constructor(fileName) {
    this._file = new File(fileName);
    FileStream._registry.register(this, this._file, this);
    // eagerly trigger async read of file contents into this.data
  }

  close() {
    FileStream._registry.unregister(this);
    File.close(this._file);
    // other cleanup
  }

  async *[Symbol.iterator]() {
    // read data from this._file
  }
}

const fs = new FileStream('path/to/some/file');

for await (const data of fs) {
  // do something
}
fs.close();