import { Button, Group, Progress, Stack, Text, createStyles, Avatar, TypographyStylesProvider, Paper, Image, Grid } from '@mantine/core';
import { useContext } from 'react';
import { Star } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { Review } from '../../lib/types';

const useStyles = createStyles((theme) => ({
    comment: {
        padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
    },

    body: {
        fontSize: theme.fontSizes.sm,
    },

    content: {
        '& > p:last-child': {
            marginBottom: 0,
        },
    },
}));

interface ReviewCardProps {
    review: Review;
    deleteReview: Function
}

export default function ReviewCard(props: ReviewCardProps) {
    const { review } = props;
    const { user } = useContext(UserContext);
    const { classes } = useStyles();

    const deleteReview = async () => {
        // console.log('Deleting review with id', review.id);
        props.deleteReview(review.id);
    };

    // console.log('Review', review);

    const criteria = [
        {
            label: 'It tasted',
            value: 'taste',
        },
        {
            label: 'It made me feel',
            value: 'feel',
        },
        {
            label: 'Difficulty',
            value: 'difficulty',
        },
    ];

    const reviewDate = review.createdAt.toDate();
    console.log('Review date', reviewDate);

    return (
        <div className="bg-white rounded-md shadow p-4 flex">
            <Paper withBorder radius="md" className={classes.comment}>

                <Group>
                    <Avatar src={review.userData.image} alt={review.userData.firstName} radius="xl" />
                    <div>
                        <Text size="sm">{review.userData.firstName} {review.userData.lastName}</Text>
                        <Text size="xs" color="dimmed">
                            {((review.createdAt.toDate())).toLocaleDateString()}
                        </Text>
                    </div>
                    <Group spacing={2}>
                        {[...Array(review.rating)].map((e, i) => <Star key={i} fill="#454289" color="#454289" />)}
                    </Group>
                </Group>

                <Group grow my={24}>
                    {criteria.map((c, index) => (
                        // <ScoreBar score={review[c.value]} label={c.label} max={10} showMax />
                        <Stack key={index}>
                            <Group position="apart">
                                <Text size="xs">{c.label}</Text>
                            </Group>
                            <Progress value={review[c.value] * 10} size="sm" radius="xl" />
                        </Stack>
                    ))}
                </Group>
                <Grid>
                    {review.image &&
                        <Grid.Col span={4}>
                            <Image src={review.image} style={{ height: '100%', objectFit: 'cover' }} />
                        </Grid.Col>
                    }

                    <Grid.Col span={review.image ? 8 : 12}>
                        <TypographyStylesProvider className={classes.body}>
                            <div className={classes.content} dangerouslySetInnerHTML={{ __html: review.review }} />
                        </TypographyStylesProvider>
                    </Grid.Col>
                </Grid>
                {user && (user.uid === review.userData.id) &&
                    <Button mt={8} color="red" onClick={() => deleteReview()}>Delete</Button>
                }
            </Paper>
        </div>
    );
}
