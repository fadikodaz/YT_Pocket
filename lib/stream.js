// Live MP3 streams: the browser's download starts at once and fills while the
// server fetches the sound and converts it, instead of waiting for a finished
// file. yt-dlp writes the source audio to a pipe, ffmpeg converts it to MP3
// (with title, artist and cover art) and its output goes straight to the
// browser. Nothing is stored on disk except the small info and cover files.
//
// A stream is created with the same checks as a normal job (POST /api/jobs
// with stream: true) and then served once at GET /api/jobs/:id/file. Its
// progress (bytes sent, finished, failed) is read at GET /api/jobs/:id, so
// the page shows it in the same row as any other download.
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const ytdlp = require('./ytdlp');

const IS_WIN = process.platform === 'win32';

// ID3v2.3 tag (title, artist, front cover). Written by us at the start of the
// stream: ffmpeg's own tag needs to seek back into the file, which a stream
// can't do.
function id3Tag({ title, artist, cover }) {
  const text = (id, value) => {
    if (!value) return null;
    const body = Buffer.concat([Buffer.from([1, 0xff, 0xfe]), Buffer.from(String(value).slice(0, 300), 'utf16le')]);
    return frame(id, body);
  };
  const frame = (id, body) => {
    const head = Buffer.alloc(10);
    head.write(id, 0, 'latin1');
    head.writeUInt32BE(body.length, 4);
    return Buffer.concat([head, body]);
  };
  const frames = [text('TIT2', title), text('TPE1', artist)];
  if (cover?.length) {
    frames.push(frame('APIC', Buffer.concat([Buffer.from('\0image/jpeg\0\x03\0', 'latin1'), cover])));
  }
  const body = Buffer.concat(frames.filter(Boolean));
  const head = Buffer.from('ID3\x03\0\0\0\0\0\0', 'latin1');
  const n = body.length; // size is "synchsafe": 7 bits per byte
  head[6] = (n >> 21) & 0x7f;
  head[7] = (n >> 14) & 0x7f;
  head[8] = (n >> 7) & 0x7f;
  head[9] = n & 0x7f;
  return Buffer.concat([head, body]);
}

// Any image -> square 600x600 JPEG for the cover. Null if it fails.
function squareJpeg(ffmpeg, input, output) {
  return new Promise((resolve) => {
    const p = spawn(
      ffmpeg,
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        input,
        '-vf',
        "crop='min(iw,ih)':'min(iw,ih)',scale=600:600",
        '-frames:v',
        '1',
        '-q:v',
        '3',
        output,
      ],
      { windowsHide: true, stdio: 'ignore' }
    );
    const t = setTimeout(() => p.kill('SIGKILL'), 10000);
    p.on('error', () => resolve(null));
    p.on('close', (code) => {
      clearTimeout(t);
      resolve(code === 0 ? fs.promises.readFile(output).catch(() => null) : null);
    });
  });
}
const UNUSED_TTL = 2 * 60 * 1000; // created but never opened
const DONE_TTL = 10 * 60 * 1000; // finished: status stays readable

class StreamManager {
  constructor({ ffmpeg, maxStreams = 4, perIp = 2, timeoutMs = 30 * 60 * 1000 } = {}) {
    this.ffmpeg = ffmpeg;
    this.maxStreams = maxStreams;
    this.perIp = perIp;
    this.timeoutMs = timeoutMs;
    this.streams = new Map();
    setInterval(() => this.sweep(), 30 * 1000).unref();
  }

  active() {
    return [...this.streams.values()].filter((s) => s.status === 'waiting' || s.status === 'streaming');
  }

  // Throws LIMIT/BUSY like the job queue does.
  create(spec, ip, cover) {
    const live = this.active();
    if (live.filter((s) => s.ip === ip).length >= this.perIp) throw ytdlp.err('LIMIT');
    if (live.length >= this.maxStreams) throw ytdlp.err('BUSY');
    const id = crypto.randomBytes(12).toString('hex');
    const s = {
      id,
      ip,
      spec,
      cover, // Promise of a Buffer (or null)
      status: 'waiting', // waiting -> streaming -> done | error | cancelled
      bytes: 0,
      error: null,
      created: Date.now(),
      finished: 0,
      kill: null,
    };
    this.streams.set(id, s);
    return s;
  }

  get(id) {
    return this.streams.get(String(id || '')) || null;
  }

  view(s) {
    return {
      id: s.id,
      stream: true,
      status: s.status === 'done' ? 'ready' : s.status,
      kind: 'mp3',
      bytes: s.bytes,
      size: s.status === 'done' ? s.bytes : 0,
      estimatedSize: s.spec.estimatedOutput || 0,
      filename: s.spec.filename,
      error: s.error,
    };
  }

  cancel(s) {
    if (s.status === 'waiting' || s.status === 'streaming') {
      s.status = 'cancelled';
      s.finished = Date.now();
      s.kill?.();
    }
  }

  sweep() {
    const now = Date.now();
    for (const s of this.streams.values()) {
      if (s.status === 'waiting' && now - s.created > UNUSED_TTL) this.streams.delete(s.id);
      else if (s.finished && now - s.finished > DONE_TTL) this.streams.delete(s.id);
    }
  }

