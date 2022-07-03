import { useEffect, useContext, useState } from 'react';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Avatar, Button, Group, Stack, Text } from '@mantine/core';
import { Entity, Notification } from '../../lib/types';
import { acceptFriendRequestNotification, deleteNotification } from '../../lib/notifications';

import { fetchSingleEntity, getOrignalPostIdOfComment } from '../../lib/social';

interface SingleNotificationProps {
    notification: Notification
}

export function SingleNotification(props: SingleNotificationProps) {
    const { notification } = props;

    const [originalPostId, setOriginalPostId] = useState();
    const [fromUser, setFromUser] = useState<Entity>();
    const [friendRequestAccepted, setFriendRequestAccepted] = useState<boolean | null>(null);
    const [formattedDistance, setFormattedDistance] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (notification.fromEntityId) {
                // const res = await getPublicProfileForUser(notification.fromUserId)
                const res = await fetchSingleEntity(notification.fromEntityType, notification.fromEntityId);
                // console.log('Entity res', res);
                setFromUser(res);
            }
        };

        const check = async () => {
            if (
                notification.type === 'comment' ||
                notification.type === 'comment_reply'
            ) {
                try {
                    const postId = await getOrignalPostIdOfComment(
                        notification.actionId
                    );
                    setOriginalPostId(postId);
                } catch (e) {
                    console.warn('Error getting postId, ', notification, e);
                    setError(true);
                }
            }
        };
        fetchUserData();
        check();

        const distance = formatDistance(
            notification.createdAt.toDate(),
            new Date()
        );

        setFormattedDistance(distance);
    }, []);

    const respondToFriendRequest = async (id: string, accept: boolean) => {
        if (accept) {
            setFriendRequestAccepted(true);
            await acceptFriendRequestNotification(notification.id);
        } else {
            setFriendRequestAccepted(false);
            // Now remove from notification database
            await deleteNotification(notification.id);
        }
    };

    const formattedNotification = formatNotification(notification, originalPostId);

    return (
        <>
            {!error && fromUser &&
                <Group noWrap align="start">

                    {/* Link if author */}
                    <Link href={(notification.type === 'error_fix') || !fromUser ? '' : `/user/${fromUser.id}`}>
                        <Avatar
                            radius="xl"
                            src={
                                (notification.type === 'error_fix') || !fromUser
                                    ? 'https://firebasestorage.googleapis.com/v0/b/recipes-5f381.appspot.com/o/recipes%2FZ3snLnfWThwivgsy2z3qkcOFOyWjsH?alt=media&token=0a5b81e4-64c3-41cb-88ac-5b433716f2ee'
                                    : fromUser.image
                                        ? fromUser.image
                                        : 'https://firebasestorage.googleapis.com/v0/b/recipes-5f381.appspot.com/o/blog-images%2FitMnJQa3WsGNoil8wzDvBLRRXKk23F?alt=media&token=84a9f4bb-f9ea-49ed-be03-729f3f1eac94'
                            }

                        />
                    </Link>

                    <Stack>
                        {/* Friend Request  */}
                        {(notification.accepted || friendRequestAccepted) ?
                            <div>
                                You and {fromUser &&
                                    <Link href={`/user/${fromUser.id}`}><span className="font-semibold">{fromUser.name}</span></Link>
                                } are now friends
                                <br /><span className="text-xs text-gray-600">{formattedDistance} ago</span>
                            </div>
                            :
                            // Other notifications
                            <div>
                                {formattedNotification && (notification.type !== 'friend_request') ?
                                    <Link href={formattedNotification.link} passHref>
                                        <div>
                                            <Group>
                                                <Text inline><span style={{ fontWeight: '600' }}>{fromUser && fromUser.name}</span> {formattedNotification.string}
                                                </Text>
                                            </Group>
                                            <Text color="dimmed" size="xs">{formattedDistance} ago
                                            </Text>
                                        </div>
                                    </Link>
                                    :
                                    <>
                                        <Group>
                                            <Text inline><span style={{ fontWeight: '600' }}>{fromUser && fromUser.name}</span>  {formattedNotification.string}
                                            </Text>
                                        </Group>
                                        <Text color="dimmed" size="xs">{formattedDistance} ago
                                        </Text>
                                    </>
                                }
                                {(notification.type === 'friend_request' && friendRequestAccepted === null) &&
                                    <Group>
                                        <Button onClick={() => respondToFriendRequest(notification.actionId, true)} size="xs">Accept</Button>
                                        <Button onClick={() => respondToFriendRequest(notification.actionId, false)} size="xs">Decline</Button>
                                    </Group>
                                }
                                {friendRequestAccepted !== null &&
                                    <>
                                        {friendRequestAccepted ?
                                            <div>Friend request accepted</div> :
                                            <div>Friend request declined</div>
                                        }
                                    </>
                                }
                            </div>
                        }
                    </Stack>
                </Group>
            }
        </>

    );
}

