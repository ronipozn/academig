export { CreateProfile,
         CreatePosition,
         PositionStatus,
         Position,
         Honor,
         Funding,
         Outreach,
         Service,
         Society,
         Language,
         People,
         Journal,

         Publication,
         complexEmail,
         PositionMini,
         Invite,
         PeopleNavBar,
         Profile,
         ReportItem,
       };

import { objectMini, objectMiniPosition, groupComplex, Period, Quote } from './shared.ts';
import { Interview } from './groups.ts';

interface CreateProfile {
    firstName: string,
    lastName: string,
    country_id: number,
    pic: string,

    background: string,
    interests: string[],

    position: number,
    period: Period,
    university: string,
    department: string,
    group: string,

    challengeGoal: number,

    names: string[],

    theme: number,
    themeIndex: number,
    cover: string,

    groupsIds: string[],

    buildMode: number,
    buildPro: number,
    interview: Interview,
    papersKitStatus: number,
    mentorStatus: number,
    members: objectMiniPosition[],
    currentWebsite: string,
    group_size: number,
    establishDate: Date,
    topic: string[]
}

interface CreatePosition {
    titles: number[],
    period: Period,
    groupComplex: groupComplex
}

interface PositionStatus {
    id: number,
    statusCode: number,
    acceptedCode: number,
    statusText: string,
    appliedDate: Date
}

interface Position {
    _id: string,
    status: number,
           // 2 - alumni
           // 3 - visitor
           // 4 - member
           // 5 - admin
           // 6 - super admin
           // 7 - on behalf
           // 8 - dummy member
           // 9 - dummy alumni
           // 10 - marketer
    mode: number,
           // 0 - Invitstion sent
           // 1 - Declined
           // 2 - Accepted / Active User
    period: Period,
    titles: number[],
    locations: groupComplex
}

// interface Degree {
//     _id: string,
//     status: number,
//     mode: number,
//     period: Period,
//     titles: string[],
//     locations: groupComplex,
//     field: string,
//     honor: string,
//     cgpa: number,
//     thesis: string
// }

interface Honor {
    period: Period,
    name: string
}

interface Funding {
    period: Period,
    external: boolean,
    link: string,
    name: string,
    pic: string
}

interface Outreach {
    period: Period,
    name: string,
    role: string
}

interface Service {
    period: Period,
    journal: string,
    role: number
}

interface Society {
    name: string
}

interface Language {
    language: string,
    level: number
}

interface People {
    _id: string,
    name: string,
    stage: number[],
    pic: string,
    progress: boolean[],
    email: string,
    positions: Position[],
    followStatus: boolean
}

interface Journal {
    name: string,
    issn: string[]
}

interface Publication {
    _id: string,
    type: number,
    title: string,
    views: number[],
    followStatus: boolean,
    citations: number,
    date: Date,
    authors: objectMini[],
    abstract: string,
    abstractPic: string,
    doi: string,
    pdf: string,
    citationsCount: number,
    tags: string[],

    journal: Journal, // Paper, Report, Conference(conference)
    volume: number, // Paper, Chapter(chapter), Patent(patentNumber), Report(reportNumber)
    issue: number, // Paper
    edition: string, // Book, Chapter
    pages: string // Paper, Chapter, Conference, Book(length), Patent(applicationNumber)
}

interface complexEmail {
    address: string,
    updated: Date,
    stage: number
}

interface PositionMini {
    coverPic: string,
    status: number,
    mode: number,
    titles: number[],
    period: Period,
    email: complexEmail,
    group: groupComplex
}

interface Invite {
    mode: number,
    group: groupComplex,
    publication: Publication
}

interface PeopleNavBar {
    _id: string,
    name: string,
    pic: string,
    coverPic: string,
    stage: number,
    compareIds: string[],
    progress: boolean[],
    quantity: number,
    unseen: number,
    unread: number,
    positions: PositionMini[],
    invites: Invite[],
    token: string
}

interface Profile {
    // completenessPercent: number,
    // completenessSuggest: string,
    // highlights: any[],
    progress: boolean[],

    _id: string,
    name: string,
    pic: string,

    quote: Quote,
    coverPic: string,
    followStatus: boolean,
    background: string,
    meetClip: string,
    researchInterests: string[],
    positions: Array<Position>,
    honors: Array<Honor>,
    // fundings: Array<Funding>,
    outreach: Array<Outreach>,
    // teachings: Array<Teaching>,
    services: Array<Service>,
    societies: Array<Society>,
    languages: Array<Language>,
    recreationalInterests: string[]
}

interface ReportItem {
    _id: string,
    groupId: string,
    date: Date,
    title: string,
    file: string,
    submitStatus: number
}
