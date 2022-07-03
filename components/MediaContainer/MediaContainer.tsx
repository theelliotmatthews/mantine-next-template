import { Button } from '@mantine/core';

interface MediaContainerProps {
    remove: Function,
    media: string,
    type: 'video' | 'image',
    className?: string,
}

export default function MediaContainer(props: MediaContainerProps) {
    const { remove, media, type, className } = props;

    return (
        <div style={{ position: 'relative', maxWidth: '100%' }}>
            <Button
                onClick={() => remove()}
                style={{ position: 'absolute', top: 0, right: 0, zIndex: 20 }}
            >
                Remove
            </Button>
            {type === 'video' ?
                <video src={media} alt="Video" width="100%" controls />
                :
                <img src={media} alt="Photo" width="100%" />
            }
        </div>

    );
}
