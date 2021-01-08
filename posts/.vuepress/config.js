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
  ga: 'UA-29129365-12',
  themeConfig: {
    author: 'Nicolas Beauvais',
  },
  plugins: [
    [
      'sitemap',
      {
        hostname: 'https://invariance.dev'
      }
    ],
    [
      'disqus',
      {
        shortname: 'invariance',
      }
    ],
    [
      'vuepress-plugin-rss',
      {
        base_url: '/',
        site_url: 'https://invariance.dev',
        copyright: (new Date()).getFullYear() + ' Invariance',
        count: 100
      }
    ],
    [
      'autometa',
      {
        canonical_base: 'https://invariance.dev',
        author: {
          name   : 'Nicolas Beauvais',
          twitter: 'w3Nicolas',
        },

        site: {
          name   : 'Invariance',
        },
        description_sources: [
          'frontmatter',
          'excerpt',
          /^((?:(?!^#)(?!^\-|\+)(?!^[0-9]+\.)(?!^!\[.*?\]\((.*?)\))(?!^\[\[.*?\]\])(?!^\{\{.*?\}\})[^\n]|\n(?! *\n))+)(?:\n *)+\n/img,
          /<p(?:.*?)>(.*?)<\/p>/i,
        ],
        image_sources: [
          'frontmatter',
          /!\[.*?\]\((.*?)\)/i,        // markdown image regex
          /<img.*?src=['"](.*?)['"]/i, // html image regex
        ],
      }
    ],
    [
      '@limdongjin/vuepress-plugin-simple-seo',
      {
        default_image: '/logo.png',
        default_image_type: 'image/png',
        default_image_width: 1200,
        default_image_height: 1200,
        default_image_alt: 'Invariance logo',
        default_twitter_creator: 'w3Nicolas',
        root_url: 'https://invariance.dev',
        default_site_name: 'Invariance'
      }
    ]
  ],
}
