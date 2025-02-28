import type { Schema } from '../../data/resource'

export const handler: Schema["getReport"]["functionHandler"] = async (event) => {
    const { target_url } = event.arguments
    return `Hello, you are trying to get a report for ${target_url}`
}