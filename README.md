# Nx Next Server

> Utility for creating a custom Next.js server with Nx in a separate app.

![npm](https://img.shields.io/npm/v/nx-next-server)

Creating [Next.js](https://nextjs.org/) custom servers with [Nx](https://nx.dev/) is not possible (as of the time this package was created). `nx-next-server` provides a simple utility function which can be used to start a Next.js app within Nx from another Nx app.

The benefits of this are:

- Create custom Next.js server with TypeScript in Nx
- Import and use Nx libs within custom server

## Install

```bash
$ yarn add nx-next-server
# or
$ npm install nx-next-server
```

## Usage

Your NX workspace should include a [Next.js app](https://nx.dev/react/plugins/next/overview) and a server app ([Node.js](https://nx.dev/react/plugins/node/overview)/[Express](https://nx.dev/react/plugins/express/overview)).

This example assumes you have a Nx workspace with two apps:

- **apps/web** - Next.js app
- **apps/server** - Express app

```ts
// apps/server/src/main.ts
import createServer from "nx-next-server";
import * as express from "express";

// Create Next.js server for apps/web app
createServer("web").then(({ nextApp, handler, settings, proxyConfig }) => {
  const server = express();

  server.all("*", (req, res) => handler(req, res));

  server.listen(settings.port, settings.hostname, () => {
    console.log(
      `Listening on ${settings.hostname || "http://localhost"}:${settings.port}`
    );
  });
});
```

Once you've written your express app, it can be run using:

```bash
$ yarn start server
```

## Build

Your Next.js app can be built with:

```bash
$ yarn build web
```

Your Express server can be built with:

```bash
$ yarn build server --configuration=production
```

> **Note:** you need to include `--configuration=production` to ensure your server targets the `dist/apps/web` Next.js build.

The build can be tested by running the main.js file in `dist`:

```bash
$ node ./dist/apps/server/main.js
```

## License

[MIT](http://vjpr.mit-license.org)
