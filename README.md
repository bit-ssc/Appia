<div align="center">
  <img src="https://github.com/bit-ssc/Appia/assets/15917128/66b43886-0427-4518-9740-6de93974801b" width="500" />
</div>

<h1 align="center">
  Appia is an IM software for enterprise internal communication, including multiple modules and functions such as projects, channels, robots, labor, OA, and external system access
</h1>


## Local development

### Prerequisites

You can follow these instructions to setup a dev environment:

- Install **Node 14.x (LTS)** either [manually](https://nodejs.org/dist/latest-v14.x/) or using a tool like [nvm](https://github.com/creationix/nvm) (recommended)
- Install **Meteor**: https://www.meteor.com/developers/install
- Install **yarn**: https://yarnpkg.com/getting-started/install
- Clone this repo: `git clone https://github.com/bit-ssc/Appia.git`
- Run `yarn` to install dependencies

### Starting Rocket.Chat

```
yarn dsv
```

After initialized, you can access the server at http://localhost:3000

### Starting Rocket.Chat in microservices mode

```
yarn turbo run ms
```

After initialized, you can access the server at http://localhost:4000

## Installation

Please see the [requirements documentation](https://docs.rocket.chat/deploy/installing-client-apps/minimum-requirements-for-using-rocket.chat) for system requirements and more information about supported operating systems.
Please refer to [Install Rocket.Chat](https://rocket.chat/install) to install your Rocket.Chat instance.


## Credits

- Emoji provided graciously by [JoyPixels](https://www.joypixels.com).
- Testing with [BrowserStack](https://www.browserstack.com).
- Translations done with [LingoHub](https://lingohub.com).

## Mobile Apps

In addition to the web interface, you can also download Rocket.Chat clients for:

[![Appia on Apple App Store](https://user-images.githubusercontent.com/551004/29770691-a2082ff4-8bc6-11e7-89a6-964cd405ea8e.png)](https://apps.apple.com/us/app/appia/id1630882554?l=zh-Hans-CN)

## Learn More

- [API](https://developer.rocket.chat/reference/api)
- [See who's using Rocket.Chat](https://rocket.chat/customer-stories)


