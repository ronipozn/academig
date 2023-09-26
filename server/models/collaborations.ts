export { Collaboration, Sponsor };

import { objectMini, Period } from './shared.ts';

interface Collaboration {
  _id: string,
  status: number, // 0 - invite
                  // 1 - decline
                  // 2 - accept
  groupsIds: string[],
  period: Period,
  projects: objectMini[],
  text: string,
  ai: boolean
}

interface Sponsor {
  _id: string,
  period: Period,
  projects: objectMini[],
  name: string,
  link: string
}
