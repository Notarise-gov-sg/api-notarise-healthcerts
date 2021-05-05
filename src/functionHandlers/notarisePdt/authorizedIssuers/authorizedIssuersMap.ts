import { config } from "../../../config";

export interface Issuer {
  name: string;
  domain: string;
}

const authorizedIssuersBothEnv: { [domain: string]: Issuer } = {
  "donotverify.testing.verify.gov.sg": {
    name: "DO NOT VERIFY",
    domain: "donotverify.testing.verify.gov.sg"
  },
  "nextid.com": {
    name: "NEXT ID",
    domain: "nextid.com"
  },
  "parkwaypantai.com": {
    name: "Parkway Shenton",
    domain: "parkwaypantai.com"
  },
  "carehealth.io": {
    name: "Raffles Medical Group",
    domain: "carehealth.io"
  },
  "gleneagles.hk": {
    name: "Gleneales Hospital Hong Kong",
    domain: "gleneagles.hk"
  },
  "riverr.ai": {
    name: "Riverr",
    domain: "riverr.ai"
  },
  "healthcert-issuer.collinsonassistance.com": {
    name: "Collinson Assistance Service Ltd",
    domain: "healthcert-issuer.collinsonassistance.com"
  },
  "siloamhospitals.com": {
    name: "SILOAM HOSPITALS ASRI",
    domain: "siloamhospitals.com"
  },
  "3dcerts.com": {
    name: "3DCerts Staging Test",
    domain: "3dcerts.com"
  },
  "acmsmedical.com.sg": {
    name: "ACMS Medical Clinic",
    domain: "acmsmedical.com.sg"
  },
  "wlhms.riverr.ai": {
    name: "Riverr",
    domain: "wlhms.riverr.ai"
  },
  "tcmc.riverr.ai": {
    name: "Riverr",
    domain: "tcmc.riverr.ai"
  },
  "tmctw.riverr.ai": {
    name: "Riverr",
    domain: "tmctw.riverr.ai"
  },
  "tmcplq.riverr.ai": {
    name: "Riverr",
    domain: "tmcplq.riverr.ai"
  },
  "smsc.riverr.ai": {
    name: "Riverr",
    domain: "smsc.riverr.ai"
  },
  "speedoc.riverr.ai": {
    name: "Riverr",
    domain: "speedoc.riverr.ai"
  },
  "slmc.riverr.ai": {
    name: "Riverr",
    domain: "slmc.riverr.ai"
  },
  "rmi.riverr.ai": {
    name: "Riverr",
    domain: "rmi.riverr.ai"
  },
  "ohi.riverr.ai": {
    name: "Riverr",
    domain: "ohi.riverr.ai"
  },
  "npfc.riverr.ai": {
    name: "Riverr",
    domain: "npfc.riverr.ai"
  },
  "imckatong.riverr.ai": {
    name: "Riverr",
    domain: "imckatong.riverr.ai"
  },
  "imcjelita.riverr.ai": {
    name: "Riverr",
    domain: "imcjelita.riverr.ai"
  },
  "imcchildrens.riverr.ai": {
    name: "Riverr",
    domain: "imcchildrens.riverr.ai"
  },
  "imccamden.riverr.ai": {
    name: "Riverr",
    domain: "imccamden.riverr.ai"
  },
  "fema.riverr.ai": {
    name: "Riverr",
    domain: "fema.riverr.ai"
  },
  "eurofinsSG.riverr.ai": {
    name: "Riverr",
    domain: "eurofinsSG.riverr.ai"
  },
  "dwfc.riverr.ai": {
    name: "Riverr",
    domain: "dwfc.riverr.ai"
  },
  "dtap.riverr.ai": {
    name: "Riverr",
    domain: "dtap.riverr.ai"
  },
  "cmc.riverr.ai": {
    name: "Riverr",
    domain: "cmc.riverr.ai"
  },
  "smc.riverr.ai": {
    name: "Riverr",
    domain: "smc.riverr.ai"
  },
  "pmc.riverr.ai": {
    name: "Riverr",
    domain: "pmc.riverr.ai"
  },
  "mhmc.riverr.ai": {
    name: "Riverr",
    domain: "mhmc.riverr.ai"
  },
  "pch.riverr.ai": {
    name: "Riverr",
    domain: "pch.riverr.ai"
  },
  "hwmc.riverr.ai": {
    name: "Riverr",
    domain: "hwmc.riverr.ai"
  },
  "myclinic.riverr.ai": {
    name: "Riverr",
    domain: "myclinic.riverr.ai"
  },
  "shanah.riverr.ai": {
    name: "Riverr",
    domain: "shanah.riverr.ai"
  },
  "cck.riverr.ai": {
    name: "Riverr",
    domain: "cck.riverr.ai"
  },
  "dover.riverr.ai": {
    name: "Riverr",
    domain: "dover.riverr.ai"
  },
  "bless.riverr.ai": {
    name: "Riverr",
    domain: "bless.riverr.ai"
  },
  "greenlink.riverr.ai": {
    name: "Riverr",
    domain: "greenlink.riverr.ai"
  },

  "street11.riverr.ai": {
    name: "Riverr",
    domain: "street11.riverr.ai"
  },
  "lucence.com": {
    name: "AokPass",
    domain: "lucence.com"
  },
  "platinum.riverr.ai": {
    name: "Riverr",
    domain: "platinum.riverr.ai"
  },
  "oa.keys.trybe.id": {
    name: "Trybe ID Inc",
    domain: "oa.keys.trybe.id"
  },
  "nippon.riverr.ai": {
    name: "Riverr",
    domain: "nippon.riverr.ai"
  },
  "healthcert-apac.collinsonassistance.com": {
    name: "Collinson Assistance Service Ltd",
    domain: "healthcert-apac.collinsonassistance.com"
  },
  "healthcerts.jebhealth.com": {
    name: "JEB Healthcare Technologies Pte Ltd (JEBHEALTH)",
    domain: "healthcerts.jebhealth.com"
  },
  "ongsclinic.riverr.ai": {
    name: "Riverr",
    domain: "ongsclinic.riverr.ai"
  },
  "bedokdaynight.riverr.ai": {
    name: "Riverr",
    domain: "bedokdaynight.riverr.ai"
  },
  "jurongdaynight.riverr.ai": {
    name: "Riverr",
    domain: "jurongdaynight.riverr.ai"
  },
  "kingswaymedical.riverr.ai": {
    name: "Riverr",
    domain: "kingswaymedical.riverr.ai"
  },
  "thegoodclinic.riverr.ai": {
    name: "Riverr",
    domain: "thegoodclinic.riverr.ai"
  },
  "tmedicalkallang.riverr.ai": {
    name: "Riverr",
    domain: "tmedicalkallang.riverr.ai"
  },
  "tmedicalcanberra.riverr.ai": {
    name: "Riverr",
    domain: "tmedicalcanberra.riverr.ai"
  },
  "tmedicalcitygate.riverr.ai": {
    name: "Riverr",
    domain: "tmedicalcitygate.riverr.ai"
  },
  "healthcaremedicalkovan.riverr.ai": {
    name: "Riverr",
    domain: "healthcaremedicalkovan.riverr.ai"
  },
  "doctors4lifepickering.riverr.ai": {
    name: "Riverr",
    domain: "doctors4lifepickering.riverr.ai"
  },
  "shalomclinicsurgery.riverr.ai": {
    name: "Riverr",
    domain: "shalomclinicsurgery.riverr.ai"
  },
  "acmsmedicalclinic.riverr.ai": {
    name: "Riverr",
    domain: "acmsmedicalclinic.riverr.ai"
  },
  "mydoctorcanberra.riverr.ai": {
    name: "Riverr",
    domain: "mydoctorcanberra.riverr.ai"
  },
  "healthlinkmed.riverr.ai": {
    name: "Riverr",
    domain: "healthlinkmed.riverr.ai"
  },
  "singapuraclinic.riverr.ai": {
    name: "Riverr",
    domain: "singapuraclinic.riverr.ai"
  },
  "bukittimahclinic.riverr.ai": {
    name: "Riverr",
    domain: "bukittimahclinic.riverr.ai"
  },
  "thedublinclinic.riverr.ai": {
    name: "Riverr",
    domain: "thedublinclinic.riverr.ai"
  },
  "unihealthclinicjurongeast.riverr.ai": {
    name: "Riverr",
    domain: "unihealthclinicjurongeast.riverr.ai"
  },
  "belieffamilyclinic.riverr.ai": {
    name: "Riverr",
    domain: "belieffamilyclinic.riverr.ai"
  },
  "mydoctorlakeside.riverr.ai": {
    name: "Riverr",
    domain: "mydoctorlakeside.riverr.ai"
  },
  "citygpfamilyclinic.riverr.ai": {
    name: "Riverr",
    domain: "citygpfamilyclinic.riverr.ai"
  },
  "healthpartnershipmedical.riverr.ai": {
    name: "Riverr",
    domain: "healthpartnershipmedical.riverr.ai"
  },
  "newcastleclinic.riverr.ai": {
    name: "Riverr",
    domain: "newcastleclinic.riverr.ai"
  },
  "prohealth.riverr.ai": {
    name: "Riverr",
    domain: "prohealth.riverr.ai"
  },
  "accredify.io": {
    name: "Accredify",
    domain: "accredify.io"
  },
  "www.docotormmc.com": {
    name: "3DCerts Pte Ltd",
    domain: "www.docotormmc.com"
  },
  "www.aris-mc.com": {
    name: "3DCerts Pte Ltd",
    domain: "www.aris-mc.com"
  },
  "www.acmsmedical.com.sg": {
    name: "3DCerts Pte Ltd",
    domain: "www.acmsmedical.com.sg"
  },
  "pinnacle.3dcerts.com": {
    name: "3DCerts Pte Ltd",
    domain: "pinnacle.3dcerts.com"
  },
  "www.acumen-diagnostics.com": {
    name: "3DCerts Pte Ltd",
    domain: "www.acumen-diagnostics.com"
  },

  "inex.sg": {
    name: "3DCerts Pte Ltd",
    domain: "inex.sg"
  },
  "issuer-w3c.loyalty.com.hk": {
    name: "Loyalty Service Ltd",
    domain: "issuer-w3c.loyalty.com.hk"
  },
  "issuer.loyalty.com.hk": {
    name: "Collinson Assistance Service Ltd",
    domain: "issuer.loyalty.com.hk"
  },
  "c3familyclinic.riverr.ai": {
    name: "Riverr",
    domain: "c3familyclinic.riverr.ai"
  },
  "arismedical.riverr.ai": {
    name: "Riverr",
    domain: "arismedical.riverr.ai"
  },
  "healthwerkzcck.riverr.ai": {
    name: "Riverr",
    domain: "healthwerkzcck.riverr.ai"
  },
  "urgentcareclinic.riverr.ai": {
    name: "Riverr",
    domain: "urgentcareclinic.riverr.ai"
  },
  "gardenclinic.riverr.ai": {
    name: "Riverr",
    domain: "gardenclinic.riverr.ai"
  },
  "minmedjurongeast.riverr.ai": {
    name: "Riverr",
    domain: "minmedjurongeast.riverr.ai"
  },
  "minmedyishun.riverr.ai": {
    name: "Riverr",
    domain: "minmedyishun.riverr.ai"
  },
  "minmedjhaigroad.riverr.ai": {
    name: "Riverr",
    domain: "minmedjhaigroad.riverr.ai"
  },
  "minmedpunggol.riverr.ai": {
    name: "Riverr",
    domain: "minmedpunggol.riverr.ai"
  },
  "minmedsengkang.riverr.ai": {
    name: "Riverr",
    domain: "minmedsengkang.riverr.ai"
  },
  "minmedjpasirris.riverr.ai": {
    name: "Riverr",
    domain: "minmedjpasirris.riverr.ai"
  },
  "minmedscreeners.riverr.ai": {
    name: "Riverr",
    domain: "minmedscreeners.riverr.ai"
  },
  "dayspring.riverr.ai": {
    name: "Riverr",
    domain: "dayspring.riverr.ai"
  },
  "THEPINNACLEMEDICAL.3DCERTS.COM": {
    name: "3DCerts Pte Ltd",
    domain: "THEPINNACLEMEDICAL.3DCERTS.COM"
  },
  "fullertonhealthcaretrythall.riverr.ai": {
    name: "Riverr",
    domain: "fullertonhealthcaretrythall.riverr.ai"
  },
  "amc.riverr.ai": {
    name: "Riverr",
    domain: "amc.riverr.ai"
  },
  "alexandrafamilyclinic.riverr.ai": {
    name: "Riverr",
    domain: "alexandrafamilyclinic.riverr.ai"
  },
  "alifeclinic.riverr.ai": {
    name: "Riverr",
    domain: "alifeclinic.riverr.ai"
  },
  "affinitymedical.riverr.ai": {
    name: "Riverr",
    domain: "affinitymedical.riverr.ai"
  },
  "pacificfamilyclinic.riverr.ai": {
    name: "Riverr",
    domain: "pacificfamilyclinic.riverr.ai"
  },
  "medlifeclinic.riverr.ai": {
    name: "Riverr",
    domain: "medlifeclinic.riverr.ai"
  },
  "healthcaremedicalrailmall.riverr.ai": {
    name: "Riverr",
    domain: "healthcaremedicalrailmall.riverr.ai"
  },
  "faithfamilyclinic.riverr.ai": {
    name: "Riverr",
    domain: "faithfamilyclinic.riverr.ai"
  },
  "verify.aok.me": {
    name: "AOKpass",
    domain: "verify.aok.me"
  },
  "fmgfcy.riverr.ai": {
    name: "Riverr",
    domain: "fmgfcy.riverr.ai"
  },
  "fmgfcb.riverr.ai": {
    name: "Riverr",
    domain: "fmgfcb.riverr.ai"
  },
  "fmgffcj.riverr.ai": {
    name: "Riverr",
    domain: "fmgffcj.riverr.ai"
  },
  "fmgfht.riverr.ai": {
    name: "Riverr",
    domain: "fmgfht.riverr.ai"
  },
  "fmgfctp.riverr.ai": {
    name: "Riverr",
    domain: "fmgfctp.riverr.ai"
  },
  "fmgfcs.riverr.ai": {
    name: "Riverr",
    domain: "fmgfcs.riverr.ai"
  },
  "fmgfcr.riverr.ai": {
    name: "Riverr",
    domain: "fmgfcr.riverr.ai"
  },
  "rafrop.accredify.io": {
    name: "Raffles Medical",
    domain: "rafrop.accredify.io"
  },
  "suncare.riverr.ai": {
    name: "Riverr",
    domain: "suncare.riverr.ai"
  },
  "daclinicanson.riverr.ai": {
    name: "Riverr",
    domain: "daclinicanson.riverr.ai"
  },
  "daclinicbukitbatok.riverr.ai": {
    name: "Riverr",
    domain: "daclinicbukitbatok.riverr.ai"
  },
  "daclinicanchorvale.riverr.ai": {
    name: "Riverr",
    domain: "daclinicanchorvale.riverr.ai"
  },
  "daclinicbishan.riverr.ai": {
    name: "Riverr",
    domain: "daclinicbishan.riverr.ai"
  },
  "daclinicpotongpasir.riverr.ai": {
    name: "Riverr",
    domain: "daclinicpotongpasir.riverr.ai"
  },
  "daclinictamanjurong.riverr.ai": {
    name: "Riverr",
    domain: "daclinictamanjurong.riverr.ai"
  },
  "dasimei.riverr.ai": {
    name: "Riverr",
    domain: "dasimei.riverr.ai"
  },
  "amk.riverr.ai": {
    name: "Riverr",
    domain: "amk.riverr.ai"
  },
  "chinchoo.riverr.ai": {
    name: "Riverr",
    domain: "chinchoo.riverr.ai"
  },
  "sembawangmart.riverr.ai": {
    name: "Riverr",
    domain: "sembawangmart.riverr.ai"
  },
  "thecliniq.riverr.ai": {
    name: "Riverr",
    domain: "thecliniq.riverr.ai"
  },
  "sengkangfamily.riverr.ai": {
    name: "Riverr",
    domain: "sengkangfamily.riverr.ai"
  },
  "iconmedical.riverr.ai": {
    name: "Riverr",
    domain: "iconmedical.riverr.ai"
  },
  "urgentcareclinic.sg": {
    name: "3DCerts Pte Ltd",
    domain: "urgentcareclinic.sg"
  },
  "ptanfmc.riverr.ai": {
    name: "P Tan Family Medicine Clinic",
    domain: "ptanfmc.riverr.ai"
  },
  "familycareclinic.riverr.ai": {
    name: "Riverr",
    domain: "familycareclinic.riverr.ai"
  }
};

