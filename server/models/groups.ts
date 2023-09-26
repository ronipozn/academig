export { CreateGroup,
         Group,
         Relation,
         Interview,
         homePageItems,
         peoplesPageItems,
         resourcesPageItems,
         projectsPageItems,
         collaborationsPageItems,
         fundingsItems,
         positionsPageItems,
         mediaItems,
         faqPageItems,
         contactsPageItems
       };

import { groupComplex, Affiliation, Quote, Period } from './shared.ts';
import { FAQ } from './faqs.ts';
import { Category } from './resources.ts';
import { Collaboration } from './collaborations.ts';

interface CreateGroup {
    buildMode: number,
    firstInstituteEmail: string,
    position: number,
    period: Period,
    secondInstituteEmail: string,
    secondPosition: number,
    secondName: string,
    secondPic: string,
    secondStartDate: string,
    currentWebsite: string,
    allowSendEmails: boolean,
    university: string,
    department: string,
    unit: string,
    group: string,
    logo: string,
    country_id: number,
    group_size: number,
    topic: string[],
    establishDate: string,
    background: string,
    interests: string[],
    names: string[],
    theme: number,
    themeIndex: number,
    cover: string,
    privacy: number
}

interface Group {
    _id: string,
    onBehalf: number,
    welcome: number,
    stage: number,
            // -1 build for me (wait button)
            // 0 initial (publish button)
            // 1 under review (withdraw button)
            // 2 published (settings button)
            // 3 on hold (unhold button)
            // 4
            // 5 from scratch
            // 6 delete
            // 7 improve (set by Academig)
            // 8 decline (set by Academig)
            // 9 on hold (set by Academig)
    dates: Date[],
            // [0] - Creation Date
            // [1] - Submitted Date
            // [2] - Published Date
            // [3] - Deleted Date
    extScore: number,
    intScore: number,
    progress: boolean[],
    coverPic: string,
    groupIndex: groupComplex,
    membersCount: number,
    unit: string,
    pic: string,
    // ------------------------
    relation: Relation, // relation of User visit the site to the group (dynamic)
    collaboration: Collaboration, // collaboration info (dynamic)
    followStatus: boolean, // User visit the site follow status (dynamic)
    followAdminStatus: boolean[]
}

interface Relation {
    status: number,
           // 0 - none,
           // 1 - waiting
           // 2 - alumni
           // 3 - visitor
           // 4 - member
           // 5 - admin
           // 6 - super admin
           // 7 - on behalf
    text: string,
    period: Period,
    email_stage: number
}

interface Interview {
    status: boolean,
    email: string
}

interface homePageItems {
    background: string,
    pic: string,
    quote: Quote,
    thanks: string,
    intrests: string[],
    twitter: string,
    affiliations: Affiliation
}

interface peoplesPageItems {
    activesIds: string[],
    visitorsIds: string[],
    alumniIds: string[],
    visitUs: string
}

interface resourcesPageItems {
    background: string,
    categories: Category[]
}

interface projectsPageItems {
    background: string,
    layManText: string,
    layManPic: string
}

interface collaborationsPageItems {
    industries: string[],
    governments: string[],
    collaborateWithUs: string
}

interface fundingsItems {
    fundingsIds: string[]
}

interface positionsPageItems {
    whyJoin: string,
    diversity: string
}

interface mediaItems {
    talksIds: string[],
    postersIds: string[],
    pressesIds: string[]
}

interface faqPageItems {
    faqs: FAQ[]
}

interface contactsPageItems {
    findUs: string,
    findUsPic: string,
    findUsCaption: string
}

// * Group class.
// function Group (group_data) {
//     this.name = group_data.name;
//     this.date = group_data.date;
//     this.title = group_data.title;
//     this.description = group_data.description;
//     this._id = group_data._id;
// }
//
// Group.prototype.name = null;
// Group.prototype.date = null;
// Group.prototype.title = null;
// Group.prototype.description = null;
//
// Group.prototype.response_obj = function () {
//     return { name: this.name,
//              date: this.date,
//              title: this.title,
//              description: this.description };
// };
