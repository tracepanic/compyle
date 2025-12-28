import { appStatusEnum } from "@/db/schemas/enums";
{/*Testing changes Deployment error*/ }
export type AppPublishStatus = (typeof appStatusEnum.enumValues)[number];

