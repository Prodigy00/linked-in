const express = require("express");

const expressGraphQL = require("express-graphql");

const schema = require("./schema/schema.js");

const app = express();

app.use(
  "/graphql",
  expressGraphQL({
    schema, //aka schema:schema
    graphiql: true
  })
);

app.listen(4000, () => {
  console.log("Listening...");
});
