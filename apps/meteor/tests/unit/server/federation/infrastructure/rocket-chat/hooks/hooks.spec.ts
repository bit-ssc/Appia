/* eslint-disable */
import proxyquire from 'proxyquire';
import { expect } from 'chai';
import sinon from 'sinon';
import faker from '@faker-js/faker';

const remove = sinon.stub();
const get = sinon.stub();
const hooks: Record<string, any> = {};

import type * as hooksModule from '../../../../../../../server/services/federation/infrastructure/rocket-chat/hooks';

const { FederationHooks } = proxyquire
	.noCallThru()
	.load<typeof hooksModule>('../../../../../../../server/services/federation/infrastructure/rocket-chat/hooks', {
		'meteor/meteor': {
			'@global': true,
		},
		'@rocket.chat/random': {
			'@global': true,
		},
		'../../../../../../lib/callbacks': {
			callbacks: {
				priority: { HIGH: 'high' },
				remove,
				add: (_name: string, callback: (...args: any[]) => void, _priority: string, _id: string) => {
					hooks[_id] = callback;
				},
			},
		},
		'../../../../../../app/settings/server': {
			settings: { get },
		},
	});

describe('Federation - Infrastructure - RocketChat - Hooks', () => {
	afterEach(() => {
		remove.reset();
		get.reset();
	});

	describe('#afterUserLeaveRoom()', () => {
		it('should NOT execute the callback if no room was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterUserLeaveRoom(stub);
			hooks['federation-v2-after-leave-room']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided room is not federated', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterUserLeaveRoom(stub);
			hooks['federation-v2-after-leave-room']({}, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no user was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterUserLeaveRoom(stub);
			hooks['federation-v2-after-leave-room'](undefined, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterUserLeaveRoom(stub);
			hooks['federation-v2-after-leave-room']({}, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterUserLeaveRoom(stub);
			hooks['federation-v2-after-leave-room']({}, { federated: true });
			expect(stub.calledWith({}, { federated: true })).to.be.true;
		});
	});

	describe('#onUserRemovedFromRoom()', () => {
		it('should NOT execute the callback if no room was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.onUserRemovedFromRoom(stub);
			hooks['federation-v2-after-remove-from-room']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided room is not federated', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.onUserRemovedFromRoom(stub);
			hooks['federation-v2-after-remove-from-room']({}, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no params were provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.onUserRemovedFromRoom(stub);
			hooks['federation-v2-after-remove-from-room']({}, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no removedUser was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.onUserRemovedFromRoom(stub);
			hooks['federation-v2-after-remove-from-room']({}, { federated: true }, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no userWhoRemoved was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.onUserRemovedFromRoom(stub);
			hooks['federation-v2-after-remove-from-room']({ removedUser: 'removedUser' }, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.onUserRemovedFromRoom(stub);
			hooks['federation-v2-after-remove-from-room']({ removedUser: 'removedUser', userWhoRemoved: 'userWhoRemoved' }, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.onUserRemovedFromRoom(stub);
			hooks['federation-v2-after-remove-from-room']({ removedUser: 'removedUser', userWhoRemoved: 'userWhoRemoved' }, { federated: true });
			expect(stub.calledWith('removedUser', { federated: true }, 'userWhoRemoved')).to.be.true;
		});
	});

	describe('#canAddFederatedUserToNonFederatedRoom()', () => {
		it('should NOT execute the callback if no room was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToNonFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-non-federated-room']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no params were provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToNonFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-non-federated-room']({}, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no user was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToNonFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-non-federated-room']({}, { federated: true }, {});
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToNonFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-non-federated-room']({ user: 'user' }, { federated: true });
			expect(stub.calledWith('user', { federated: true })).to.be.true;
		});
	});

	describe('#canAddFederatedUserToFederatedRoom()', () => {
		it('should NOT execute the callback if no room was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-federated-room']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no params were provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-federated-room']({}, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no user was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-federated-room']({}, { federated: true }, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no inviter was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-federated-room']({ user: 'user' }, { federated: true }, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-federated-room']({ user: 'user', inviter: 'inviter' }, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canAddFederatedUserToFederatedRoom(stub);
			hooks['federation-v2-can-add-federated-user-to-federated-room']({ user: 'user', inviter: 'inviter' }, { federated: true });
			expect(stub.calledWith('user', 'inviter', { federated: true })).to.be.true;
		});
	});

	describe('#canCreateDirectMessageFromUI()', () => {
		it('should NOT execute the callback if no members was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canCreateDirectMessageFromUI(stub);
			hooks['federation-v2-can-create-direct-message-from-ui-ce']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.canCreateDirectMessageFromUI(stub);
			hooks['federation-v2-can-create-direct-message-from-ui-ce']([]);
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.canCreateDirectMessageFromUI(stub);
			hooks['federation-v2-can-create-direct-message-from-ui-ce']([]);
			expect(stub.calledWith([])).to.be.true;
		});
	});

	describe('#afterMessageReacted()', () => {
		it('should NOT execute the callback if no message was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageReacted(stub);
			hooks['federation-v2-after-message-reacted']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided message is not from a federated room', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageReacted(stub);
			hooks['federation-v2-after-message-reacted']({});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no params were provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageReacted(stub);
			hooks['federation-v2-after-message-reacted']({ federation: { eventId: 'eventId' } }, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no user was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageReacted(stub);
			hooks['federation-v2-after-message-reacted']({ federation: { eventId: 'eventId' } }, { federated: true }, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no reaction was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageReacted(stub);
			hooks['federation-v2-after-message-reacted']({ federation: { eventId: 'eventId' } }, { user: 'user' });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterMessageReacted(stub);
			hooks['federation-v2-after-message-reacted']({ federation: { eventId: 'eventId' } }, { user: 'user', reaction: 'reaction' });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageReacted(stub);
			hooks['federation-v2-after-message-reacted']({ federation: { eventId: 'eventId' } }, { user: 'user', reaction: 'reaction' });
			expect(stub.calledWith({ federation: { eventId: 'eventId' } }, 'user', 'reaction')).to.be.true;
		});
	});

	describe('#afterMessageunReacted()', () => {
		it('should NOT execute the callback if no message was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided message is not from a federated room', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted']({});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no params were provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted']({ federation: { eventId: 'eventId' } }, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no user was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted']({ federation: { eventId: 'eventId' } }, { federated: true }, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no reaction was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted']({ federation: { eventId: 'eventId' } }, { user: 'user' });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no oldMessage was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted']({ federation: { eventId: 'eventId' } }, { user: 'user', reaction: 'reaction' });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted'](
				{ federation: { eventId: 'eventId' } },
				{ user: 'user', reaction: 'reaction', oldMessage: {} },
			);
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageunReacted(stub);
			hooks['federation-v2-after-message-unreacted'](
				{ federation: { eventId: 'eventId' } },
				{ user: 'user', reaction: 'reaction', oldMessage: {} },
			);
			expect(stub.calledWith({}, 'user', 'reaction')).to.be.true;
		});
	});

	describe('#afterMessageDeleted()', () => {
		it('should NOT execute the callback if no room was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageDeleted(stub);
			hooks['federation-v2-after-room-message-deleted']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided room is not federated', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageDeleted(stub);
			hooks['federation-v2-after-room-message-deleted']({}, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided message is not from a federated room', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageDeleted(stub);
			hooks['federation-v2-after-room-message-deleted']({}, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterMessageDeleted(stub);
			hooks['federation-v2-after-room-message-deleted']({ federation: { eventId: 'eventId' } }, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageDeleted(stub);
			hooks['federation-v2-after-room-message-deleted']({ federation: { eventId: 'eventId' } }, { federated: true, _id: 'roomId' });
			expect(stub.calledWith({ federation: { eventId: 'eventId' } }, 'roomId')).to.be.true;
		});
	});

	describe('#afterMessageUpdated()', () => {
		it('should NOT execute the callback if no room was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageUpdated(stub);
			hooks['federation-v2-after-room-message-updated']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided room is not federated', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageUpdated(stub);
			hooks['federation-v2-after-room-message-updated']({}, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided message is not from a federated room', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageUpdated(stub);
			hooks['federation-v2-after-room-message-updated']({}, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterMessageUpdated(stub);
			hooks['federation-v2-after-room-message-updated']({ federation: { eventId: 'eventId' } }, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the message is not a edited one', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageUpdated(stub);
			hooks['federation-v2-after-room-message-updated']({ federation: { eventId: 'eventId' } }, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			const editedAt = faker.date.recent();
			const editedBy = { _id: 'userId' };
			const message = { federation: { eventId: 'eventId' }, editedAt, editedBy };
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageUpdated(stub);
			hooks['federation-v2-after-room-message-updated'](message, { federated: true, _id: 'roomId' });
			expect(stub.calledWith(message, 'roomId', 'userId')).to.be.true;
		});
	});

	describe('#afterMessageSent()', () => {
		it('should NOT execute the callback if no room was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageSent(stub);
			hooks['federation-v2-after-room-message-sent']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the provided room is not federated', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageSent(stub);
			hooks['federation-v2-after-room-message-sent']({}, {});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterMessageSent(stub);
			hooks['federation-v2-after-room-message-sent']({}, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if the message is edited one', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageSent(stub);
			const editedAt = faker.date.recent();
			const editedBy = { _id: 'userId' };
			hooks['federation-v2-after-room-message-sent']({ editedAt, editedBy }, { federated: true });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterMessageSent(stub);
			hooks['federation-v2-after-room-message-sent']({ u: { _id: 'userId' } }, { federated: true, _id: 'roomId' });
			expect(stub.calledWith({ u: { _id: 'userId' } }, 'roomId', 'userId')).to.be.true;
		});
	});

	describe('#afterRoomRoleChanged', () => {
		const handlers: any = {
			onRoomOwnerAdded: sinon.stub(),
			onRoomOwnerRemoved: sinon.stub(),
			onRoomModeratorAdded: sinon.stub(),
			onRoomModeratorRemoved: sinon.stub(),
		};

		afterEach(() => {
			handlers.onRoomOwnerAdded.reset();
			handlers.onRoomOwnerRemoved.reset();
			handlers.onRoomModeratorAdded.reset();
			handlers.onRoomModeratorRemoved.reset();
		});

		it('should NOT call the handler if the event is empty', () => {
			FederationHooks.afterRoomRoleChanged(handlers, undefined);

			expect(handlers.onRoomOwnerAdded.called).to.be.false;
			expect(handlers.onRoomOwnerRemoved.called).to.be.false;
			expect(handlers.onRoomModeratorAdded.called).to.be.false;
			expect(handlers.onRoomModeratorRemoved.called).to.be.false;
		});

		it('should NOT call the Federation module is disabled', () => {
			get.returns(false);
			FederationHooks.afterRoomRoleChanged(handlers, undefined);

			expect(handlers.onRoomOwnerAdded.called).to.be.false;
			expect(handlers.onRoomOwnerRemoved.called).to.be.false;
			expect(handlers.onRoomModeratorAdded.called).to.be.false;
			expect(handlers.onRoomModeratorRemoved.called).to.be.false;
		});
		it('should NOT call the handler if the event is not for roles we are interested in on Federation', () => {
			get.returns(true);
			FederationHooks.afterRoomRoleChanged(handlers, { _id: 'not-interested' });

			expect(handlers.onRoomOwnerAdded.called).to.be.false;
			expect(handlers.onRoomOwnerRemoved.called).to.be.false;
			expect(handlers.onRoomModeratorAdded.called).to.be.false;
			expect(handlers.onRoomModeratorRemoved.called).to.be.false;
		});

		it('should NOT call the handler there is no handler for the event', () => {
			get.returns(true);
			FederationHooks.afterRoomRoleChanged(handlers, { _id: 'owner', type: 'not-existing-type' });

			expect(handlers.onRoomOwnerAdded.called).to.be.false;
			expect(handlers.onRoomOwnerRemoved.called).to.be.false;
			expect(handlers.onRoomModeratorAdded.called).to.be.false;
			expect(handlers.onRoomModeratorRemoved.called).to.be.false;
		});

		['owner-added', 'owner-removed', 'moderator-added', 'moderator-removed'].forEach((type) => {
			const internalRoomId = 'internalRoomId';
			const internalTargetUserId = 'internalTargetUserId';
			const internalUserId = 'internalUserId';
			it(`should call the handler for the event ${type}`, () => {
				get.returns(true);
				FederationHooks.afterRoomRoleChanged(handlers, {
					_id: type.split('-')[0],
					type: type.split('-')[1],
					scope: internalRoomId,
					u: { _id: internalTargetUserId },
					givenByUserId: internalUserId,
				});

				expect(
					handlers[`onRoom${type.charAt(0).toUpperCase() + type.slice(1).replace(/-./g, (x) => x[1].toUpperCase())}`].calledWith(
						internalUserId,
						internalTargetUserId,
						internalRoomId,
					),
				).to.be.true;
			});
		});
	});

	describe('#afterRoomNameChanged()', () => {
		it('should NOT execute the callback if no params was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomNameChanged(stub);
			hooks['federation-v2-after-room-name-changed']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no roomId was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomNameChanged(stub);
			hooks['federation-v2-after-room-name-changed']({});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no roomName was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomNameChanged(stub);
			hooks['federation-v2-after-room-name-changed']({ rid: 'roomId' });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterRoomNameChanged(stub);
			hooks['federation-v2-after-room-name-changed']({ rid: 'roomId', name: 'roomName' });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomNameChanged(stub);
			hooks['federation-v2-after-room-name-changed']({ rid: 'roomId', name: 'roomName' });
			expect(stub.calledWith('roomId', 'roomName')).to.be.true;
		});
	});

	describe('#afterRoomTopicChanged()', () => {
		it('should NOT execute the callback if no params was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomTopicChanged(stub);
			hooks['federation-v2-after-room-topic-changed']();
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no roomId was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomTopicChanged(stub);
			hooks['federation-v2-after-room-topic-changed']({});
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if no topic was provided', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomTopicChanged(stub);
			hooks['federation-v2-after-room-topic-changed']({ rid: 'roomId' });
			expect(stub.called).to.be.false;
		});

		it('should NOT execute the callback if federation module was disabled', () => {
			get.returns(false);
			const stub = sinon.stub();
			FederationHooks.afterRoomTopicChanged(stub);
			hooks['federation-v2-after-room-topic-changed']({ rid: 'roomId', topic: 'topic' });
			expect(stub.called).to.be.false;
		});

		it('should execute the callback when everything is correct', () => {
			get.returns(true);
			const stub = sinon.stub();
			FederationHooks.afterRoomTopicChanged(stub);
			hooks['federation-v2-after-room-topic-changed']({ rid: 'roomId', topic: 'topic' });
			expect(stub.calledWith('roomId', 'topic')).to.be.true;
		});
	});

	describe('#removeCEValidation()', () => {
		it('should remove the specific validation for CE environments', () => {
			FederationHooks.removeCEValidation();
			expect(remove.calledTwice).to.be.equal(true);
			expect(
				remove.firstCall.calledWith('federation.beforeAddUserToARoom', 'federation-v2-can-add-federated-user-to-federated-room'),
			).to.be.equal(true);
			expect(
				remove.secondCall.calledWith('federation.beforeCreateDirectMessage', 'federation-v2-can-create-direct-message-from-ui-ce'),
			).to.be.equal(true);
		});
	});

	describe('#removeAllListeners()', () => {
		it('should remove all the listeners', () => {
			FederationHooks.removeAllListeners();
			expect(remove.callCount).to.be.equal(11);
			expect(remove.getCall(0).calledWith('afterLeaveRoom', 'federation-v2-after-leave-room')).to.be.equal(true);
			expect(remove.getCall(1).calledWith('afterRemoveFromRoom', 'federation-v2-after-remove-from-room')).to.be.equal(true);
			expect(
				remove.getCall(2).calledWith('federation.beforeAddUserToARoom', 'federation-v2-can-add-federated-user-to-non-federated-room'),
			).to.be.equal(true);
			expect(
				remove.getCall(3).calledWith('federation.beforeAddUserToARoom', 'federation-v2-can-add-federated-user-to-federated-room'),
			).to.be.equal(true);
			expect(
				remove.getCall(4).calledWith('federation.beforeCreateDirectMessage', 'federation-v2-can-create-direct-message-from-ui-ce'),
			).to.be.equal(true);
			expect(remove.getCall(5).calledWith('afterSetReaction', 'federation-v2-after-message-reacted')).to.be.equal(true);
			expect(remove.getCall(6).calledWith('afterUnsetReaction', 'federation-v2-after-message-unreacted')).to.be.equal(true);
			expect(remove.getCall(7).calledWith('afterDeleteMessage', 'federation-v2-after-room-message-deleted')).to.be.equal(true);
			expect(remove.getCall(8).calledWith('afterSaveMessage', 'federation-v2-after-room-message-updated')).to.be.equal(true);
			expect(remove.getCall(9).calledWith('afterSaveMessage', 'federation-v2-after-room-message-sent')).to.be.equal(true);
			expect(remove.getCall(10).calledWith('afterSaveMessage', 'federation-v2-after-room-message-sent')).to.be.equal(true);
		});
	});
});
