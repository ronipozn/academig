import { NgxLoggerLevel } from 'ngx-logger';

export const environment = {
  production: true,

  apiUrl: 'https://www.academig.com/',
  logLevel: NgxLoggerLevel.OFF,
  serverLogLevel: NgxLoggerLevel.OFF,
  // serverLogLevel: NgxLoggerLevel.ERROR,

  companyId: '5d6bbb4d2a8aaa77dd7dc06d',
  pusher: {
    key: '562fc24342c58e11a061',
    cluster: 'eu',
  },
  uploadecare: {
    key: 'db20eafbf3648a36d4d0',
  },
  algolia: {
    institutes: 'institutes',
    companies: 'companies',
    labs: 'labs',
    researchers: 'researchers',
    services: 'services',
    mentors: 'mentors',
    // projects: 'projects',
    apps: 'apps',
    podcasts: 'podcasts',
    events: 'events',
    trends: 'trends',
    kits: 'kits',
    quotes: 'quotes',
    save: 'save',

    daily: 'daily',
    news: 'news',

    morning: 'morninig',
    stories: 'stories',

    posts: 'blog',
  }
};
