const fs = require('fs');
const path = './src/data/simba_products.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const categoryImages = {
  "Fruits & Vegetables": ["1610832958506-aa56368176cf", "1560806887-1e4cd0b6cd6d", "1592924357228-91a4daadcfea", "1590865107670-35a96ead1757", "1603833665858-e81b1c7e4a7d"],
  "Cosmetics & Personal Care": ["1596462502278-27bfdc4033c8", "1608248543803-ba4f8c70ae0b", "1620916566398-39f1143ab7be", "1556228578-0d85b1a4d571"],
  "Kitchenware & Electronics": ["1556910103-1c02745aae4d", "1584269600464-37b1b58a9e04", "1590794055401-561b365b211d"],
  "Food Products": ["1506484334402-40ff22e0d3b6", "1587049352847-4d4b1f6d3eee", "1606923829579-0cb981a83e2e"],
  "Alcoholic Drinks": ["1597290282695-edc4310e7129", "1569529465615-e24c2edce3f6", "1516594798947-e6e1ba0c14a2"],
  "Baby Products": ["1555252333-9f8e92e65df9", "1519689680058-324335c77eba", "1544367567-0f2fcb009e0b"],
  "Sports & Wellness": ["1517836357463-d25dfeac3438", "1538805060514-97d9cc17730c"]
};

let i = 0;
data.products.forEach(p => {
  const images = categoryImages[p.category] || categoryImages["Food Products"];
  const imageId = images[i % images.length];
  p.image = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=800`;
  i++;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
