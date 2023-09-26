export { Podcast, SubmitPodcast };

interface Podcast {
  name: string,
  link: string,
  pic: string,
  description: string,
  categories: number[],
  // fields: number[],
  // tldr // podcastBenefits

  type: number,
  website: string,
  release: string,
  language: number,
  total: number,
  latest: Date,
}

interface SubmitPodcast {
  podcastName: string,
  podcastURL: string,
  podcastMarkets: string,
  podcastType: number,
  podcastDescription: string,
  podcastBenefits: string,
  podcastYear: number,
  podcastUsers: number,

  email: string,
  twitter: string,
  firstName: string,
  lastName: string,
  role: string,

  goal: number,

  referred: string,
  comments: string
}
