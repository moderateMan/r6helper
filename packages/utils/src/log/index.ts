import log  from "npmlog";

log.level == process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";
log.heading = "moderate-cli";
log.headingStyle = { bg: "blue" };
log.addLevel("success", 2000, { fg: "green", bold: true });

export default log;
