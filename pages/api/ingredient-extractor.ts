const axios = require('axios');

export default async function handler(req: any, res: any) {
  //   const { ingredient_input } = req.body;
  //   console.log("Ingredient input", ingredient_input);

  const response = await axios.post(
    'https://europe-west2-recipes-5f381.cloudfunctions.net/nutrition-calculator',
    req.body
  );

  console.log('Ingredient extractor req', response.data);
  res.json({ response: response.data });
}
