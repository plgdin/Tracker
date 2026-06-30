import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  "7C Baking Ingredients",
  "Aluminum Moulds",
  "Appliances Mixers",
  "Arife Wow Sale",
  "Bake & Serve",
  "Baking Ingredients",
  "Baking Tools & Accessories",
  "Piping Nozzles",
  "Brands",
  "Cake And Cupcake Stand",
  "Cake Base",
  "Cake Dummies",
  "Cake Toppers",
  "Chocolate And Cupcake Boxes",
  "Chocolate Wrappers",
  "Cutters",
  "Diwali Mould",
  "Diy Stamps Fondant Embosser",
  "Feather",
  "Festival Themes",
  "Knives And Spatula",
  "Kulfi Moulds",
  "Leafs And Flakes",
  "Non Edible Dust",
  "Non Stick Moulds",
  "Nylon Spoon",
  "Party Supplies",
  "Polycarbonate Moulds",
  "Pvc Mould",
  "Resin Arts",
  "Scraper",
  "Selfie Mirror",
  "Silicon Moulds",
  "Sprinklers And Candies",
  "Stencils",
  "Sticker",
  "Ultimakes"
];

const colors = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

async function seed() {
  console.log('Seeding categories to database...');
  
  for (let i = 0; i < categories.length; i++) {
    const name = categories[i];
    const color = colors[i % colors.length];
    
    // Using crypto.randomUUID() for valid UUID
    const id = crypto.randomUUID();
    
    try {
      const { data, error } = await supabase.from('categories').insert([{
        id,
        name,
        color,
        icon: 'Tag', // Generic icon
        created_at: new Date().toISOString()
      }]);
      
      if (error) {
        if (error.code === '23505') {
          console.log(`Category "${name}" already exists, skipping.`);
        } else {
          console.error(`Error inserting ${name}:`, error.message);
        }
      } else {
        console.log(`Successfully added category: ${name}`);
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  console.log('Finished seeding categories!');
}

seed();
