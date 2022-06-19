import Link from 'next/link';
import {
    Card,
    Image,
    Text,
    ActionIcon,
    Badge,
    Group,
    Center,
    Avatar,
    useMantineTheme,
    createStyles,
    Tooltip,
} from '@mantine/core';
import { useContext } from 'react';
import { Share } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { Collection } from '../../lib/types';

const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },

    rating: {
        position: 'absolute',
        top: theme.spacing.xs,
        right: theme.spacing.xs + 2,
        pointerEvents: 'none',
    },

    title: {
        display: 'block',
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs / 2,
        textDecoration: 'none',
        color: theme.colors.dark[7],
    },

    action: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    },

    footer: {
        marginTop: theme.spacing.md,
    },
}));

interface CollectionCardProps {
    collection: Collection;
    inPost?: boolean
}

export function CollectionCard(props: CollectionCardProps) {
    const { collection, inPost } = props;
    const { classes, cx } = useStyles();
    const theme = useMantineTheme();

    const { user } = useContext(UserContext);

    const shareCollection = async () => {
        console.log('Sharing collection');
    };

    const buttons = [
        {
            type: 'share',
            action: shareCollection,
            icon: 'share',
            hide: false,
        },
    ];

    return (
        <>
            <Card withBorder radius="md" className={cx(classes.card)}>
                <Card.Section>
                    <Link href={`/collections/${collection.id}`} passHref>
                        <a>
                            <Image src={collection.image} height={180} />
                        </a>
                    </Link>
                </Card.Section>

                <Text className={classes.title} weight={500}>
                    <Link href={`/collections/${collection.id}`} passHref>
                        <a className={classes.title}>
                            {collection.title}
                        </a>
                    </Link>
                </Text>

                <Group position="apart">

                    <Group spacing="xs">
                        <Text size="xs" color="dimmed">
                            {collection.count} {collection.count > 1 ? 'recipes' : 'recipe'}
                        </Text>
                    </Group>
                </Group>

                <Group position="apart" className={classes.footer}>
                    {collection.entity && collection.entity.name ?
                        <Center>
                            <Avatar src={collection.entity.image} size={24} radius="xl" mr="xs" />
                            <Text size="xs" inline>
                                {collection.entity.name}
                            </Text>
                        </Center>
                        : null
                    }

                    <Group spacing={8} mr={0}>
                        <Tooltip label="Share">
                            <ActionIcon className={classes.action}>
                                <Share size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </Card>

        </>

    );
}

export default CollectionCard;
