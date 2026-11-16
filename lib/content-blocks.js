// Building blocks shared by every mini-site's SEO content (YouTube, TikTok,
// Facebook, ...). See lib/content-youtube.js for the section types.

// The exact messages from lib/ytdlp.js ERRORS (so people who search for a
// message land on its fix), each with a default fix. Pages can pass their
// own fix text with fix(key, text).
const MSG = {
  badUrl: "This link isn't supported.",
  private: 'This video is private.',
  members: 'This video is members-only.',
  age: 'This video is age-restricted.',
  live: "Live streams can't be downloaded while they are live.",
  large: 'That file would be too large.',
  long: 'This video is too long for this server.',
  busy: 'The server is busy right now.',
  limited: 'YouTube isn’t letting us download this right now.',
  removed: 'Video unavailable.',
  login: 'This site only shows this video to signed-in users.',
  noVideo: "This post doesn't contain a video.",
  region: "This video isn't available in our region.",
  refused: 'The site refused the download.',
};

const FIX = {
  badUrl: 'Copy the link of **one video** (Share, then Copy link), not a profile, channel or playlist.',
  private: 'Only **public** videos can be saved.',
  members: 'Members-only videos need a paid channel membership, so they **can’t be saved** here.',
  age: 'These need a signed-in account, so they **can’t be downloaded** here.',
  live: '**Wait until the stream ends.** The recording usually works a few minutes later.',
  large: 'Pick a **lower quality**. 1080p instead of 4K usually fixes it.',
  long: 'Videos up to **3 hours** can be saved. Try a shorter one.',
  busy: 'Lots of people are downloading. **Try again in a minute.**',
  limited: 'YouTube sometimes limits downloads for a while. **Try again later**; nothing is wrong with your link.',
  removed: 'The video was removed, made private or blocked in some countries. Check it still plays on the site.',
  login: 'The owner shares it only with signed-in people or friends, so it **can’t be saved** here. Public videos work.',
  noVideo: 'Open the post, tap Share on **the video itself** and copy that link.',
  region: 'The site blocks it where our server is. **Try another video.**',
  refused: 'The site said no for this one. **Try again in a moment.**',
};

/** A fixes item: the exact message plus a fix (default or custom). */
const fix = (key, text) => [MSG[key], text || FIX[key]];

const fixes = (title, items, text = 'These are the messages YTPocket shows, and what to do about each one.') => ({
  type: 'fixes',
  id: 'fixes',
  title,
  text,
  items: items.map((i) => (Array.isArray(i) ? i : fix(i))),
});

/** "On any device": four columns, short steps, one "saved in" line. */
const devices = ({ title, text, pick = 'Pick a quality', where }) => ({
  type: 'devices',
  id: 'devices',
  title,
  text,
  items: [
    {
      icon: 'apple-logo',
      name: 'iPhone and iPad',
      steps: ['Open YTPocket in **Safari**.', 'Tap the yellow paste box.', `${pick}, then **Download**.`],
      where: where?.iphone || 'Files app, Downloads',
    },
    {
      icon: 'android-logo',
      name: 'Android',
      steps: ['Open YTPocket in **Chrome**.', 'Tap the yellow paste box.', `${pick}.`],
      where: where?.android || 'Files app, Downloads',
    },
    {
      icon: 'windows-logo',
      name: 'Windows',
      steps: ['Copy the link from the address bar.', 'Paste with **Ctrl + V**.', `${pick}.`],
      where: 'Downloads folder',
    },
    {
      icon: 'laptop',
      name: 'Mac',
      steps: ['Copy the link from the address bar.', 'Paste with **⌘ + V**.', `${pick}.`],
      where: 'Downloads folder',
    },
  ],
});

/** "Which links work?" with an example address and two lists. */
const links = ({ title, text, demo, ok, no }) => ({ type: 'links', id: 'links', title, text, demo, ok, no });

/** "Is YTPocket safe and legal?" */
const trust = ({ what = 'videos', site = 'YouTube' } = {}) => ({
  type: 'trust',
  id: 'safe',
  title: 'Is YTPocket safe and legal?',
  text: 'Safe: it runs in your browser over HTTPS, and files are deleted from our server 15 minutes after they’re made. Here’s what you won’t find:',
  nots: ['Pop-ups', 'Fake download buttons', 'Sign-up', 'Apps or extensions', 'Notification requests'],
  legal: `**Legal:** download your own ${what}, Creative Commons and public-domain ${what}, or anything you have permission to save. Respect creators and ${site}’s terms. Read our [Terms](/terms) and [Copyright policy](/copyright).`,
});

// Example films: Blender open movies, free to share (CC BY).
const FILMS = {
  bunny: { title: 'Big Buck Bunny', by: 'Blender Foundation, free to share (CC BY)' },
  spring: { title: 'Spring', by: 'Blender Studio, free to share (CC BY)' },
  sintel: { title: 'Sintel', by: 'Blender Foundation, free to share (CC BY)' },
};

module.exports = { MSG, FIX, fix, fixes, devices, links, trust, FILMS };
