export { projectMini, OpenPositionApply, Position, PositionDetails };

import { groupComplex } from './shared.ts';

interface projectMini {
    id: string,
    name: string,
    pic: string,
    spotsAvailable: number
}

interface OpenPositionApply {
    grades: string[],
    letters: string[],
    referees: string[]
}

interface OpenPositionApplyInfo {
  id: string,
  status: number,
  date: Date[],
  grades: string[],
  letters: string[],
  referees: Referee[]
}

interface Referee {
  // member: objectMini,
  member: string,
  // type: number,
  // status: number,
  email: string,
  description: string
}

interface Position {
    // groupId: number,
    id: number,
    group: groupComplex,
    title: string,
    internalId: string,
    description: string,
    spotsAvailable: number,
    deadline: Date,
    deadlineType: number,
    startDate: Date,
    startDateType: number,
    note: string,
    views: number[],
    stepsDeadlines: string[],
    stepsTypes: number[],
    activeStep: number,

    apply: OpenPositionApplyInfo // dynamic
}

interface PositionDetails {
    id: number,
    group: groupComplex,
    title: string,
    style: boolean,
    internalId: string,
    description: string,
    posted_on: Date,
    spotsAvailable: number,
    deadline: string,
    startDate: string,
    note: string,
    views: number[],
    status: number,
    stepsDeadlines: string[],
    stepsTypes: number[],
    activeStep: number,

   apply: OpenPositionApplyInfo, // dynamic

    longDescription: string,
    schoolarship: string,
    duties: string,
    expectations: string,
    requiredEducation: string,
    requiredExperience: string,
    contractLength: string,
    hours: string,
    salary: number,
    tags: string[],
    projects: projectMini[]
}
