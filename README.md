# Instagram Scraper CLI
Node.js tool which allows to download posts, stories and more from Instagram directly from terminal.

Supported components:
- Posts
- Tagged photos
- Stories
- Highlighted stories
- Followers
- Following

This tool does not rely on the Graph API for developers
-- it uses user's browser session to authenticate HTTP requests in the same way a browser does while browsing Instagram (no OAuth token needed).

Since this tool requests data as logged user, it is possible to fetch data from private profiles as long as the user is accepted follower of a fetched account.

## Cookies setup

Cookie data should be inserted into `cookie` attribute in `credentials.json` file. You do not need to pass whole cookie, the most important parameter is `sessionid` and it is required to authorize user requests by Instagram servers.

One of the easiest ways to access your cookies is using Chrome extension `EditThisCookie`. Just log onto your Instagram account and the extension should display `sessionid` among other Instagram related cookies. Then you should copy it and replace `YOUR_SESSION_ID` in `credentials.json` file.

```
{
  "cookie": "sessionid=YOUR_SESSION_ID"
}
```
The app will be working as long as your session remains active.

## Running app


>1. Installing dependencies `npm install`
>3. Cookie setup (explained in the preceding section)
>2. Running app `node instagram.js [options]`. All of the avaiable options are listed below:

```
Options:
  -h, --help                    Shows help
  -p, --posts [username]        Downloads posts of given user
  -t, --tagged [username]       Downloads tagged photos of given user
  -s, --stories [username]      Downloads stories of given user
  -S, --highlighted [username]  Downloads highlighted stories of given user
  -r, --followers [username]    Prints list of followers of given user
  -g, --following [username]    Prints list of following of given user

  -d, --destination [path]      Destination path (only for download commands)
  -i, --index [number]          Index of highlighted stories group (downloads all if not set)
```

### Examples:
```
node instagram.js -p georgehotz
```
Downloads posts of user `georgehotz` and saves it in the current directory
```
node instagram.js -S apple -i 2 -d ~/Photos
```
Downloads the second group of highlighted stories of user `apple` and saves it into `~/Photos` directory
