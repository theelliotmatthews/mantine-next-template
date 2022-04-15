import { createContext } from 'react';

export const UserContext: any = createContext({
  user: null,
  username: null,
  signInMethod: null,
  activePlans: [],
  status: null,
});

// export const ModalContext = createContext({
//   show: false,
//   type: null,
//   data: null,
//   showModal: (type, data, onComplete) => {},
//   hideModal: (refresh) => {},
//   onComplete: () => {},
//   refresh: 0,
// });

// export const SlideoverContext = createContext({
//   show: false,
//   type: null,
//   showSlideover: (type, data) => {},
//   hideSlideover: () => {},
//   action: (recipe, type, data, uid) => {},
//   refreshSlideover: () => {},
//   refreshCount: 0,
//   data: {},
// });

// export const CalculatorRecipes = createContext({
//   recipes: [],
//   addRecipe: (recipe) => {},
//   removeRecipe: (recipe) => {},
//   emptyRecipes: () => {},
//   changeRecipeServings: (recipe, newServings, recipes) => {},
// });
