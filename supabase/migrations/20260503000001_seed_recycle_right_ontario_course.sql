-- Seed: Recycle Right Ontario (Public Edition) — 16-module training
-- Idempotent: safe to re-run. Uses fixed UUIDs.

DO $$
DECLARE
  v_course_id UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  v_mod_ids UUID[] := ARRAY[
    'b2c30001-0000-0000-0000-000000000001',
    'b2c30001-0000-0000-0000-000000000002',
    'b2c30001-0000-0000-0000-000000000003',
    'b2c30001-0000-0000-0000-000000000004',
    'b2c30001-0000-0000-0000-000000000005',
    'b2c30001-0000-0000-0000-000000000006',
    'b2c30001-0000-0000-0000-000000000007',
    'b2c30001-0000-0000-0000-000000000008',
    'b2c30001-0000-0000-0000-000000000009',
    'b2c30001-0000-0000-0000-000000000010',
    'b2c30001-0000-0000-0000-000000000011',
    'b2c30001-0000-0000-0000-000000000012',
    'b2c30001-0000-0000-0000-000000000013',
    'b2c30001-0000-0000-0000-000000000014',
    'b2c30001-0000-0000-0000-000000000015',
    'b2c30001-0000-0000-0000-000000000016',
    'b2c30001-0000-0000-0000-000000000017'
  ]::UUID[];
