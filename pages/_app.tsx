import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
import { AppProps } from 'next/app';
import { getCookie, setCookies } from 'cookies-next';
import Head from 'next/head';
import { MantineProvider, ColorScheme, ColorSchemeProvider, Global } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { UserContext } from '../lib/context';
import { useUserData } from '../lib/hooks';
import HeaderSimple from '../components/Header/Header';

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookies('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  const userData = useUserData();

  return (

    <>
      <Head>
        <title>Plant Food - Mantine</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>

      <UserContext.Provider value={userData}>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider
            theme={{
              // colorScheme
              colors: {
                brand: ['#EEEEF7', '#D0CFE8', '#B2B0D9', '#9491CA', '#7672BB', '#5853AC', '#46428A', '#353267', '#232145', '#121122'],
                appBackground: ['#F7F8FE', '#F7F8FE', '#F7F8FE', '#F7F8FE', '#F7F8FE', '#F7F8FE', '#F7F8FE', '#F7F8FE', '#F7F8FE', '#F7F8FE'],
              },
              primaryColor: 'brand',
            }}
            withGlobalStyles
            withNormalizeCSS
          >
            <ModalsProvider>
              <NotificationsProvider position="top-right">
                <HeaderSimple
                  // user={{
                  //   name: 'Jane Spoonfighter',
                  //   email: 'janspoon@fighter.dev',
                  //   image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80',
                  // }}
                  links={[
                    { label: 'Search', link: 'search' },
                    { label: 'Social', link: 'social' },
                    { label: 'My Recipes', link: 'my-recipes' },
                    { label: 'Planner', link: 'planner' },
                    { label: 'Shopping List', link: 'list' },
                    { label: 'Venues', link: 'venues' },
                  ]}
                />
                <Component {...pageProps} />
              </NotificationsProvider>
            </ModalsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </UserContext.Provider>

      <Global
        styles={(theme) => ({
          '*, *::before, *::after': {
            boxSizing: 'border-box',
          },

          body: {
            ...theme.fn.fontStyles(),
            backgroundColor: theme.colors.gray[0],
          },
        })}
      />
    </>
  );
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie('mantine-color-scheme', ctx) || 'light',
});
