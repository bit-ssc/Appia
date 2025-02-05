import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { MessageAction } from '../../../ui-utils/client';
import { messageArgs } from '../../../../client/lib/utils/messageArgs';
import { imperativeModal } from '../../../../client/lib/imperativeModal';
import MessageTodoTips from '../../../../client/components/MessageTodo/MessageTodoTips';

Meteor.startup(function () {
	Tracker.autorun(() => {
		MessageAction.addButton({
			id: 'set_todo',
			icon: 'set_todo',
			label: 'Set_todo',
			context: ['message', 'message-mobile', 'threads', 'federated'],
			async action(this: unknown, _, { message = messageArgs(this).msg, chat }) {
				chat?.flows.setMessageTodos({ messageId: message._id, status: 1, type: 'd' });
			},
			condition({ message, subscription }) {
				return !!subscription;
			},
			order: -3,
			group: 'menu',
		});
		/* MessageAction.addButton({
            id: 'set_hight_todo',
            icon: 'set_hight_todo',
            label: 'Set_hight_todo',
            context: ['message', 'message-mobile', 'threads', 'federated'],
            async action(this: unknown, _, { message = messageArgs(this).msg, chat }) {
                imperativeModal.open({
                    component: MessageTodoTips,
                    props: {
                        onClose: imperativeModal.close,
                        onOk:(tips?:string) => chat?.flows.setMessageTodos({ messageId: message._id, status: 1,tips,type:'h' })
                    },
                });
            },
            condition({ message, subscription }) {
                return !message.msgType && !!subscription;
            },
            order: 9,
            group: 'menu',
        }); */
		MessageAction.addButton({
			id: 'completed_todo',
			icon: 'completed_todo',
			label: 'Completed_todo',
			context: ['message', 'message-mobile', 'threads', 'federated'],
			async action(this: unknown, _, { message = messageArgs(this).msg, chat }) {
				await chat?.flows.finishMessageTodo({ id: message.appiaTodo?.tid, status: -1 });
			},
			condition({ message, subscription }) {
				return !!subscription;
			},
			order: -4,
			group: 'menu',
		});
	});
});
