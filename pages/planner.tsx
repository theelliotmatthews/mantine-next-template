import { Avatar, Button, Card, Divider, Grid, Group, Stack, Tabs, Text, TextInput } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { ArrowLeftBar, Calendar, Users } from 'tabler-icons-react';
import CollaborativePlannerCard from '../components/CollaborativePlannerCard/CollaborativePlannerCard';
import EditCollaborativePlanner from '../components/EditCollaborativePlanner/EditCollaborativePlanner';
import Planner from '../components/Planner/Planner';
import { UserContext } from '../lib/context';
import { getAllCollaborativePlanners, respondToCollaborativePlannerInvite } from '../lib/planner/planner';
import { CollaborativePlanner } from '../lib/types';

export default function PlannerPage() {
    const { user } = useContext(UserContext);
    const tabs = [
        {
            label: 'My Planner',
            icon: <Calendar size={14} />,
            href: '/planner',
        },
        {
            label: 'Shared Planners',
            icon: <Users size={14} />,
            href: '/shared-planners',
        },
    ];

    const [activeTab, setActiveTab] = useState(0);
    const onChange = (active: number) => {
        setActiveTab(active);
    };

    const [planners, setPlanners] = useState<CollaborativePlanner[]>([]);
    const [plannersFiltered, setPlannersFiltered] = useState<CollaborativePlanner[]>([]);
    const [activeSharedPlanner, setActiveSharedPlanner] = useState<string>('');
    const [addingNewPlanner, setAddingNewPlanner] = useState<boolean>(false);
    const [collaborativePlannerInvites, setCollaborativePlannerInvites] = useState<CollaborativePlanner[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getCollabPlanners = async (closeSharedPlanner?: boolean) => {
        try {
            const res = await getAllCollaborativePlanners(user.uid, false, false, false);
            console.log('Collab planners', res);
            setPlanners(res);
            setPlannersFiltered(res)

            if (closeSharedPlanner) {
                setActiveSharedPlanner('');
            }
        } catch (e: any) {
            console.warn('Error getting collab planners', e);
        }
    };

    const getCollabInvites = async () => {
        try {
            const res = await getAllCollaborativePlanners(user.uid, true, false, false);
            console.log('Collab INVITES', res);
            setCollaborativePlannerInvites(res);
        } catch (e: any) {
            console.warn('Cant get collab invites', e);
        }
    };

    const respondToCollabInvite = async (inviteId: string, accept: boolean, plannerId: string) => {
        await respondToCollaborativePlannerInvite(inviteId, accept, plannerId, user.uid);

        if (accept) {
            await getCollabPlanners();
        }

        setCollaborativePlannerInvites(prevState => prevState.filter(invite => invite.inviteId !== inviteId));
    };

    useEffect(() => {
        console.log('User', user);
        if (!user) return;

        if (activeTab === 1) {
            getCollabPlanners();
            getCollabInvites();
        }
    }, [user, activeTab]);

    useEffect(() => {
        if (planners.length > 0) {
            if (searchTerm.length > 0) {
                setPlannersFiltered(planners.filter(planner => planner.title.toLowerCase().includes(searchTerm.toLowerCase())));
            } else {
                setPlannersFiltered(planners);
            }
            // .sort((a, b) =>
            //     a.title < b.title ? -1 : a.title > b.title ? 1 : 0
            // )
        }
    }, [searchTerm, planners]);

    return (
        <Stack>
            <Tabs active={activeTab} onTabChange={onChange}>
                {tabs.map((tab, index) => (
                    <Tabs.Tab key={index} label={tab.label} icon={tab.icon} />))}
            </Tabs>

            {activeTab === 1 ?
                activeSharedPlanner ?
                    <Stack>
                        <Group>
                            <Button leftIcon={<ArrowLeftBar size={16} />} onClick={() => setActiveSharedPlanner('')}>Back</Button>
                        </Group>
                        <CollaborativePlannerCard planner={planners.find(p => p.id === activeSharedPlanner)} editable getCollabPlanners={getCollabPlanners} expanded />

                        <Planner collaborative collaborativePlannerId={activeSharedPlanner} />
                    </Stack>
                    :
                    <Stack>
                        {!addingNewPlanner ?
                            <Group>
                                <Button onClick={() => setAddingNewPlanner(true)}>Create planner</Button>
                            </Group>
                            : <EditCollaborativePlanner setEditing={setAddingNewPlanner} getCollabPlanners={getCollabPlanners} />}

                        {planners.length > 0 ? <TextInput placeholder="Search planners" onChange={(e: any) => setSearchTerm(e.target.value)} /> : null}

                        {collaborativePlannerInvites.length > 0 ?
                            <Stack>
                                <Text>You have been invited to the following planners</Text>
                                {collaborativePlannerInvites.map((invite, index) => (
                                    <Card key={index} withBorder>
                                        {/* {JSON.stringify(invite)} */}
                                        <Group position="apart">
                                            <Group>
                                                <Text>{invite.title}</Text>
                                                <Divider orientation="vertical" variant="solid" sx={{ height: '24px' }} />
                                                <Group spacing="xs">
                                                    <Avatar src={invite.usersWithData?.find(user => user.id === invite.createdBy).image} radius="xl" size="sm" />
                                                    <Text size="xs">{invite.usersWithData?.find(user => user.id === invite.createdBy).name}</Text>
                                                </Group>
                                            </Group>
                                            <Group>
                                                <Button size="xs" radius="xl" variant="outline" onClick={() => respondToCollabInvite(invite.inviteId, true, invite.id)}>Accept</Button>
                                                <Button size="xs" radius="xl" variant="outline" onClick={() => respondToCollabInvite(invite.inviteId, false, invite.id)}>Decline</Button>
                                            </Group>
                                        </Group>
                                    </Card>))}
                            </Stack> : null
                        }
                        <Grid justify="stretch" align="stretch">
                            {plannersFiltered.map((result, i) => (
                                <Grid.Col key={i} xs={12} sm={6} md={4} lg={3}>
                                    <CollaborativePlannerCard planner={result} key={result.id} setActiveSharedPlanner={setActiveSharedPlanner} />
                                </Grid.Col>
                            )
                            )}
                        </Grid>
                    </Stack>
                : <Planner collaborative={false} />}

        </Stack>
    );
}
