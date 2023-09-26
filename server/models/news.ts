export { News };

import { objectMini, groupComplex } from './shared.ts';

interface News {
    id: number,
    actor: objectMini,
    verb: string,
    object: objectMini,
    target: groupComplex,
    time: string,
    text: string
}
