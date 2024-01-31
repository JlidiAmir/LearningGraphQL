import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors"; 
import express from "express";
import { Context } from "vm";
import { createServer } from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

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

# The "Query" type is special: it lists all of the available queries that Clients can execute to read data,
# along with the return type for each. In this case, the "books" query returns an array of zero
# or more books ( defined above ).
type Query {
    books: [Book]
    authors: [Author]
}

# The "Mutation" Object type is special: it lists all of the availabe queries that Clients can execute to write data 
type Mutation {
    addBook(title: String, author: String): [Book]
}
`;

const books =[
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
const authors =[
    {
        name: "Robert Kyosaki",
        
    },
    {
        name: "Paul Auster"
    }
]

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above. 

const resolvers = {
    Query: {
        books: () => books,
        authors: ()=> authors,
    },
    Mutation: {
        addBook: (_,args)=>{
            console.log(args);
            books.push({title:args.title,author:{name:args.author}});
            return books;
        }
    }
};

// The ApolloServer constructor requires two parameters: your schema definition and your resolvers

const server = new ApolloServer<Context>(
    {
        typeDefs, 
        resolvers,
    }
);

const app = express(); 

// Note you must call 'start()' on the 'ApolloServer'
// instance before passing the instance to `expressMiddleware`

await server.start(); 

// Specify the path where we'd like to mount our server

app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server));

app.listen(4000,()=>{
    console.log("🚀 Server ready at http://localhost:4000/");
})






