require('dotenv').config()

module.exports = {
  title: 'Apollo Spreadsheet',
  tagline: 'The most powerful out-of-the-box spreadsheet with full support to React',
  url: 'https://apollo-docs.famousgadget.pt',
  baseUrl: '/',
  // onBrokenLinks: 'throw',
  // onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Famous Gadget', // Usually your GitHub org/user name.
  projectName: 'apollo-spreadsheet', // Usually your repo name.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hant'],
  },
  themeConfig: {
    navbar: {
      title: 'Apollo Spreadsheet',
      logo: {
        alt: 'Apollo logo',
        src: 'img/apollo.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          position: 'right',
          background: 'img/github.png',
          label: 'GitHub',
          href: 'https://github.com/underfisk/apollo-spreadsheet',
          // imageUrl: 'img/github.png',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'About Us',
          items: [
            {
              label: 'Famous Gadget',
              href: 'https://famousgadget.pt/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Apollo',
              href: 'https://apollo.famousgadget.pt/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/underfisk/apollo-spreadsheet',
            },
            {
              label: 'README',
              href: 'https://github.com/underfisk/apollo-spreadsheet#readme',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/underfisk/apollo-spreadsheet/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Apollo Spreadsheet, Famous Gadget.`,
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
      IconDarkMode: '🌙',
        //lightIcon: '\u{1F602}',
        IconLightMode: '🌞',
        lightIconStyle: {
          marginLeft: '1px',
    },
    // algolia: {
    //   apiKey: process.env.API_KEY,
    //   indexName: 'apollo-docs',
    // },
  },
  presets: [
    [
      //'@docusaurus/preset-bootstrap',
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/',
        },
      },
    ],
  ],
}
