import convict from "convict";
import { join, isAbsolute, resolve } from "path";
import envPath from "env-paths";

const getSchema = (envPrefix) => ({
  DIR: {
    doc: "Custom app directory",
    format: String,
    default: "",
    env: `${envPrefix}_DIR`,
    arg: "DIR",
  },
  CONFIG: {
    doc: "Path to configuration file",
    format: String,
    default: "",
    env: `${envPrefix}_CONFIG`,
    arg: "CONFIG",
  },
});

const getAppNameFromPackageName = (packageName) => {
  let [scope, name] = packageName.split("/");
  name = name || scope;
  return name;
};

const getEnvPrefixFromName = (name) => name.toUpperCase().replace("-", "_");

export const resolveUserConfig = (packageName) => {
  const name = getAppNameFromPackageName(packageName);
  const envPrefix = getEnvPrefixFromName(name);
  const schema = getSchema(envPrefix);
  const config = convict(schema);
  const { CONFIG, DIR } = config.getProperties();
  const defaultConfigFilename = `${name}.config.json`;

  if (CONFIG) {
    // config is required by user!
    // fail if file doesn't exist!
    if (isAbsolute(CONFIG)) return CONFIG;
    if ("true" === CONFIG) return resolve(".", defaultConfigFilename);
    return resolve(".", CONFIG);
  }

  if (DIR) return join(DIR, "config", defaultConfigFilename);

  const { XDG_CONFIG_HOME } = process.env;
  if (XDG_CONFIG_HOME)
    return join(XDG_CONFIG_HOME, packageName, defaultConfigFilename);

  const configDir = envPath(packageName).config;
  return join(configDir, defaultConfigFilename);
};
