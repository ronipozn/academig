export { Event, SubmitEvent };

interface Event {
  name: string,
  link: string,
  pic: string,
  description: string,
  categories: number[],
  // fields: number[],
  // tldr // eventBenefits

  type: number,
  website: string,
  start: Date,
  end: Date,
  language: string,
  register: string,
  price: number,
}

interface SubmitEvent {
  eventName: string,
  eventURL: string,
  eventMarkets: string[],
  eventType: number,
  eventDescription: string,
  eventBenefits: string,
  eventStartDate: Date,
  eventEndDate: Date,

  companyName: number,

  email: string,
  twitter: string,
  firstName: string,
  lastName: string,
  role: string,

  goal: number,
  goalMain: number,
  goalType: number,
  productVersion: number,
  priceFull: number,

  referred: string,
  comments: string
}
