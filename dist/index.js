import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// A schema is  a collection of type definitions ( hence "typeDefs" )
// that together define the "shape" of queries that are excuted against your data.
const typeDefs = `#graphql
# Comments in GraphQL strings ( such as this one ) start with hash ( # ) symbol.

# This "Book" type defines the queryable fields for every book in our data source.
type Book {
    title: String!
    author: Author!
}

type Author{
    name: String!
}

# The "Query" type is special: it lists all of the available queries that Clients can execute,
# along with the return type for each. In this case, the "books" query returns an array of zero
# or more books ( defined above ).
type Query {
    books: [Book]
    authors: [Author]
}
`;
const books = [
    {
        title: "The Awkening",
        author: {
            name: "Kate Chopin"
        },
    },
    {
        title: "City of Glass",
        author: {
            name: "Paul Auster"
        },
    },
];
const authors = [
    {
        name: "Robert Kyosaki",
    },
    {
        name: "Paul Auster"
    }
];
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above. 
const resolvers = {
    Query: {
        books: () => books,
        authors: () => authors,
    },
};
// The ApolloServer constructor requires two parameters: your schema definition and your resolvers
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// Passing an ApolloServer instance to the `startStandaloneServer` function: 
// 1. creates an Express app 
// 2. installs your ApolloServer instance as middleware
// 3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
