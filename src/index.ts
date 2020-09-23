import type Server from "next/dist/next-server/server/next-server";
import * as path from "path";
import initNextConfig from "./init-next-config";

export default async function createServer(appName: string) {
  const { settings, proxyConfig } = initNextConfig(appName);

  let nextApp: Server;
  if (process.env.NODE_ENV !== "production") {
    const { default: NextServer } = await import(
      "next/dist/server/next-dev-server"
    );
    nextApp = new NextServer({ ...settings, customServer: true });
  } else {
    const { default: next } = await import("next");
    nextApp = next({
      ...settings,
      dir: path.resolve(settings.dir, settings.conf.outdir),
      customServer: true,
    });
  }

  const handler = nextApp.getRequestHandler();

  await nextApp.prepare();

  return { nextApp, handler, settings, proxyConfig };
}
