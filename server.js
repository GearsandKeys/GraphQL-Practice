const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const{ //dependencies for the schema
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull //never can return a null value for types with this
} = require('graphql')

const app = express();

const authors = [ //this is in place of a database for now
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [ //this is in place of a database for now.
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType ({
    name: 'Book',
    description: 'This represents a book written',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        //no resolve needed since default returns value of an object
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType, //need a custom resolve
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType ({
    name: 'Author',
    description: 'This represents an author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        //no resolve needed since default returns value of an object
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

//"Dummy Schema"
// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType ({
//         name: 'HelloWorld', // No spaces allowed in this
//         fields: () => ({ //fields in the query
//             message: {
//                 type: GraphQLString, //We have to declare type of our message
//                 resolve: () => 'Hello World!' //resolve is what we are sending back, arguments include parent, and passed arguments
//             }
//         })
//     })
// })

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: "Root Query",
    fields: () => ({ //wrapping it in the parenthesis means I don't have to use a return statement, the object in parenthesis will be returned
        book: {
            type: BookType,
            description: 'A Single Book',
            args: {
                id: { type : GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of ALL books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: "A Single Author",
            args: {
                id: { type : GraphQLInt }
            },
            resolve: (parent, args) => (authors.find(author => author.id === args.id))
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of ALL authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType ({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId} //DB would automatically generate the ID
                books.push(book) //add book to our array
                return book
            }
            
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name} //DB would automatically generate the ID
                authors.push(author) //add author to our array
                return author
            }
        }
    })
})

const schema = new GraphQLSchema ({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema, //call our schema here
    graphiql: true
}))



app.listen(5000., () => console.log('Server Running.'));

