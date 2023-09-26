export { GroupApprove, MarketingItem };

import { groupComplex } from './shared.ts';

interface GroupApprove {
  _id: string,
  onBehalf: number,
  currentWebsite: string,
  stage: number,
          // -1 build for me (wait button)
          // 0 initial (publish button)
          // 1 under review (withdraw button)
          // 2 adminpublished (settings button)
          // 3 user on hold (unhold button)
          // 4 user delete (recover button) (show recoverable period)
          // 5 admin on hold (no button)
          // 6 admin delete (no button)
          // 7 admin improve (publish button)
          // 8 admin decline (no button)
  dates: Date[],
          // [0] - Creation Date
          // [1] - Submitted Date
          // [2] - Published Date
          // [3] - Deleted Date
  extScore: number,
  intScore: number,
  progress: boolean[],
  groupIndex: groupComplex
}

interface MarketingItem {
  counter: number,
  url: string,
  text: string,
  pics: string[]
}