BEGIN
  -- Course
  INSERT INTO public.courses (id, title, description, short_description, duration_minutes, is_published)
  VALUES (
    v_course_id,
    'Recycle Right Ontario — Public Edition',
    'A complete 16-module training program for Ontario residents, students, educators, community leaders, and new Canadians. Built on official RPRA data and global best practices from Japan and Sweden, this course prepares learners for the Blue Box 2026 transition and equips them to lead community recycling initiatives.',
    'Learn how to recycle correctly across Ontario — Blue Box 2026, sorting, hazardous waste, and community action.',
    240,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    duration_minutes = EXCLUDED.duration_minutes,
    is_published = EXCLUDED.is_published,
    updated_at = now();

  -- Clear existing modules (and their quizzes via FK cascade) for clean re-seed
  DELETE FROM public.modules WHERE course_id = v_course_id;

  -- Modules
  INSERT INTO public.modules (id, course_id, title, description, content, order_index, duration_minutes, has_quiz, quiz_pass_mark) VALUES
  (v_mod_ids[1], v_course_id, 'Welcome & Overview',
   'Introduction to Ontario recycling and this 16-module training program.',
   E'## Welcome to Recycle Right Ontario\n\nOntario generates over 12 million tonnes of waste every year. Only about a third is diverted from landfill through recycling, composting, and reuse. The rest is buried — and landfill space across southern Ontario is running critically short.\n\nMost of what ends up in landfill doesn''t need to be there. It can be recycled, composted, or dropped off at one of more than 20,000 RPRA locations across the province. The problem isn''t a lack of programs — it''s that residents don''t always know how to use them correctly.\n\n### Key Numbers\n- **12M+ tonnes** of waste generated each year in Ontario\n- **20,000+** RPRA drop-off locations across Ontario\n- **17.6M tonnes** of Blue Box materials recovered 2002–2021\n- **96.4%** of Ontario households served by Blue Box by 2021\n\n### Who This Training is For\nEveryone — children, seniors, new Canadians, apartment residents, homeowners, community advocates, educators, and municipal workers.\n\n### Learning Objectives\n- Understand what this training covers and why it matters for Ontario\n- Recognize the scale of Ontario''s waste challenge and the opportunity recycling presents\n- Feel motivated to complete all 16 modules and share what you learn',
   1, 10, true, 70),

  (v_mod_ids[2], v_course_id, 'Know Your Materials',
   'The six major recyclable material categories in Ontario.',
   E'## The Six Material Categories\n\n**1. Metals** — Aluminum cans, steel food tins, clean foil trays, empty aerosols. Infinitely recyclable. Recycling aluminum saves **95%** of the energy required to make it from raw ore. A recycled can is back on shelves within 60 days. Do NOT place scrap metal, pipes, wire, or large appliances in the blue bin.\n\n**2. Paper & Cardboard** — Newspapers, flattened cardboard, magazines, greeting cards, calendars, envelopes, paper bags, soft-cover books. Paper fibre can be recycled up to 7 times. **Greasy or food-soiled paper is NOT accepted** — it contaminates entire bales.\n\n**3. Plastics** — Identified by resin code #1–#7. Plastics #1 (PET) and #2 (HDPE) are broadly accepted. **Black plastic is NEVER recyclable** in Ontario because NIR sorting scanners cannot detect it.\n\n**4. Batteries** — All types contain heavy metals. Never in the blue, green, or grey bin. Lithium-ion batteries cause fires when crushed. Free drop-off at Canadian Tire, Home Depot, Best Buy, or municipal depots.\n\n**5. Household Hazardous Waste (HHW)** — Paints, solvents, pesticides, motor oil, antifreeze, pool chemicals. Always to an HHW depot. *Even empty HHW containers are still HHW.*\n\n**6. Organics** — Food scraps, coffee grounds, tea bags, meat, dairy, soiled paper. Belong in the green bin only. Organics in the blue bin are Ontario''s **#1 cause** of rejected recycling loads.',
   2, 12, true, 70),

  (v_mod_ids[3], v_course_id, 'The Blue Box Revolution — January 1, 2026',
   'Ontario''s Extended Producer Responsibility (EPR) transition and the new harmonised Blue Box program.',
   E'## The Biggest Change in Ontario Recycling History\n\nOn **January 1, 2026**, Ontario''s Blue Box Program transitions to **Extended Producer Responsibility (EPR)**. The companies that produce or sell packaging now pay 100% of the cost of collecting and recycling it — not taxpayers, not municipalities.\n\n### What is RPRA?\nThe **Resource Productivity and Recovery Authority** is Ontario''s independent regulatory authority. RPRA enforces compliance and oversees six programs: Blue Box, Batteries, Electronics, HHW, Lighting, and Tires.\n\n### Harmonisation\nFor the first time, the **same materials** are accepted in every Ontario community — from Toronto to Thunder Bay.\n\n### Expanded Coverage\n- Apartment buildings and condominiums\n- Schools and educational institutions\n- Retirement homes and assisted living facilities\n- Long-term care homes and nursing facilities\n\n### Three New Categories\n1. **Product Packaging** — primary, transportation, and convenience packaging; service accessories like straws and cutlery.\n2. **Paper Products** — newspapers, magazines, greeting cards, calendars, notebooks, promotional material. Hard-cover books are NOT included.\n3. **Packaging-Like Products** — aluminum foil, metal trays, plastic film, wrapping paper, paper bags, beverage cups. Cling wrap and freezer bags are NOT included.',
   3, 14, true, 70),

  (v_mod_ids[4], v_course_id, 'The Plastics Guide — Know Your Number',
   'Resin codes #1 through #7 and what each means for recyclability in Ontario.',
   E'## How to Find the Plastic Number\nEvery plastic container has a resin code 1–7 stamped inside a Möbius loop, usually on the bottom.\n\n### The Seven Resin Codes\n- **#1 PET / PETE** — Water bottles, soda bottles, peanut butter jars. ✅ Blue bin.\n- **#2 HDPE** — Milk jugs, shampoo, detergent. ✅ Blue bin.\n- **#3 PVC / Vinyl** — Pipes, hoses, shower curtains. ❌ Garbage.\n- **#4 LDPE** — Plastic bags, bread bags, dry-cleaning bags. ⚠ Store drop-off only — NEVER blue bin.\n- **#5 PP** — Yogurt containers, bottle caps, straws. ✅ Most municipalities.\n- **#6 PS / Styrofoam** — Foam cups, takeout, egg cartons. ❌ Garbage.\n- **#7 Other / mixed** — Multi-layer, baby bottles, big water jugs. ❌ Check locally.\n\n### Black Plastic Warning\nCarbon-black pigment absorbs all NIR light, making any black plastic invisible to MRF sensors. **Always garbage.**\n\n### Plastic Bag Rule\nBags jam machinery. NEVER in the blue bin — take to grocery store collection bins (Loblaws, No Frills, Walmart).\n\n### Important\nThe recycling triangle symbol does NOT guarantee recyclability in Ontario.',
   4, 14, true, 70),

  (v_mod_ids[5], v_course_id, 'Environmental Impact — Why Recycling Matters',
   'The environmental consequences of landfilling recyclables, and how Ontario compares to world leaders.',
   E'## Ontario by the Numbers\nFrom 2002 to 2021, **17.6 million tonnes** of Blue Box materials were recovered. By 2021, **96.4%** of households were served. Yet Ontario''s overall diversion rate (~64%) lags Sweden (88.4% for cans/bottles) and Japan (87.8% overall).\n\n### Key Stats\n- **450+ years** for a plastic bottle to decompose\n- **95%** energy saved by recycling aluminum vs. mining\n- **80×** methane more potent than CO₂ over 20 years\n- **17 trees** saved for every tonne of paper recycled\n\n### Material-by-Material Harm\n- **Plastics** → microplastics now in Lake Ontario, fish, soil, drinking water, human blood\n- **Metals** → mining strips forests and emits huge GHG; recycling avoids it\n- **Paper** → in landfill, decomposes anaerobically, producing methane (80× CO₂)\n- **Batteries** → heavy metals leach into groundwater; lithium causes fires\n- **Organics** → ~40% of Ontario''s landfill methane is food waste; the green bin turns waste into farmland compost\n\n### The Recycling Loop\nCurbside → MRF sort → Bale & sell → Remanufacture → Back on the shelf. Aluminum can to new can: ~60 days.',
   5, 14, true, 70),

  (v_mod_ids[6], v_course_id, 'Sorting at Home — Which Bin?',
   'The definitive guide to blue bin, green bin, grey bin — and how to avoid contamination.',
   E'## Sorting at Home\n\n### 💙 Blue Bin (Recycling)\n**Accepted:** plastic bottles/jugs/tubs (#1, #2), metal food cans (rinsed), glass bottles & jars, flattened cardboard, clean paper, milk and juice cartons, empty aerosols, greeting cards, paper bags, magazines, clean foil trays.\n\n**Not accepted:** Styrofoam, plastic bags, food-soiled items, batteries, electronics, black plastic, waxed boxes, used tissues, greasy pizza boxes, hardcover books, broken ceramics, HHW.\n\n### 💚 Green Bin (Organics)\n**Accepted:** fruit/veg scraps, meat, fish, bones, dairy, eggs/shells, coffee grounds, paper-only tea bags, soiled napkins, soiled pizza boxes, bread, pasta, cooking fats in container.\n\n**Not accepted:** glass, metal, plastic, plastic bags, pet waste, diapers, liquids poured directly, Styrofoam, clean recyclables.\n\n### 🗑️ Grey/Black Bin (Garbage)\n**Accepted:** Styrofoam, chip bags, candy wrappers, waxed paper, diapers, black plastic, used tissues, broken ceramics, plastic wrap, frozen-food boxes, rubber/leather.\n\n**Not accepted:** batteries, electronics, paint, medications, propane tanks, fluorescent bulbs, tires, motor oil — all need designated drop-off.\n\n### Contamination — The Golden Rule\nA contaminated load can cause an **entire truckload** to be rejected to landfill. **When in doubt — rinse it out, or leave it out.**',
   6, 14, true, 70),

  (v_mod_ids[7], v_course_id, 'Hazardous & Special Materials',
   'Safe disposal of batteries, paint, motor oil, pesticides, mercury items, pressurized containers, and medications.',
   E'## RPRA''s Hazardous & Special Material Programs\n\n**1. Batteries (≤5 kg)** — button cells, AA-D, 9V, lantern, sealed lead-acid, replacement device batteries. Free at Canadian Tire, Home Depot, Best Buy, municipal depots. Always remove batteries from devices.\n\n**2. Paint, Coatings, Solvents** — latex/oil paint, aerosols, stains, varnishes, thinners. PaintCare Ontario accepts free at hundreds of retailers. *Even empty containers count as HHW.*\n\n**3. Motor Oil, Antifreeze, Filters** — Canadian Tire and Napa Auto Parts accept free. One litre of oil can contaminate **one million litres** of drinking water.\n\n**4. Pesticides, Herbicides, Fertilizers** — Municipal HHW depots; ReturnToRetailer.ca for retailers.\n\n**5. Mercury & Lighting** — Thermometers, thermostats, fluorescent and CFL bulbs. Home Depot and IKEA accept all bulb types free under RPRA''s lighting program.\n\n**6. Pressurized Containers** — Helium, nitrogen, propane. Never puncture or crush.\n\n**7. Medications** — Return any unused or expired medication to **any Ontario pharmacy** — free, no questions asked. Never flush.\n\n**Find your nearest free drop-off:** rpra.ca/where-to-recycle',
   7, 14, true, 70),

  (v_mod_ids[8], v_course_id, 'Preparing Your Blue Bin — 8 Essential Steps',
   'The eight preparation steps that prevent contamination at the source.',
   E'## 8 Essential Steps\n\n1. **Empty & rinse all containers** — 3-second cold-water rinse. No soap.\n2. **Remove & separate lids** — often a different plastic. Metal lids can go inside a steel can.\n3. **Flatten all cardboard** — saves space; remove Styrofoam inserts.\n4. **Never bag your recyclables** — bagged items are treated as garbage at the MRF and sent to landfill.\n5. **Contain shredded paper** — place in a sealed paper bag or envelope.\n6. **Let items air dry** — wet paper breaks apart and contaminates other materials.\n7. **Scrape out all food** — if too soiled to clean, garbage it.\n8. **Set up a home sorting station** — three labelled bins (blue, green, grey) with picture-based labels.\n\nThese 8 steps add about 10–15 seconds per container — and across Ontario''s 5.4 million households, save millions in contamination costs annually.',
   8, 12, true, 70),

  (v_mod_ids[9], v_course_id, 'Inside the Sorting Facility (MRF)',
   'A walkthrough of the six phases inside an Ontario Material Recovery Facility.',
   E'## The Six Sorting Phases\n\n1. **Tipping Floor & Pre-Sort** — Trucks dump loads; workers visually pull obvious contaminants. Highly contaminated loads can be rejected here.\n2. **Conveyor Belts & Manual Picking** — Sorters remove plastic bags and large contaminants. Bag jams cost 15–30 minutes each.\n3. **Disc Screens & Trommel Drums** — Flat paper passes over; 3D containers fall through. Shredded paper falls through like sand.\n4. **Magnetic & Eddy Current Separation** — Overband magnets pull steel; eddy currents eject aluminum sideways.\n5. **Near-Infrared (NIR) Optical Sorting** — Detects plastic resins by NIR reflection, then air-jets eject them. Black plastic is invisible to NIR.\n6. **Quality Control, Baling & Sale** — Final QC, then bales sold to manufacturers. Bale price depends on purity.\n\n### RPRA Confirms\nProperly sorted Blue Box materials DO continue through the recycling process and are sold as raw materials. Only **contamination** causes materials to be discarded — recycling itself is real.',
   9, 14, true, 70),

  (v_mod_ids[10], v_course_id, 'Tires & Electronics Drop-Off Programs',
   'Ontario''s dedicated RPRA tire and electronics recycling programs.',
   E'## Tires\nIllegally dumped tires breed mosquitoes, are flammable, and leach toxins. Ontario accepts car/truck/SUV/motorcycle/ATV/trailer/industrial/agricultural tires, and any tire ≥ 1 kg (snowblower, lawnmower, dolly).\n\nRecycled tires become **crumb rubber** — used in sports turf, playground surfaces, running tracks, rubberised asphalt, noise barriers, and anti-fatigue mats.\n\n## Electronics\nAccepted free at hundreds of locations:\n- Computers, laptops, tablets\n- All cell phones, telephones\n- Monitors, TVs, projectors\n- Printers and printer cartridges\n- Audio equipment, cameras\n- Video gaming devices, drones\n- Cables, chargers, keyboards, mice, hard drives\n- Electronic instruments\n- After-market vehicle stereos\n\n**Find drop-offs:** rpra.ca/where-to-recycle',
   10, 12, true, 70),

  (v_mod_ids[11], v_course_id, 'The Circular Economy',
   'How Ontario''s recycling fits into a circular economy and your role in closing the loop.',
   E'## Linear vs. Circular\n- **Linear:** take → make → use → dump.\n- **Circular:** design out waste, then recover materials and feed them back into manufacturing.\n\n## How EPR Drives the Circular Economy\nOntario''s 2026 EPR transition pushes producers to:\n- Design for recyclability\n- Use less and better packaging\n- Invest in collection and processing\n- Increase recycled content\n\n## Five Links in Ontario''s Circular Chain\n1. **Design** — products built for recyclability\n2. **Collect** — Blue Box, green bin, drop-offs\n3. **Process** — MRFs sort, clean, prepare materials\n4. **Remanufacture** — Aluminum → cans, paper → packaging, plastic → resin pellets\n5. **Buy Recycled** — consumers choosing recycled-content products closes the loop\n\n**You are the most critical link.** Sorting correctly and choosing recycled-content products signals market demand.',
   11, 12, true, 70),

  (v_mod_ids[12], v_course_id, 'Recycling Myths Busted by RPRA',
   'The four most damaging recycling myths in Ontario, officially corrected by RPRA.',
   E'## Myths vs. Facts\n\n**Myth 1:** "Most Blue Box materials end up in landfill anyway."\n*Fact:* Only **contaminated** material is discarded. Properly sorted recyclables continue through processing and are sold as raw materials.\n\n**Myth 2:** "Consumers can''t really do much."\n*Fact:* Consumer behaviour drives the entire system — buying choices, source sorting, and dropping off batteries/paint/electronics.\n\n**Myth 3:** "When unsure, throw it in the trash."\n*Fact:* Only valid for ordinary uncertainties. Batteries, electronics, paint, chemicals, and medications must NEVER go in the trash — they require designated drop-off.\n\n**Myth 4:** "The recycling triangle means it''s recyclable in Ontario."\n*Fact:* The Möbius loop may indicate recycled content or recyclability elsewhere. Always check your municipal list or rpra.ca.\n\n### Bonus: Eco-Fees\nEnvironmental handling fees are NOT government taxes, NOT set by RPRA, NOT mandatory. Businesses set them at their discretion. Misrepresentation? Call **1-800-889-9768**.',
   12, 12, true, 70),

  (v_mod_ids[13], v_course_id, 'World Leaders — Japan & Sweden',
   'What Japan''s MOTTAINAI culture and Sweden''s deposit-return system can teach Ontario.',
   E'## 🇯🇵 Japan — MOTTAINAI ("waste nothing, honour everything")\n- **87.8%** overall recycling/reuse rate\n- **94%** PET bottle recycling rate (vs. 27% in the USA)\n- Households sort up to **45 categories** in Tokyo\n- Bottle separated into 3 parts: cap, label film, body\n- 1,000+ waste-to-energy plants\n- AI sorting robots and smart bins\n- EPR for packaging since **1997**\n- **Osaki Town** — 13,000 residents, 83.4% recycling for 11 years; revenue funds local scholarships\n\n## 🇸🇪 Sweden — Pantamera Deposit Return (since 1984)\n- **88.4%** can/bottle return rate (target: 90%)\n- 3 billion+ containers returned in 2025\n- 180,000 tonnes of CO₂ prevented in 2024\n- Deposit of 2–3 SEK ($0.18–$0.28 CAD)\n- **Closed loop:** cans → cans, PET → PET (no downcycling)\n- 45% of returns through reverse vending machines\n- Mandatory 25% recycled PET content (rising to 30% by 2030)\n\n## Lessons for Ontario\n- Meticulous sorting culture (Japan)\n- Community revenue from recycling (Osaki)\n- Financial incentives — deposit-return (Sweden)\n- Closed-loop quality (Sweden)\n- EPR is the foundation that enables all other improvements',
   13, 14, true, 70),

  (v_mod_ids[14], v_course_id, 'Ontario''s Path Forward',
   'Ontario''s strengths, gaps vs. world leaders, and concrete improvements ahead.',
   E'## Ontario''s Strengths\n- **RPRA** — independent regulator with enforcement powers\n- **2026 EPR transition** — producers pay\n- **20,000+** free drop-off locations\n- **Province-wide harmonisation** in 2026\n- **17.6M tonnes** recovered 2002–2021; 96.4% household coverage\n\n## Where Ontario Can Accelerate\n- **Expand deposit-return to ALL beverage containers** — single highest-impact policy\n- Pilot more sort categories (Japan-style)\n- Invest in AI and robotic sorting at MRFs\n- Mandate minimum recycled content in packaging (Sweden-style)\n- Drive a culture shift — schools, ambassadors, multilingual outreach, gamified apps\n\nThe gap to close is one of speed, ambition, and community culture — not direction. Every resident plays a role.',
   14, 12, true, 70),

  (v_mod_ids[15], v_course_id, 'Community Innovations',
   'Community-led recycling initiatives Ontarians can launch today.',
   E'## ⭐ Community Aluminum Can Collection — The Flagship Idea\nAluminum is infinitely recyclable; saves 95% of energy vs. mining. Cans worth **$0.05–$0.15 each** at scrap depots. Use revenue for additional bins, multilingual signage, eco-school certifications, field trips, charity, or park cleanups.\n\nInspired by **Osaki Town, Japan** — recycling funds scholarships.\n\n### How to Start\n1. Pick a champion\n2. Set up a labelled collection point\n3. Communicate clearly\n4. Set a goal\n5. Contact a scrap dealer\n6. Celebrate and report back\n\n## Six More Community Innovations\n- **🏘️ Neighbourhood Can & Bottle Drives** — apartments, condos, schools, faith groups\n- **🏫 School Recycling Enterprises** — eco-school programs integrated with curriculum\n- **🤖 Smart Reverse Vending Machines** — Pantamera-inspired, with grocery/transit rewards\n- **📍 Community Sorting Hubs** — neighbourhood mini-depots\n- **🌐 Multilingual Recycling Ambassador Programs** — peer-led in 30+ languages\n- **📱 Gamified Recycling App** — address-specific bin guidance and household scoring\n\n**Start today** — no permission, no big budget required.',
   15, 12, true, 70),

  (v_mod_ids[16], v_course_id, 'Closing & Call to Action',
   'Your personal commitment to Ontario''s recycling future.',
   E'## What You Now Know\nYou have completed all 16 modules. You now know the six material categories, the 2026 EPR transition, the 7 plastic resin codes, the environmental stakes, sorting at home, hazardous disposal, blue bin preparation, MRF mechanics, the tire & electronics programs, the circular economy, the four big myths, world-leading systems in Japan and Sweden, Ontario''s path forward, and how to launch community innovations.\n\n## Your Personal Commitment\n- **At home** — three-bin sorting station, picture labels, rinse before binning, never bag, remove batteries.\n- **At the curb** — flatten cardboard, seal shredded paper, air dry, when in doubt leave it out.\n- **For hazardous items** — dedicated battery container; pharmacy returns for medication; PaintCare for leftover paint.\n- **In your community** — share what you''ve learned, gently correct mistakes, advocate for picture-based signage, start a can drive.\n- **As a citizen** — support deposit-return expansion, attend HHW events, choose recyclable packaging, buy recycled-content products.\n\n> You don''t have to be perfect. You just have to keep getting better. Every small action compounds into real change.',
   16, 8, true, 70),

  (v_mod_ids[17], v_course_id, 'Final Quiz — Recycle Right Ontario',
   'A 10-question final quiz covering all 16 modules.',
   E'## Final Knowledge Check\n\nThis 10-question quiz covers everything you''ve learned across the 16 modules of Recycle Right Ontario. A passing score (70%) demonstrates your readiness to recycle correctly and lead in your community.\n\nGood luck!',
   17, 10, true, 70);

  -- Quiz Questions
  -- Module 1
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[1], 'Roughly how much waste does Ontario generate every year?', '["1 million tonnes","Over 12 million tonnes","500,000 tonnes","50 million tonnes"]'::jsonb, 1, 1),
  (v_mod_ids[1], 'About how many RPRA drop-off locations exist across Ontario?', '["200","2,000","Over 20,000","100"]'::jsonb, 2, 2),
  (v_mod_ids[1], 'Who is this training designed for?', '["Only municipal workers","Only homeowners","Everyone — students, seniors, residents, advocates, educators","Only business owners"]'::jsonb, 2, 3);

  -- Module 2
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[2], 'How many major recyclable material categories are covered in Ontario''s system?', '["3","4","6","10"]'::jsonb, 2, 1),
  (v_mod_ids[2], 'Where do batteries belong?', '["Blue bin","Green bin","Grey/garbage bin","A designated drop-off location"]'::jsonb, 3, 2),
  (v_mod_ids[2], 'Why is recycling aluminum important?', '["It is cheaper to throw away","It saves 95% of the energy required to make new aluminum","Aluminum is biodegradable","It cannot be recycled"]'::jsonb, 1, 3);

  -- Module 3
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[3], 'Under EPR, who pays for the Blue Box program?', '["Taxpayers","Municipalities","Producers (the companies that make the packaging)","Charities"]'::jsonb, 2, 1),
  (v_mod_ids[3], 'What does RPRA stand for?', '["Resource Productivity and Recovery Authority","Recycling Producer Responsibility Agency","Regional Plastic Recovery Association","Recycle and Process Regulatory Authority"]'::jsonb, 0, 2),
  (v_mod_ids[3], 'What is "harmonisation" in the new Blue Box program?', '["Recycling music","The same accepted materials across every Ontario community","A new sorting machine","A musical recycling program"]'::jsonb, 1, 3);

  -- Module 4
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[4], 'Which plastic types are most broadly accepted in Ontario blue bins?', '["#3 and #6","#1 (PET) and #2 (HDPE)","#4 and #7","None"]'::jsonb, 1, 1),
  (v_mod_ids[4], 'Why is black plastic not recyclable in Ontario?', '["It is too heavy","NIR optical sorters cannot detect it","It melts in trucks","It is illegal"]'::jsonb, 1, 2),
  (v_mod_ids[4], 'Where should clean plastic grocery bags go?', '["Blue bin","Green bin","Grocery store collection bins","Compost"]'::jsonb, 2, 3);

  -- Module 5
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[5], 'How much more potent is methane than CO₂ over 20 years?', '["2 times","10 times","80 times","The same"]'::jsonb, 2, 1),
  (v_mod_ids[5], 'Roughly how long does a plastic bottle take to decompose in a landfill?', '["5 years","50 years","Over 450 years","1 year"]'::jsonb, 2, 2),
  (v_mod_ids[5], 'About how many trees are saved per tonne of paper recycled?', '["1","5","17","100"]'::jsonb, 2, 3);

  -- Module 6
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[6], 'Where does a clean rinsed plastic milk jug belong?', '["Blue bin","Green bin","Grey/garbage bin","HHW depot"]'::jsonb, 0, 1),
  (v_mod_ids[6], 'Where do fruit and vegetable scraps go?', '["Blue bin","Green bin","Grey bin","Sink drain"]'::jsonb, 1, 2),
  (v_mod_ids[6], 'What is the "Golden Rule" of contamination?', '["Always recycle everything","When in doubt, rinse it out or leave it out","Bag everything tightly","Mix all materials"]'::jsonb, 1, 3);

  -- Module 7
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[7], 'Where do unused or expired medications belong?', '["Toilet","Garbage","Any Ontario pharmacy (free)","Blue bin"]'::jsonb, 2, 1),
  (v_mod_ids[7], 'Why are lithium-ion batteries especially dangerous?', '["They are heavy","When crushed, they can ignite and cause fires","They don''t work","They smell"]'::jsonb, 1, 2),
  (v_mod_ids[7], 'Where can you find your nearest free hazardous waste drop-off?', '["anywhere.ca","rpra.ca/where-to-recycle","The hardware store website","Trash collector"]'::jsonb, 1, 3);

  -- Module 8
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[8], 'What happens to recyclables placed inside a tied plastic bag?', '["They are sorted normally","The whole bag is treated as garbage and sent to landfill","They go to the green bin","They are washed first"]'::jsonb, 1, 1),
  (v_mod_ids[8], 'Why should cardboard be flattened?', '["It saves space in trucks and on sorting belts","It looks nicer","It burns better","It floats better"]'::jsonb, 0, 2),
  (v_mod_ids[8], 'How should shredded paper be placed in the blue bin?', '["Loose","In a plastic bag","Inside a sealed paper bag or envelope","Mixed with food"]'::jsonb, 2, 3);

  -- Module 9
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[9], 'Which technology identifies different plastic resins on a conveyor?', '["X-ray","Near-Infrared (NIR) optical sensors","Ultrasound","Thermal cameras"]'::jsonb, 1, 1),
  (v_mod_ids[9], 'Why are plastic bags such a problem at MRFs?', '["They smell bad","They jam machinery and cost lost sorting time","They are too colourful","They are too small"]'::jsonb, 1, 2),
  (v_mod_ids[9], 'What does RPRA confirm about properly sorted Blue Box materials?', '["They all go to landfill","They continue through the recycling process and are sold as raw materials","They are burned","They are exported only"]'::jsonb, 1, 3);

  -- Module 10
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[10], 'What is recycled tire rubber commonly turned into?', '["Drinking water","Crumb rubber for playgrounds, sports fields, and rubberised asphalt","Plastic bags","Glass bottles"]'::jsonb, 1, 1),
  (v_mod_ids[10], 'Are old cell phones accepted in Ontario''s electronics program?', '["Yes — for free at participating drop-offs","No, they go in the blue bin","No, they go in garbage","Only if broken"]'::jsonb, 0, 2),
  (v_mod_ids[10], 'What is the minimum tire weight accepted at retail tire drop-offs?', '["1 kg","10 kg","50 kg","No minimum"]'::jsonb, 0, 3);

  -- Module 11
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[11], 'What is a circular economy?', '["A take-make-waste system","A system that keeps materials in use through recovery and remanufacture","A type of bank","A waste-to-landfill model"]'::jsonb, 1, 1),
  (v_mod_ids[11], 'Which of these is NOT one of the five links in Ontario''s circular chain?', '["Design","Collect","Burn","Remanufacture"]'::jsonb, 2, 2),
  (v_mod_ids[11], 'How do consumers help close the loop?', '["By buying more","By sorting correctly and choosing recycled-content products","By using more single-use plastics","By bagging recyclables"]'::jsonb, 1, 3);

  -- Module 12
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[12], 'According to RPRA, why do some materials end up in landfill at MRFs?', '["Because they are contaminated, not because recycling fails","Because MRFs throw everything away","Because Ontario doesn''t recycle","Because the trucks are too small"]'::jsonb, 0, 1),
  (v_mod_ids[12], 'Is "when in doubt, throw it out" ever the wrong answer?', '["Yes — for batteries, paint, electronics, chemicals, and medications","No, it''s always correct","Only on weekends","Only for paper"]'::jsonb, 0, 2),
  (v_mod_ids[12], 'Are environmental handling fees set by RPRA?', '["Yes","No — they are set by individual businesses at their own discretion","Yes, by federal law","Yes, monthly"]'::jsonb, 1, 3);

  -- Module 13
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[13], 'What does the Japanese concept MOTTAINAI roughly mean?', '["Garbage day","What a waste — a respect for resources","Lots of trash","Buy more"]'::jsonb, 1, 1),
  (v_mod_ids[13], 'What is Sweden''s can and bottle return rate?', '["25%","50%","About 88.4%","100%"]'::jsonb, 2, 2),
  (v_mod_ids[13], 'What launched in Sweden in 1984 that inspires recycling worldwide?', '["A new type of plastic","The world''s first deposit return system","A landfill","A new resin code"]'::jsonb, 1, 3);

  -- Module 14
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[14], 'Which independent authority enforces Ontario''s recycling rules?', '["Environment Canada","RPRA","Pantamera","JCPRA"]'::jsonb, 1, 1),
  (v_mod_ids[14], 'Which policy change would have the highest impact on container return rates?', '["Banning the blue bin","Expanding deposit-return to ALL beverage containers","Removing all bins","Charging for recycling"]'::jsonb, 1, 2),
  (v_mod_ids[14], 'When does Ontario''s full Blue Box EPR transition take effect?', '["January 1, 2026","July 2030","2050","Never"]'::jsonb, 0, 3);

  -- Module 15
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[15], 'About how much is an aluminum can worth at Ontario scrap depots?', '["$1.00","$0.05–$0.15","Nothing","$5.00"]'::jsonb, 1, 1),
  (v_mod_ids[15], 'What does the Japanese town of Osaki use recycling revenue to fund?', '["New landfills","Local scholarships and community programs","New cars","Plastic bag production"]'::jsonb, 1, 2),
  (v_mod_ids[15], 'What is the easiest way to start a community recycling program?', '["Wait for the government","Pick a champion and set up a labelled aluminum can collection point","Build a new factory","Pass new laws"]'::jsonb, 1, 3);

  -- Module 16
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[16], 'What is the single most effective change to make at home?', '["Buy more bins","Set up a three-bin sorting station with picture-based labels","Stop recycling","Burn waste"]'::jsonb, 1, 1),
  (v_mod_ids[16], 'What should you do with leftover medication?', '["Flush it","Garbage","Return to any Ontario pharmacy","Blue bin"]'::jsonb, 2, 2),
  (v_mod_ids[16], 'What is the closing message of this training?', '["Recycling doesn''t matter","You don''t have to be perfect — you just have to keep getting better","Only experts can recycle","Use more plastic"]'::jsonb, 1, 3);

  -- Final Quiz (Module 17) — 10 questions
  INSERT INTO public.quiz_questions (module_id, question, options, correct_answer_index, order_index) VALUES
  (v_mod_ids[17], 'How many tonnes of waste does Ontario generate every year?', '["1 million","Over 12 million","100,000","50 million"]'::jsonb, 1, 1),
  (v_mod_ids[17], 'Which two plastic resin codes are most broadly accepted in Ontario?', '["#1 (PET) and #2 (HDPE)","#3 and #6","#4 and #7","#6 and #7"]'::jsonb, 0, 2),
  (v_mod_ids[17], 'Why is black plastic NOT recyclable in Ontario?', '["It''s too heavy","It''s invisible to NIR optical sorters","It melts in the truck","It''s banned everywhere"]'::jsonb, 1, 3),
  (v_mod_ids[17], 'When does Ontario''s Blue Box EPR transition take full effect?', '["January 1, 2026","2030","2050","Already happened in 2010"]'::jsonb, 0, 4),
  (v_mod_ids[17], 'Where do batteries belong?', '["Blue bin","Green bin","Garbage","A designated drop-off (Canadian Tire, Home Depot, Best Buy, municipal depot)"]'::jsonb, 3, 5),
  (v_mod_ids[17], 'Where do food scraps belong?', '["Blue bin","Green bin","Garbage","Pharmacy"]'::jsonb, 1, 6),
  (v_mod_ids[17], 'What is contamination in recycling?', '["Clean materials","Wrong items, or right items prepared wrong, that ruin a load","A new bin colour","A type of paper"]'::jsonb, 1, 7),
  (v_mod_ids[17], 'What does RPRA confirm about properly sorted Blue Box materials?', '["They go to landfill","They continue through the recycling process and are sold as raw materials","They are exported only","They are burned"]'::jsonb, 1, 8),
  (v_mod_ids[17], 'What is Sweden''s can and bottle return rate?', '["10%","50%","About 88.4%","100%"]'::jsonb, 2, 9),
  (v_mod_ids[17], 'How much energy does recycling aluminum save vs. making it from raw ore?', '["10%","50%","95%","0%"]'::jsonb, 2, 10);

END $$;
