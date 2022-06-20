import React, { useEffect, useState } from 'react';
import { Tabs, useMantineTheme } from '@mantine/core';
import { Bookmark, Eye, Folders, Soup, Star, UserPlus } from 'tabler-icons-react';
import SearchBar from '../SearchBar/SearchBar';
import Collections from '../Collections/Collections';

interface UserRecipesProps {
    type?: 'saved' | 'cooked' | 'viewed' | 'reviewed' | 'created' | 'collections' | 'collection' | 'recipes';
    recipeCreatorId: string;
    creatorType?: 'user' | 'page' | 'venue'
    slideover?: boolean;
    chooseRecipe?: boolean;
    hideCollections?: boolean;
    collectionId?: string;
    hideTabs?: boolean;
    buttonText?: string;
    addRecipeToPlanner?: Function;
    selectMode?: boolean;
    selectedRecipes?: string[];
    selectRecipe?: Function;
}

export default function UserRecipes(props: UserRecipesProps) {
    const { type, recipeCreatorId, creatorType, slideover, chooseRecipe, hideCollections, collectionId, hideTabs, buttonText, addRecipeToPlanner, selectMode, selectedRecipes, selectRecipe } = props;
    const theme = useMantineTheme();

    const [activeTab, setActiveTab] = useState(1);

    const [userRecipeTypes, setUserRecipeTypes] = useState([
        {
            name: 'saved',
            href: '/my-recipes/saved',
            icon: <Bookmark size={16} />,
        },
        {
            name: 'cooked',
            href: '/my-recipes/cooked',
            icon: <Soup size={16} />,
        },
        {
            name: 'viewed',
            href: '/my-recipes/viewed',
            icon: <Eye size={16} />,
        },
        {
            name: 'reviewed',
            href: '/my-recipes/reviewed',
            icon: <Star size={16} />,
        },
        {
            name: 'created',
            href: '/my-recipes/created',
            icon: <UserPlus size={16} />,
        },

    ]);

    useEffect(() => {
        if (!hideCollections) {
            setUserRecipeTypes([...userRecipeTypes, {
                name: 'collections',
                href: '/my-recipes/collections',
                icon: <Folders size={16} />,
            }]);
        }
    }, [hideCollections]);

    return (
        <div>
            <Tabs active={activeTab} onTabChange={setActiveTab} color={theme.colors.brand[5]}>
                {userRecipeTypes.map((recipeType, index) => (
                    <Tabs.Tab key={index} label={recipeType.name} icon={recipeType.icon}>
                        {recipeType.name !== 'collections' ?
                            <SearchBar
                                placeholder={`Search your ${recipeType.name} recipes`}
                                userRecipeSearch
                                recipeCreatorId={recipeCreatorId}
                                userRecipeType={recipeType.name}
                                creatorType="user"
                                selectMode={selectMode}
                                selectRecipe={selectRecipe}
                                selectedRecipes={selectedRecipes}
                            /> : <Collections userId={recipeCreatorId} />
                        }
                    </Tabs.Tab>
                )
                )}
            </Tabs>

        </div>
    );
}
