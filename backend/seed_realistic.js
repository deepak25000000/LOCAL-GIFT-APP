const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ═══════════════════════════════════════════════════════════════
// 15 Unique Realistic Owners with proper Indian names and emails
// ═══════════════════════════════════════════════════════════════
const owners = [
    { id: "owner_aarav_sharma", name: "Aarav Sharma", email: "aarav.sharma@gmail.com" },
    { id: "owner_priya_kapoor", name: "Priya Kapoor", email: "priya.kapoor@outlook.com" },
    { id: "owner_rohan_mehta", name: "Rohan Mehta", email: "rohan.mehta@yahoo.com" },
    { id: "owner_ananya_gupta", name: "Ananya Gupta", email: "ananya.gupta@gmail.com" },
    { id: "owner_vikram_singh", name: "Vikram Singh", email: "vikram.singh@hotmail.com" },
    { id: "owner_sneha_joshi", name: "Sneha Joshi", email: "sneha.joshi@gmail.com" },
    { id: "owner_arjun_patel", name: "Arjun Patel", email: "arjun.patel@yahoo.com" },
    { id: "owner_kavya_reddy", name: "Kavya Reddy", email: "kavya.reddy@outlook.com" },
    { id: "owner_rahul_verma", name: "Rahul Verma", email: "rahul.verma@gmail.com" },
    { id: "owner_meera_iyer", name: "Meera Iyer", email: "meera.iyer@protonmail.com" },
    { id: "owner_deepika_nair", name: "Deepika Nair", email: "deepika.nair@gmail.com" },
    { id: "owner_karthik_menon", name: "Karthik Menon", email: "karthik.menon@yahoo.com" },
    { id: "owner_ritu_das", name: "Ritu Das", email: "ritu.das@gmail.com" },
    { id: "owner_sanjay_bose", name: "Sanjay Bose", email: "sanjay.bose@outlook.com" },
    { id: "owner_nisha_rao", name: "Nisha Rao", email: "nisha.rao@gmail.com" },
];

