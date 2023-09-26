export { App, SubmitApp };

interface App {
  name: string,
  link: string,
  pic: string,
  description: string,
  categories: number[],
  // fields: number[],
  // tldr // productBenefits

  type: number,
  website: string,
  release: string,
  language: number,
  company: string,
  price: number,
}

interface SubmitApp {
  productName: string,
  productURL: string,
  productMarkets: string[],
  productType: number,
  productDescription: string,
  productBenefits: string,

  companyName: number,
  companyYear: number,
  companyUsers: number,
  companyRevenue: number,

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
