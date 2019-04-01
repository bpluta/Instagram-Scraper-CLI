const Axios = require('Axios')
const Credentials = require('./credentials.json')
const QueryData = require('./QueryData.json')

var baseURL = "https://www.instagram.com/graphql/query/";

function getURL(baseURL, parameters) {
  var url = baseURL;
  if (parameters) {
    url += "?";
    for (var param in parameters) {
      url += encodeURIComponent(param)+'=';
      if (typeof parameters[param] == "object") {
        url += encodeURIComponent(JSON.stringify(parameters[param]))+'&';
      }
      else {
        url += encodeURIComponent(parameters[param])+'&';
      }
    }
    url = url.substring(0, url.length - 1);
  }
  return url;
}

async function sendRequest(url, parameters) {

  const response = await Axios.get(getURL(url,parameters),{
    headers: {
      Cookie: Credentials.cookie
    }}).catch(error => {
      console.error(`Server error: ${error.response.status}`);
      process.exit(1)
  });
  return response ? response.data : null
}

async function getUserID(user) {
  const response = await sendRequest(`https://instagram.com/${user}?__a=1`)
  return response ? response.graphql.user.id : null
}

async function fetchStories(users) {
  var data = QueryData.stories;
  data.variables.reel_ids = users;

  var stories = [];
  var response = await sendRequest(baseURL,data)
  if (response.data.reels_media && response.data.reels_media.length) {
    response = response.data.reels_media[0].items;

    for (var i=0; i<response.length; i++) {
      if (response[i].is_video) {
        stories.push(response[i].video_resources[response[i].video_resources.length-1].src);
      }
      else {
        stories.push(response[i].display_url);
      }
    }
  }
  return stories
}

async function fetchHighlightedStoriesList(user) {
  var data = QueryData.pinnedStoriesList;
  data.variables.user_id = user;

  var stories = [];
  response = await sendRequest(baseURL,data)
  if (response == null) {
    return []
  }
  else {
    response = response.data.user.edge_highlight_reels.edges
  }

  for (var i=0; i<response.length; i++) {
    stories.push(response[i].node.id)
  }
  return stories
}

async function fetchHighlightedStories(user) {
  var data = QueryData.pinnedStories
  data.variables.highlight_reel_ids = await fetchHighlightedStoriesList(user)

  response = await sendRequest(baseURL,data)
  if (response == null) {
    return []
  }
  else {
    response = response.data.reels_media
  }

  highlightedStories = []

  for (var i=0; i<response.length; i++) {
    highlightGroup = []
    for (var j=0; j<response[i].items.length; j++) {
      let item = response[i].items[j]
      if (item.is_video) {
        highlightGroup.push(item.video_resources[0].src)
      }
      else {
        highlightGroup.push(item.display_resources[item.display_resources.length-1].src)
      }
    }
    highlightedStories.push(highlightGroup)
  }
  return highlightedStories
}

async function fetchSinglePost(shortcode) {
  var data = QueryData.post;
  data.variables.shortcode = shortcode;

  response = await sendRequest(baseURL,data)
  return response
}

async function fetchFullPostPhotos(shortcode) {
  let reponse = await fetchSinglePost(shortcode)
  var photos = []
  if (response == null) { return [] }
  else {
    if (response.data.shortcode_media.hasOwnProperty('edge_sidecar_to_children')) {

      node = response.data.shortcode_media.edge_sidecar_to_children.edges
      for (var j=0; j<node.length; j++) {
        if (node[j].node.is_video) {
          photos.push(node[j].node.video_url);
        }
        else {
          photos.push(node[j].node.display_resources[node[j].node.display_resources.length-1].src)
        }
      }
    }
    else {
      if (response.data.shortcode_media.is_video) {
        photos.push(response.data.shortcode_media.video_url);
      }
      else {
        photos.push(response.data.shortcode_media.display_resources[response.data.shortcode_media.display_resources.length-1].src);
      }
    }
  }
  return photos
}

