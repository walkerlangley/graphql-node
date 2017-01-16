'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
} = require('graphql');

const {
  getVideoById,
  getVideos,
  createVideo,
  getBookById,
  getBooks,
} = require('./src/data');

const {
  globalIdField,
  connectionDefinitions,
  connectionFromPromisedArray,
  connectionArgs,
  mutationWithClientMutationId,
} = require('graphql-relay');

const { nodeInterface, nodeField } = require('./src/node');

const PORT = process.env.PORT || 4000
const server = express();


const videoType = new GraphQLObjectType({
  name: 'Video',
  description: 'A video on Egghead.io',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString,
      description: 'The title of the video.',
    },
    duration: {
      type: GraphQLInt,
      description: 'The duration of the video in seconds.',
    },
    released: {
      type: GraphQLBoolean,
      description: 'Whether or not the video has been watched.',
    },
  },
  interfaces: [nodeInterface],
});

exports.videoType = videoType;

const bookType = new GraphQLObjectType({
  name: 'Book',
  description: 'Book I want to or have read',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString,
      description: 'The title of the book',
    },
    author: {
      type: GraphQLString,
      description: 'The author of the book',
    },
    genre: {
      type: GraphQLString,
      description: 'Genre of the book',
    },
    haveRead: {
      type: GraphQLBoolean,
      description: 'Have I read the book',
    },
  },
  interfaces: [nodeInterface],
});

const { connectionType: VideoConnection } = connectionDefinitions({
  nodeType: videoType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      description: 'a count of the total number of objects in this connection.',
      resolve: (conn) => {
        return conn.edges.length;
      },
    },
  }),
});

const { connectionType: BookConnection } = connectionDefinitions({
  nodeType: bookType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      description: 'A count of the total number of objects in this connection.',
      resolve: (conn) => {
        return conn.edges.length;
      },
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'The root query type.',
  fields: {
    node: nodeField,
    videos: {
      type: VideoConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
        getVideos(),
        args
      ),
    },
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the video.',
        },
      },
      resolve: (_, args) => {
        return getVideoById(args.id);
      },
    },
    books: {
      type: BookConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
        getBooks(),
        args
      ),
    },
  }
});

const videoMutation = mutationWithClientMutationId({
  name: 'AddVideo',
  inputFields: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the video.',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of the video (in seconds).',
    },
    released: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether or not the video has been released',
    },
  },
  outputFields: {
    video: {
      type: videoType,
    },
  },
  mutateAndGetPayload: (args) => new Promise((resolve, reject) => {
    Promise.resolve(createVideo(args))
      .then((video) => resolve({ video }))
      .catch(reject);
  }),
});

const bookMutation = mutationWithClientMutationId({
  name: 'AddBook',
  inputFields: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the book',
    },
    author: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The author of the book',
    },
    genre: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Genre of the book',
    },
    haveRead: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Have I read the book',
    },
  },
  outputFields: {
    book: {
      type: bookType,
    },
  },
  mutateAndGetPayload: (args) => new Promise((resolve, reject) => {
    Promise.resolve(createBook(args))
      .then((book) => resolve({ book }))
      .catch(reject);
  }),
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'The root Mutation type.',
  fields: {
    createVideo: videoMutation,
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});


// The root provides a resolver function for each API endpoint
server.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

server.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});



