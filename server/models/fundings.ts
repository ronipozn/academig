export { fundingRole, fundingPeriods, Funding };

import { objectMini, groupComplex } from './shared.ts';

interface fundingRole {
    member: objectMini,
    type: number, // 0 - none
                         // 1 - PI
                         // 2 - Coordinator
                         // 3 - Speaker
    status: number, // 0 - invite
                           // 1 - declined
                           // 2 - accepted
    description: string
}

interface fundingPeriods {
    start: Date,
    end: Date,
    mode: number,
    amount: number,
    currency: number
}

interface Funding {
    id: string,
    name: string,
    groups: groupComplex[],
    officalId: number,
    pic: string,
    abbr: string,
    link: string,
    description: string,
    totalAmounts: number[],
    periods: fundingPeriods[],
    roles: fundingRole[],
    projects: objectMini[]
}
