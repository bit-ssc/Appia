import { expect } from 'chai';

import MentionsServer from '../../../../app/mentions/server/Mentions';

let mention;

beforeEach(function () {
	mention = new MentionsServer({
		pattern: '[0-9a-zA-Z-_.]+',
		messageMaxAll: () => 4, // || RocketChat.settings.get('Message_MaxAll')
		getUsers: async (usernames) =>
			[
				{
					_id: 1,
					username: 'rocket.cat',
				},
				{
					_id: 2,
					username: 'jon',
				},
			].filter((user) => usernames.includes(user.username)), // Meteor.users.find({ username: {$in: _.unique(usernames)}}, { fields: {_id: true, username: true }}).fetch();
		getChannels(channels) {
			return [
				{
					_id: 1,
					name: 'general',
				},
			].filter((channel) => channels.includes(channel.name));
			// return RocketChat.models.Rooms.find({ name: {$in: _.unique(channels)}, t: 'c'	}, { fields: {_id: 1, name: 1 }}).fetch();
		},
		getUser: (userId) => ({ _id: userId, language: 'en' }),
		getTotalChannelMembers: (/* rid*/) => 2,
	});
});

describe('Mention Server', () => {
	describe('getUsersByMentions', () => {
		describe('for @all but the number of users is greater than messageMaxAll', () => {
			beforeEach(() => {
				mention.getTotalChannelMembers = () => 5;
			});
			it('should return nothing', async () => {
				const message = {
					msg: '@all',
				};
				const expected = [];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});
		});
		describe('for one user', () => {
			beforeEach(() => {
				mention.getChannel = () => ({
					usernames: [
						{
							_id: 1,
							username: 'rocket.cat',
						},
						{
							_id: 2,
							username: 'jon',
						},
					],
				});
				// Meteor.users.find({ username: {$in: _.unique(usernames)}}, { fields: {_id: true, username: true }}).fetch();
			});
			it('should return "all"', async () => {
				const message = {
					msg: '@all',
				};
				const expected = [
					{
						_id: 'all',
						username: 'all',
					},
				];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});
			it('should return "here"', async () => {
				const message = {
					msg: '@here',
				};
				const expected = [
					{
						_id: 'here',
						username: 'here',
					},
				];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});
			it('should return "rocket.cat"', async () => {
				const message = {
					msg: '@rocket.cat',
				};
				const expected = [
					{
						_id: 1,
						username: 'rocket.cat',
					},
				];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});
		});
		describe('for two user', () => {
			it('should return "all and here"', async () => {
				const message = {
					msg: '@all @here',
				};
				const expected = [
					{
						_id: 'all',
						username: 'all',
					},
					{
						_id: 'here',
						username: 'here',
					},
				];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});
			it('should return "here and rocket.cat"', async () => {
				const message = {
					msg: '@here @rocket.cat',
				};
				const expected = [
					{
						_id: 'here',
						username: 'here',
					},
					{
						_id: 1,
						username: 'rocket.cat',
					},
				];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});

			it('should return "here, rocket.cat, jon"', async () => {
				const message = {
					msg: '@here @rocket.cat @jon',
				};
				const expected = [
					{
						_id: 'here',
						username: 'here',
					},
					{
						_id: 1,
						username: 'rocket.cat',
					},
					{
						_id: 2,
						username: 'jon',
					},
				];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});
		});

		describe('for an unknow user', () => {
			it('should return "nothing"', async () => {
				const message = {
					msg: '@unknow',
				};
				const expected = [];
				const result = await mention.getUsersByMentions(message);
				expect(expected).to.be.deep.equal(result);
			});
		});
	});
	describe('getChannelbyMentions', () => {
		it('should return the channel "general"', async () => {
			const message = {
				msg: '#general',
			};
			const expected = [
				{
					_id: 1,
					name: 'general',
				},
			];
			const result = await mention.getChannelbyMentions(message);
			expect(result).to.be.deep.equal(expected);
		});
		it('should return nothing"', async () => {
			const message = {
				msg: '#unknow',
			};
			const expected = [];
			const result = await mention.getChannelbyMentions(message);
			expect(result).to.be.deep.equal(expected);
		});
	});
	describe('execute', () => {
		it('should return the channel "general"', async () => {
			const message = {
				msg: '#general',
			};
			const expected = [
				{
					_id: 1,
					name: 'general',
				},
			];
			const result = await mention.getChannelbyMentions(message);
			expect(result).to.be.deep.equal(expected);
		});
		it('should return nothing"', async () => {
			const message = {
				msg: '#unknow',
			};
			const expected = {
				msg: '#unknow',
				mentions: [],
				channels: [],
			};
			const result = await mention.execute(message);
			expect(result).to.be.deep.equal(expected);
		});
	});

	describe('getters and setters', () => {
		describe('messageMaxAll', () => {
			const mention = new MentionsServer({});
			describe('constant', () => {
				it('should return the informed value', () => {
					mention.messageMaxAll = 4;
					expect(mention.messageMaxAll).to.be.deep.equal(4);
				});
			});
			describe('function', () => {
				it('should return the informed value', () => {
					mention.messageMaxAll = () => 4;
					expect(mention.messageMaxAll).to.be.deep.equal(4);
				});
			});
		});
		describe('getUsers', () => {
			const mention = new MentionsServer({});
			describe('constant', () => {
				it('should return the informed value', async () => {
					mention.getUsers = 4;
					expect(await mention.getUsers()).to.be.deep.equal(4);
				});
			});
			describe('function', () => {
				it('should return the informed value', async () => {
					mention.getUsers = () => 4;
					expect(await mention.getUsers()).to.be.deep.equal(4);
				});
			});
		});
		describe('getChannels', () => {
			const mention = new MentionsServer({});
			describe('constant', () => {
				it('should return the informed value', () => {
					mention.getChannels = 4;
					expect(mention.getChannels()).to.be.deep.equal(4);
				});
			});
			describe('function', () => {
				it('should return the informed value', () => {
					mention.getChannels = () => 4;
					expect(mention.getChannels()).to.be.deep.equal(4);
				});
			});
		});
		describe('getChannel', () => {
			const mention = new MentionsServer({});
			describe('constant', () => {
				it('should return the informed value', () => {
					mention.getChannel = true;
					expect(mention.getChannel()).to.be.deep.equal(true);
				});
			});
			describe('function', () => {
				it('should return the informed value', () => {
					mention.getChannel = () => true;
					expect(mention.getChannel()).to.be.deep.equal(true);
				});
			});
		});
	});
});
