export { departmentComplex, Department, groupsItems, contactsItems};

import { complexName } from './shared.ts';

// interface Unit {
//   constructor(
//     id: number,
//     categoryId: number,
//     name: string,
//     pic: string) {
//     }
// }

interface departmentComplex {
    department: complexName,
    university: complexName
}

interface Department {
    _id: number,
    state: number, // 0 - not active,
                   // 1 - active
    departmentIndex: departmentComplex
}

interface groupsItems {
    // units: Unit[],
    groupsIds: number[]
}

interface contactsItems {
    contactsIds: number[],
    findUs: string,
    ourBuildingPic: string,
    publicTransportation: string,
    parkingLocations: string
}
