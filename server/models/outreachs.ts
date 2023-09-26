import { Period } from './shared.ts';

export { Outreach };

interface Outreach {
  _id: string,
  period: Period,
  name: string,
  link: string,
  pic: string,
  caption: string,
  clip: string,
  location: string,
  description: string
}
