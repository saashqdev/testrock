import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import FlyDomainsServer from "./FlyDomains.server";
import { GetCertDto } from "../dtos/GetCertDto";
import { db } from "@/db";

async function getConfig({ appConfiguration, request }: { appConfiguration?: AppConfigurationDto; request: Request }) {
  if (!appConfiguration) {
    appConfiguration = await db.appConfiguration.getAppConfiguration();
  }
  const domains = appConfiguration?.portals?.domains;
  if (!domains?.enabled) {
    throw new Error("Custom domains are not enabled");
  }
  switch (domains.provider) {
    case "fly": {
      if (!process.env.PORTAL_SERVER_FLY_TOKEN) {
        throw new Error("PORTAL_SERVER_FLY_TOKEN is not defined");
      }
      return domains;
    }
    default:
      throw new Error(`Unknown custom domain provider: ${domains.provider}`);
  }
}

async function addCert({ hostname, request }: { hostname: string; request: Request }) {
  const domainsConfig = await getConfig({ request });
  switch (domainsConfig.provider) {
    case "fly": {
      await FlyDomainsServer.addCert({
        appId: domainsConfig.portalAppId,
        hostname,
        apiToken: process.env.PORTAL_SERVER_FLY_TOKEN?.toString() ?? "",
      });
    }
  }
}

async function getCert({ hostname, request }: { hostname: string | null; request: Request }) {
  if (!hostname) {
    return null;
  }
  const domainsConfig = await getConfig({ request });
  switch (domainsConfig.provider) {
    case "fly": {
      const cer = await FlyDomainsServer.getCert({
        appId: domainsConfig.portalAppId,
        hostname,
        apiToken: process.env.PORTAL_SERVER_FLY_TOKEN?.toString() ?? "",
      }).catch(() => null);
      if (!cer) {
        return null;
      }
      const certificate: GetCertDto = {
        configured: cer.data.app.certificate.configured,
        records: {
          A: {
            name: getApexDomain(hostname),
            value: domainsConfig.records?.A ?? "",
          },
          AAAA: {
            name: getApexDomain(hostname),
            value: domainsConfig.records?.AAAA ?? "",
          },
          CNAME: {
            name: cer.data.app.certificate.dnsValidationHostname,
            value: cer.data.app.certificate.dnsValidationTarget,
          },
        },
      };
      return certificate;
    }
  }

  return null;
}

function getApexDomain(hostname: string) {
  // if root domain, return @ otherwise remove the root domain
  return hostname === getRootDomain(hostname) ? "@" : hostname.replace("." + getRootDomain(hostname), "");
}
function getRootDomain(hostname: string) {
  const parts = hostname.split(".");
  return parts.slice(-2).join(".");
}

async function delCert({ hostname, request }: { hostname: string; request: Request }) {
  const domainsConfig = await getConfig({ request });
  switch (domainsConfig.provider) {
    case "fly": {
      return FlyDomainsServer.delCert({
        appId: domainsConfig.portalAppId,
        hostname,
        apiToken: process.env.PORTAL_SERVER_FLY_TOKEN?.toString() ?? "",
      });
    }
  }
}

export default {
  getConfig,
  addCert,
  getCert,
  delCert,
};
