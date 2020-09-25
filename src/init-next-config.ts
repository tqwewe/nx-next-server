import * as path from "path";
import * as fs from "fs";
import { BuilderContext } from "@angular-devkit/architect";
import { terminal } from "@angular-devkit/core";
import { getLogger } from "@nrwl/tao/src/shared/logger";
import nextSchema from "@nrwl/next/src/builders/server/schema.json";
import { NextServerOptions, ProxyConfig } from "@nrwl/next/src/utils/types";
import { prepareConfig } from "@nrwl/next/src/utils/config";
import { findWorkspaceRoot } from "@nrwl/cli/lib/find-workspace-root";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER,
} from "next/dist/next-server/lib/constants";
import deepMerge from "./deep-merge";

export default function initNextConfig(appName: string) {
  const logger = getLogger(false);
  const infoPrefix = `[ ${terminal.dim(terminal.cyan("info"))} ] `;

  const workspaceRoot = findWorkspaceRoot(process.cwd()).dir;
  const workspace = JSON.parse(
    fs.readFileSync(path.join(workspaceRoot, "workspace.json")).toString()
  );
  const root = path.join(workspaceRoot, workspace.projects[appName].root);

  const buildConf = workspace.projects[appName].architect.build;
  const serveConf = workspace.projects[appName].architect.serve;

  const workspaceOptions = deepMerge(
    serveConf.options,
    (serveConf.configurations &&
      serveConf.configurations[process.env.NODE_ENV]) ||
      {}
  );
  const defaultOptions = (Object.entries(nextSchema.properties) as [
    string,
    {
      type: string;
      description: string;
      default: unknown;
    }
  ][]).reduce<{
    dev?: boolean;
    staticMarkup?: boolean;
    quiet?: boolean;
    port?: number;
    customServerPath?: string;
    hostname?: string;
    proxyConfig?: string;
  }>(
    (acc, [key, { default: def }]) => ({
      ...acc,
      [key]: def,
    }),
    {}
  );
  const options = deepMerge(defaultOptions, workspaceOptions);

  const buildOptions = deepMerge(
    {
      root: `apps/${appName}`,
      outputPath: `dist/apps/${appName}`,
      fileReplacements: [],
    },
    deepMerge(
      buildConf.options,
      (buildConf.configurations &&
        buildConf.configurations[process.env.NODE_ENV]) ||
        {}
    )
  );

  const config = prepareConfig(
    options.dev ? PHASE_DEVELOPMENT_SERVER : PHASE_PRODUCTION_SERVER,
    buildOptions,
    {
      workspaceRoot,
    } as BuilderContext
  );

  const settings: NextServerOptions = {
    dev: options.dev,
    dir: root,
    staticMarkup: options.staticMarkup,
    quiet: options.quiet,
    conf: config,
    port: options.port,
    path: options.customServerPath,
    hostname: options.hostname,
  };

  // look for the proxy.conf.json
  let proxyConfig: ProxyConfig;
  const proxyConfigPath = options.proxyConfig
    ? path.join(workspaceRoot, options.proxyConfig)
    : path.join(root, "proxy.conf.json");
  if (fs.existsSync(proxyConfigPath)) {
    console.log();
    logger.info(
      `${infoPrefix} found proxy configuration at ${proxyConfigPath}`
    );
    proxyConfig = require(proxyConfigPath);
  }

  return { settings, proxyConfig };
}
