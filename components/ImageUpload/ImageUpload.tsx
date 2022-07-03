import { Button, createStyles, Group, Loader, MantineTheme, Progress, Text, useMantineTheme } from '@mantine/core';
import { DropzoneStatus, Dropzone, DropzoneStatus, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Upload, Photo, X, Icon as TablerIcon } from 'tabler-icons-react';

import { useRef, useState } from 'react';
import { storage } from '../../lib/firebase';

const useStyles = createStyles(() => ({
    button: {
        position: 'relative',
        transition: 'background-color 150ms ease',
    },

    progress: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        left: -1,
        top: -1,
        height: 'auto',
        backgroundColor: 'transparent',
        zIndex: 0,
    },

    label: {
        position: 'relative',
        zIndex: 1,
    },
}));

interface ImageUploadProps {
    setUrl: Function,
    id: number;
    setVideoUrl?: Function;
    small?: boolean;
    title?: string;
    buttonOnly?: boolean
}

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
    return status.accepted
        ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
        : status.rejected
            ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
            : theme.colorScheme === 'dark'
                ? theme.colors.dark[0]
                : theme.colors.gray[7];
}

function ImageUploadIcon({
    status,
    ...props
}: React.ComponentProps<TablerIcon> & { status: DropzoneStatus }) {
    if (status.accepted) {
        return <Upload {...props} />;
    }

    if (status.rejected) {
        return <X {...props} />;
    }

    return <Photo {...props} />;
}

export const dropzoneChildren = (status: DropzoneStatus, theme: MantineTheme, small?: boolean, title?: string) => (
    <Group position="center" spacing="xl" style={{ minHeight: small ? 'auto' : 220, pointerEvents: 'none' }}>
        <ImageUploadIcon status={status} style={{ color: getIconColor(status, theme) }} size={80} />

        <div>
            <Text size="xl" inline>
                {title || 'Drag images here or click to select files'}
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed 5mb
            </Text>
        </div>
    </Group>
);

export default function ImageUpload(props: ImageUploadProps) {
    const { setUrl, id, setVideoUrl, small, title, buttonOnly } = props;
    // const theme = useMantineTheme();
    const { classes, theme } = useStyles();


    // const [file, setFile] = useState(null)
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadPhoto = async (file, fileIsVideo) => {
        let filePath = null;
        let uploadUrl = '';

        if (file == null) {
            return;
        }

        function makeid(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        filePath = `/recipes/${makeid(30)}`;
        //const storageRef = storage.ref(filePath);
        const storageRef = storage.ref(filePath);

        try {
            setLoading(true);
            // let uploadTask: any = storageRef.put(file);
            // await uploadTask.on("state_changed", function progress(snapshot) {
            //   console.log(snapshot.totalBytesTransferred); // progress of upload
            // });
            // uploadUrl = await uploadTask.ref.getDownloadURL();
            // console.log(uploadUrl);

            const uploadTask = storageRef.child(filePath).put(file);

            // Register three observers:
            // 1. 'state_changed' observer, called any time the state changes
            // 2. Error observer, called on failure
            // 3. Completion observer, called on successful completion
            await uploadTask.on('state_changed',
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                    setProgress(progress);
                    // switch (snapshot.state) {
                    //   case storage.TaskState.PAUSED: // or 'paused'
                    //     console.log('Upload is paused');
                    //     break;
                    //   case storage.TaskState.RUNNING: // or 'running'
                    //     console.log('Upload is running');
                    //     break;
                    // }
                },
                (error) => {
                    // Handle unsuccessful uploads
                },
                () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        uploadUrl = downloadURL;
                        console.log('File available at', downloadURL);
                        console.log('isVideo', isVideo);
                        fileIsVideo ? setVideoUrl(uploadUrl) : setUrl(uploadUrl);
                        setLoading(false);
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            //error.value = err;
        }
    };

    const handleChange = async (e: any) => {
        console.log('Handle change', e);
        setError('');
        const types = ['image/png', 'image/jpeg', 'image/gif', 'video/mp4'];
        // const selected = e.target.files[0];
        const selected = e[0];

        let file;

        if (selected && types.includes(selected.type)) {
            file = selected;
            setPreview(URL.createObjectURL(selected));
            console.log('File', file);
            console.log('Selected', selected);

            let fileIsVideo = false;
            if (selected.type === 'video/mp4') {
                console.log('Selected type IS VIDEO');
                fileIsVideo = true;
                setIsVideo(true);
            }

            await uploadPhoto(file, fileIsVideo);
        } else {
            file = null;
            setError('Only PNGs, JPEGs, GIFs and MP4s are allowed');
        }
    };

    const openRef = useRef<() => void>(null);

    return (
        // <div className="">
        //     {/* <label
        //         htmlFor={`file-upload-${id}`}
        //         className="relative cursor-pointer rounded-sm font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
        //     >
        //         <span className="primary-text-1">Upload a file</span>

        //     </label> */}
        //     <input
        //         id={`file-upload-${id}`}
        //         name="file-upload"
        //         type="file"
        //         className="sr-only"
        //         onChange={handleChange}
        //         onClick={(event) => {
        //             // @ts-ignore
        //             // event.target.value = null;
        //         }}
        //     />
        //     {/* <p className="pl-1">or drag and drop</p> */}
        //     {progress && (progress !== 100) && <div> {Math.ceil(parseFloat(progress))} % uploaded</div>}
        //     {error && <p className="text-red-600">{error}</p>}
        //     {loading && <Loader />}
        // </div>
        <>

            <Dropzone
                openRef={openRef}
                onDrop={handleChange}
                onReject={(files) => console.log('rejected files', files)}
                // maxSize={3 * 1024 ** 2}
                accept={['image/png', 'image/jpeg', 'image/gif', 'video/mp4']}
                loading={loading}
                style={{ display: buttonOnly ? 'none' : 'block' }}
            >
                {(status) => dropzoneChildren(status, theme, small, title)}
            </Dropzone>

            {/* <Group position="center" mt="md"> */}
            {buttonOnly && <Button
                onClick={() => openRef.current && openRef.current()}

            >
                <div className={classes.label}>
                    {progress !== 0 ? 'Uploading files' : 'Upload files'}
                </div>
                {progress !== 0 && (
                    <Progress
                        value={progress}
                        className={classes.progress}
                        color={theme.fn.rgba(theme.colors[theme.primaryColor][2], 0.35)}
                        radius="sm"
                    />
                )}
            </Button>
            }


            {/* </Group> */}
        </>

    );
}
