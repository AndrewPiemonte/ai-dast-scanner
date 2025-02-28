import { type ClientSchema, a, defineData } from "@aws-amplify/backend"
import { getReport } from "../functions/get-report/resource"

const schema = a.schema({
    reportInfo: a.model({
        id: a.id(),
        testName: a.string(),
        testDate: a.string(),
        targetURL: a.string(),
        type: a.enum(["base scan", "api"]),
        status: a.enum(["success", "pending", "failed", "-"])
    }).authorization(allow => [allow.owner()])
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "iam"
    }
})