const authorizedIssuersDevelopment: { [domain: string]: Issuer } = {
  ...authorizedIssuersBothEnv,
  "dev-healthcerts.jebhealth.com": {
    name: "Jebhealth",
    domain: "dev-healthcerts.jebhealth.com"
  },
  "demo-healthcerts.knowledgecatalyst.io": {
    name: "Knowledge Catalyst Pte. Ltd.",
    domain: "demo-healthcerts.knowledgecatalyst.io"
  },
  "demo2-healthcerts.knowledgecatalyst.io": {
    name: "Demo 2 HealthCerts KC",
    domain: "demo2-healthcerts.knowledgecatalyst.io"
  },
  "issuer1.tubalt.com": {
    name: "1PASS Test Clinic 1",
    domain: "issuer1.tubalt.com"
  },
  "staging.qrlab.my": {
    name: "QRlab",
    domain: "staging.qrlab.my"
  }
};

const authorizedIssuersProduction: { [domain: string]: Issuer } = {
  ...authorizedIssuersBothEnv
};

const getAuthorizedIssuers = () =>
  config.authorizedIssuerMap === "production"
    ? authorizedIssuersProduction
    : authorizedIssuersDevelopment;

export const authorizedIssuers = new Map<string, Issuer>(
  Object.entries(getAuthorizedIssuers())
);
