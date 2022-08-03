const { buildSchema } = require('graphql');

module.exports = buildSchema(`

    type userData {
        userId: String! 
        email: String!
        token: String!
    }
    type Rolls {
        _id: String
        name: String! 
    }

    type Msg{
        message : String!
    }
    
    type RootQuery {
        signIn(email: String!, password: String!): userData!
        getAllRolls: [Rolls]
        getRollById (id : String!) : Rolls
    }

     type RootMutation {
        updateRoll(id: String! , name: String!): Msg!
        addRoll(name: String!): Msg!
        deleteRoll(id: String!): Msg!
        
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
