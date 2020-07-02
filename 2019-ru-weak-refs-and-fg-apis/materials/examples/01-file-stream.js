// source: https://github.com/tc39/proposal-weakrefs
'use strict';

class FileStream {
  static #cleanUp(heldValue) {
    console.error(`File leaked: ${file}!`);
  }

  static #finalizationGroup = new FinalizationRegistry(FileStream.#cleanUp);

  #file;

  constructor(fileName) {
    this.#file = new File(fileName);
    FileStream.#finalizationGroup.register(this, this.#file, this);
    // eagerly trigger async read of file contents into this.data
  }

  close() {
    FileStream.#finalizationGroup.unregister(this);
    File.close(this.#file);
    // other cleanup
  }

  async *[Symbol.iterator]() {
    // read data from this.#file
  }
}

const fs = new FileStream('path/to/some/file');

for await (const data of fs) {
  // do something
}
fs.close();
