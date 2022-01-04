---
type: post
title: Slack workspaces in the browser
image: '/images/slack-workspaces-in-the-browser/slack-workspaces-in-the-browser.jpg'
tags: [slack, productivity, user-script]
excerpt: A quick guide to activate workspace on the Slack website, and avoid using the electron app.
date: 2022-01-04
---

I always try to avoid using Electron apps when I can, more so when I need them running all day like Slack. It doesn't make much sense to me, it forces my computer to run another WebKit engine just for Slack when it already works perfectly in a browser.

But Slack does not offer a way to get all workspaces notifications in a single tab, and keeping 3-5 open tabs just for it is annoying, making the Electron app mandatory to use. 

If you were stuck like me in this situation, I have exactly what you need: **a way to activate Slack's workspace switcher in your web browser**!

<CaptionImage src="/images/slack-workspaces-in-the-browser/slack-workspaces.jpg" alt="Slack workspaces" caption="Workspaces switcher in the browser" /> 

All you need to make this work is to change your favourite browser's user agent to make Slack think that you are using a chromebook, as detailed in [this stack exchange thread](https://webapps.stackexchange.com/questions/144258/slacks-web-version-shows-workspace-switching-sidebar-but-only-on-chromebooks).

You can use the great Tampermonkey extension, or similar, to easily change your user agent on the Slack website. If you do not know about this extension, it allows you to run a user-defined script on a particular website, and more things outside this article's scope.

- [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
- [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

Once installed, you need to create the following script that will change your user agent, and make the Slack website think that you are running the latest Google Chrome version on a Chrome OS laptop:

```javascript
// ==UserScript==
// @name        Enable Slack workspaces in the browser
// @namespace   slack.com
// @version     https://dev.to/nicolasbeauvais
// @description Enable Slack workspaces in the browser
// @match       https://app.slack.com/*
// @match       https://app.slack.com/
// @grant       none
// @run-at      document-start
// ==/UserScript==

(function () {
    'use strict';
    Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; CrOS x86_64 10066.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
    });
})();
```

If you never used Tampermonkey before, you can find many online tutorials that will show you how to add a script. 

> Be careful with the scripts that you add to Tampermonkey, you should never add code that you do not fully understand.

And that's it, you can now open all your Slack workspaces in a single tab, and receive all notifications, just like with the Electron app.
