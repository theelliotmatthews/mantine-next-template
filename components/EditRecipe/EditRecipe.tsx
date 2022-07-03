import { useRouter } from 'next/router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Alert, Button, Card, Center, Checkbox, Group, Loader, NumberInput, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';

import { string } from 'zod';
import { AlertCircle, CircleCheck } from 'tabler-icons-react';
import { UserContext } from '../../lib/context';
import { fetchAllFollowing } from '../../lib/social';
import { IngredientGroup, Recipe, RecipeGroup, RecipeIngredient } from '../../lib/types';
import EditMethod from './EditMethod';
import { firestore, increment } from '../../lib/firebase';
import { DropdownSelect } from '../DropdownSelect/DropdownSelect';
import ImageUpload from '../ImageUpload/ImageUpload';
import PhotoContainer from '../PhotoContainer/PhotoContainer';
import EditIngredients from './EditIngredients';
import NutrientStats from '../NutrientStats/NutrientStats';
import { createNotification } from '../../lib/notifications';

const _ = require('lodash');
// import { EditIngredients } from './EditIngredients';

interface EditRecipeProps {
    editingRecipe?: Recipe
}

export default function EditRecipe(props: EditRecipeProps) {
    const { editingRecipe } = props;

    const { user } = useContext(UserContext);
    const router = useRouter()

    const [managedEntities, setManagedEntities] = useState([]);
    const [activeEntity, setActiveEntity] = useState(null);
    const [image, setImage] = useState('');
    const [cuisines, setCuisines] = useState([
        {
            name: 'Asian',
            type: 'cuisine',
            dbName: 'east_asian',
            active: false,
        },
        {
            name: 'Indian',
            type: 'cuisine',
            dbName: 'indian',
            active: false,
        },
        {
            name: 'Mexican',
            type: 'cuisine',
            dbName: 'mexican',
            active: false,
        },
        {
            name: 'Italian',
            type: 'cuisine',
            dbName: 'italian',
            active: false,
        },
        {
            name: 'Caribbean',
            type: 'cuisine',
            dbName: 'caribbean',
            active: false,
        },
        {
            name: 'European',
            type: 'cuisine',
            dbName: 'european',
            active: false,
        },
        {
            name: 'Middle Eastern',
            type: 'cuisine',
            dbName: 'middle_east',
            active: false,
        },
    ]);
    const [activeCuisine, setActiveCuisine] = useState();
    const [recipeType, setRecipeType] = useState('My own creation');
    const [recipeTypes, setRecipeTypes] = useState(['My own creation', 'From a cookbook', 'From a website']);
    const [privateRecipe, setPrivateRecipe] = useState(false);
    const [published, setPublished] = useState(false);
    const [iframePreview, setIframePreview] = useState('');
    const [calculatingNutrition, setCalculatingNutrition] = useState(false);
    const [nutrition, setNutrition] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    // METHOD STATE
    const [method, setMethod] = useState({
        // 1: { id: '1', instruction: 'Take out the garbage' },
        // 2: { id: '2', instruction: 'Watch my favorite show' },
        // 3: { id: '3', instruction: 'Charge my phone' },
        // 4: { id: '4', instruction: 'Cook dinner' },
        // 5: { id: '5', instruction: '<p>Cook for 2 minutes</p>', hours: 0, minutes: 2, seconds: 0, image: 'https://firebasestorage.googleapis.com/v0/b/recipes-5f381.appspot.com/o/recipes%2FY94mA4SsYg5fAWzmZZAcIV8LPfE4wn%2Frecipes%2FY94mA4SsYg5fAWzmZZAcIV8LPfE4wn?alt=media&token=1afcb8d8-8595-44a3-ab7e-aa5327ea4518', video: '' },
    });
    const [methodIds, setMethodIds] = useState([
        // '1', '2', '3', '4', '5',
    ]);

    // INGREDIENTS STATE
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
        { ingredient: 'soy sauce', id: '11', group: '2' },
        { ingredient: 'lime', id: '12', group: '2' },
        { ingredient: 'sugar', id: '13', group: '2' },
        { ingredient: 'tofu', id: '14', group: '3' },
        { ingredient: 'cornflour', id: '15', group: '3' },
        { ingredient: 'rice', id: '16', group: '4' },
        { ingredient: 'salt', id: '17', group: '4' },
    ]);
    const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([]);
    const [createSuccess, setCreateSuccess] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        setIngredientGroups([
            {
                id: '2',
                ingredients: [
                    '11',
                    '12',
                    '13',
                ],
                name: 'For the sauce',
            },
            {
                id: '3',
                ingredients: [
                    '14',
                    '15',
                ],
                name: 'For the tofu',
            },
            {
                id: '4',
                ingredients: [
                    '16',
                    '17',
                ],
                name: 'For the fried rice',
            },
            {
                id: uuidv4(),
                ingredients: [
                ],
                name: 'No group',
            },
        ]);
    }, []);

    const [draft, setDraft] = useState(true);
    const [servings, setServings] = useState(1);
    const [nutrients, setNutrients] = useState(null);
    const [recipe, setRecipe] = useState<Recipe | null>(editingRecipe || null);

    const form = useForm({
        initialValues: {
            title: '',
            description: '',
            image: '',
            servings: 1,
            hours: 0,
            minutes: 5,
            iframe: '',
            websiteSource: '',
            ingredients: [],
            ingredientGroups: [],
            method: {},
            methodIds: [],
            published: false,
            private: false,
            type: 'My own creation',
        },
    });

    // Fetch all entities that a user follows
    useEffect(() => {
        if (user) {
            const fetchUserData = async () => {
                const entities = await fetchAllFollowing(user.uid, true);
                setManagedEntities(entities);
                setActiveEntity(entities[0]);
            };

            fetchUserData();
        }
    }, [user]);

    const onSubmit = async (data: any) => {
        setShowErrors(true);

        let errors = false;
        for (const [key, value] of Object.entries(form.errors)) {
            if (form.errors[key] !== null) errors = true;
        }

        if (!errors) setShowErrors(false);
        console.log('Submitting new recipe data', data);
        console.log('Form values', form.values);
        // for (const group of data.ingredients) {
        //     if (group.ingredients.length > 0) ingredientsEmpty = false;
        // }

        // if (ingredientsEmpty) {
        //     setError('ingredients', {
        //         type: 'manual',
        //         message: 'You need at least 1 ingredient',
        //     });
        //     return;
        // }
        if (!data.ingredients || (data.ingredients.length === 0)) {
            form.setFieldError('ingredients', 'Please add at least 1 ingredient');
        }

        if (!data.methodIds || (data.methodIds.length === 0)) {
            form.setFieldError('method', 'Please add at least 1 instruction');
        }

        if (!data.title || (data.title.length < 5)) {
            form.setFieldError('title', 'Please add a title at least 5 characters long');
        }

        if (!data.description || (data.title.description < 5)) {
            form.setFieldError('description', 'Please add a description at least 5 characters long');
        }

        if (!data.image) {
            form.setFieldError('image', 'Please add an image');
        }

        if (data.hours === 0 && data.minutes === 0) {
            form.setFieldError('hours', 'Please add hours');
            form.setFieldError('minutes', 'Please add minutes');
        }

        console.log('Errors', form.errors);

        // Create ingredients map
        const ingredients_map = {};
        data.ingredients.forEach(ingredient => {
            const formatted = ingredient.ingredient.replace(' ', '_').toLowerCase();
            ingredients_map[formatted] = true;
        });

        // Create search terms
        const search_terms = {};
        const titleArray = data.title
            .replace(/['.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .toLowerCase()
            .split(' ');
        titleArray.forEach((word) => {
            if (word.length > 0) search_terms[word] = true;
        });

        // Select category / cuisine
        const categories = {};
        if (activeCuisine) {
            categories[activeCuisine.dbName] = true;
        }

        const totalMinutes = ((data.hours * 60) + data.minutes);

        let timeBoundary = 1;
        // Add time boundary
        if (totalMinutes < 30) {
            timeBoundary = 1;
        } else if (totalMinutes < 60) {
            timeBoundary = 2;
        } else {
            timeBoundary = 3;
        }

        console.log('Nutrition', nutrition);

        const updatedRecipe = {
            ...data,
            ingredients_map,
            categories,
            search_terms,
            sourceType: recipeType,
            entity: { type: activeEntity.type, id: activeEntity.id },
            nutrients: nutrition.nutrients, // Might need to change this to nutritionm per serving
            micronutrient_score: nutrition.micronutrient_score,
            private: false,
            published,
            time: totalMinutes,
            timeBoundary,
            v2: true,
            lastUpdated: new Date(),
            websiteSource: data.websiteSource ? data.websiteSource : '',
            //iframe: "",
            //title: "",
            // description: "",
            //image: null,
            //ingredients_formatted: [],
            //method: [],
            //servings: 1,
            //time: null,
            //collections: [],
            //source: null,
            //channel: null,
            //link: "",
        };

        console.log('Recipe to update', updatedRecipe);

        if (recipe) {
            // Edit using recipe.id
            await firestore.collection('all_recipes').doc(recipe.id).update(updatedRecipe);

            setRecipe(updatedRecipe);
            window.scrollTo(0, 0);
            setUpdateSuccess(true)
        } else {
            // Create new recipe

            updatedRecipe.created = new Date();

            if (updatedRecipe.entity.type !== 'user') {
                updatedRecipe.createdByEntity = { type: 'user', id: user.uid };
            }

            const res = await firestore.collection('all_recipes').add(updatedRecipe);
            setRecipe({
                ...updatedRecipe,
                id: res.id,
            });
            // Update user recipe count
            await firestore.collection('profiles').doc(user.uid).update({
                count: increment(1),
            });

            // Send notifications to friends
            await createNotification(res.id, activeEntity.id, activeEntity.type, null, null, null, null, null)

            router.push(`/recipes/${res.id}`);
        }

        // const pageId = await updatePage(page ? page.id : null, data, user.uid)
        // router.push({
        //     pathname: '/pages/[pid]',
        //     query: { pid: page ? page.id : pageId }
        // })
    };

    useEffect(() => {
        if (recipe && managedEntities) {
            console.log('Yes editing recipe', editingRecipe);

            form.setValues(recipe);
            // console.log('Yes editing recipe copied into recipe', recipe)
            // console.log('Yes managedEntities', managedEntities)
            // Zof form values
            // form.setFieldValue('title', recipe.title,);

            // form.setFieldValue('description', recipe.description,);

            // form.setFieldValue('image', recipe.image,);

            // setImage(recipe.image);

            // form.setFieldValue('servings', recipe.servings,);

            // form.setFieldValue('hours', recipe.hours,);

            // form.setFieldValue('minutes', recipe.minutes,);

            // // form.setFieldValue('ingredients', recipe.ingredients,);

            // // form.setFieldValue('ingredientGroups', recipe.ingredientGroups,);

            // // form.setFieldValue('method', recipe.method,);

            // form.setFieldValue('iframe', recipe.iframe,);

            // form.setFieldValue('websiteSource', recipe.websiteSource,);

            // Other state values

            // Work out the selected entity by the ID and type
            const selectedEntity = managedEntities.find(x => (x.id === recipe.entity.id) && (x.type === recipe.entity.type));
            setActiveEntity(selectedEntity);

            // Get the category / cuisine by the DB Name
            if (recipe.categories) {
                for (const [key, value] of Object.entries(recipe.categories)) {
                    const selectedCuisine = cuisines.find(x => x.dbName === key);
                    setActiveCuisine(selectedCuisine);
                }
            }

            // Recipe type
            setRecipeType(recipe.sourceType);

            // Published
            setPublished(recipe.published);
            setServings(recipe.servings);
            setIngredients(recipe.ingredients);
            setIngredientGroups(recipe.ingredientGroups);
            setNutrients(recipe.nutrients);
            setMethod(recipe.method);

            // clearErrors();
        } else {
            // Set defaults
            form.setFieldValue('servings', 1);
        }
    }, [recipe, managedEntities]);

    useEffect(() => {
        if (form.values.iframe) {
            // Check for TikTok
            if (form.values.iframe.includes('cite="https://www.tiktok.com')) {
                //
                setIframePreview(
                    `<iframe src="https://www.tiktok.com/embed/${form.values.iframe.split('/video/')[1].split('"')[0]}"
                  style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;"
                  allowfullscreen
                  scrolling="no"
                  allow="encrypted-media;"
                ></iframe>`);
            } else {
                setIframePreview(form.values.iframe);
            }
        } else {
            setIframePreview('');
        }
    }, [form.values.iframe]);

    const updateImage = (url) => {
        form.setFieldValue('image', url,);
        setImage(url);
    };

    function createMarkup() {
        return { __html: iframePreview };
    }

    const matchEntity = (input: { label: string, image: string, id: string }) => {
        const matched = managedEntities.find(x => x.id === input.id);
        setActiveEntity(matched);
    };

    const debounce_fun = useCallback(_.debounce(async (servings: number, ingredients: RecipeIngredient[]) => {
        setCalculatingNutrition(true);
        let s = '';

        ingredients.forEach(ingredient => {
            s += `${ingredient.quantity ? ingredient.quantity : ''} ${ingredient.unit ? ingredient.unit : ''} ${ingredient.ingredient}, `;
        });

        console.log('Fetch nutrition servings:', servings, ingredients);

        await fetch('/api/ingredient-extractor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ ingredient_input: s, servings }),
        })
            .then(async (response) => {
                const res = await response.json();
                console.log('Res from nutrition extractor', res.response);
                setNutrition(res.response.nutrition_data);
                // console.log('Selected group: ', JSON.stringify(selectedGroup));
                // addIngredients(res.response.ingredients_formatted, selectedGroup);
            })
            .catch((error) => {
                console.error('Error:', error);
                setNutrition({});
            });

        setCalculatingNutrition(false);
    }, 1000), []);

    // Listen for change in ingredients, run script to calculate nutrition
    useEffect(() => {
        console.log('Ingredients changing', ingredients);
        // _.debounce(fetchNutrition(), 1000)

        debounce_fun(form.values.servings, ingredients);
    }, [ingredients, form.values.servings]);

    // List for any changes in ingredients or method
    useEffect(() => {
        form.setValues({
            ...form.values,
            ingredients,
            ingredientGroups,
            method,
            methodIds,
        });
    }, [ingredients, ingredientGroups, method, methodIds]);

    return (
        <div className="space-y-6">
            <div>
                <h1>Create your recipe</h1>

                {/* <pre>{JSON.stringify(form.values, null, 2)}</pre> */}
                {/* <pre>{JSON.stringify(nutrition.nutrition_per_serving, null, 2)}</pre> */}

                {/* <EditIngredients /> */}
                {/* {JSON.stringify(method, null, 2)} */}
                {/* <EditIngredients
                    updateIngredients={updateIngredients}
                    servings={servings}
                    setRecipeNutrients={setNutrients}
                    existingIngredients={ingredients}
                    existingIngredientGroups={ingredientGroups}
                /> */}
                {/* <p className="text-red-600">{errors.ingredients?.message && errors.ingredients?.message}</p> */}

                {/* <EditMethod updateMethod={updateMethod} existingMethod={method} /> */}
                {/* <p className="text-red-600">{errors.method?.message && errors.method?.message}</p> */}

                {/* <CreateRecipeIngredients /> */}

                <form onSubmit={form.onSubmit(onSubmit)} className="space-y-6">
                    <Stack>
                        <Alert icon={<CircleCheck size={16} />} title="Recipe updated" color="green">
                            Your new changes should now show
                        </Alert>

                        {managedEntities ?
                            <DropdownSelect
                                options={managedEntities.map((entity) => ({ label: entity.name, image: entity.image, id: entity.id }))}
                                // selected={activeEntity}
                                select={matchEntity}
                            // side="left"
                            // entity
                            /> : null}
                        {/* Cover photo */}

                        <div className="relative">
                            <Text size="sm">Cover photo</Text>

                            {!image ? <ImageUpload setUrl={updateImage} id={1} /> : <PhotoContainer photo={image} removePhoto={() => setImage('')} />}
                        </div>
                        {/* <p className="text-red-600">{errors.image?.message && errors.image?.message}</p> */}

                        <TextInput label="Title" {...form.getInputProps('title')} type="text" />
                        <Textarea label="Description" {...form.getInputProps('description')} />

                        <Text size="sm">Select cuisine</Text>
                        <Group>
                            {cuisines.map((cuisine, index) => (
                                <Button
                                    key={index}
                                    onClick={() => activeCuisine !== cuisine ? setActiveCuisine(cuisine) : setActiveCuisine('')}
                                    variant={activeCuisine && (activeCuisine.name === cuisine.name) ? 'filled' : 'light'}
                                >{cuisine.name}
                                </Button>)
                            )}
                        </Group>

                        <Checkbox {...form.getInputProps('published', { type: 'checkbox' })} label="Publish recipe" />
                        <Checkbox {...form.getInputProps('private', { type: 'checkbox' })} label="Keep this recipe private" />

                        <Select {...form.getInputProps('type')} data={recipeTypes.map((type) => ({ value: type, label: type }))} label="Recipe type" />
                        {recipeType === 'From a website' && <TextInput label="Website source URL" {...form.getInputProps('websiteSource')} type="text" />}
                        {recipeType === 'From a cookbook' && <div className="bg-primary-light">Recipes you upload from cookbooks will not be available publicly as they contain copyrighted content.</div>}

                        <Group grow align="start">
                            <NumberInput label="Servings" {...form.getInputProps('servings')} min={1} precision={0} />
                            <NumberInput label="hours" {...form.getInputProps('hours')} min={0} precision={0} />
                            <NumberInput label="minutes" {...form.getInputProps('minutes')} min={0} max={59} precision={0} />
                        </Group>

                        <Textarea label="Embed an iFrame" {...form.getInputProps('iframe')} placeholder="Paste your embed code here" />

                        {iframePreview &&
                            <>
                                {
                                    iframePreview.includes('tiktok') ?
                                        <div className="w-96">
                                            <div style={{ left: '0px', width: '100%', height: '0px', position: 'relative', paddingBottom: '177.778%', paddingTop: '120px' }} className="overflow-hidden" dangerouslySetInnerHTML={createMarkup()} />
                                        </div>
                                        :

                                        iframePreview.includes('youtube') ?
                                            <div className="embed_container">
                                                <div style={{ left: '0px', width: '100%', height: '0px', position: 'relative', paddingBottom: '177.778%', paddingTop: '120px' }} className="overflow-hidden">
                                                    <iframe width="560" height="315" src="https://www.youtube.com/embed/2LGPDCWDWBw" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                                                </div>
                                            </div>

                                            :
                                            <div className="embed_container" dangerouslySetInnerHTML={createMarkup()} />
                                }
                            </>
                        }

                        <EditIngredients
                            ingredients={ingredients}
                            setIngredients={setIngredients}
                            ingredientGroups={ingredientGroups}
                            setIngredientGroups={setIngredientGroups}
                        >
                            {calculatingNutrition ?
                                <Center>
                                    <Loader />
                                </Center> :
                                <>
                                    {nutrition.nutrients &&
                                        <Card withBorder>
                                            <NutrientStats
                                                recipes={[{
                                                    micronutrient_score: nutrition.score,
                                                    nutrients: nutrition.nutrients,
                                                    servings: form.values.servings,
                                                    servingsAdjusted: form.values.servings,
                                                    ingredients_formatted: ingredients,
                                                }]}
                                                recipePage
                                                servings={form.values.servings}
                                                hideAdjustServings
                                            />
                                        </Card>
                                    }
                                </>}

                        </EditIngredients>

                        <EditMethod method={method} methodIds={methodIds} setMethod={setMethod} setMethodIds={setMethodIds} ingredients={ingredients} />

                        {showErrors && (
                            <Alert icon={<AlertCircle size={16} />} title="Errors!" color="red">
                                Please fix the following errors
                                <ul>
                                    {Object.keys(form.errors).map((key: string) => {
                                        if (form.errors[key] !== null) {
                                            return <li>{form.errors[key]}</li>;
                                        }
                                    })}
                                </ul>
                            </Alert>)}

                        <div>
                            <Button type="submit" disabled={!form.errors}>{recipe ? 'Update page' : 'Create recipe'}</Button>
                        </div>

                        {/* <pre>{JSON.stringify(form.errors, null, 2)}</pre> */}
                    </Stack>
                </form>

            </div>
        </div>
    );
}
