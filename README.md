# Fed-Down

Fed-Down is a firefox extension to interact with the Fediverse directly from your web browser.
It shows an action button where can directly fav or boost the page you're currently reading. If you right-click a link to a fediverse resource, you can also boost that resource from any of your fediverse account. This is useful if you scroll a timeline on one instance and want to boost on another instance.
For these actions to work, the current webpage must be a page federated with your fediverse instance server.


As a fallback, it is also possible to submit a new status on your fediverse account by selecting text from the current page and choosing the option to share with the fediverse from the context-menu (right click).


Use-cases : 
- You read a wordpress or ghost article from a blog federated with your mastodon server. You can favorite that article without leaving your webpage. You don't need to find the original fediverse post through your mastodon UI so it's easy to fav or boost an article from a blog you follow via its RSS feed.
- You stumble upon an amazing photo in your pixelfed feed and you want to boost it on your mastodon account : Right click on the "time posted" link and choose an account to give a boost

## Setup

To use this extension, you must register fediverse accounts in the plugin settings.
The process is currently manual as you need to generate an API token on your fediverse instance to register it in the plugin.

### Maston
- Go to your profile settings
- Click the Development menu
- Click "New application"
- Enter "Fed-Down" as then name and select the following permissions : 
  - read:search
  - profile
  - write: favourites
  - write: statuses

- Validate the changes and click on the application details.
- Copy the token and use it in the plugin configuration

### Misskey (Calkey, Sharkey, *key)
- Go to "Settings"
- Click "Service integration" menu
- Click the "Generate an access token" button
- Select the following permissions 
  - Read account information
  - Manage favorites
  - Create / Delete notes
  - Manage reactions
- Validate the settings 
- Copy the generated token and use it in the plugin configuration