// ═══════════════════════════════════════════════════════════════
// 12 Indian Cities — each with 6 distinct area locations
// ═══════════════════════════════════════════════════════════════
const cities = {
    "New Delhi": [
        { lat: 28.6139, lng: 77.2090, area: "Connaught Place" },
        { lat: 28.5244, lng: 77.1855, area: "Hauz Khas" },
        { lat: 28.6304, lng: 77.2177, area: "Chandni Chowk" },
        { lat: 28.5535, lng: 77.2588, area: "Lajpat Nagar" },
        { lat: 28.5921, lng: 77.2195, area: "Lodhi Colony" },
        { lat: 28.6508, lng: 77.2324, area: "Civil Lines" },
    ],
    "Mumbai": [
        { lat: 19.0760, lng: 72.8777, area: "Churchgate" },
        { lat: 19.0178, lng: 72.8478, area: "Bandra West" },
        { lat: 19.1136, lng: 72.8697, area: "Andheri" },
        { lat: 18.9220, lng: 72.8347, area: "Colaba" },
        { lat: 19.0596, lng: 72.8295, area: "Dadar" },
        { lat: 19.1334, lng: 72.9133, area: "Powai" },
    ],
    "Pune": [
        { lat: 18.5204, lng: 73.8567, area: "Shivajinagar" },
        { lat: 18.5074, lng: 73.8077, area: "Kothrud" },
        { lat: 18.5308, lng: 73.8475, area: "Deccan Gymkhana" },
        { lat: 18.5590, lng: 73.7868, area: "Hinjewadi" },
        { lat: 18.4879, lng: 73.8137, area: "Sinhagad Road" },
        { lat: 18.5612, lng: 73.9170, area: "Viman Nagar" },
    ],
    "Bangalore": [
        { lat: 12.9716, lng: 77.5946, area: "MG Road" },
        { lat: 12.9352, lng: 77.6245, area: "Koramangala" },
        { lat: 13.0358, lng: 77.5970, area: "Hebbal" },
        { lat: 12.9698, lng: 77.7500, area: "Whitefield" },
        { lat: 12.9141, lng: 77.6411, area: "HSR Layout" },
        { lat: 12.9780, lng: 77.5710, area: "Rajajinagar" },
    ],
    "Hyderabad": [
        { lat: 17.3850, lng: 78.4867, area: "Banjara Hills" },
        { lat: 17.4400, lng: 78.3489, area: "HITEC City" },
        { lat: 17.3616, lng: 78.4747, area: "Charminar" },
        { lat: 17.4260, lng: 78.4488, area: "Begumpet" },
        { lat: 17.4156, lng: 78.4347, area: "Ameerpet" },
        { lat: 17.4504, lng: 78.3807, area: "Madhapur" },
    ],
    "Chennai": [
        { lat: 13.0827, lng: 80.2707, area: "T. Nagar" },
        { lat: 13.0569, lng: 80.2425, area: "Adyar" },
        { lat: 13.0878, lng: 80.2785, area: "Mylapore" },
        { lat: 12.9941, lng: 80.2152, area: "Velachery" },
        { lat: 13.1067, lng: 80.2206, area: "Nungambakkam" },
        { lat: 13.0480, lng: 80.2090, area: "Guindy" },
    ],
    "Kolkata": [
        { lat: 22.5726, lng: 88.3639, area: "Park Street" },
        { lat: 22.5183, lng: 88.3585, area: "Ballygunge" },
        { lat: 22.5475, lng: 88.3517, area: "Esplanade" },
        { lat: 22.5024, lng: 88.3931, area: "Jadavpur" },
        { lat: 22.5958, lng: 88.3702, area: "Shyambazar" },
        { lat: 22.5646, lng: 88.3907, area: "Salt Lake" },
    ],
    "Jaipur": [
        { lat: 26.9124, lng: 75.7873, area: "MI Road" },
        { lat: 26.9260, lng: 75.8235, area: "Johari Bazaar" },
        { lat: 26.8986, lng: 75.7618, area: "Vaishali Nagar" },
        { lat: 26.9425, lng: 75.7937, area: "Raja Park" },
        { lat: 26.8830, lng: 75.7857, area: "Mansarovar" },
        { lat: 26.9510, lng: 75.7230, area: "Jhotwara" },
    ],
    "Ahmedabad": [
        { lat: 23.0225, lng: 72.5714, area: "CG Road" },
        { lat: 23.0300, lng: 72.5113, area: "Satellite" },
        { lat: 23.0469, lng: 72.5317, area: "Navrangpura" },
        { lat: 23.0639, lng: 72.5349, area: "Shahibaug" },
        { lat: 23.0125, lng: 72.5110, area: "Vastrapur" },
        { lat: 22.9924, lng: 72.4990, area: "Bopal" },
    ],
    "Lucknow": [
        { lat: 26.8467, lng: 80.9462, area: "Hazratganj" },
        { lat: 26.8600, lng: 80.9115, area: "Gomti Nagar" },
        { lat: 26.8389, lng: 80.9340, area: "Aminabad" },
        { lat: 26.8726, lng: 80.9424, area: "Indira Nagar" },
        { lat: 26.8150, lng: 80.9195, area: "Aliganj" },
        { lat: 26.8950, lng: 80.9530, area: "Chinhat" },
    ],
    "Chandigarh": [
        { lat: 30.7333, lng: 76.7794, area: "Sector 17" },
        { lat: 30.7421, lng: 76.7681, area: "Sector 22" },
        { lat: 30.7080, lng: 76.8000, area: "Sector 35" },
        { lat: 30.7600, lng: 76.7675, area: "Sector 8" },
        { lat: 30.7274, lng: 76.8072, area: "Sector 43" },
        { lat: 30.6956, lng: 76.7718, area: "Sector 44" },
    ],
    "Kochi": [
        { lat: 9.9312, lng: 76.2673, area: "Fort Kochi" },
        { lat: 10.0159, lng: 76.3086, area: "Edappally" },
        { lat: 9.9816, lng: 76.2999, area: "MG Road Kochi" },
        { lat: 10.0271, lng: 76.3085, area: "Aluva" },
        { lat: 9.9520, lng: 76.2670, area: "Mattancherry" },
        { lat: 10.0000, lng: 76.3000, area: "Kaloor" },
    ],
};

