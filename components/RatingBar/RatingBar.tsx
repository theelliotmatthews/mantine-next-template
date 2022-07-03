import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
    progressLabel: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        lineHeight: 1,
        fontSize: theme.fontSizes.sm,
    },

    stat: {
        borderBottom: '3px solid',
        paddingBottom: 5,
    },

    statCount: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        lineHeight: 1.3,
    },

    diff: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        display: 'flex',
        alignItems: 'center',
    },

    icon: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
    },
}));

interface RatingBarProps {
    rating: number,
    setRating: Function,
    title: string,
    leftText?: string,
    rightText?: string
}

export default function RatingBar(props: RatingBarProps) {
    const { rating, setRating, leftText, rightText, title } = props
    const { classes, cx } = useStyles();


    return (
        <div className="flex flex-col items-start">
            <div>{title}</div>
            <div className="flex items-center h-5 w-full justify-between divide-x divide-gray-200 rounded-full overflow-hidden">
                {[...Array(rating)].map((e, i) => <div onClick={() => setRating(i + 1)} className="bg-primary-medium w-full h-full"></div>)}
                {[...Array(10 - rating)].map((e, i) => <div onClick={() => setRating(rating + i + 1)} className="bg-primary-light w-full h-full"></div>)}

            </div>
            {(leftText || rightText) && <div className="flex items-center justify-between w-full text-sm">
                <div>{leftText}</div>
                <div>{rightText}</div>
            </div>
            }

        </div>
    );

}



