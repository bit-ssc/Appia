import React from 'react';

import RoomMembers from './List/RoomMembersWithData';

const TeamInfo: React.FC<{ rid: string }> = ({ rid }) => <RoomMembers rid={rid} />;

export default TeamInfo;
