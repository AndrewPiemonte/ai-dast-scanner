import { type ClientSchema, a, defineData } from "@aws-amplify/backend"

const schema = a.schema({
Chat: a.model({
    id: a.id(),
    messages: a.hasMany("message", "chatId")
}).authorization(allow => [allow.owner()]),
Message: a.model({
  id: a.id(),
  chatId: a.belongsTo("chat", "chatId"),
  content: a.string(),
  sender: a.enum(["user", "bot"])
})
})



export type Schema = ClientSchema<typeof schema>

export const chatData = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool"
    }
})
