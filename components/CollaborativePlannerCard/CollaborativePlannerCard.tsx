import Link from 'next/link';
import {
    Card,
    Image,
    Text,
    ActionIcon,
    Badge,
    Group,
    Avatar,
    useMantineTheme,
    createStyles,
    Tooltip,
    AvatarsGroup,
    Button,
    TextInput,
    Checkbox,
    Stack,
} from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { Crown, Edit, Friends, Share, Star, Trash } from 'tabler-icons-react';
import { useModals } from '@mantine/modals';
import { UserContext } from '../../lib/context';
import { CollaborativePlanner, Collection } from '../../lib/types';
import { checkIfPlannerIsFavourite, deleteCollaborativePlanner, getCollaborativePlannerInvites, inviteFriendToPlanner, leaveCollaborativePlanner, respondToCollaborativePlannerInvite, toggleFavouritePlanner, updateCollaborativePlanner } from '../../lib/planner/planner';
import EditCollaborativePlanner from '../EditCollaborativePlanner/EditCollaborativePlanner';
import FriendsList from '../FriendsList/FriendsList';

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        height: '100%',
    },

    rating: {
        position: 'absolute',
        top: theme.spacing.xs,
        right: theme.spacing.xs + 2,
        pointerEvents: 'none',
    },

    title: {
        display: 'block',
        // marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs / 2,
        textDecoration: 'none',
        color: theme.colors.dark[7],
        cursor: 'pointer',
    },

    action: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    },

    footer: {
        marginTop: theme.spacing.md,
    },
}));

interface CollaborativePlannerCardProps {
    planner: CollaborativePlanner;
    setActiveSharedPlanner?: Function;
    editable?: boolean;
    getCollabPlanners?: Function;
    expanded?: boolean
}

export interface Invites { invited: string[], accepted: string[] }

