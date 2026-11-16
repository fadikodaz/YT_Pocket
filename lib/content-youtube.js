// SEO content for the YouTube mini-site (mockup I). Merged into the TOOLS
// entries in lib/content.js by path; rendered by lib/pages.js.
//
// Text markup: [text](/path) internal link, **bold**, `code`.
//
// Section types (one object each, in page order):
//   devices  { title, text[], items[{ icon, name, steps[], where }] }
//   sizes    { title, text, minutes, max, rows[[label, note, MB per minute, best]], note }
//   explain  { title, text[], options[[name, sub, best]], wave { lanes[[label, sub, tone]], caption } }
//   table    { title, text, head[], rows[[...]], best (row index), note }
//   links    { title, text, demo [before, id, after], ok[], no[] }
//   fixes    { title, text, items[[message, fix]] }
//   trust    { title, text, nots[], legal }
// Every section also has: type, id (anchor), jump (label in "Jump to").

const UPDATED = '16 November 2026';

// Exact messages from lib/ytdlp.js ERRORS, so people who search for them
// land on the fix.
const FIX = {
  badUrl: [
    'This link isn’t supported.',
    'Copy the link of **one video** (Share, then Copy link), not a channel or a playlist.',
  ],
  private: ['This video is private.', 'Only **public or unlisted** videos can be saved.'],
  members: [
    'This video is members-only.',
    'Members-only videos need a paid channel membership, so they **can’t be saved** here.',
  ],
  age: [
    'This video is age-restricted.',
    'These need a signed-in YouTube account, so they **can’t be downloaded** here.',
  ],
  live: [
    'Live streams can’t be downloaded while they are live.',
    '**Wait until the stream ends.** The recording usually works a few minutes later.',
  ],
  large: ['That file would be too large.', 'Pick a **lower quality**. 1080p instead of 4K usually fixes it.'],
  long: ['This video is too long for this server.', 'Videos up to **3 hours** can be saved. Try a shorter one.'],
  busy: ['The server is busy right now.', 'Lots of people are downloading. **Try again in a minute.**'],
  limited: [
    'YouTube isn’t letting us download this right now.',
    'YouTube sometimes limits downloads for a while. **Try again later**; nothing is wrong with your link.',
  ],
  removed: [
    'Video unavailable.',
    'The video was removed, made private or blocked in some countries. Check it still plays on YouTube.',
  ],
};

const fixes = (title, keys, text = 'These are the messages YTPocket shows, and what to do about each one.') => ({
  type: 'fixes',
  id: 'fixes',
  jump: 'Fixes',
  title,
  text,
  items: keys.map((k) => FIX[k]),
});

const devices = ({ title, text, pick = 'Pick a quality', where }) => ({
  type: 'devices',
  id: 'devices',
  jump: 'On your device',
  title,
  text,
  items: [
    {
      icon: 'apple-logo',
      name: 'iPhone and iPad',
      steps: ['Open YTPocket in **Safari**.', 'Tap **Tap to paste link**.', `${pick}, then tap **Download**.`],
      where: where?.iphone || 'Files app → Downloads',
    },
    {
      icon: 'android-logo',
      name: 'Android',
      steps: ['Open YTPocket in **Chrome**.', 'Tap **Tap to paste link**.', `${pick}. It saves by itself.`],
      where: where?.android || 'Files app → Downloads',
    },
    {
      icon: 'windows-logo',
      name: 'Windows',
      steps: ['Copy the link from the address bar.', 'Paste it above with **Ctrl + V**.', `${pick}.`],
      where: 'This PC → Downloads',
    },
    {
      icon: 'laptop',
      name: 'Mac',
      steps: ['Copy the link from the address bar.', 'Paste it above with **⌘ + V**.', `${pick}.`],
      where: 'Finder → Downloads',
    },
  ],
});

const LINKS_OK = [
  '`youtube.com/watch?v=…`',
  '`youtu.be/…` from the Share button',
  '`youtube.com/shorts/…`',
  '`m.youtube.com/…` and `music.youtube.com/…`',
  '`youtube.com/live/…` after the stream ends',
];
const LINKS_NO = [
  'Whole playlists or channels',
  'Private and members-only videos',
  'Age-restricted videos',
  'Streams that are live right now',
];

const links = (title, text, extraOk = []) => ({
  type: 'links',
  id: 'links',
  jump: 'Links that work',
  title,
  text,
  demo: ['youtube.com/watch?v=', 'aqz-KE-bpKQ', 'the video ID is all we need'],
  ok: [...LINKS_OK, ...extraOk],
  no: LINKS_NO,
});

