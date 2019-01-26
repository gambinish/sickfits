// imports the GraphQL Yoga server
const { GraphQLServer } = require('graphql-yoga');

// data resolvers: 'mutations' and 'queries' and are referenced in the createServer()
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db')

// Create the GraphQL Yoga Server
function createServer() {
  return new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers: {
      Mutation,
      Query,
    },
    // turn off noisy warnings
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    context: req => ({ ...req, db }),
  });
}

module.exports = createServer;

// NOTE: on initial startup, you will need to create placeholder variables in schema.graphQL
// this is to "PAD" graphQL init process:
        // type Mutation {
        //   placeholder: String
        // }
        // type Query {
        //   placeholder: String
        // }