  // Serve the stream to the browser. Headers are only sent once ffmpeg has
  // produced its first bytes, so an early failure (link blocked, video gone)
  // still gets a normal error response instead of a broken file.
  async serve(s, res, sendError, contentDisposition) {
    if (s.status !== 'waiting') {
      return res.status(404).json({
        error: 'This download was already started. Tap the quality again.',
        code: 'NOT_FOUND',
        hint: '',
      });
    }
    s.status = 'streaming';
    const { spec } = s;
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'ytdl-stream-'));
    const infoFile = path.join(dir, 'info.json');
    await fsp.writeFile(infoFile, JSON.stringify(spec.info));
    let cover = null;
    const thumb = await s.cover;
    if (thumb?.length) {
      const raw = path.join(dir, 'thumb');
      await fsp.writeFile(raw, thumb);
      cover = await squareJpeg(this.ffmpeg, raw, path.join(dir, 'cover.jpg'));
    }
    s.cover = null;
    let tag = id3Tag({ title: spec.title, artist: spec.artist, cover });

    // A stream is one connection, so YouTube's speed limit for unsolved
    // player challenges would make it real-time slow: always give yt-dlp a
    // JavaScript runtime (Node, already here) to solve them.
    const jsRuntime =
      String(process.env.YTDLP_JS_RUNTIME || '').toLowerCase() === 'off'
        ? []
        : ['--js-runtimes', process.env.YTDLP_JS_RUNTIME_PATH || `node:${process.execPath}`];
    const ytArgs = [
      ...ytdlp.baseArgs(0, spec.url),
      ...jsRuntime,
      '--load-info-json',
      infoFile,
      '-f',
      spec.sourceFormat,
      '--no-part',
      // Ranged requests: YouTube slows down one long request.
      '--http-chunk-size',
      '10M',
      '--quiet',
      '--no-progress',
      '-o',
      '-',
    ];
    const { args: ya, cleanup } = ytdlp.isolateCookies(ytArgs);
    // Plain MP3 frames: no tag (ours goes first) and no Xing header (it
    // would need a seek back at the end).
    const ffArgs = [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      'pipe:0',
      '-map',
      '0:a:0',
      '-c:a',
      'libmp3lame',
      '-b:a',
      `${spec.quality}k`,
      '-id3v2_version',
      '0',
      '-write_xing',
      '0',
      '-f',
      'mp3',
      'pipe:1',
    ];

    const opts = { windowsHide: true, detached: !IS_WIN };
    const yt = spawn(ytdlp.binary(), ya, { ...opts, stdio: ['ignore', 'pipe', 'pipe'] });
    const ff = spawn(this.ffmpeg, ffArgs, { ...opts, stdio: ['pipe', 'pipe', 'pipe'] });
    let ytErr = '';
    let ffErr = '';
    yt.stderr.on('data', (d) => (ytErr = (ytErr + d).slice(-4000)));
    ff.stderr.on('data', (d) => (ffErr = (ffErr + d).slice(-4000)));
    yt.stdout.pipe(ff.stdin);
    ff.stdin.on('error', () => {}); // ffmpeg quit early: reported below
    yt.on('error', () => {});
    ff.on('error', () => {});

    let started = false;
    let ended = false;
    const timer = setTimeout(() => stop('TIMEOUT'), this.timeoutMs);
    const stop = (code) => {
      if (ended) return;
      ended = true;
      clearTimeout(timer);
      ytdlp.killTree(yt);
      ytdlp.killTree(ff);
      cleanup();
      fs.rm(dir, { recursive: true, force: true }, () => {});
      s.finished = Date.now();
      if (code === 'OK') s.status = 'done';
      else if (s.status !== 'cancelled') {
        const e = code === 'CLIENT' ? ytdlp.err('CANCELLED') : ytdlp.mapError(ytErr) || ytdlp.err('UNKNOWN');
        s.status = code === 'CLIENT' ? 'cancelled' : 'error';
        s.error = { code: e.code, message: e.message, hint: e.hint || '' };
        if (code !== 'CLIENT')
          console.error(`[stream ${s.id.slice(0, 6)}] failed:`, e.code, (ffErr || ytErr).slice(-300));
      }
      if (!res.writableEnded) {
        if (!started) sendError(res, ytdlp.err(s.error?.code || 'UNKNOWN', s.error?.message, s.error?.hint));
        else if (code === 'OK') res.end();
        else res.destroy(); // a cut-off download shows as failed in the browser
      }
    };
    s.kill = () => stop('CANCEL');

    ff.stdout.on('data', (chunk) => {
      if (ended) return;
      if (!started) {
        started = true;
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': contentDisposition(spec.filename),
          'Cache-Control': 'private, no-store',
          'X-Accel-Buffering': 'no',
        });
        res.write(tag);
        s.bytes += tag.length;
        tag = null;
      }
      s.bytes += chunk.length;
      if (!res.write(chunk)) {
        ff.stdout.pause();
        res.once('drain', () => ff.stdout.resume());
      }
    });
    ff.on('close', (code) => stop(code === 0 && started ? 'OK' : 'FAIL'));
    yt.on('close', (code) => {
      if (code !== 0 && !ended) stop('FAIL');
    });
    res.on('close', () => {
      if (!ended) stop('CLIENT');
    });
  }
}

module.exports = { StreamManager };