// ═══════════════════════════════════════════════════════════════
// Items per city — 6 unique items for each of the 12 cities
// ═══════════════════════════════════════════════════════════════
const cityItems = {
    "New Delhi": [
        { title: "Vintage Leather Chesterfield Sofa", description: "Beautiful classic brown leather sofa from the late 90s. Minor wear on the left armrest but the overall structure is solid and surprisingly comfortable. Would love this to go to someone who appreciates vintage furniture.", category: "Furniture", condition: "Good", imgId: 1005 },
        { title: "Sony A7III Mirrorless Camera Body", description: "Used this primarily for studio portrait work over the past three years. Shutter count is around 40k. Selling all my Sony gear to switch to medium format.", category: "Electronics", condition: "Good", imgId: 1009 },
        { title: "Apple MacBook Air M1 — 256GB", description: "Factory reset. Battery health is still at 88% after two years of daily use. There is one tiny dead pixel in the bottom-right corner. Upgrading to M3.", category: "Electronics", condition: "Like New", imgId: 1 },
        { title: "Fender Stratocaster Guitar 2015", description: "My first real guitar that served me through countless jam sessions. The rosewood fretboard has beautiful patina. Electronics are solid — all three pickups work perfectly.", category: "Hobbies & Tools", condition: "Fair", imgId: 96 },
        { title: "Breville Barista Express Espresso", description: "This machine has pulled over a thousand shots. The built-in grinder still works great. Missing the single-shot filter basket but the double works perfectly.", category: "Appliances", condition: "Good", imgId: 225 },
        { title: "KitchenAid Artisan Stand Mixer", description: "The iconic cobalt blue model that has been the heart of my baking adventures for six years. The motor runs a bit loud on speed 8 and above. Comes with paddle attachment and whisk.", category: "Appliances", condition: "Fair", imgId: 292 },
    ],
    "Mumbai": [
        { title: "Bose QC45 Noise Cancelling Headphones", description: "The noise cancellation is world-class. The earpads have some wear but replacements are cheap on Amazon. Perfect for the Mumbai local commute.", category: "Electronics", condition: "Good", imgId: 577 },
        { title: "Mahogany Bookshelf — Wall-Mounted", description: "Custom-made by a Bandra carpenter. Five shelves, solid mahogany wood. Had it on a wall for 4 years. A few brackets need replacing. Beautiful grain pattern.", category: "Furniture", condition: "Good", imgId: 1055 },
        { title: "Canon EOS R50 with Kit Lens", description: "Used for street photography in Mumbai for two years. Minor scuffs on the body. The kit lens has a slight focusing issue on the wide end. Great for beginners.", category: "Electronics", condition: "Fair", imgId: 1009 },
        { title: "Complete Harry Potter Box Set", description: "All seven books in their Bloomsbury UK hardcover editions. Read twice. Books 1 and 4 have slightly torn dust jackets. Actual hardcovers are in excellent condition.", category: "Books & Media", condition: "Good", imgId: 24 },
        { title: "Coleman 4-Person Camping Tent", description: "Took this on three camping trips to Lonavala and Alibaug. One fiberglass pole was repaired with tape but holds fine. Tent body is completely waterproof.", category: "Sports & Fitness", condition: "Good", imgId: 540 },
        { title: "Ray-Ban Aviator Sunglasses Gold", description: "Classic gold frame with green G-15 lenses. Purchased from Ray-Ban store in Phoenix Marketcity. Hairline scratch on the right lens only visible in bright light.", category: "Clothing", condition: "Good", imgId: 883 },
    ],
    "Pune": [
        { title: "Trek Marlin 5 Mountain Bike", description: "2021 model in teal color. Used extensively around Sinhagad and Lavasa trails. Needs a professional tune-up — chain needs lubing, brake pads worn. Frame and components are solid.", category: "Sports & Fitness", condition: "Good", imgId: 628 },
        { title: "Samsung 50-inch Crystal 4K Smart TV", description: "Gorgeous 4K display with vibrant HDR colors. Runs Tizen OS smoothly. One of four HDMI ports stopped working after a monsoon power surge. Remote missing back cover.", category: "Electronics", condition: "Good", imgId: 335 },
        { title: "Instant Pot Duo 7-in-1 — 6 Quart", description: "Single-handedly got me through three years of hostel cooking in Pune. All components work perfectly. The silicone ring has absorbed the aroma of famous Pune misal pav.", category: "Appliances", condition: "Good", imgId: 312 },
        { title: "Logitech MX Master 3 Wireless Mouse", description: "Most comfortable mouse I have ever used. The ergonomic shape cured my wrist pain from coding marathons at Hinjewadi IT Park. Occasionally phantom-scrolls backwards.", category: "Electronics", condition: "Good", imgId: 550 },
        { title: "Monstera Deliciosa — Large Potted", description: "Magnificent Monstera that thrived in Pune weather for four years. In a 12-inch terracotta pot. Needs bright indirect light and weekly watering. Moving to a smaller flat.", category: "Home & Garden", condition: "New", imgId: 1073 },
        { title: "Handmade Ceramic Dinnerware Set of 4", description: "Artisan plates and bowls from a Pune pottery studio. Blue-green glazing with gorgeous variations. Missing one dessert bowl. Two dinner plates have minor rim chips.", category: "Home & Garden", condition: "Good", imgId: 433 },
    ],
    "Bangalore": [
        { title: "iPad Pro 11-inch 2020 + Apple Pencil", description: "Display is gorgeous — perfect for digital art and note-taking. Hairline crack near top bezel from a fall but does not affect touch or display at all. Apple Pencil 2nd gen works perfectly.", category: "Electronics", condition: "Good", imgId: 160 },
        { title: "Rust Programming Books Bundle", description: "The Rust Programming Language, Programming Rust 2nd Edition, and Rust in Action. Read once during a career switch at a Whitefield startup. Pages are crisp and annotations in pencil.", category: "Books & Media", condition: "Like New", imgId: 24 },
        { title: "Electric Standing Desk Frame Black", description: "Dual-motor sit/stand desk frame used at home office in HSR Layout. Smoothly transitions heights with programmable memory presets. No tabletop included. Some scratches from moving.", category: "Furniture", condition: "Good", imgId: 1044 },
        { title: "Dyson V8 Absolute Cordless Vacuum", description: "Suction is still powerful after three years. Battery holds about 15 minutes now (originally 40). Replacement batteries available for around Rs.2500. All original attachments included.", category: "Appliances", condition: "Fair", imgId: 870 },
        { title: "Meta Quest 2 VR Headset 64GB", description: "Lenses are scratch-free thanks to prescription inserts I used. Comes with upgraded Elite head strap. Battery life has degraded to about 45 minutes from original 2 hours.", category: "Electronics", condition: "Good", imgId: 577 },
        { title: "Lululemon Reversible Yoga Mat + Blocks", description: "Premium 5mm yoga mat in purple/grey with two cork blocks. The underside has some discoloration but the practice surface is clean and grippy. Great for daily yoga practice.", category: "Sports & Fitness", condition: "Good", imgId: 790 },
    ],
    "Hyderabad": [
        { title: "PlayStation 5 Disc Edition 825GB", description: "Perfect condition, used primarily for weekend gaming. Includes one DualSense controller and Horizon Forbidden West disc. Moving abroad and cannot carry it.", category: "Electronics", condition: "Like New", imgId: 335 },
        { title: "Rustic Oak Dining Table — Seats 6", description: "Solid oak dining table that comfortably seats six. Some coffee rings and light scratches on the surface. Nothing a weekend sanding project would not fix.", category: "Furniture", condition: "Fair", imgId: 1076 },
        { title: "Gaggia Classic Pro Espresso Machine", description: "Legendary in the home espresso community. Pulls consistently excellent shots. Needs a new group head gasket (Rs.600 part). Steam wand froths milk beautifully.", category: "Appliances", condition: "Good", imgId: 225 },
        { title: "Asimov Sci-Fi Novel Collection", description: "Twenty classic science fiction novels including Foundation trilogy, Childhood's End, and Rendezvous with Rama. Paperback editions with creased spines but every page is intact.", category: "Books & Media", condition: "Good", imgId: 24 },
        { title: "Rubber Hex Dumbbell Set 5/10/15 lb", description: "Three pairs of rubber-coated hex dumbbells from my home gym days in HITEC City apartment. The 10-pounders rubber is peeling slightly. Perfect starter set for home workouts.", category: "Sports & Fitness", condition: "Good", imgId: 866 },
        { title: "Large Abstract Canvas Blue and Gold", description: "Striking 36x48 inch abstract composition in deep navy and metallic gold leaf. Purchased from a Hyderabad artist. Small scuff on frame but canvas itself is pristine.", category: "Home & Garden", condition: "Good", imgId: 1029 },
    ],
    "Chennai": [
        { title: "Royal Enfield Classic 350 Accessories", description: "Leather saddlebag, crash guard, and visor set from my Classic 350. Upgrading to a Himalayan so these are up for grabs. All in excellent condition, barely used for 6 months.", category: "Other", condition: "Like New", imgId: 628 },
        { title: "Yamaha PSR-E373 Digital Keyboard", description: "61-key keyboard bought to learn piano. Includes original stand and sustain pedal. Power adapter connection is slightly loose — needs a wiggle to charge but works perfectly once connected.", category: "Hobbies & Tools", condition: "Good", imgId: 453 },
        { title: "Mid-Century Mustard Velvet Chair", description: "Gorgeous mustard yellow velvet accent chair with walnut legs. One area on the back where my cat used it as a scratching post. Structurally perfect and very comfortable.", category: "Furniture", condition: "Fair", imgId: 1040 },
        { title: "Women Brown Leather Riding Boots", description: "Size US 8 in chestnut brown genuine leather. Got me through three winters with a beautiful developed patina. Soles have plenty of tread left. Some toe cap scuffing adds character.", category: "Clothing", condition: "Good", imgId: 669 },
        { title: "Architecture Coffee Table Books Set", description: "Five massive hardcover coffee table books covering Tadao Ando and Steve McCurry. Each book weighs 2-3 kg. Spines are tight, pages crisp — displayed more than read.", category: "Books & Media", condition: "Like New", imgId: 24 },
        { title: "Casper Queen Memory Foam Mattress", description: "Three-layer memory foam mattress used with a waterproof protector since day one. No stains, impressions, or sagging. Heavy — need a truck for pickup. Best sleep I ever had.", category: "Furniture", condition: "Like New", imgId: 913 },
    ],
    "Kolkata": [
        { title: "Vintage Kolkata Art Print Collection", description: "Set of 8 framed prints depicting old Kolkata — Howrah Bridge, Victoria Memorial, College Street. Hand-printed on archival paper by a Kumartuli artist. Frames have minor chips.", category: "Home & Garden", condition: "Good", imgId: 1029 },
        { title: "Pearl Export Acoustic Drum Kit", description: "Full-sized five-piece drum kit from my college band days. Missing hi-hat stand and crash cymbal. Drum skins need replacing. Shells produce a warm, punchy tone. Very heavy!", category: "Hobbies & Tools", condition: "Good", imgId: 731 },
        { title: "Nokia 2720 Flip Phone — New", description: "Sealed box Nokia flip phone. Bought as backup during WFH but never opened it. Perfect for someone who wants a distraction-free phone or a gift for elderly parents.", category: "Electronics", condition: "New", imgId: 1 },
        { title: "Crate of Vinyl Records 70s/80s Rock", description: "Around forty 12-inch vinyl records — Led Zeppelin IV, Fleetwood Mac Rumours, and Talking Heads. Album covers show decades of wear but records play beautifully.", category: "Books & Media", condition: "Fair", imgId: 145 },
        { title: "The North Face Thermoball Jacket L", description: "Men's Large in matte black. Got me through two harsh Darjeeling winters. Main zipper sticks near chin guard — candle wax on the teeth fixes it instantly.", category: "Clothing", condition: "Good", imgId: 399 },
        { title: "Vintage Copper Cooking Pans Set of 3", description: "Heavy-gauge copper pans from Moradabad via New Market Kolkata. Tin lining needs retinning for cooking (Rs.1500/pan). Makes stunning kitchen wall decorations otherwise.", category: "Home & Garden", condition: "Fair", imgId: 466 },
    ],
    "Jaipur": [
        { title: "Rajasthani Hand-Block Print Fabric", description: "20 meters of pure cotton with traditional Sanganeri block printing. Blues and indigos on white base. Bought from a Jaipur artisan. Perfect for curtains, cushion covers, or garments.", category: "Home & Garden", condition: "New", imgId: 1059 },
        { title: "Burton Custom 155cm Snowboard", description: "My trusty board that conquered Gulmarg slopes. Base has scratches and needs hot wax treatment. Edges have decent sharpness. Union bindings mounted on it are in great condition.", category: "Sports & Fitness", condition: "Good", imgId: 414 },
        { title: "Ryobi 18V Cordless Drill", description: "Incredibly reliable drill that handled everything from shelves to flat-pack furniture. Rubber grip peeling slightly but function unaffected. Includes lithium battery and charger.", category: "Hobbies & Tools", condition: "Good", imgId: 648 },
        { title: "Nintendo Switch Lite Turquoise", description: "Has the common left joycon drift issue. Screen is perfect thanks to tempered glass protector. Includes original charger. Great if you know how to fix stick drift.", category: "Electronics", condition: "Fair", imgId: 96 },
        { title: "Martin LX1E Travel Guitar", description: "Perfect travel companion that has been to Udaipur, Pushkar, and Jaisalmer with me. Small crack on spruce top from a backpack incident but still plays beautifully. Fishman pickup works great.", category: "Hobbies & Tools", condition: "Fair", imgId: 145 },
        { title: "Brass Lamp and Candle Holder Set", description: "Traditional Rajasthani brass lamp stand (4 feet tall) with matching candle holders. Tarnished from age but easily cleaned with brass polish. Stunning centerpiece for any living room.", category: "Home & Garden", condition: "Fair", imgId: 919 },
    ],
    "Ahmedabad": [
        { title: "Wooden Rocking Chair — Teak", description: "Hand-carved teak rocking chair from a Gandhinagar craftsman. The wood has aged beautifully over 15 years. The rocking mechanism is butter-smooth. One armrest has a small crack, cosmetic only.", category: "Furniture", condition: "Good", imgId: 1040 },
        { title: "Premium Skincare Sample Collection", description: "Spring cleaning my bathroom cabinet. Sealed, unopened sample-size products — La Mer moisturizer, Drunk Elephant protini, Sunday Riley Good Genes, and twelve more from Nykaa.", category: "Other", condition: "New", imgId: 1059 },
        { title: "UPPAbaby Vista V2 Stroller", description: "Premium stroller used for two years of parenting. Telescoping handlebar foam torn from sun exposure. All four wheels roll perfectly, braking is solid. Folds compactly.", category: "Other", condition: "Fair", imgId: 380 },
        { title: "Strategy Board Games Bundle Catan+", description: "Settlers of Catan, Ticket to Ride Europe, and Pandemic. Each game is missing one or two small tokens from enthusiastic game nights but all are entirely playable with original boxes.", category: "Hobbies & Tools", condition: "Good", imgId: 743 },
        { title: "IKEA Kallax 8-Cube Storage Unit", description: "The ubiquitous white Kallax. Some pencil marks from my nephew and one internal shelf has a small edge chip. Includes four grey fabric storage bins. Extremely sturdy.", category: "Furniture", condition: "Good", imgId: 1055 },
        { title: "Rip Curl Flashbomb 4/3mm Wetsuit M", description: "Used for surfing trips to Diu and Dwarka. Neoprene is still stretchy and warm. Small tear near left knee patched with neoprene cement — held up through several sessions.", category: "Sports & Fitness", condition: "Fair", imgId: 883 },
    ],
    "Lucknow": [
        { title: "Chikankari Embroidered Kurta Set", description: "Genuine Lucknow chikankari work on pure georgette. Men's L size kurta with matching pyjama. Worn twice for wedding functions. The intricate hand-embroidery is flawless.", category: "Clothing", condition: "Like New", imgId: 399 },
        { title: "1960s Remington Portable Typewriter", description: "Gorgeous sea-foam green mechanical typewriter from the early 1960s. Some keys stick occasionally — particularly the 'e' and 't'. Needs a fresh ink ribbon. Built like a tank.", category: "Hobbies & Tools", condition: "Fair", imgId: 429 },
        { title: "Large Patio Umbrella + Cast Iron Base", description: "9-foot beige market umbrella. The fabric has faded to warm off-white after two monsoon seasons. Aluminum frame and crank work smoothly. Cast iron base is incredibly heavy and stable.", category: "Home & Garden", condition: "Good", imgId: 919 },
        { title: "Premium Leather Reclining Armchair", description: "The kind of armchair that swallows you in comfort. Manual reclining mechanism is smooth. Bonded leather is showing age — armrest and headrest areas have started flaking.", category: "Furniture", condition: "Good", imgId: 1040 },
        { title: "Industrial Bar Stools Set of 4", description: "Four industrial-style bar stools with solid mango wood seats and matte black metal frames. Two wobble slightly on uneven surfaces — feet need to be filed down about 1mm.", category: "Furniture", condition: "Good", imgId: 1076 },
        { title: "Wusthof Classic 6-Piece Knife Set", description: "Premium German steel chef knives. All six are quite dull and need professional sharpening (Rs.500). The wooden block and polymer handles are in pristine condition.", category: "Home & Garden", condition: "Fair", imgId: 824 },
    ],
    "Chandigarh": [
        { title: "Decathlon Rockrider ST520 MTB", description: "Mountain bike perfect for Chandigarh cycling tracks and Morni Hills trails. Shimano gears shift smoothly. Front suspension is slightly soft. New tires were fitted last month.", category: "Sports & Fitness", condition: "Good", imgId: 628 },
        { title: "Philips Air Fryer XXL", description: "Large capacity air fryer that fed our entire family of five. The non-stick basket coating has worn in spots. Still fries, bakes, and grills perfectly. Includes recipe booklet.", category: "Appliances", condition: "Fair", imgId: 312 },
        { title: "Bose SoundLink Revolve+ Speaker", description: "360-degree Bluetooth speaker with amazing sound quality. Battery still lasts 12+ hours. Some cosmetic scratches on the aluminum body from outdoor use at Sukhna Lake picnics.", category: "Electronics", condition: "Good", imgId: 577 },
        { title: "Organic Cotton Bedsheets Set — King", description: "Two Egyptian cotton 400-thread-count bedsheets with four pillowcases. Pristine white with subtle grey stripes. Used with a mattress protector. Washed and ironed, ready to go.", category: "Home & Garden", condition: "Like New", imgId: 913 },
        { title: "Rustic Pine Coffee Table", description: "Solid pine coffee table with hairpin legs. The surface has developed a beautiful honey patina from years of use. A coffee ring near the center adds character. Very sturdy.", category: "Furniture", condition: "Good", imgId: 1076 },
        { title: "Osho Complete Works Collection", description: "15 volumes of Osho's discourses covering Zen, Tao, and meditation. Paperback editions in English. Some volumes have highlighted passages. Bought from Sector 17 bookshop.", category: "Books & Media", condition: "Good", imgId: 24 },
    ],
    "Kochi": [
        { title: "Kerala Mural Art Canvas — Large", description: "Authentic Kerala mural painting depicting Kathakali dancer. 3x4 feet canvas painted by a Fort Kochi artist. Colors are vibrant with gold leaf accents. Wood frame is solid.", category: "Home & Garden", condition: "Good", imgId: 1029 },
        { title: "Surfboard 7ft Foam Beginner", description: "Perfect beginner surfboard used at Kovalam and Varkala beaches. Some wax residue on the deck. A few dings on the rails that have been sealed. Fins included.", category: "Sports & Fitness", condition: "Fair", imgId: 883 },
        { title: "Redmi Note 12 Pro 128GB", description: "Used for one year as secondary phone. Screen is pristine with protector still on. Battery health is great — easily lasts a full day. Includes original box and charger.", category: "Electronics", condition: "Good", imgId: 1 },
        { title: "Handloom Cotton Sarees — Set of 3", description: "Three beautiful Kerala Kasavu cotton sarees with gold borders. Worn to Onam celebrations. The gold thread work (kasavu) is real zari. Hand-washed and stored with camphor.", category: "Clothing", condition: "Good", imgId: 669 },
        { title: "Teak Wood Spice Box — Traditional", description: "Traditional Kerala masala box (masala petti) in solid teak. Seven compartments with a rotating lid. Used for two years — has absorbed wonderful spice aromas. Recently oiled.", category: "Home & Garden", condition: "Good", imgId: 466 },
        { title: "Philips 2-in-1 Air Purifier and Fan", description: "Used in my Edappally apartment for 18 months. HEPA filter was replaced 3 months ago. Works silently on low settings. Perfect for Kochi's humid weather. Remote control included.", category: "Appliances", condition: "Good", imgId: 870 },
    ],
};

