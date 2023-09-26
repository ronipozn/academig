export { Contact };

import { objectMini } from './shared.ts';

interface Contact {
  _id: string,
  title: number,
  pic: string,
  mode: number,
  member: objectMini,
  address: string,
  phone: string,
  fax: string,
  email: string
}
