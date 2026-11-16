// SEO content for the TikTok, Facebook and "More" (Pinterest, Dailymotion,
// Twitch) mini-sites. Same section types as lib/content-youtube.js; merged
// into TOOLS by path in lib/content.js.
//
// Example cards use Blender open movies in each platform's card shape (they
// aren't TikToks or Reels, so there are no sizes, lengths or "Try this
// example": just what the result looks like).
const { devices, fixes, fix, links, trust, FILMS } = require('./content-blocks');

module.exports = (Q) => ({
  // ------------------------------------------------------------- TikTok --
  '/tiktok-downloader': {
    proof: ['Best quality available', 'No app to install', 'Files deleted in 15 min'],
    example: {
      kind: 'tall',
      ...FILMS.spring,
      img: 'spring-tall.jpg',
      caption: 'Spring, a Blender open movie',
      rows: [
        ['HD MP4', 'Best quality'],
        ['MP3', 'Just the sound'],
      ],
    },
    sections: [
      devices({
        title: 'How to download TikTok videos on any device',
        text: [
          'In TikTok, tap **Share**, then **Copy link**, and paste it above. The video is saved as an MP4 in the best quality TikTok has, exactly as it was posted: vertical, with the sound.',
          'Only want the sound? Use [TikTok to MP3](/tiktok-to-mp3). Saving YouTube Shorts too? Try our [YouTube downloader](/youtube-shorts-downloader).',
        ],
        where: { iphone: 'Files app; Share, Save Video for Photos', android: 'Gallery, Downloads' },
      }),
      {
        type: 'explain',
        id: 'which',
        title: 'Which TikToks can be saved?',
        text: [
          'Any **public** TikTok works, from any account, in the best quality TikTok offers for it.',
          'Videos from **private accounts**, “Friends only” posts and live streams can’t be saved: TikTok only shows those to signed-in people. Photo slideshows aren’t videos, so they can’t be saved as MP4 either.',
        ],
        options: [
          ['Public videos', 'Saved in the best quality', true],
          ['Sound only', 'With [TikTok to MP3](/tiktok-to-mp3)'],
          ['Private accounts', 'Not available'],
          ['Photo slideshows', 'Not a video'],
        ],
      },
      links({
        title: 'Which TikTok links work?',
        text: 'Copy the link from the Share button or from the address bar of tiktok.com.',
        demo: ['tiktok.com/@name/video/', '7312345678901234567', 'the video number is what counts'],
        ok: [
          '`tiktok.com/@name/video/…`',
          '`vm.tiktok.com/…` and `vt.tiktok.com/…` from the Share button',
          '`m.tiktok.com/…` links',
        ],
        no: ['Profiles (tiktok.com/@name)', 'Private or “Friends only” videos', 'Lives', 'Photo slideshows'],
      }),
      fixes('If a TikTok doesn’t download', [
        'badUrl',
        fix('private', 'It’s from a **private account** or shared with friends only. Public TikToks work.'),
        'login',
        'noVideo',
        'removed',
        'busy',
      ]),
      trust({ what: 'TikToks', site: 'TikTok' }),
    ],
    faq: [
      Q.free,
      {
        q: 'Can I download private TikTok videos?',
        a: 'No. Only public videos can be saved. Videos from private accounts, or shared with friends only, are not available.',
      },
      {
        q: 'How do I save a TikTok to my phone’s gallery?',
        a: 'On Android, saved videos show up in the Gallery and Google Photos (under Downloads). On iPhone, open the Files app, tap the video, tap Share, then Save Video.',
      },
      {
        q: 'Why does a TikTok link say it isn’t available?',
        a: 'TikTok sometimes blocks a video in some countries or networks, or the video was deleted. Try again later or try another video.',
      },
      {
        q: 'Can I save just the sound?',
        a: 'Yes. Open the Audio MP3 tab after loading the video, or use [TikTok to MP3](/tiktok-to-mp3).',
      },
      Q.iphone,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  '/tiktok-to-mp3': {
    proof: ['Title and cover built in', 'No app to install', 'Files deleted in 15 min'],
    only: 'audio',
    alt: { path: '/tiktok-downloader', label: 'Want the video? Get MP4 instead' },
    example: {
      kind: 'music',
      ...FILMS.sintel,
      title: 'Original sound: Sintel',
      img: 'sintel-square.jpg',
      duration: '',
      rows: [
        ['MP3 192 kbps', 'High quality'],
        ['MP3 128 kbps', 'Smaller file'],
      ],
    },
    sections: [
      devices({
        title: 'How to save a TikTok sound as MP3 on any device',
        text: [
          'In TikTok, tap **Share**, then **Copy link**, and paste it above. You get the sound exactly as it plays in that TikTok, as an MP3 with the title and cover picture built in.',
          'Want the whole video? Use the [TikTok downloader](/tiktok-downloader). Saving music from YouTube? Try [YouTube to MP3](/youtube-to-mp3).',
        ],
        pick: 'Pick an MP3 quality',
        where: { android: 'Music apps find it by themselves' },
      }),
      {
        type: 'explain',
        id: 'sound',
        title: 'What sound do you get?',
        text: [
          'The MP3 is the sound of **that TikTok**: the music plus any voice-over or effects the creator added. If you want the clean original song, look it up on YouTube and use [YouTube to MP3](/youtube-to-mp3).',
          '**192 kbps** keeps everything TikTok sends. **128 kbps** makes a smaller file, fine for voice clips.',
        ],
        options: [
          ['MP3 192 kbps', 'High quality, the default', true],
          ['MP3 128 kbps', 'Smaller file'],
          ['Ringtone', 'Works on Android right away'],
          ['Your edits', 'Use it in a video editor'],
        ],
      },
      links({
        title: 'Which TikTok links work?',
        text: 'The link of the TikTok itself, from the Share button or the address bar.',
        demo: ['vm.tiktok.com/', 'ZMabc1234', 'the short Share link works'],
        ok: ['`vm.tiktok.com/…` and `vt.tiktok.com/…`', '`tiktok.com/@name/video/…`'],
        no: ['Sound pages (tiktok.com/music/…)', 'Private or “Friends only” videos', 'Profiles'],
      }),
      fixes('If a TikTok sound doesn’t save', [
        fix('badUrl', 'Copy the link of **the TikTok video** that uses the sound, not the sound’s page or a profile.'),
        fix('private', 'It’s from a **private account** or shared with friends only. Public TikToks work.'),
        'login',
        'removed',
        'busy',
      ]),
      trust({ what: 'sounds and videos', site: 'TikTok' }),
    ],
    faq: [
      {
        q: 'Do I get the original song or the video’s sound?',
        a: 'You get the sound exactly as it plays in that TikTok, including any voice-over or effects.',
      },
      {
        q: 'Can I use it as a ringtone?',
        a: 'Yes. On Android, move the MP3 to the Ringtones folder or pick it in Settings, Sound. On iPhone, ringtones need GarageBand or a computer.',
      },
      {
        q: 'Can I paste a TikTok sound page link?',
        a: 'Not yet. Paste the link of a TikTok video that uses the sound instead.',
      },
      Q.free,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  // ----------------------------------------------------------- Facebook --
  '/facebook-video-downloader': {
    proof: ['Public videos', 'No app to install', 'Files deleted in 15 min'],
    example: {
      kind: 'wide',
      ...FILMS.sintel,
      img: 'sintel-wide.jpg',
      rows: [
        ['HD MP4', 'Best quality'],
        ['SD MP4', 'Smaller file'],
        ['MP3 192 kbps', 'Just the sound'],
      ],
    },
    sections: [
      devices({
        title: 'How to download Facebook videos on any device',
        text: [
          'On Facebook, open the video, tap **Share**, then **Copy link**, and paste it above. Choose HD or SD as an MP4, or save just the sound as an MP3.',
          'Saving a reel? Use the [Facebook Reels downloader](/facebook-reels-downloader). Have a YouTube link? Use the [YouTube downloader](/).',
        ],
      }),
      {
        type: 'explain',
        id: 'which',
        title: 'Which Facebook videos can be saved?',
        text: [
          'Videos that **anyone can watch without logging in**: public posts from pages and people, and videos in public groups.',
          'Videos shared with **friends only**, posted in **private groups** or in stories need a login, so Facebook doesn’t show them to our server. If you can watch a video in a private window without logging in, it will work.',
        ],
        options: [
          ['Public posts', 'HD or SD MP4, or MP3', true],
          ['Public groups and pages', 'Work the same way'],
          ['Friends only', 'Needs a login'],
          ['Private groups, stories', 'Needs a login'],
        ],
      },
      links({
        title: 'Which Facebook links work?',
        text: 'Copy the link from the Share button or the address bar of the video.',
        demo: ['facebook.com/watch?v=', '1234567890123456', 'the video number is what counts'],
        ok: [
          '`facebook.com/watch?v=…`',
          '`fb.watch/…` from the Share button',
          '`facebook.com/…/videos/…`',
          '`facebook.com/share/v/…`',
          '`m.facebook.com/…` links',
        ],
        no: ['Friends-only videos', 'Private groups', 'Stories', 'Live videos that are still live'],
      }),
      fixes('If a Facebook video doesn’t download', ['badUrl', 'login', 'noVideo', 'live', 'removed', 'busy']),
      trust({ site: 'Facebook' }),
    ],
    faq: [
      Q.free,
      {
        q: 'Why does a Facebook video not work?',
        a: 'Only public videos can be saved. Videos shared with friends only, or posted in private groups, need a login and are not available.',
      },
      {
        q: 'Which links work?',
        a: 'Links from the Share button (fb.watch/…, facebook.com/share/v/…) and links from the address bar of a video page.',
      },
      {
        q: 'What’s the difference between HD and SD?',
        a: 'HD is usually 720p or 1080p and looks sharp on any screen. SD is smaller (often 360p), handy when space or data is limited.',
      },
      Q.iphone,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  '/facebook-reels-downloader': {
    proof: ['Stays vertical', 'No app to install', 'Files deleted in 15 min'],
    example: {
      kind: 'tall',
      ...FILMS.bunny,
      img: 'bunny-tall.jpg',
      caption: 'Big Buck Bunny, a Blender open movie',
      rows: [
        ['HD MP4', 'Best quality'],
        ['MP3', 'Just the sound'],
      ],
    },
    sections: [
      devices({
        title: 'How to download Facebook Reels on any device',
        text: [
          'On the reel, tap **Share**, then **Copy link**, and paste it above. Reels are saved as they were posted: vertical, with the sound.',
          'Saving a regular video? Use the [Facebook video downloader](/facebook-video-downloader). Short videos from TikTok? Try the [TikTok downloader](/tiktok-downloader).',
        ],
        where: { iphone: 'Files app; Share, Save Video for Photos', android: 'Gallery, Downloads' },
      }),
      links({
        title: 'Which reel links work?',
        text: 'The link from the reel’s Share button, or the address bar on a computer.',
        demo: ['facebook.com/reel/', '1234567890123456', 'the reel number is what counts'],
        ok: ['`facebook.com/reel/…`', '`fb.watch/…` from the Share button', '`facebook.com/share/r/…`'],
        no: ['Friends-only reels', 'Reels in private groups', 'Stories'],
      }),
      fixes('If a reel doesn’t download', ['badUrl', 'login', 'noVideo', 'removed', 'busy']),
      trust({ what: 'reels', site: 'Facebook' }),
    ],
    faq: [
      {
        q: 'Can I download any reel?',
        a: 'Public reels, yes. Reels shared with friends only need a login and are not available.',
      },
      {
        q: 'Do reels stay vertical?',
        a: 'Yes. The reel is saved exactly as it was posted, without black bars or cropping.',
      },
      {
        q: 'Can I download Instagram reels here?',
        a: 'Not yet: Instagram only shows almost every reel to signed-in people. Facebook reels work.',
      },
      Q.free,
      Q.iphone,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  // --------------------------------------------------------------- More --
  '/pinterest-video-downloader': {
    proof: ['Video pins', 'No app to install', 'Files deleted in 15 min'],
    example: {
      kind: 'pin',
      ...FILMS.spring,
      img: 'spring-pin.jpg',
      rows: [['HD MP4', 'Best quality']],
    },
    sections: [
      devices({
        title: 'How to download Pinterest videos on any device',
        text: [
          'In Pinterest, open the video pin, tap **Share**, then **Copy link**, and paste it above. The video is saved as an MP4 in the best quality available.',
          'Want the cover picture? After loading the video, use Save thumbnail. Other sites: [Dailymotion](/dailymotion-downloader), [Twitch](/twitch-clip-downloader).',
        ],
      }),
      links({
        title: 'Which Pinterest links work?',
        text: 'Short pin.it links from the app and full pinterest.com links both work.',
        demo: ['pinterest.com/pin/', '123456789012345678', 'the pin number is what counts'],
        ok: ['`pin.it/…` from the Share button', '`pinterest.com/pin/…`', 'Country sites like `pinterest.co.uk/pin/…`'],
        no: ['Picture pins (no video)', 'Boards and profiles', 'Pins from secret boards'],
      }),
      fixes('If a pin doesn’t download', [
        'badUrl',
        fix('noVideo', 'That pin is a **picture**, not a video. Open a video pin and copy its link.'),
        'removed',
        'busy',
      ]),
      trust({ site: 'Pinterest' }),
    ],
    faq: [
      {
        q: 'Do short pin.it links work?',
        a: 'Yes. Links from the Share button (pin.it/…) and full pinterest.com links both work.',
      },
      {
        q: 'Can I download Pinterest images?',
        a: 'This tool is for video pins. For a picture, use Save thumbnail after loading a video pin, or save it in the Pinterest app.',
      },
      Q.free,
      Q.iphone,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  '/dailymotion-downloader': {
    proof: ['Up to 1080p', 'No app to install', 'Files deleted in 15 min'],
    example: {
      kind: 'wide',
      ...FILMS.sintel,
      img: 'sintel-wide.jpg',
      rows: [
        ['1080p MP4', 'Best quality'],
        ['720p MP4', 'Smaller file'],
        ['MP3 192 kbps', 'Just the sound'],
      ],
    },
    sections: [
      devices({
        title: 'How to download Dailymotion videos on any device',
        text: [
          'On Dailymotion, tap **Share**, then **Copy link**, and paste it above. Pick any quality the video has, usually up to 1080p, or save the sound as an MP3.',
          'Have a YouTube link? Use the [YouTube downloader](/). Twitch clip? Try the [Twitch clip downloader](/twitch-clip-downloader).',
        ],
      }),
      links({
        title: 'Which Dailymotion links work?',
        text: 'Full links and the short dai.ly links from the Share button both work.',
        demo: ['dailymotion.com/video/', 'x8abcd1', 'the video ID is what counts'],
        ok: ['`dailymotion.com/video/…`', '`dai.ly/…` from the Share button'],
        no: ['Playlists and channels', 'Private videos', 'Streams that are live right now'],
      }),
      fixes('If a Dailymotion video doesn’t download', ['badUrl', 'private', 'region', 'live', 'removed', 'busy']),
      trust({ site: 'Dailymotion' }),
    ],
    faq: [
      {
        q: 'Which qualities can I choose?',
        a: 'Every quality the video offers, usually from 240p up to 1080p.',
      },
      {
        q: 'Can I save just the sound?',
        a: 'Yes. Open the Audio MP3 tab after loading the video.',
      },
      Q.free,
      Q.iphone,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },

  '/twitch-clip-downloader': {
    proof: ['Clips and past broadcasts', 'No app to install', 'Files deleted in 15 min'],
    example: {
      kind: 'wide',
      ...FILMS.bunny,
      img: 'bunny-wide.jpg',
      badge: 'CLIP',
      rows: [
        ['1080p 60fps MP4', 'Source quality'],
        ['720p MP4', 'Smaller file'],
      ],
    },
    sections: [
      devices({
        title: 'How to download Twitch clips on any device',
        text: [
          'On Twitch, open the clip, tap **Share**, then **Copy link**, and paste it above. Clips are saved as MP4 in the quality they were recorded in; past broadcasts (VODs) up to 3 hours work too.',
          'Gaming videos on YouTube? Use the [YouTube downloader](/). Short videos? Try the [TikTok downloader](/tiktok-downloader).',
        ],
      }),
      {
        type: 'explain',
        id: 'which',
        title: 'Clips, past broadcasts and live streams',
        text: [
          '**Clips** are short moments anyone can make from a stream; they save in seconds. **Past broadcasts** (VODs) are whole streams that the channel keeps for a while; they can be saved if they are up to 3 hours long.',
          'A stream that is **live right now** can’t be saved until it ends. **Subscriber-only** VODs need a login.',
        ],
        options: [
          ['Clips', 'Saved in seconds', true],
          ['Past broadcasts', 'Up to 3 hours'],
          ['Live right now', 'After it ends'],
          ['Subscriber-only', 'Needs a login'],
        ],
      },
      links({
        title: 'Which Twitch links work?',
        text: 'Clip links from the Share button, and links to past broadcasts.',
        demo: ['clips.twitch.tv/', 'FaintSmoothKiwi', 'the clip name is what counts'],
        ok: ['`clips.twitch.tv/…`', '`twitch.tv/name/clip/…`', '`twitch.tv/videos/…` (past broadcasts)'],
        no: ['Channels that are live right now', 'Subscriber-only videos', 'Channel pages'],
      }),
      fixes('If a Twitch link doesn’t download', ['badUrl', 'live', 'login', 'long', 'removed', 'busy']),
      trust({ what: 'clips and videos', site: 'Twitch' }),
    ],
    faq: [
      {
        q: 'Can I download a whole stream?',
        a: 'Past broadcasts (VODs) up to 3 hours long can be saved. Live streams can’t be saved while they are live.',
      },
      {
        q: 'Can I download someone else’s clips?',
        a: 'Any public clip can be saved. Respect the streamer: don’t re-upload clips as your own.',
      },
      Q.free,
      Q.iphone,
      Q.where,
      Q.privacy,
      Q.legal,
    ],
  },
});
