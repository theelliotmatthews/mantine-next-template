import { useState, useContext } from 'react';
import { Alert, Button, Card, Grid, Group, Slider, Stack, Text, Textarea } from '@mantine/core';
import { UserContext } from '../../lib/context';
import { Recipe } from '../../lib/types';
import { addReview } from '../../lib/reviews';
import { StarRating } from '../StarRating/StarRating';
import RatingBar from '../RatingBar/RatingBar';
import ImageUpload from '../ImageUpload/ImageUpload';
import { PhotoContainer } from '../PhotoContainer/PhotoContainer';
import { AlertCircle } from 'tabler-icons-react';

interface ReviewInputProps {
    cancelLeavingReview: Function,
    reviewSubmitted: Function,
    recipe: Recipe
}

export default function ReviewInput(props: ReviewInputProps) {
    const { cancelLeavingReview, recipe, reviewSubmitted } = props;
    const { user } = useContext(UserContext);

    const [starRating, setStarRating] = useState(0);
    const [taste, setTaste] = useState(0);
    const [feel, setFeel] = useState(0);
    const [difficulty, setDifficulty] = useState(0);
    const [review, setReview] = useState('');
    const [photo, setPhoto] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const submitReview = async () => {
        console.log('Submitting review');
        const newErrors = []
        setErrors([]);

        // Check for errors first
        if (starRating === 0) {
            newErrors.push(
                'Please add a star rating'
            );
        }

        if (taste === 0) {
            newErrors.push(
                'Please rate the taste of the recipe'
            );
        }

        if (feel === 0) {
            newErrors.push(
                'Please rate how this recipe made you feel'
            );
        }

        if (difficulty === 0) {
            newErrors.push(
                'Please rate the difficulty of this recipe'
            );
        }

        if (review.length < 30) {
            newErrors.push(
                'Please add a review longer than 30 characters'
            );
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        // Construct review
        const reviewDoc = {
            approved: false,
            createdAt: new Date(),
            difficulty,
            feel,
            image: photo,
            rating: starRating,
            recipeId: recipe.id,
            recipeSearchTerms: recipe.search_terms,
            recipeTitle: recipe.title,
            review,
            taste,
            uid: user.uid,
        };

        setLoading(true);
        await addReview(reviewDoc, null, recipe);
        setLoading(false);
        reviewSubmitted();
    };

    return (
        <Card withBorder px="xl">
            <Stack>
                <StarRating rating={starRating} setRating={setStarRating} />

                <Grid gutter={64}>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>It tasted</Text>
                            <Slider
                                value={taste}
                                onChange={setTaste}
                                max={10}
                                min={0}
                            />
                            <Group position="apart">
                                <Text color="dimmed" size="xs">Terrible</Text>
                                <Text color="dimmed" size="xs">Incredible</Text>
                            </Group>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>It made me feel</Text>
                            <Slider
                                value={feel}
                                onChange={setFeel}
                                max={10}
                                min={0}
                            />
                            <Group position="apart">
                                <Text color="dimmed" size="xs">Terrible</Text>
                                <Text color="dimmed" size="xs">Incredible</Text>
                            </Group>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack>
                            <Text>Difficulty</Text>
                            <Slider
                                value={difficulty}
                                onChange={setDifficulty}
                                max={10}
                                min={0}
                            />
                            <Group position="apart">
                                <Text color="dimmed" size="xs">Very easy</Text>
                                <Text color="dimmed" size="xs">Rock science</Text>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
                {/* <RatingBar rating={taste} setRating={setTaste} title="It tasted" leftText="Terrible" rightText="Incredible" /> */}
                {/* <RatingBar rating={feel} setRating={setFeel} title="It made me feel" leftText="Terrible" rightText="Incredible" /> */}
                {/* <RatingBar rating={difficulty} setRating={setDifficulty} title="Difficulty" leftText="Very easy" rightText="Rocket science" /> */}

                <div>
                    <Textarea onChange={(e) => setReview(e.target.value)} placeholder="Please enter at least 30 characters" label="Your review" />
                </div>

                {photo ? <PhotoContainer photo={photo} removePhoto={() => setPhoto('')} className="max-w-lg" /> :
                    <ImageUpload setUrl={setPhoto} id={1} />
                }

                {errors.length > 0 &&
                    <Alert icon={<AlertCircle size={16} />} title="Please fix the following errors" color="red">
                        {errors.map((e, i) => <div key={i}>{e}</div>)}
                    </Alert>
                }

                <Group>
                    <Button onClick={() => submitReview()}>Add review</Button>
                    <Button onClick={() => cancelLeavingReview()}>Cancel</Button>
                </Group>

            </Stack>
        </Card >
    );
}
