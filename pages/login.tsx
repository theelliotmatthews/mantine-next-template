import React, { useState } from 'react';
import { useForm, useToggle, upperFirst } from '@mantine/hooks';
import {
    TextInput,
    PasswordInput,
    Text,
    Paper,
    Group,
    PaperProps,
    Button,
    Divider,
    Checkbox,
    Anchor,
    Center,
    createStyles,
} from '@mantine/core';
import { BrandGoogle } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { auth, signInWithGoogle } from '../lib/firebase';

const useStyles = createStyles((theme) => ({
    error: {
        color: theme.colors.red[4],
    },
}));

function AuthenticationForm(props: PaperProps<'div'>) {
    const router = useRouter();
    const [type, toggle] = useToggle('login', ['login', 'register']);
    const form = useForm({
        initialValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            terms: true,
        },

        validationRules: {
            email: (val) => /^\S+@\S+$/.test(val),
            password: (val) => val.length >= 6,
        },
    });
    const [error, setError] = useState(null);
    const { classes } = useStyles();

    const googleSignIn = async () => {
        await signInWithGoogle();
        router.push('/');
    };

    const submitForm = async (data: {
        email: string;
        password: string;

    }) => {
        setError(null);
        try {
            await auth.signInWithEmailAndPassword(data.email, data.password);
            router.push('/');
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <Paper radius="md" p="xl" withBorder {...props}>
            <Text size="lg" weight={500}>
                Welcome to Plant Food, {type} with
            </Text>

            <Group grow mb="md" mt="md">
                {/* <GoogleButton radius="xl">Google</GoogleButton> */}
                {/* <TwitterButton radius="xl">Twitter</TwitterButton> */}
                <Button onClick={googleSignIn} leftIcon={<BrandGoogle />}>Google</Button>
            </Group>

            <Divider label="Or continue with email" labelPosition="center" my="lg" />

            <form onSubmit={form.onSubmit((e: any) => { submitForm(e); })}>
                <Group direction="column" grow>
                    {type === 'register' && (
                        <>
                            <TextInput
                                label="First Name"
                                placeholder="Your first name"
                                value={form.values.firstName}
                                onChange={(event) => form.setFieldValue('firstName', event.currentTarget.value)}
                            />

                            <TextInput
                                label="Last Name"
                                placeholder="Your last name"
                                value={form.values.lastName}
                                onChange={(event) => form.setFieldValue('lastName', event.currentTarget.value)}
                            />
                        </>
                    )}

                    <TextInput
                        required
                        label="Email"
                        placeholder="hello@mantine.dev"
                        value={form.values.email}
                        onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                        error={form.errors.email && 'Invalid email'}
                    />

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                        error={form.errors.password && 'Password should include at least 6 characters'}
                    />

                    {type === 'register' && (
                        <Checkbox
                            label="I accept terms and conditions"
                            checked={form.values.terms}
                            onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                        />
                    )}
                </Group>

                {error ?
                    <Group mt="md">
                        <Text className={classes.error}>{error}</Text>
                    </Group> : null
                }

                <Group position="apart" mt="xl">
                    <Anchor component="button" type="button" color="gray" onClick={() => toggle()} size="xs">
                        {type === 'register'
                            ? 'Already have an account? Login'
                            : "Don't have an account? Register"}
                    </Anchor>
                    <Button type="submit">{upperFirst(type)}</Button>
                </Group>
            </form>
        </Paper>
    );
}

export default function Login() {
    return (
        <>
            <Center>
                <AuthenticationForm />
            </Center>
        </>
    );
}
