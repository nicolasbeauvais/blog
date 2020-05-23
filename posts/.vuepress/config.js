const path = require('path');

module.exports = {
  title: 'Invariance',
  description: 'Exploring all subject around software engineering, developer productivity and life.',
  dest: path.resolve(__dirname, '../../dist'),
  evergreen: true,
  locales: {
    '/': { lang: 'en' },
  },
  head: [
    ['link', { rel: 'shortcut icon', href: '/favicon.svg' }],
    ['meta', { name: 'keywords', content: 'Invariance, Nicolas Beauvais, blog, Software engineering, Vuejs, JavaScript, Laravel, PHP, Python, Linux' }],
    ['meta', { name: 'author', content: 'Nicolas Beauvais' }],
  ],
  ga: 'UA-29129365-3',
  themeConfig: {
    author: 'Nicolas Beauvais',
  },
  plugins: [
    '@vuepress/google-analytics',
    ['sitemap', { hostname: 'https://invariance.dev' }],
    ['disqus', {
      shortname: 'invariance',
    }],
    ['vuepress-plugin-rss',
      {
        base_url: '/',
        site_url: 'https://invariance.dev',
        copyright: '2020 Invariance',
        count: 100
      }
    ]
  ],
}
