export { Trend, SubmitTrend };

interface Trend {
  name: string,
  link: string,
  pic: string,
  description: string,
  categories: number[],
  // fields: number[],
  // tldr // eventBenefits

  // timeline
}

interface SubmitTrend {
  trend: string,
}
