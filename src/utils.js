import fs from 'fs'
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(filename)

function makeId(data){
    let initialId = 1;

    for (var i = 0; i <= data.length; i++) {
        initialId = data.length + 1;
        }
    return initialId;
}

export default makeId;