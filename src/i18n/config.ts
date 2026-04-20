import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      search: "Search for products...",
      myCart: "My Cart",
      allCategories: "All Categories",
      home: "Home",
      shop: "Shop",
      about: "About",
      contact: "Contact",
      addToCart: "Add to Cart",
      checkout: "Checkout",
      emptyCart: "Your cart is empty",
      total: "Total",
      payWithMomo: "Pay with MoMo",
      momoPhone: "MoMo Phone Number",
      placeOrder: "Place Order",
      orderSuccess: "Order placed successfully!",
      paymentPending: "Please check your phone to approve the MoMo prompt.",
      priceRwf: "{{price}} RWF",
      newArrivals: "New Arrivals",
      popularProducts: "Popular Products",
      supermarket: "Supermarket"
    }
  },
  fr: {
    translation: {
      search: "Rechercher des produits...",
      myCart: "Mon Panier",
      allCategories: "Toutes les Catégories",
      home: "Accueil",
      shop: "Boutique",
      about: "À propos",
      contact: "Contact",
      addToCart: "Ajouter au Panier",
      checkout: "Payer",
      emptyCart: "Votre panier est vide",
      total: "Total",
      payWithMomo: "Payer avec MoMo",
      momoPhone: "Numéro de téléphone MoMo",
      placeOrder: "Passer la Commande",
      orderSuccess: "Commande passée avec succès !",
      paymentPending: "Veuillez vérifier votre téléphone pour approuver l'invite MoMo.",
      priceRwf: "{{price}} FRW",
      newArrivals: "Nouveautés",
      popularProducts: "Produits Populaires",
      supermarket: "Supermarché"
    }
  },
  rw: {
    translation: {
      search: "Shakisha ibicuruzwa...",
      myCart: "Akagare kanjye",
      allCategories: "Ibyiciro byose",
      home: "Ahabanza",
      shop: "Gura",
      about: "Abo Turi Bo",
      contact: "Twandikire",
      addToCart: "Ongeramo",
      checkout: "Ishyura",
      emptyCart: "Akagare kawe nti karimo ikintu",
      total: "Igiteranyo",
      payWithMomo: "Ishyura na MoMo",
      momoPhone: "Numero ya MoMo",
      placeOrder: "Emeza",
      orderSuccess: "Kugura byagenze neza!",
      paymentPending: "Reba muri telefone yawe wemeze kwishyura kuri MoMo.",
      priceRwf: "{{price}} RWF",
      newArrivals: "Ibishya",
      popularProducts: "Ibicuruzwa Bikunzwe",
      supermarket: "Supermarket"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
