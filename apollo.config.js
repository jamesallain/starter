module.exports = {
  client: {
    includes: [`${__dirname}/@app/native/src/**/*.graphql`],
    service: {
      name: 'postgraphile',
      localSchemaFile: `${__dirname}/../server/data/schema.graphql`,
    },
  },
};
