const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Product{
        _id: ID!
        name: String!
        price: Float!
        image: String!
    }


    type User {
        _id: ID!
        name: String!
        family: String!
        email: String!
        mobile: String!
        image: String!
        password: String
        rollId: String!
        products: [Product!]!
    }
    

    type RollsData {
        _id: String
        name: String
        users: [User!]
    }

    

    type userData {
        userId: String! 
        email: String!
        token: String!
    }

    input UserInputData {
        email: String!
        password: String!
    }

    type RootQuery {
        signIn(email: String!, password: String!): userData!
    }
    
    type RootMutation {
        getAllRolls: RollsData!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
