import { Button, Center, Grid } from '@mantine/core';
import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../lib/context';
import { checkIfReviewExists, deleteReview, getReviewsForRecipe } from '../../lib/reviews';
import { Recipe } from '../../lib/types';
import ReviewCard from '../ReviewCard/ReviewCard';
import ReviewInput from '../ReviewInput/ReviewInput';

interface ReviewsProps {
    id: string,
    recipe: Recipe
}

export function Reviews(props: ReviewsProps) {
    const { id, recipe } = props;

    const { user } = useContext(UserContext);

    const [reviews, setReviews] = useState([]);
    const [userHasLeftReview, setUserHasLeftReview] = useState(false);
    const [leavingReview, setLeavingReview] = useState(false);
    const [userCompletedReview, setUserCompletedReview] = useState(false);

    useEffect(() => {
        setReviews([]);

        const fetchReviews = async () => {
            const res = await getReviewsForRecipe(id);
            setReviews(res);
        };

        fetchReviews();
    }, [id, userCompletedReview]);

    useEffect(() => {
        if (user) {
            const existsCheck = async () => {
                const exists = await checkIfReviewExists(id, user.uid);
                setUserHasLeftReview(exists);
                // console.log('Exists', exists);
            };

            existsCheck();
        }
    }, [user]);

    const deleteReviewByUser = async (id) => {
        // Filter review by review with ID
        const copy = [...reviews].filter(item => item.id !== id);
        await deleteReview(id);
        setUserHasLeftReview(false);
        setReviews(copy);
    };

    const completeReview = () => {
        setUserCompletedReview(true);
        setLeavingReview(false);
        setUserHasLeftReview(true);
    };

    return (
        <>
            <h3>Reviews</h3>

            {reviews.length > 0 ?
                <Grid>
                    {reviews.map((review, index) => (
                        <Grid.Col key={review.id} span={6}>
                            <ReviewCard key={index} review={review} deleteReview={deleteReviewByUser} />
                        </Grid.Col>
                    ))}

                </Grid>
                :
                <div>No reviews yet, you should leave one</div>
            }

            {(!userHasLeftReview && !leavingReview) &&
                <Center>
                    <Button onClick={() => setLeavingReview(true)}>Leave review</Button>
                </Center>
            }

            {leavingReview && <ReviewInput cancelLeavingReview={() => setLeavingReview(false)} recipe={recipe} reviewSubmitted={() => completeReview()} />}
        </>
    );
}

export default Reviews;
