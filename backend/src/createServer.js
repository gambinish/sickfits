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