const trust = (what = 'videos') => ({
  type: 'trust',
  id: 'safe',
  jump: 'Safe and legal',
  title: 'Is YTPocket safe and legal?',
  text: 'Safe: it runs in your browser over HTTPS, and files are deleted from our server 15 minutes after they’re made. Here’s what you won’t find:',
  nots: ['Pop-ups', 'Fake download buttons', 'Sign-up', 'Apps or extensions', 'Notification requests'],
  legal: `**Legal:** download your own ${what}, Creative Commons and public-domain ${what}, or anything you have permission to save. Respect creators and YouTube’s terms. Read our [Terms](/terms) and [Copyright policy](/copyright).`,
});

// MB per minute, video and sound together (typical YouTube files).
const RATE = { p360: 2, p720: 6, p1080: 15, p1440: 40, p2160: 105, mp3_128: 0.96, mp3_192: 1.44, mp3_320: 2.4 };

const MP3_WAVE = {
  lanes: [
    ['YouTube sound', '≈ 130–160 kbps', 'ink'],
    ['MP3 192', 'keeps it all', 'mint'],
    ['MP3 320', 'about 1.7× the size', 'pop'],
  ],
  caption: 'The dashed line is where YouTube’s sound stops. A higher bitrate can’t add anything to the right of it.',
};

// Hero "What you get" card. Big Buck Bunny: Blender Foundation, CC BY 3.0.
const SAMPLE = {
  title: 'Big Buck Bunny 60fps 4K',
  by: 'Blender Foundation, Creative Commons, free to download',
  duration: '10:34',
};

const PROOF = ['Works on iPhone and Android', 'No app to install', 'Files deleted in 15 min'];

