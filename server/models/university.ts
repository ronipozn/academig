export { CreateDepartment };

import { Period } from './shared.ts';

interface CreateDepartment {
  name: string,
  link: string,
  pic: string,
  description: string,
  source: string,
  website: string
}