function formatNotification(notification: Notification, originalPostId: string) {
    if (notification.type === 'comment') {
        return {
            string: 'commented on your activity',
            link: `/activity/${originalPostId}#${notification.actionId}`,
        };
    } if (notification.type === 'comment_reply') {
        return {
            string: 'replied to your comment',
            link: `/activity/${originalPostId}#${notification.actionId}`,
        };
    } if (notification.type === 'friend_request') {
        return {
            string: 'sent you a friend request',
            link: `/user/${notification.fromEntityId}`,
        };
    } if (notification.type === 'dinner_invite') {
        return {
            string: 'invited you for a meal',
            link: `/events/${notification.actionId}`,
        };
    } if (notification.type === 'response_dinner_invite_accepted') {
        return {
            string: 'accepted your meal invite',
            link: `/events/${notification.actionId}`,
        };
    } if (notification.type === 'response_dinner_invite_declined') {
        return {
            string: 'declined your meal invite',
            link: `/events/${notification.actionId}`,
        };
    } if (notification.type === 'updated_dinner_invite') {
        return {
            string: 'updated your meal invite',
            link: `/events/${notification.actionId}`,
        };
    } if (notification.type === 'event_post_comment') {
        return {
            string: 'commented on your event post ',
            link: `/events/${notification.eventId}#${notification.actionId}`,
        };
    } if (notification.type === 'event_post_comment_reply') {
        return {
            string: 'replied to your event post comment',
            link: `/events/${notification.eventId}#${notification.actionId}`,
        };
    } if (notification.type === 'event_post') {
        return {
            string: "posted in an event you're attending",
            link: `/events/${notification.actionId}`,
        };
    } if (notification.type === 'cancelled_dinner_invite') {
        return {
            string: 'cancelled an event',
            link: `/events/${notification.actionId}`,
        };
    } if (notification.type === 'collaborative_planner_invite') {
        return {
            string: 'invited you to a shared meal planner',
            link: '/collaborative-plans',
        };
    } if (notification.type === 'collaborative_planner_joined') {
        return {
            string: 'joined your shared planner',
            link: '/collaborative-plans',
        };
    } if (notification.type === 'shared_planner') {
        return {
            string: 'shared a planner with you',
            link: `/planners/${notification.actionId}`,
        };
    } if (notification.type === 'shared_list') {
        return {
            string: 'shared a list with you',
            link: `/lists/${notification.actionId}`,
        };
    } if (notification.type === 'shared_collection') {
        return {
            string: 'shared a collection with you',
            link: `/collection/${notification.actionId}`,
        };
    } if (notification.type === 'shared_user') {
        return {
            string: 'shared a profile with you',
            link: `/user/${notification.actionId}`,
        };
    } if (notification.type === 'shared_recipe') {
        return {
            string: 'shared a recipe with you',
            link: `/recipe/${notification.actionId}`,
        };
    } if (notification.type === 'error_fix') {
        return {
            string: 'A recipe you reported has now been fixed, thanks!',
            link: `/recipe/${notification.actionId}`,
        };
    }
    console.log('Error type', notification);
    return { string: 'error notification', link: '#' };
}

export default SingleNotification;
