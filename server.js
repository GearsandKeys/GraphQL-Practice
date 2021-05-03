const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const{ //dependencies for the schema
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} = require('graphql')

const app = express();

//"Dummy Schema"
const schema = new GraphQLSchema({
    query: new GraphQLObjectType ({
        name: 'HelloWorld', // No spaces allowed in this
        fields: () => ({ //fields in the query
            message: {
                type: GraphQLString, //We have to declare type of our message
                resolve: () => 'Hello World!' //resolve is what we are sending back
            }
        })
    })
})

app.use('/graphql', expressGraphQL({
    schema: schema, //call our schema here
    graphiql: true
}))



app.listen(5000., () => console.log('Server Running.'));

