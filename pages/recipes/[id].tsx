import { firestore } from '../../lib/firebase';
import { getRecipeById } from '../../lib/recipes/recipes';
import { Recipe } from '../../lib/types';

export async function getStaticProps({ params }: { params: any }) {
    const { id } = params;

    const recipe = await getRecipeById(id);

    if (!recipe) {
        return {
            notFound: true,
        };
    }

    return {
        props: { recipe: JSON.parse(JSON.stringify(recipe)) },
        revalidate: 100,
    };
}

export async function getStaticPaths() {
    // Improve my using Admin SDK to select empty docs
    const snapshot = await firestore.collection('all_recipes').limit(1).get();

    const paths = snapshot.docs.map((doc) => {
        const { id } = doc;
        return {
            params: { id },
        };
    });

    return {
        // must be in this format:
        // paths: [
        //   { params: { username, slug }}
        // ],
        paths,
        fallback: 'blocking',
    };
}

export default function Recipe(props: { recipe: Recipe }) {
    const { recipe } = props;

    return (
        <div>

        </div>
    );
}
