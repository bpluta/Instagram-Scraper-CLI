const minimist = require('minimist');
const Download = require('./downloadManager.js')

let args = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    p: 'posts',
    s: 'stories',
    t: 'tagged',
    S: 'highlighted',
    d: 'destination',
    r: 'followers',
    g: 'following',
    i: 'index',
  },
  unknown: (parameter) => {
    console.error(`Unknown parameter: ${parameter}`)
    process.exit(1)
  }
});

if (process.argv.length === 2) {
  console.error('Expected at least one argument');
  process.exit(1);
}

if (args.hasOwnProperty('help')) {
  showHelp()
}
if (args.hasOwnProperty('posts')) {
  Download.posts(args.posts, args.destination)
}
if (args.hasOwnProperty('tagged')) {
  Download.taggedPhotos(args.tagged, args.destination)
}
if (args.hasOwnProperty('stories')) {
  Download.stories(args.stories, args.destination)
}
if (args.hasOwnProperty('highlighted')) {
  if (args.hasOwnProperty('index')) {
    if (!Number.isInteger(args.index)) {
      console.error('Index must be integer')
      process.exit(1);
    }
    Download.highlightedStories(args.highlighted, args.index, args.destination)
  }
  else {
    Download.highlightedStories(args.highlighted, args.destination)
  }
}
if (args.hasOwnProperty('followers')) {
  Download.followers(args.followers)
}
if (args.hasOwnProperty('following')) {
  Download.following(args.following)
}

function showHelp() {
  console.log('Options:')
  console.log('  -h, --help\t\t\tShows help')
  console.log('  -p, --posts [username]\tDownloads posts of given user')
  console.log('  -t, --tagged [username]\tDownloads tagged photos of given user')
  console.log('  -s, --stories [username]\tDownloads stories of given user')
  console.log('  -S, --highlighted [username]\tDownloads highlighted stories of given user')
  console.log('  -r, --followers [username]\tPrints list of followers of given user')
  console.log('  -g, --following [username]\tPrints list of following of given user')

  console.log('\n  -d, --destination [path]\tDestination path (only for download commands)')
  console.log('  -i, --index [number]\t\tIndex of highlighted stories group (downloads all if not set)')
}
