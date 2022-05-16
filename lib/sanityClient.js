import sanityClient from "@sanity/client"

export const client = sanityClient({
    projectId : '8o4leiwb',
    dataset : 'production',
    apiVersion : 'v1',
    token : 'sk7AwRhMCoJ3UuzH719SQeZTiHgC3bGo8H9RqyMoS4VSMpFWPXkfW7AV5T93akEVVpTSwgxjZeb5A2Z12V4yKwgZKmLFyfmA3twJ85VPXksNAdqQxexmwWBLzFtgipdLKOScqfmaDzdWLimJ3Ok4jCPVShxm99537T6z1ppA617q6n1jrUu9',
    useCdn : false
})