const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
	Query: {
		getSingleUser: async (parent, { user, id, username }) => {
			const foundUser = await User.findOne({
				$or: [{ _id: user ? user._id : id }, { username: username }],
			})
				.select('-__v -password')
				.populate('savedBooks');

			if (!foundUser) {
				throw new AuthenticationError('Incorrect credentials');
			}

			return foundUser;
		},
	},
	Mutation: {
		createUser: async (parent, args) => {
			const user = await User.create(args);
			const token = signToken(user);

			return { token, user };
		},
		login: async (parent, { username, email, password }) => {
			const user = await User.findOne({
				$or: [{ username: username }, { email: email }],
			});

			if (!user) {
				throw new AuthenticationError('Incorrect credentials');
			}

			const correctPw = await user.isCorrectPassword(password);

			if (!correctPw) {
				throw new AuthenticationError('Incorrect credentials');
			}

			const token = signToken(user);
			return { token, user };
		},
		saveBook: async (parent, args, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $addToSet: { savedBooks: args } },
					{ new: true, runValidators: true }
				);
				return updatedUser;
			}
			throw new AuthenticationError('You need to be logged in!');
		},
		deleteBook: async (parent, { bookId }, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $pull: { savedBooks: { bookId: bookId } } },
					{ new: true }
				);
				return updatedUser;
			}
			throw new AuthenticationError('You need to be logged in!');
		},
	},
};

module.exports = resolvers;
