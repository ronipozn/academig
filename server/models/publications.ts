import { objectMini } from './shared.ts';

// 0 Papers
// 1 Books
// 2 Books Chapters
// 3 Conferences
// 4 Patents
// 5 Reports

export { Publication, PublicationDetails, CreatePublication, Journal, JournalObj };

interface Publication {
    id: number,
    type: number,
    title: string,
    views: number[],
    followStatus: boolean,
    citations: number,
    date: Date,
    authors: objectMini[],
    generalName: string,
    generalNumbers: string
}

interface PublicationDetails {
    id: number,
    type: number,
    title: string,
    views: number[],
    followStatus: boolean,
    citations: number,
    date: Date,
    authors: objectMini[],
    publisher: string,
    abstract: string,
    url: string,
    tags: string[],
    doi: string,
    // projects: objectMini[],
    fundings: objectMini[],
    pdf: string,

    journal: string, // Paper, Report, Conference(conference)
    abbr: string, // Paper, Report
    volume: number, // Paper, Chapter(chapter), Patent(patentNumber), Report(reportNumber)
    issue: number, // Paper
    pages: string, // Paper, Chapter, Conference, Book(length), Patent(applicationNumber)
    edition: string, // Book, Chapter
}

interface CreatePublication {
    type: number,
    title: string,
    parentId: string,

    date: Date,
    authors: objectMini[],
    publisher: string,
    abstract: string,
    abstractPic: string,
    url: string,
    tags: string[],
    doi: string,
    // projects: objectMini[],
    fundings: objectMini[],
    // pdf: string,
    referencesCount: number,
    citationsCount: number,
    journal: Journal, // Paper, Report, Conference(conference)
    abbr: string, // Paper, Report
    volume: number, // Paper, Chapter(chapter), Patent(patentNumber), Report(reportNumber)
    issue: number, // Paper
    pages: string, // Paper, Chapter, Conference, Book(length), Patent(applicationNumber)
    edition: string, // Book, Chapter
    ai: boolean
}

interface Journal {
    name: string,
    issn: string[]
}

interface JournalObj {
    journal: Journal,
    issue: number,
    pages: string,
    publisher: string,
    volume: number
}
