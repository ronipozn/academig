import { NgxLoggerLevel } from 'ngx-logger';

export const environment = {
  production: false,

  apiUrl: 'http://localhost:4200/',
  logLevel: NgxLoggerLevel.DEBUG,
  serverLogLevel: NgxLoggerLevel.OFF,

  companyId: '5faedfdc7db3dec4fff547d9',
  auth: {
    // callbackURL: 'http://localhost:4200/#/callback'
    callbackURL: 'http://localhost:4200/callback'
  },
  pusher: {
    key: '562fc24342c58e11a061',
    cluster: 'eu',
  },
  uploadecare: {
    key: 'c367913a2486a422f3ab',
  },
  algolia: {
    institutes: 'dev_institutes',
    companies: 'dev_companies',
    labs: 'dev_labs',
    researchers: 'dev_researchers',
    services: 'dev_services',
    mentors: 'dev_mentors',
    // projects: 'dev_projects',
    apps: 'dev_apps',
    podcasts: 'dev_podcasts',
    events: 'dev_events',
    trends: 'dev_trends',
    kits: 'dev_kits',
    quotes: 'dev_quotes',
    save: 'dev_save',

    daily: 'dev_daily',
    news: 'dev_news',

    morning: 'dev_morning',
    stories: 'dev_stories',

    posts: 'dev_blog',
  },

};

import 'zone.js/dist/zone-error';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
