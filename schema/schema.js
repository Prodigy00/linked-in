//const _ = require("lodash"); //helper library, helps  us walk through collections of data
const axios = require("axios");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList //don't forget to destructure whatever prop you use in the schema
} = graphql;

// const users = [
//   { id: "45", firstName: "David", age: 29 },
//   { id: "31", firstName: "Dozie", age: 31 }
// ];
//It's important that you place your company type above the user type.
//order of definition matters.
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    //connecting users to company so you can search for companies then users
    users: {
      //this tells GQL that when we go from a company to a user,
      //GQL should expect a list of users associated with that one company
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(
            //parentValue.id === companyId
            `http://localhost:3000/companies/${parentValue.id}/users`
          )
          .then(response => response.data);
      }
    }
  })
});
//type: new GraphQLList(UserType) gave an error because it was placed(in companytype) before the user type definition...
//this is because we're trying to use a variable before it's been defined. Circular reference btw two types.
//solution: turn fields into a fnc.

//associations between types are treated as fields
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    //notice the field is company not companyID, GQL allows you to do this.
    //hint: you use resolve to teach GQL to get some data to populate the field.
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        //console.log(parentValue, args);
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(response => response.data);
      }
    }
  })
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
    },
    //we'll add another field to our root query type called company
    //this enables us to be able to query the db for companies only, not just users.
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then(response => response.data);
      }
    }
  }
});

//Root Mutation
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    //unlike root query the fields are named according to the type of operation the mutation will undertake.
    addUser: {}
  }
});

//GraphQL schema turns a root query into a schema instance
module.exports = new GraphQLSchema({
  query: RootQuery
});
