const sanityClient = require('@sanity/client');

const SanityClient = sanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2021-03-25',
    token: process.env.SANITY_TOKEN,
    useCdn: false,
});

module.exports = { SanityClient };