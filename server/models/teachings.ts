import { Period } from './shared.ts';

export { Teaching };

interface Teaching {
  _id: string,
  period: Period,
  id: string,
  name: string,
  role: number,
  university: string
}
