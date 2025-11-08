import fs from 'fs';
import watcherConfig from '../watcher-config.js';

const matchFileEventType = (filename) =>
  (Object.entries(watcherConfig).find((entry) => entry[1].test(filename)) || [
    undefined,
  ])[0];

export const startFileWatcher = async (changeHandler) => {
  console.log('File watcher running');
  try {
    fs.watch('./', { recursive: true }, (event, filename) => {
      const matchedFileType = matchFileEventType(filename);
      if (matchedFileType !== undefined) {
        changeHandler(matchedFileType);
      }
    });
  } catch (err) {
    console.log(err);
    if (err.name === 'AbortError') return;
    throw err;
  }
};
