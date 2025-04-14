import { type ClientSchema, a, defineData } from "@aws-amplify/backend"

const schema = a.schema({
    reportInfo: a.model({
        id: a.id(),
        scan_id: a.string(),
        testName: a.string(),
        testDate: a.string(),
        targetURL: a.string(),
        type: a.string(),
        status: a.enum(["initiated", "running", "processing", "failed", "completed"])
    }).authorization(allow => [allow.owner()]),
    Chat: a.model({
        id: a.id(),
        reportId: a.id(),
        messages: a.hasMany("Message", "chat")
    }).authorization(allow => [allow.owner()]),
    Message: a.model({
      id: a.id(),
      chat: a.belongsTo("Chat", "chatId"),
      content: a.string(),
      sender: a.enum(["user", "bot"])
    }).authorization(allow => [allow.owner()])
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool"
    }
})
