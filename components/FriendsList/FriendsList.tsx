import { Avatar, Button, Center, Group, Loader, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../lib/context';
import { fetchEntities } from '../../lib/social';
import { UserProfile } from '../../lib/types';
import { Invites } from '../CollaborativePlannerCard/CollaborativePlannerCard';

interface FriendsListProps {
    buttonAction?: Function;
    buttonText?: string;
    confirmButtonText?: string;
    acceptedText?: string;
    searchable?: boolean;
    friendInvites?: Invites[]
}

export default function FriendsList(props: FriendsListProps) {
    const { buttonAction, buttonText, searchable, confirmButtonText, acceptedText, friendInvites } = props;
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [friendsFiltered, setFriendsFiltered] = useState<UserProfile[]>([]);
    const [actionButtonList, setActionButtonList] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const getFriends = async () => {
            const res = await fetchEntities('friends', user.uid, null, null);
            console.log('Friends', res);
            setFriends(res.results);
            setFriendsFiltered(res.results);
            setLoading(false)
        };

        getFriends();

        console.log('Friends invites coming through', friendInvites)
        setActionButtonList(friendInvites.invited)

    }, []);

    useEffect(() => {
        setFriendsFiltered(friends.filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) =>
            a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        ));
    }, [searchTerm]);

    return (
        <Stack>
            {loading ? <Center py={20}><Loader /></Center> :
                <>
                    {friends.length === 0 ?

                        <Text>You should invite some friends</Text> :
                        <>
                            {searchable ? <TextInput placeholder="Search friends" onChange={(e: any) => setSearchTerm(e.target.value)} /> : null}
                            <ScrollArea style={{ height: 350 }}>
                                <Stack pr={12}>
                                    {friendsFiltered.map((friend, index) => (
                                        <Group key={index} position="apart">
                                            <Group>
                                                <Avatar src={friend.image} alt={friend.name} radius="xl" />
                                                <Text transform="capitalize">{friend.name}</Text>
                                            </Group>
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                radius="xl"
                                                onClick={() => {
                                                    buttonAction && buttonAction(friend.id);
                                                    setActionButtonList(prevState => [...prevState, friend.id]);
                                                }}
                                                disabled={actionButtonList.includes(friend.id) || (friendInvites && friendInvites.accepted.includes(friend.id))}
                                            >
                                                {(friendInvites && friendInvites.accepted.includes(friend.id)) ? acceptedText : actionButtonList.includes(friend.id) ? confirmButtonText : buttonText}
                                            </Button>
                                        </Group>)
                                    )}
                                </Stack>
                            </ScrollArea>
                        </>
                    }
                </>
            }

        </Stack>
    );
}
