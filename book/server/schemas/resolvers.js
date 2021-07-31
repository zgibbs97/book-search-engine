const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async ( parent, args, context) => {
            if ( context.user ) {
                const userData = User.findOne({ _id: context.user._id })
                .select('-_v -password');
                return userData;
            }
            throw new AuthenticationError('You are not logged in.');
        },
    },   

Mutation: {
    addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { user, token };
    },
    login: async (parent, { email, password}) => {
        const user = await User.findOne({ email });
        if(!user) {
            throw new AuthenticationError('There is no user with this email.');
        }
        const ifPassword = await user.isCorrectPassword(password);
        if(!ifPassword) {
            throw new AuthenticationError('Incorrect Password.');
    }
    const token = signToken(user);
    return { user, token };
},
    saveBook: async (parent, { bookData }, context) => {
        if (context.user) {
            const updateUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: bookData }},
                { new: true }
            );
        return updateUser;
            }
        throw new AuthenticationError('You are not logged in.');
    },
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updateUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return updateUser;
        }
        throw new AuthenticationError('You are not logged in.');
    },
},
};            



module.exports = resolvers;
