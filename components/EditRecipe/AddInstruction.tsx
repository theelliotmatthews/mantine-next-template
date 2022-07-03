import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { Button, NumberInput, TextInput } from '@mantine/core';
import { Plus, Trash } from 'tabler-icons-react';
import { Instruction, Timer } from '../../lib/types';
import ImageUpload from '../ImageUpload/ImageUpload';

interface AddInstructionProps {
    createInstruction: Function;
    editing?: Instruction;
    editInstruction: Function;
    stopEditing?: Function;
}

export default function AddInstruction(props: AddInstructionProps) {
    const { createInstruction, editing, editInstruction, stopEditing } = props;

    const groupSchema = z.object({
        name: z.string({
            required_error: 'Instruction is required',
            invalid_type_error: 'Instruction must be a string',
        }).nonempty({ message: 'An instruction is required' }).min(3),
        hours: z.number(),
        minutes: z.number(),
        seconds: z.number(),
    });

    const methods = useForm({ resolver: zodResolver(groupSchema), mode: 'onChange' });
    const { handleSubmit, formState: { errors, isValid }, setValue, clearErrors, setError, reset, watch, register } = methods;

    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [addingTimer, setAddingTimer] = useState(false);
    const [suggestedTimer, setSuggestedTimer] = useState(null);
    const [timersMatch, setTimersMatch] = useState(false);

    const updateVideo = (e) => {
        setImage(null);
        setVideo(e);
        clearErrors('name');
    };

    const updateImage = (e) => {
        setVideo(null);
        setImage(e);
        clearErrors('name');
    };

    const resetMedia = () => {
        setImage(null);
        setVideo(null);
        clearErrors('name');
    };

    const onSubmit = (data: any) => {
        console.log('Submit', data);

        if (editing) {
            editInstruction({
                timer: addingTimer ? {
                    hours: data.hours,
                    minutes: data.minutes,
                    seconds: data.seconds,
                } : null,
                name: data.name,
                image,
                video,
                id: editing.id,
            });
        } else {
            createInstruction({
                timer: addingTimer ? {
                    hours: data.hours,
                    minutes: data.minutes,
                    seconds: data.seconds,
                } : null,
                name: data.name,
                image,
                video,
            });
        }
        reset();
        setImage(null);
        setVideo(null);
    };

    useEffect(() => {
        console.log('Editing instruction', editing);

        if (editing) {
            setValue('name', editing.name);
            if (editing.image) setImage(editing.image);
            if (editing.video) setVideo(editing.video);
            if (editing.timer) {
                setValue('hours', editing.timer.hours);
                setValue('minutes', editing.timer.minutes);
                setValue('seconds', editing.timer.seconds);
                setAddingTimer(true);
            }
        }
    }, [editing]);

    const watchInstruction = watch('name', false); // you can supply default value as second argument

    // Suggest a timer based on the instruction
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            console.log('Value', value);
            const types = ['hour', 'minute', 'second'];
            if (value.name && (value.name.length > 0)) {
                const update = {
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                };
                for (const type of types) {
                    let found = null;
                    if (type === 'hour') {
                        found = value.name.includes('hour') ? value.name.match(/([\d.]+) *hour/)[1] : null;
                    } else if (type === 'minute') {
                        found = value.name.includes('minute') ? value.name.match(/([\d.]+) *minute/)[1] : null;
                    } else if (type === 'second') {
                        found = value.name.includes('second') ? value.name.match(/([\d.]+) *second/)[1] : null;
                    }

                    if (found
                        // && (parseInt(found) !== (parseInt(value[type + 's'])))
                    ) {
                        // console.log('Found ' + type, found)
                        // console.log('Value object', value[type + 's'])
                        update[`${type}s`] = parseInt(found);
                    }
                }
                // if (!timersMatchCheck(value)) {
                if (
                    (value.hours !== update.hours) ||
                    (value.minutes !== update.minutes) ||
                    (value.seconds !== update.seconds)

                ) {
                    setSuggestedTimer(update);
                }
                // }
            } else {
                setSuggestedTimer(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const toggleAddingTimer = (adding: boolean) => {
        if (!adding) {
            setAddingTimer(adding);
            setValue('hours', 0);
            setValue('minutes', 0);
            setValue('seconds', 0);
        } else {
            setAddingTimer(adding);
            setValue('hours', null);
            setValue('minutes', null);
            setValue('seconds', null);
        }
    };

    const addSuggestedTimer = () => {
        setAddingTimer(true);
        setValue('hours', suggestedTimer.hours);
        setValue('minutes', suggestedTimer.minutes);
        setValue('seconds', suggestedTimer.seconds);
        setSuggestedTimer(null);
    };

    const convertTimerToString = (timer: Timer) => {
        let string = '';

        const types = [
            'hours',
            'minutes',
            'seconds',
        ];

        types.forEach(type => {
            if (timer[type]) {
                if (type !== 'hours') {
                    string += ' ';
                }
                string += `${timer[type]} ${timer[type] > 1 ? type : type.substring(0, type.length - 1)
                    }`;
            }
        });

        return string;
    };

    const timerIsEmpty = (timer: Timer) => !timer || ((timer.hours === 0) && (timer.minutes === 0) && (timer.seconds === 0));

    return (
        <div>
            <h1>Add instruction</h1>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {editing && <Button onClick={stopEditing}>Stop editing</Button>
                    }
                    <TextInput error={errors.name?.message} label="Instruction" {...register('name')} placeholder="Your instruction..." />

                    {!timerIsEmpty(suggestedTimer) && !timersMatch &&
                        <Button onClick={() => addSuggestedTimer()}>Add timer for {
                            convertTimerToString(suggestedTimer)
                        }
                        </Button>

                    }

                    <Button onClick={() => toggleAddingTimer(!addingTimer)} leftIcon={addingTimer ? <Trash /> : <Plus />}>{addingTimer ? 'Remove timer' : 'Add timer'}</Button>

                    {addingTimer &&
                        <>
                            <h2>Add timer</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <NumberInput error={errors.hours?.message} label="hours" {...register('hours')} min={0} />
                                <NumberInput error={errors.minutes?.message} label="minutes" {...register('minutes')} min={0} max={59} />
                                <NumberInput error={errors.seconds?.message} label="seconds" {...register('seconds')} min={0} max={59} />
                            </div>
                        </>
                    }

                    {/* Cover photo */}
                    <div className="relative">
                        <div>Cover photo</div>
                        <div className="absolute right-0 top-0 bg-white flex">
                            <ImageUpload setUrl={(e) => updateImage(e)} setVideoUrl={(e) => updateVideo(e)} id={editing ? parseInt(editing.id) : 2} />
                            {(image || video) && <Button onClick={() => resetMedia()} type="button" as="button" background="primary-medium" textColor="white">Remove</Button>}
                        </div>
                        {image && <img src={image} className="w-full h-full object-cover" />}
                        {video && <video src={video} className="w-full h-full" controls />}

                    </div>
                    <Button type="submit" disabled={!isValid}>{editing ? 'Edit instruction' : '+ Add instruction'}</Button>
                </form>
            </FormProvider>
            {/* <pre>{JSON.stringify(editing, null, 2)}</pre> */}
        </div>
    );
}
