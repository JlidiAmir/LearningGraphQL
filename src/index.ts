import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { Context } from "vm";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors"; 
import { createServer } from "http";
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

# The "Subscription" type is special
type Subscription{
    hello: String!
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

export const resolvers = {
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
    },
    Subscription: {
        hello: {
            // Example using an async generator
            subscribe: async function* () 
            {
             for await (const word of ["Hello", "Bonjour", "Ciao"])
             {
                console.log(word);
                yield { hello: word };
             }   
            },
        },
        // postCreated: {
        //     // pub sub
        //     subscribe: () => pubsub.asyncIterator(["POST_CREATED"]),
        // }

    }
};

// Creating an executable Schema object using the typeDefs and resolvers 
const schema = makeExecutableSchema({ typeDefs, resolvers });
    
const app = express(); 

// Creating an http Server to wrap woth express and subscription server (WebSocket) and become our listener.
const httpServer = createServer(app);

// Creating the WebSocket server 
const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/subscription"
})

// Passing the executable schema that we created to the WebSocket. 
const serverCleanup = useServer({ schema }, wsServer);

// The ApolloServer 

const server = new ApolloServer<Context>(
    {
        schema,
        plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({httpServer}),
        // Proper shutdown for the WebSocket server.
        {
            async serverWillStart(){
                return {
                    async drainServer(){
                        await serverCleanup.dispose();
                    }
                }
            }
        }

        ]
    }
);

// Note you must call 'start()' on the 'ApolloServer'
// instance before passing the instance to `expressMiddleware`

await server.start(); 

// Specify the path where we'd like to mount our server

app.use('/subscription', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server));

// app.listen(4000,()=>{
//     console.log("🚀 Server ready at http://localhost:4000/");
// })

httpServer.listen(4000)
console.log("🚀 Server ready at http://localhost:4000/");