// ═══════════════════════════════════════════════════════════════
// Seed function
// ═══════════════════════════════════════════════════════════════
async function seed() {
    try {
        console.log('🔗 Connecting to Neon DB...');

        // Clean existing data
        await pool.query('DELETE FROM requests');
        await pool.query('DELETE FROM item_images');
        await pool.query('DELETE FROM items');
        await pool.query('DELETE FROM users WHERE id LIKE $1', ['owner_%']);
        await pool.query('DELETE FROM users WHERE id LIKE $1', ['seed_owner_%']);

        // Insert owners
        console.log('👥 Creating 15 realistic owners...');
        for (const owner of owners) {
            const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(owner.name)}`;
            await pool.query(
                `INSERT INTO users (id, name, email, avatar) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, avatar = EXCLUDED.avatar`,
                [owner.id, owner.name, owner.email, avatar]
            );
        }

        // Insert items for each city
        let totalItems = 0;
        const cityNames = Object.keys(cities);
        console.log(`📦 Inserting items across ${cityNames.length} Indian cities...`);

        for (const cityName of cityNames) {
            const cityLocations = cities[cityName];
            const items = cityItems[cityName];
            console.log(`  🏙️  ${cityName} — ${items.length} items`);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const owner = owners[(totalItems) % owners.length];
                const loc = cityLocations[i % cityLocations.length];
                // Small random offset
                const lat = loc.lat + (Math.random() - 0.5) * 0.008;
                const lng = loc.lng + (Math.random() - 0.5) * 0.008;
                const daysAgo = (Math.random() * 25 + 0.1).toFixed(1);

                const res = await pool.query(`
                    INSERT INTO items (title, description, category, condition,
                        owner_id, owner_name, owner_avatar, owner_email,
                        latitude, longitude, attributes, status, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, 'available',
                        NOW() - ($12 || ' days')::interval) RETURNING id
                `, [
                    item.title, item.description, item.category, item.condition,
                    owner.id, owner.name,
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(owner.name)}`,
                    owner.email,
                    lat, lng,
                    JSON.stringify({ city: cityName, area: loc.area }),
                    daysAgo,
                ]);

                const newId = res.rows[0].id;

                // Extract keywords for more relevant images
                const categoryKw = item.category.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
                let titleKw = item.title.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
                // Special cases for better imagery
                if (item.title.toLowerCase().includes('playstation')) titleKw = 'playstation';
                if (item.title.toLowerCase().includes('macbook') || item.title.toLowerCase().includes('ipad')) titleKw = 'apple';

                const imgUrl = `https://loremflickr.com/800/600/${categoryKw},${titleKw}?lock=${item.imgId + totalItems}`;

                await pool.query('INSERT INTO item_images (item_id, image_url) VALUES ($1, $2)', [newId, imgUrl]);
                totalItems++;
            }
        }

        console.log('');
        console.log('✅ Seed complete!');
        console.log(`   → 15 unique owners with real names & valid emails`);
        console.log(`   → ${totalItems} items across ${cityNames.length} Indian cities`);
        console.log(`   → Cities: ${cityNames.join(', ')}`);
        console.log('   → Each item has a unique image from picsum.photos');
        console.log('');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    } finally {
        pool.end();
    }
}

seed();
