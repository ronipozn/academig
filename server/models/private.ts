export { privateNews,
         CreateNews,
         UpdateNews,
         futureMeetingsItems,
         pastMeetingsItems,
         settingsMeetings,
         privateMeeting,
         privateReportsItems,
         settingsReports,
         currentReport,
         peopleReport,
         PersonalInfo,
         Vacation
       };

import { objectMini } from './shared.ts';

// ************** ************** **************
// ************** ************** **************
// **************** Group News ****************
// ************** ************** **************
// ************** ************** **************

interface privateNews {
    _id: string,
    actor: objectMini,
    verb: number,
    object: objectMini,
    time: Date,
    text: string,
    pic: string,
    comments: privateNews[]
}

interface CreateNews {
    actorId: string,
    verb: number,
    objectId: string,
    text: string,
    pic: string
}

interface UpdateNews {
    _id: string,
    objectId: string,
    text: string,
    pic: string
}

// ************** ************** **************
// ************** ************** **************
// ************** Group Calendar **************
// ************** ************** **************
// ************** ************** **************

// interface privateCalendarItems {
//   constructor(
//     meetings: privateMeeting[]
//   ) {}
// }

// ************** ************** **************
// ************** ************** **************
// ************** Group Meetings **************
// ************** ************** **************
// ************** ************** **************

interface futureMeetingsItems {
    settings: settingsMeetings,
    meetings: privateMeeting[]
}

interface pastMeetingsItems {
    settings: settingsMeetings, // define new seetings Object for past meetings
    meetings: privateMeeting[]
}

interface settingsMeetings {
    location: string,
    time: Date,
    startDate: Date,
    endDate: Date,
    // duration: number,
    howOften: number,
    howToAdd: number,
    day: number,
    secondDay: number,
    order: number,
    participants: objectMini[]
}

interface privateMeeting {
    _id: string,
    date: Date,
    location: string,
    presenter: objectMini,
    topic: string,
    files: string,
    activeFlag: boolean
}

// ************** ************** **************
// ************** ************** **************
// ************** Group Reports ***************
// ************** ************** **************
// ************** ************** **************

interface privateReportsItems {
    settings: settingsReports,
    currentReport: currentReport
}

interface settingsReports {
    howOften: number,
    duration: number,
    day: number,
    time: Date,
    whoSee: objectMini[],
    whoSubmit: peopleReport[]
}

interface currentReport {
    submissionDate: Date,
    notification: number,
    whoSee: objectMini[],
    whoSubmit: peopleReport[]
}

interface peopleReport {
    _id: string,
    name: string,
    pic: string,
    title: string,
    file: string,
    submitStatus: number
}

// ************** ************** **************
// ************** ************** **************
// *************** PersonalInfo ***************
// ************** ************** **************
// ************** ************** **************

interface PersonalInfo {
    // statusText: string,
    // statusDate: Date,
    phone: string,
    email: string,
    address: string,
    birthday: Date,
    kids: objectMini[],
    vacations: Vacation[]
}

interface Vacation {
    start: Date,
    end: Date,
    place: string
}