export function CollaborativePlannerCard(props: CollaborativePlannerCardProps) {
    const { planner, setActiveSharedPlanner, editable, getCollabPlanners, expanded } = props;
    const { classes, cx } = useStyles();
    const theme = useMantineTheme();
    const { user } = useContext(UserContext);
    const modals = useModals();

    const [isFavourite, setIsFavourite] = useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);
    const [friendInvites, setFriendInvites] = useState<Invites>([]);

    const fetchInviteStatus = async () => {
        if (planner.createdBy === user.uid) {
            try {
                const res = await getCollaborativePlannerInvites(planner.id);
                setFriendInvites(res);
                console.log('Invited', res);
            } catch (e: any) {
                console.warn('Error getting invite status', e, planner.title)
            }
        }
    };

    // Check if planner is favourite
    useEffect(() => {
        try {
            const check = async () => {
                const res = await checkIfPlannerIsFavourite(planner.id, user.uid);
                setIsFavourite(res);
            };

            check();
            fetchInviteStatus();
        } catch (e) {
            console.warn('Error checking if favourite', e)
        }
    }, []);

    const toggleFavourite = async () => {
        const result = await toggleFavouritePlanner(planner.id, user.uid);
        setIsFavourite(result);
    };

    // const form = useForm({
    //     initialValues: {
    //         title: planner.title,
    //         collaborative: false,
    //     },
    //     // validate: {
    //     //     title: (value: string) => (value.length > 0 ? null : 'Your planner must have a title'),
    //     // },
    // });

    // const submit = async (values) => {
    //     console.log('Form values', values);

    //     await updateCollaborativePlanner(planner.id, values);
    //     getCollabPlanners && await getCollabPlanners();
    //     setEditing(false);
    // };

    const openDeleteModal = () => {
        modals.openConfirmModal({
            title: 'Delete planner',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete this planner?
                </Text>
            ),
            labels: { confirm: 'Delete planner', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: async () => {
                console.log('Confirming', deleteCollaborativePlanner);
                await deleteCollaborativePlanner(planner.id);
                getCollabPlanners && getCollabPlanners(true);
            },
        });
    };

    const openLeavePlannerModal = () => {
        modals.openConfirmModal({
            title: 'Leave planner',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to leave this planner?
                </Text>
            ),
            labels: { confirm: 'Leave planner', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onCancel: () => { },
            onConfirm: async () => {
                await leaveCollaborativePlanner(user.uid, planner.id);
                getCollabPlanners && getCollabPlanners(true);
            },
        });
    };

    const inviteFriend = async (friendId: string) => {
        console.log(`Invite friend to planner with ID: ${friendId}`);
        await inviteFriendToPlanner(user.uid, friendId, planner.id);
        await fetchInviteStatus()
    };

    const openFriendModal = () => {
        const id = modals.openModal({
            title: 'Invite friends',
            children: (
                <>
                    <FriendsList buttonAction={inviteFriend} buttonText="Invite" searchable confirmButtonText="Invited" acceptedText="In planner" friendInvites={friendInvites} />
                    <Button
                        fullWidth
                        onClick={() => {
                            modals.closeModal(id);
                            fetchInviteStatus();
                        }}
                        mt="md"
                    >
                        Cancel
                    </Button>
                </>
            ),
        });
    };

    return (
        <>
            <Card withBorder radius="md" className={cx(classes.card)}>
                {/* <Card.Section>
                    <Link href={`/collections/${planner.id}`} passHref>
                        <a>
                            <Image src={planner.image} height={180} />
                        </a>
                    </Link>
                </Card.Section> */}

                <Group align="center">
                    <Text className={classes.title} weight={500} onClick={() => setActiveSharedPlanner && setActiveSharedPlanner(planner.id)}>
                        {planner.title}
                    </Text>
                    {planner.collaborative && <Badge size="xs">Collaborative</Badge>}
                </Group>

                {editing ?
                    <Stack>
                        <EditCollaborativePlanner planner={planner} setEditing={setEditing} getCollabPlanners={getCollabPlanners} />
                    </Stack> : null}

                <Group position="apart">

                    <Group spacing="xs" mb={6}>
                        <Text size="xs" color="dimmed">
                            In this planner
                        </Text>
                    </Group>
                </Group>

                <Group spacing="xs">
                    {/* <AvatarsGroup limit={10}> */}
                    {planner.usersWithData?.map((profile, index) => (
                        <Link key={profile.id} href={`/users/${profile.id}`}>
                            <Card withBorder radius="xl" p={3} pr={16} style={{ cursor: 'pointer' }}>
                                <Group spacing={4}>
                                    <Avatar key={index} src={profile.image} size="sm" radius="xl" />
                                    {planner.createdBy === profile.id ? <Crown size="16" /> : null}
                                    <Text size="xs">{profile.name?.split(' ')[0]}</Text>
                                </Group>
                            </Card>
                        </Link>
                    ))}
                    {/* </AvatarsGroup> */}
                </Group>

                <Group position="apart" className={classes.footer}>
                    {/* {planner.entity && planner.entity.name ?
                        <Center>
                            <Avatar src={planner.entity.image} size={24} radius="xl" mr="xs" />
                            <Text size="xs" inline>
                                {planner.entity.name}
                            </Text>
                        </Center>
                        : null
                    } */}

                    <Group>

                        {/* {isFavourite && <Badge>Is favourite</Badge>} */}
                        <Button onClick={() => toggleFavourite()} variant={isFavourite ? 'filled' : 'outline'} radius="xl" size="xs" leftIcon={<Star size={16} />}>{isFavourite ? 'Favourite' : 'Add to favourites'}</Button>
                        {planner.createdBy === user.uid ? <Button onClick={() => openFriendModal()} variant="outline" radius="xl" size="xs" leftIcon={<Friends size={16} />}>Invite</Button> : null}
                        {editable && !editing && (planner.createdBy === user.uid) ? <Button variant="outline" size="xs" radius="xl" leftIcon={<Edit size={16} />} onClick={() => setEditing(true)}>Edit</Button> : null}
                        {editing && planner.createdBy === user.uid ?
                            <Button color="red" onClick={() => openDeleteModal()} leftIcon={<Trash size={16} />} size="xs" radius="xl">Delete planner</Button> : null}
                        {expanded && planner.createdBy !== user.uid ?
                            <Button color="red" onClick={() => openLeavePlannerModal()} leftIcon={<Trash size={16} />} size="xs" radius="xl">Leave planner</Button> : null}
                    </Group>
                </Group>
            </Card>

        </>

    );
}

export default CollaborativePlannerCard;