// ---------------------------------------------------------------- pages --
module.exports = (Q) => ({
  '/': {
    updated: UPDATED,
    proof: PROOF,
    sample: {
      ...SAMPLE,
      // Real sizes for this video (60 fps, so bigger than the typical ones below).
      rows: [
        ['4K 60fps MP4', '≈ 1.3 GB'],
        ['1080p 60fps MP4', '≈ 255 MB'],
        ['MP3 192 kbps', '≈ 15 MB'],
      ],
    },
    sections: [
      devices({
        title: 'How to download YouTube videos on any device',
        text: [
          'Copy the video’s link from YouTube (Share, then Copy link), paste it above and pick a quality. YTPocket works in your browser, so the steps are almost the same everywhere; only the place the file ends up changes.',
          'Only want the sound? Use [YouTube to MP3](/youtube-to-mp3). Saving a Short? The [Shorts downloader](/youtube-shorts-downloader) keeps it vertical.',
        ],
      }),
      {
        type: 'sizes',
        id: 'sizes',
        jump: 'File sizes',
        title: 'How big will the file be?',
        text: 'Drag to your video’s length to see the size of each quality. Bigger isn’t always better: 1080p looks sharp on phones and laptops at a fraction of 4K’s size.',
        minutes: 10,
        max: 180,
        rows: [
          ['360p', 'Saving data', RATE.p360],
          ['720p', 'Phones, tablets', RATE.p720],
          ['1080p', 'Best pick for most people', RATE.p1080, true],
          ['1440p', 'Big monitors', RATE.p1440],
          ['4K', 'Large TVs, editing', RATE.p2160],
          ['MP3 192', 'Just the sound', RATE.mp3_192],
        ],
        note: 'Typical sizes. YTPocket shows the exact size for your video before you download. Above 1080p, files use newer formats that play in browsers and VLC but not on some older TVs.',
      },
      {
        type: 'explain',
        id: 'mp3',
        jump: 'MP3 quality',
        title: 'YouTube to MP3: is 320 kbps better?',
        text: [
          'Not for YouTube. YouTube streams sound at about 130 to 160 kbps. Converting it to 320 kbps makes a bigger file but can’t bring back detail that was never sent.',
          'That’s why **192 kbps** is our default: it keeps everything YouTube sends. For no conversion at all, pick **Original**. More on the [YouTube to MP3](/youtube-to-mp3) page.',
        ],
        options: [
          ['128 kbps', '≈ 1 MB per minute, talks and podcasts'],
          ['192 kbps', '≈ 1.4 MB per minute, music', true],
          ['320 kbps', '≈ 2.4 MB per minute, only when the source is good enough'],
          ['Original', 'YouTube’s own sound, not converted'],
        ],
        wave: MP3_WAVE,
      },
      links(
        'Which YouTube links work?',
        'Any link to a single video works, whether you copy it from the Share button or the address bar.'
      ),
      fixes('If a download doesn’t work', ['badUrl', 'private', 'age', 'live', 'large', 'limited']),
      trust(),
    ],
    faq: [
      Q.free,
      {
        q: 'How do I save a YouTube video to my phone’s gallery?',
        a: 'On Android, downloaded videos show up in Google Photos and the Gallery app by themselves (under Downloads). On iPhone, open the Files app, tap the video, tap Share, then Save Video to put it in Photos.',
      },
      {
        q: 'Which quality should I pick?',
        a: '1080p looks sharp on phones and laptops. 4K is for big screens and makes much bigger files. 720p is a good choice when space or data is limited.',
      },
      {
        q: 'Can I download a whole playlist?',
        a: 'Not at the moment. Paste the link of each video you want; links from a playlist page work and save just that video.',
      },
      {
        q: 'How long can a video be?',
        a: 'Up to 3 hours. Long videos take a little longer to prepare; the progress bar shows how far along it is.',
      },
      {
        q: 'Why won’t a 4K video play on my TV?',
        a: 'Above 1080p, YouTube only offers newer video formats (VP9 and AV1). Chrome, Firefox and VLC play them, but some older phones and TVs can’t. 1080p and below are saved as H.264, which plays everywhere.',
      },
      Q.slow,
      Q.privacy,
      {
        q: 'Is it legal to download YouTube videos?',
        a: 'It depends on the video and where you live. Downloading your own videos, Creative Commons or public-domain videos, or videos you have permission to save is fine. Respect creators and YouTube’s terms.',
      },
    ],
  },

  '/youtube-to-mp3': {
    updated: UPDATED,
    proof: ['Title and cover art built in', 'No app to install', 'Files deleted in 15 min'],
    sample: {
      ...SAMPLE,
      rows: [
        ['MP3 192 kbps', '≈ 15 MB'],
        ['MP3 128 kbps', '≈ 10 MB'],
        ['Original (not converted)', '≈ 10 MB'],
      ],
    },
    sections: [
      devices({
        title: 'How to convert YouTube to MP3 on any device',
        text: [
          'Copy the video’s link from YouTube (Share, then Copy link), paste it above and pick an MP3 quality. Each MP3 gets the video’s title, channel and cover picture, so it looks right in your music app.',
          'Need the picture too? Use the [YouTube video downloader](/) or [YouTube to MP4](/youtube-to-mp4).',
        ],
        pick: 'Pick an MP3 quality',
        where: {
          iphone: 'Files app → Downloads (play it there, or add it to a music app)',
          android: 'Files app → Downloads (music apps find it by themselves)',
        },
      }),
      {
        type: 'explain',
        id: 'mp3',
        jump: 'MP3 quality',
        title: '128 vs 192 vs 320 kbps: which MP3 quality is best?',
        text: [
          'YouTube streams sound at about 130 to 160 kbps. An MP3 can only keep what it gets, so a higher bitrate than the source makes a bigger file but doesn’t sound better.',
          '**192 kbps** keeps everything YouTube sends and is our default. **128 kbps** is fine for talks and podcasts. **320 kbps** only appears for the few videos whose sound is good enough to fill it. **Original** saves YouTube’s own sound track without converting; it plays on iPhones, Macs and most Android phones.',
        ],
        options: [
          ['128 kbps', '≈ 1 MB per minute, talks and podcasts'],
          ['192 kbps', '≈ 1.4 MB per minute, music', true],
          ['320 kbps', '≈ 2.4 MB per minute, only when the source is good enough'],
          ['Original', 'YouTube’s own sound, not converted'],
        ],
        wave: MP3_WAVE,
      },
      {
        type: 'sizes',
        id: 'sizes',
        jump: 'File sizes',
        title: 'How big will the MP3 be?',
        text: 'Drag to your video’s length. A full album or a one-hour mix still fits easily on any phone.',
        minutes: 4,
        max: 180,
        rows: [
          ['MP3 128', 'Talks, podcasts', RATE.mp3_128],
          ['MP3 192', 'Best pick for music', RATE.mp3_192, true],
          ['MP3 320', 'When offered', RATE.mp3_320],
        ],
        note: 'Typical sizes. YTPocket shows the exact size for your video before you download.',
      },
      links(
        'Which YouTube links can be converted?',
        'Any link to a single video works, including songs from YouTube Music.'
      ),
      fixes('If a conversion doesn’t work', ['badUrl', 'private', 'age', 'live', 'long', 'limited']),
      trust('music and videos'),
    ],
    faq: [
      {
        q: 'Which MP3 quality should I choose?',
        a: '192 kbps sounds as good as the YouTube original for almost everyone. 128 kbps makes smaller files. 320 kbps is only offered when the video’s own sound is good enough to benefit from it.',
      },
      {
        q: 'Does the MP3 include the song title and cover?',
        a: 'Yes. The title, the channel name and the video’s picture are built into the file, so music apps show them.',
      },
      {
        q: 'Can I convert YouTube Music links?',
        a: 'Yes. Links from music.youtube.com work the same way as normal YouTube links.',
      },
      {
        q: 'Can I convert long videos and mixes?',
        a: 'Yes, up to 3 hours long. Longer videos take a little longer to prepare; the progress bar shows how far along it is.',
      },
      {
        q: 'What is “Original”?',
        a: 'It’s YouTube’s own sound track, saved without converting (usually M4A). It has the best possible quality and plays on iPhones, Macs and most Android phones.',
      },
      Q.free,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  '/youtube-to-mp4': {
    updated: UPDATED,
    proof: PROOF,
    sample: {
      ...SAMPLE,
      rows: [
        ['4K 60fps MP4', '≈ 1.3 GB'],
        ['1080p 60fps MP4', '≈ 255 MB'],
        ['720p 60fps MP4', '≈ 153 MB'],
      ],
    },
    sections: [
      devices({
        title: 'How to convert YouTube to MP4 on any device',
        text: [
          'MP4 is the video format that plays on every phone, computer and TV. Paste a YouTube link above and choose the exact quality you want; video and sound are joined into one MP4 with the title and cover picture built in.',
          'Only need the sound? Use [YouTube to MP3](/youtube-to-mp3). For vertical videos, the [Shorts downloader](/youtube-shorts-downloader) is the quickest way.',
        ],
      }),
      {
        type: 'sizes',
        id: 'sizes',
        jump: 'File sizes',
        title: 'How big will the MP4 be?',
        text: 'Drag to your video’s length to see the size of each quality.',
        minutes: 10,
        max: 180,
        rows: [
          ['360p', 'Saving data', RATE.p360],
          ['720p', 'Phones, tablets', RATE.p720],
          ['1080p', 'Best pick for most people', RATE.p1080, true],
          ['1440p', 'Big monitors', RATE.p1440],
          ['4K', 'Large TVs, editing', RATE.p2160],
        ],
        note: 'Typical sizes. YTPocket shows the exact size for your video before you download.',
      },
      {
        type: 'explain',
        id: 'formats',
        jump: 'Which MP4 plays everywhere',
        title: 'Which MP4 plays everywhere?',
        text: [
          'Up to **1080p**, videos are saved as H.264, the format every phone, computer, TV and editing app can open.',
          'Above 1080p, YouTube only offers newer formats (VP9 or AV1). They look great and play in Chrome, Firefox and VLC, but some older phones, TVs and editing apps can’t open them. Those qualities are marked “Plays in browsers and VLC”.',
        ],
        options: [
          ['Up to 1080p', 'H.264, plays everywhere', true],
          ['1440p and 4K', 'VP9 or AV1, browsers and VLC'],
          ['60 fps', 'Kept when the video has it'],
          ['Sound', 'Built into the same file'],
        ],
      },
      links(
        'Which YouTube links work?',
        'Any link to a single video works, whether you copy it from the Share button or the address bar.'
      ),
      fixes('If a download doesn’t work', ['badUrl', 'private', 'age', 'large', 'long', 'limited']),
      trust(),
    ],
    faq: [
      {
        q: 'Which MP4 quality plays everywhere?',
        a: '1080p and below use H.264, which plays on every phone, computer and TV. Higher qualities use newer formats that play in browsers and VLC.',
      },
      {
        q: 'How big will the file be?',
        a: 'Each quality shows an estimated size before you download. As a guide, a 10-minute video is about 60 MB at 720p, 150 MB at 1080p and over 1 GB in 4K.',
      },
      {
        q: 'Does the MP4 have sound?',
        a: 'Yes. YouTube sends video and sound separately for most qualities; YTPocket joins them into one MP4 file.',
      },
      {
        q: 'Can I edit the MP4 in a video editor?',
        a: 'Yes. Pick 1080p or lower for the widest support: every editing app opens H.264 MP4 files.',
      },
      Q.free,
      Q.slow,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  '/youtube-shorts-downloader': {
    updated: UPDATED,
    proof: ['Stays vertical', 'No app to install', 'Files deleted in 15 min'],
    sections: [
      devices({
        title: 'How to download YouTube Shorts on any device',
        text: [
          'On the Short, tap Share, then Copy link, and paste it above. Shorts are saved exactly as they were posted: vertical, in the best quality available, with the sound.',
          'Want the music from a Short? Use [YouTube to MP3](/youtube-to-mp3). Saving normal videos? Use the [YouTube video downloader](/).',
        ],
        where: {
          iphone: 'Files app → Downloads (Share → Save Video puts it in Photos)',
          android: 'Gallery or Google Photos → Downloads',
        },
      }),
      {
        type: 'sizes',
        id: 'sizes',
        jump: 'File sizes',
        title: 'How big is a Short?',
        text: 'Shorts are up to 3 minutes long, so even the best quality is a small file.',
        minutes: 1,
        max: 3,
        rows: [
          ['720p', 'Saving data', RATE.p720],
          ['1080p', 'Best pick', RATE.p1080, true],
          ['MP3 192', 'Just the sound', RATE.mp3_192],
        ],
        note: 'Typical sizes. YTPocket shows the exact size before you download.',
      },
      links(
        'Which Shorts links work?',
        'Links that contain /shorts/ and the youtu.be links from the Share button both work.'
      ),
      fixes('If a Short doesn’t download', ['badUrl', 'private', 'age', 'removed', 'busy', 'limited']),
      trust('Shorts'),
    ],
    faq: [
      {
        q: 'Do Shorts stay vertical?',
        a: 'Yes. The video is saved exactly as it was posted, without black bars or cropping.',
      },
      {
        q: 'Which links work?',
        a: 'Links that contain /shorts/, and the youtu.be links from the Share button, both work.',
      },
      {
        q: 'Can I save just the sound of a Short?',
        a: 'Yes. After pasting the link, open the Audio MP3 tab, or use [YouTube to MP3](/youtube-to-mp3).',
      },
      Q.free,
      Q.iphone,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  '/youtube-thumbnail-downloader': {
    updated: UPDATED,
    proof: ['Biggest size available', 'Nothing to install', 'Nothing stored about you'],
    sample: {
      ...SAMPLE,
      by: 'Blender Foundation, Creative Commons',
      rows: [
        ['HD 1280×720', 'JPG'],
        ['640×480', 'JPG'],
        ['480×360', 'JPG'],
      ],
    },
    sections: [
      devices({
        title: 'How to save a YouTube thumbnail on any device',
        text: [
          'Paste a YouTube link above to see the video’s thumbnail and save it in the biggest size YouTube has, usually HD (1280×720). Handy for presentations, reviews or planning your own videos.',
          'Want the video itself? Use the [YouTube video downloader](/). Just the sound? Try [YouTube to MP3](/youtube-to-mp3).',
        ],
        pick: 'Tap **Save thumbnail**',
        where: {
          iphone: 'Files app → Downloads (Share → Save Image puts it in Photos)',
          android: 'Gallery or Google Photos → Downloads',
        },
      }),
      {
        type: 'table',
        id: 'sizes',
        jump: 'Thumbnail sizes',
        title: 'YouTube thumbnail sizes',
        text: 'YouTube keeps every thumbnail in several sizes. YTPocket always gives you the biggest one the video has.',
        head: ['Size', 'Pixels', 'Available on'],
        rows: [
          ['HD (maxres)', '1280 × 720', 'Most videos from the last 10 years'],
          ['Standard', '640 × 480', 'Almost all videos'],
          ['High', '480 × 360', 'Every video'],
          ['Medium', '320 × 180', 'Every video'],
        ],
        best: 0,
        note: 'Older or small videos may not have the HD size; then you get the next biggest.',
      },
      links('Which links work?', 'Any link to a single YouTube video or Short works.'),
      fixes('If a thumbnail doesn’t load', ['badUrl', 'private', 'removed', 'busy']),
      trust('thumbnails'),
    ],
    faq: [
      {
        q: 'What size is the thumbnail?',
        a: 'The biggest one the video has. For most videos that’s HD (1280×720); older or smaller videos may only have 640×480 or 480×360.',
      },
      {
        q: 'Can I use the thumbnail anywhere?',
        a: 'Thumbnails belong to the video’s creator. Using one for a review, a comment or your own reference is usually fine; publishing it as your own work is not.',
      },
      {
        q: 'Does it work for Shorts?',
        a: 'Yes. Paste the Short’s link; you get its cover image in the biggest size available.',
      },
      Q.free,
      Q.where,
      Q.privacy,
    ],
  },
});
