const Instagram = require('./instagramFetch.js')
const Fs = require('fs')
const Path = require('path')

function downloadPosts(ofUser, path) {
  fetchManager(ofUser,'photos', async (userID) => {
    const response = await Instagram.fetchPhotos(userID)
    downloadImages(response, path)
  })
}

function downloadStories(ofUser, path) {
  fetchManager(ofUser,'stories', async (userID) => {
    const response = await Instagram.fetchStories(userID)
    downloadImages(response, path)
  })
}

function downloadHighlightedStories(ofUser, index, path) {
  fetchManager(ofUser,'highlighted stories', async (userID) => {
    const response = await Instagram.fetchHighlightedStories(userID)
    if (index) {
      if (index>0 && index <= response.length) {
        downloadImages(response[index+1], path)
      }
      else {
        console.error('Index mismatch')
      }
    }
    else {
      for (var i=0; i<response.length; i++) {
        downloadImages(response[i], path)
      }
    }
  })
}

function downloadTaggedPhotos(ofUser, path) {
  fetchManager(ofUser,'tagged photos', async (userID) => {
    const response = await Instagram.fetchTaggedPhotos(userID)
    downloadImages(response, path)
  })
}

function downloadFollowers(ofUser) {
  fetchManager(ofUser,'followers', async (userID) => {
    const response = await Instagram.fetchFollowers(userID)
    console.log('=========')
    for (var i=0; i<response.length; i++) {
      console.log(response[i])
    }
    console.log('=========')
    console.log(`Total ${response.length} followers`)
  })
}

function downloadFollowing(ofUser) {
  fetchManager(ofUser,'following', async (userID) => {
    const response = await Instagram.fetchFollowing(userID)
    console.log('=========')
    for (var i=0; i<response.length; i++) {
      console.log(response[i])
    }
    console.log('=========')
    console.log(`Total ${response.length} following`)
  })
}

async function fetchManager(username, logInfo, callback) {
  console.log(`Fetching userID of "${username}"...`)
  const userID = await Instagram.getUserID(username)
  console.log(`Fetching ${logInfo}...`)
  await callback(userID)
}

async function downloadImages(arrayOfURLs, directory) {
  for (var i=0; i<arrayOfURLs.length; i++) {
    const url = arrayOfURLs[i]
    var path = directory ? resolvePath(directory) : resolvePath('.')
    if (!Fs.existsSync(path)) {
      console.log(path)
      console.error('Given directory does not exist')
      return
    }
    const filename = getFileName(url)
    path = `${path}/${filename}`
    const writer = Fs.createWriteStream(path)

    console.log(`Downloading file: ${filename}...`)

    const response = await Instagram.fetchMedia(url)
    response.data.pipe(writer)
  }
}

function getFileName(url) {
  return url.match(/[a-zA-Z0-9\_]+\.(jpg|mp4)/)[0]
}

function resolvePath(path) {
  if (path[0] === '~') {
    return Path.join(process.env.HOME, path.slice(1))
  }
  if (!Path.isAbsolute(path)) {
    return Path.resolve(path)
  }
  return path
}

module.exports.posts = downloadPosts
module.exports.stories = downloadStories
module.exports.highlightedStories = downloadHighlightedStories
module.exports.taggedPhotos = downloadTaggedPhotos
module.exports.followers = downloadFollowers
module.exports.following = downloadFollowing
