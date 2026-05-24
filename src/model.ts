import fs from "fs/promises"

export interface EndpointDocumentation {
  description: string
  queries: string[]
  exampleResponse: Record<string, unknown>
}

export type EndpointsData = Record<string, EndpointDocumentation>

function readEndpointsData(): Promise<EndpointsData> {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf8")
    .then((endpoints) => {
      return JSON.parse(endpoints) as EndpointsData
    })
}

export default readEndpointsData