import fs from 'fs';
import watcherConfig from '../watcher-config.ts';

const matchFileEventType = (filename: string) =>
  (Object.entries(watcherConfig).find((entry) => entry[1].test(filename)) || [
    undefined,
  ])[0];

export const startFileWatcher = async (
  changeHandler: (matchedFileType: string) => Promise<void>,
) => {
  console.log('File watcher running');
  try {
    fs.watch('./', { recursive: true }, (event, filename) => {
      if (filename !== null) {
        const matchedFileType = matchFileEventType(filename);
        if (matchedFileType !== undefined) {
          changeHandler(matchedFileType);
        }
      }
    });
  } catch (err: any) {
    console.log(err);
    if (err.name === 'AbortError') return;
    throw err;
  }
};
