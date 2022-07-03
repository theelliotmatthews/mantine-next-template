import { Button } from '@mantine/core';

interface PhotoContainerProps {
    removePhoto: Function,
    photo: string,
    className?: string,
}

export default function PhotoContainer(props: PhotoContainerProps) {
    const { removePhoto, photo } = props;

    return (
        <div style={{ position: 'relative', maxWidth: '100%' }}>
            <Button
                onClick={() => removePhoto()}
                style={{ position: 'absolute', top: 0, right: 0 }}
            >
                Remove photo
            </Button>
            <img src={photo} alt="Photo" width="100%" />
        </div>

    );
}