async function fetchTaggedPhotos(userID) {
	var photos = [];
  var data = QueryData.tagged;
  data.variables.id = userID;
  var hasNextPage = false;

  do {
    response = await sendRequest(baseURL,data)
    if (response == null) {
      return []
    }
    else {
      photolist = response.data.user.edge_user_to_photos_of_you;
    }

    hasNextPage = photolist.page_info.has_next_page;
    if (hasNextPage) {
      data.variables.after = photolist.page_info.end_cursor;
    }

    for (var i=0; i<photolist.edges.length; i++) {
      photos.push(photolist.edges[i].node.display_url)
    }
  } while (hasNextPage);

  return photos
}

async function fetchPhotos(userID) {
	var photos = [];
  var data = QueryData.photos;
  data.variables.id = userID;
  var hasNextPage = false;

  do {
    response = await sendRequest(baseURL,data)

    if (response == null) {
      return []
    }
    else {
      response = response.data.user.edge_owner_to_timeline_media;
    }

    hasNextPage = response.page_info.has_next_page;
    if (hasNextPage) {
      data.variables.after = response.page_info.end_cursor;
    }
    for (var i=0; i<response.edges.length; i++) {

      if (response.edges[i].node.hasOwnProperty('edge_sidecar_to_children')) {
        node = response.edges[i].node.edge_sidecar_to_children.edges
        for (var j=0; j<node.length; j++) {
          if (node[j].node.is_video) {
            photos.push(node[j].node.video_url);
          }
          else {
            photos.push(node[j].node.display_resources[node[j].node.display_resources.length-1].src)
          }
        }
      }
      else {
        if (response.edges[i].node.is_video) {
          photos.push(response.edges[i].node.video_url);
        }
        else {
          photos.push(response.edges[i].node.display_resources[response.edges[i].node.display_resources.length-1].src);
        }
      }
    }
  } while (hasNextPage);

  return photos
}

async function fetchFollowers(userID) {
  var followers = [];
  var data = QueryData.followers;
  data.variables.id = userID;
  var hasNextPage = false;

  do {
    response = await sendRequest(baseURL,data)
    if (response == null) {
      return []
    }
    else {
      response = response.data.user.edge_followed_by;
    }
    hasNextPage = response.page_info.has_next_page;
    if (hasNextPage) {
      data.variables.after = response.page_info.end_cursor;
    }
    for (var i=0; i<response.edges.length; i++) {
      followers.push(response.edges[i].node.username);
    }
  } while (hasNextPage);

	return followers;
}

async function fetchFollowing(userID) {
  var following = [];
  var data = QueryData.following;
  data.variables.id = userID;
  var hasNextPage = false;

  do {
    response = await sendRequest(baseURL,data)
    if (response == null) {
      return []
    }
    else {
      response = response.data.user.edge_follow;
    }
    hasNextPage = response.page_info.has_next_page;
    if (hasNextPage) {
      data.variables.after = response.page_info.end_cursor;
    }
    for (var i=0; i<response.edges.length; i++) {
      following.push(response.edges[i].node.username);
    }
  } while (hasNextPage);

	return following;
}

async function fetchMedia(url) {
  return await Axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers: {
      Cookie: Credentials.cookie
    }
  })
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

module.exports.getUserID = getUserID
module.exports.fetchStories = fetchStories
module.exports.fetchHighlightedStories = fetchHighlightedStories
module.exports.fetchSinglePost = fetchSinglePost
module.exports.fetchFullPostPhotos = fetchFullPostPhotos
module.exports.fetchTaggedPhotos = fetchTaggedPhotos
module.exports.fetchPhotos = fetchPhotos
module.exports.fetchFollowers = fetchFollowers
module.exports.fetchFollowing = fetchFollowing
module.exports.fetchMedia = fetchMedia
