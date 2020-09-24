import type { NextServerOptions } from "@nrwl/next/src/utils/types";
import type Server from "next/dist/next-server/server/next-server";
import * as path from "path";
import initNextConfig from "./init-next-config";
import deepMerge from "./deep-merge";

export default async function createServer(
  appName: string,
  customSettings: Partial<NextServerOptions> = {},
  production: boolean = process.env.NODE_ENV === "production"
) {
  const { settings, proxyConfig } = initNextConfig(appName);

  let nextApp: Server;
  if (!production) {
    const { default: NextServer } = await import(
      "next/dist/server/next-dev-server"
    );
    nextApp = new NextServer(deepMerge(settings, customSettings));
  } else {
    const { default: next } = await import("next");
    settings.conf.distDir = ".next";
    nextApp = next(
      deepMerge(
        {
          ...settings,
          dir: settings.dir,
          dev: false,
        },
        customSettings
      )
    );
  }

  const handler = nextApp.getRequestHandler();

  await nextApp.prepare();

  return { nextApp, handler, settings, proxyConfig };
}
