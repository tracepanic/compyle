import { appStatusEnum } from "@/db/schemas/enums";

export type AppPublishStatus = (typeof appStatusEnum.enumValues)[number];
