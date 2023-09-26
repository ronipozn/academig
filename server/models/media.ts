export { Talk, Poster, Press };

import { objectMini } from './shared.ts';

interface Talk {
    id: number,
    title: string,
    location: string,
    date: Date,
    text: string,
    videoId: string,
    presentors: objectMini[],
    projects: objectMini[]
}

interface Poster {
    id: number,
    title: string,
    abstract: string,
    authors: objectMini[],
    location: string,
    date: Date,
    embed: string,
    projects: objectMini[]
}

interface Press {
    id: number,
    title: string,
    source: string,
    date: Date,
    link: string,
    projects: objectMini[]
}
