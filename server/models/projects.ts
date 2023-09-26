export { Topic, CreateProject, Project, ProjectDetails };

import { objectMini, groupComplex, Period } from './shared.ts';
import { FAQ } from './faqs.ts';

interface Topic {
    _id: string,
    name: string
}

interface CreateProject {
    _id: string,
    name: string,
    pic: string,
    period: Period,
    description: string,
    group: groupComplex,
    collaborations: groupComplex[],
    people: objectMini[],
    fundings: objectMini[]
}

interface Project {
    _id: string,
    name: string,
    pic: string,
    period: Period,
    description: string,
    group: groupComplex,
    views: number[],
    followStatus: boolean
}

interface ProjectDetails {
    _id: string,
    name: string,
    pic: string,
    description: string,
    group: groupComplex,

    period: Period,
    views: number[],
    followStatus: boolean,

    background: string,
    backgroundPic: string,
    goals: string,
    faqs: FAQ[],
    collaborations: objectMini[],
    people: objectMini[],
    fundings: objectMini[],
    // publicationsIds: number[],
    // talksIds: number[],
    // postersIds: number[],
    // pressesIds: number[],
    // resourcesIds: number[],
    showcases: number[]
}
