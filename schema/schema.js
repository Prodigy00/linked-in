//const _ = require("lodash"); //helper library, helps  us walk through collections of data
const axios = require("axios");
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

// const users = [
//   { id: "45", firstName: "David", age: 29 },
//   { id: "31", firstName: "Dozie", age: 31 }
// ];

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt }
  }
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    //connect to user type
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLString }
      },
      //where we go into our data store
      resolve(parentValue, args) {
        //walking through our list of users, find and return the first user who ha an id equal to args.id
        // return _.find(users, { id: args.id });
        //stopped using lodash at this point to use axios for async requests
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then(response => response.data); //axios returns nested data like so{ data: {firstName:'David}}
      }
    }
  }
});

//GraphQL schema turns a root query into a schema instance
module.exports = new GraphQLSchema({
  query: RootQuery
});
