export { Mentor, SubmitMentor, Expertise, Availability, OnGoing };

interface Mentor {
  // _id: string,
  // mode: number, // 0 - On Hold
  //               // 1 - Active
  //               // 2 - Canceled
  // standout: number, // [0-3]
  // payment: boolean,
  //
  // group: groupComplex,
  // profile: objectMini,
  // name: string,
  // pic: string,
  // description: string,
  // categoryId: number,
  // price: Price,
  // tags: string[],
  // views: number[],
  // channels: Channel[],
  // followStatus: boolean
}

interface SubmitMentor {
  first_name: string,
  last_name: string,
  linkedin: string,
  position: string,
  experience: string,
  charging: string,
  charing_importance: string,
  pitch: string,
  price_hour: string,
  charging_terms: string,
  background_terms: string,

  academic_writing: number,

  hours: string,
  past_mentoring: string,
  communication_tool: string,
  description: string,
  mindset: string,
  desired_topic: string,
  out_of_the_box: string,
  content: string,
  feedback: string
}

interface Expertise {
  _id: string,
  name: string,
  years: string,
  description: string
}

interface Availability {
  price: number,
  durations: number[],
  times: number[],
  days: number[],
  tools: string[],
  availability: number[]
}

interface OnGoing {
  price: number,
  hours: number,
  details: string
}
