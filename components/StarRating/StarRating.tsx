import { Group } from "@mantine/core";
import { Star } from "tabler-icons-react";

interface StarRatingProps {
    rating: number,
    setRating: Function,
}

export function StarRating(props: StarRatingProps) {
    const { rating, setRating } = props;

    return (
        <div className="flex flex-col items-start">
            <div>Rating:</div>
            <Group >
                {[...Array(rating)].map((e, i) => <div onClick={() => setRating(i + 1)}><Star fill="#454289" color="#454289" /></div>)}
                {[...Array(5 - rating)].map((e, i) => <div onClick={() => setRating(rating + i + 1)}><Star /> </div>)}

            </Group>
        </div>
    );
}

export default StarRating;
