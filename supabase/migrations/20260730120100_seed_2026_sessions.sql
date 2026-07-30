-- History Camp Boston 2026 — 2026 session data
--
-- Loaded from the organizers' final schedule grid (rooms/times/presenters,
-- authoritative for display) cross-referenced with the speaker/tags CSV
-- (docs/source-data/2026-speaker-info-with-tags.csv) for tags and presenter
-- email. Where the two sources disagreed on spelling, the CSV title was
-- treated as correct (submitter-provided) over the grid's typeset text.
--
-- Sessions without an explicit "Tags for app" value in the CSV fall back to
-- their Topic value as a single tag, so every session has at least one tag
-- to browse by.

insert into time_blocks (label, start_time, end_time, sort_order) values
  ('Session 1 — 9:30–10:15 AM', '2026-08-08T09:30:00-04:00', '2026-08-08T10:15:00-04:00', 1),
  ('Session 2 — 10:30–11:15 AM', '2026-08-08T10:30:00-04:00', '2026-08-08T11:15:00-04:00', 2),
  ('Session 3 — 11:30 AM–12:15 PM', '2026-08-08T11:30:00-04:00', '2026-08-08T12:15:00-04:00', 3),
  ('Session 4 — 1:30–2:15 PM', '2026-08-08T13:30:00-04:00', '2026-08-08T14:15:00-04:00', 4),
  ('Session 5 — 2:30–3:15 PM', '2026-08-08T14:30:00-04:00', '2026-08-08T15:15:00-04:00', 5),
  ('Session 6 — 3:30–4:15 PM', '2026-08-08T15:30:00-04:00', '2026-08-08T16:15:00-04:00', 6),
  ('Session 7 — 4:30–5:15 PM', '2026-08-08T16:30:00-04:00', '2026-08-08T17:15:00-04:00', 7);

insert into rooms (name, building) values
  ('Room 235', 'Suffolk University Law School'),
  ('Room 275', 'Suffolk University Law School'),
  ('Room 285', 'Suffolk University Law School'),
  ('Room 295', 'Suffolk University Law School'),
  ('Room 315', 'Suffolk University Law School'),
  ('Room 335', 'Suffolk University Law School'),
  ('Room 385', 'Suffolk University Law School'),
  ('Room 425', 'Suffolk University Law School');

insert into sessions (title, presenter_name, presenter_email, presenter_credentials, co_presenters, tags, time_block_id, room_id)
select v.title, v.presenter_name, nullif(v.presenter_email, ''), nullif(v.presenter_credentials, ''), v.co_presenters::jsonb, v.tags, tb.id, r.id
from (values
  ('The True Story of The Woman Hobo: Separating Fact from Fiction in a 1908 Travelogue', 'Heather Cole', 'heatherscole@rocketmail.com', '', '[]', ARRAY['Women''s History']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 235'),
  ('Transformation of the Charlestown Territory in the Massachusetts Bay Colony from 1629 to 1800', 'Alison Simcox', 'acsimcox1@gmail.com', '', '[{"name":"Douglas Heath","credentials":null,"bio":null}]', ARRAY['Environmental History']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 275'),
  ('Race & Brutality in the Neutral Ground: Colonel Christopher Greene and the 1st Rhode Island Regiment at Pines Bridge, May 14, 1781', 'Ben Powers', 'arthur.b.powers@gmail.com', '', '[{"name":"Bjorn Bruckshaw","credentials":null,"bio":null}]', ARRAY['Am Rev']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 285'),
  ('Stories of the Signatures', 'J.L. Bell', 'boston1775@earthlink.net', '', '[]', ARRAY['Am Rev']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 295'),
  ('Telling Complex & Hard Histories: Interpreting Slavery at Small Historic Sites', 'Nikki Stewart', 'nstewart@oldnorth.com', '', '[{"name":"Roeshana Moore-Evans","credentials":null,"bio":null},{"name":"Suzy Buchanan","credentials":null,"bio":null}]', ARRAY['Local History', 'Black History', 'Public History']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 315'),
  ('Oxen and the Revolution: How Four Hooves and a Set of Horns Helped Forge a Nation (1775-1781)', 'Owen Laurenzo', 'oclaurenzo@gmail.com', '', '[]', ARRAY['Am Rev']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 335'),
  ('Conspirator in Chief: The Long Tradition of Conspiracy Theories in the American Presidency', 'Stephen Knott', 'sfknott@gmail.com', '', '[]', ARRAY['Presidential History', 'Political History', 'American Presidency', 'Politics', 'Government', 'Constitutional History', 'Democracy', 'Executive Power', 'Political Culture', 'Biography']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 385'),
  ('How English Witch-Hunting Manuals Guided New England''s Witch Trials, 1647-1697', 'Josh Hutchinson', 'sarah@endwitchhunts.org', '', '[{"name":"Sarah Jack","credentials":null,"bio":null}]', ARRAY['Witchcraft', 'Salem', 'Colonial America', 'Legal History', 'Religion', 'Puritanism', 'England', 'Primary Sources', 'Books', 'Cultural History']::text[], 'Session 1 — 9:30–10:15 AM', 'Room 425'),
  ('The Unknown Musician – An Inquiry into the Origin of Taps', 'Tom Mannle Jr.', 'tmannle@gmail.com', '', '[{"name":"Timothy A. Wray","credentials":null,"bio":null}]', ARRAY['Military History']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 235'),
  ('The United States Navy in the American Gilded Age (1878-1898): From Rotting Relic to Herald of Empire', 'Steve Parode', 'spondroad@gmail.com', '', '[]', ARRAY['Military History']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 275'),
  ('Who Was Agent 355? Women, Espionage, and the Culper Ring in the American Revolution', 'Kit Sergeant', 'kitsergeant.author@gmail.com', '', '[]', ARRAY['Am Rev', 'Women''s History']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 285'),
  ('1776: Independence and After', 'Robert J. Allison', 'rallison@suffolk.edu', '', '[]', ARRAY['American Revolution', 'Declaration of Independence', 'Continental Congress', 'Founding Era', 'Revolutionary Politics', 'Colonial America', 'Independence', 'Founding Fathers', 'Early Republic', '1776']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 295'),
  ('Famous Women, Forgotten Women: Stories from American History', 'Alan Fishel', 'alanfishel2@gmail.com', '', '[{"name":"Robin Hayutin","credentials":null,"bio":null}]', ARRAY['Women''s History', 'Biography', 'Reformers', 'Civil Rights', 'Education', 'American History', 'Leadership', 'Social Change', 'Forgotten History', 'Diversity']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 315'),
  ('''The Marines Have Landed…'' The Continental Marines and the Birth of the U.S. Marine Corps', 'Richard Tucker', 'richard.o.tucker1@gmail.com', '', '[]', ARRAY['Living History']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 335'),
  ('Civil War Monuments, from Obelisks to ''Parade Rest'' to American Renaissance', 'A. Michael Ruderman', 'amruderman@gmail.com', '', '[]', ARRAY['Civil War', 'Monuments', 'Memorials', 'Public History', 'Commemoration', 'Memory', 'Massachusetts', 'Art History', 'Civic Spaces', 'Historic Preservation']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 385'),
  ('Shays'' Rebellion: Reclaiming the Revolution', 'Tom Goldscheider', 'tom.goldscheider@gmail.com', '', '[]', ARRAY['Am Rev']::text[], 'Session 2 — 10:30–11:15 AM', 'Room 425'),
  ('Fake Portraits of Illustrious Leaders in Boston', 'Margo Burns', 'margoburns@gmail.com', '', '[]', ARRAY['Art History', 'Portraits', 'Museums', 'Authentication', 'Historical Mysteries', 'Boston', 'Colonial America', 'Material Culture', 'Collecting', 'Visual History']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 235'),
  ('Only a Dozen Loyalists in Marblehead?!', 'Judy Anderson', 'marbleheadarchitecture@gmail.com', '', '[]', ARRAY['Am Rev']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 275'),
  ('Seventeenth-Century English Immigrant Motivation and the Making of New England Institutions', 'John Cass', 'genejohncass@gmail.com', '', '[]', ARRAY['Immigrant History']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 285'),
  ('Dr. Joseph Warren – ''Act Worthy of Yourselves''', 'Sam Forman', 'sforman@hsph.harvard.edu', '', '[]', ARRAY['American Revolution', 'Biography', 'Boston', 'Bunker Hill', 'Sons of Liberty', 'Medicine', 'Patriot Movement', 'Revolutionary Leadership', 'Massachusetts', 'Military History']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 295'),
  ('Stopping to Witness History: How Micro-Monuments Inspire Human Connection', 'Mikayla Harden', 'mharden@historicnewengland.org', '', '[{"name":"Pat Wilson Pheanious","credentials":null,"bio":null},{"name":"Liz Lightfoot","credentials":null,"bio":null}]', ARRAY['Public History', 'Black History']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 315'),
  ('Reconstructing the Spoken Word of the 18th Century through the Adams'' Letters and Language', 'Sarah Walsh', 'pins.abigail76@gmail.com', '', '[{"name":"Christopher S. Davis","credentials":null,"bio":null}]', ARRAY['Living History']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 335'),
  ('Politics & Public Health, 1918: The Great War Meets the Great Influenza', 'B. Dale Magee', 'dalemagee@gmail.com', '', '[]', ARRAY['WWI', 'Medical History']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 385'),
  ('George Boutwell: Fighting to Redeem America''s Promise', 'Jeffrey Boutwell', 'boutwell@alum.mit.edu', '', '[]', ARRAY['Reconstruction', 'Civil War', 'Politics', 'Equal Rights', 'Constitutional History', 'Massachusetts', 'Biography', 'Government', 'Civil Rights', 'Gilded Age']::text[], 'Session 3 — 11:30 AM–12:15 PM', 'Room 425'),
  ('Much More than Taxation: Mercantilism and the Coming of the Revolution', 'Steve C. Call', 'sccall321@gmail.com', '', '[]', ARRAY['American Revolution', 'Economics', 'Mercantilism', 'British Empire', 'Colonial America', 'Trade', 'Taxation', 'Political Economy', 'Causes of the Revolution', '18th Century']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 235'),
  ('Walking Cape Cod''s Hidden History: from the American Revolution to the Kennedy/Civil Rights Era', 'Peggy Jablonski', 'pegjab@gmail.com', '', '[]', ARRAY['Local History', 'Women''s History', 'Indigenous History', 'Black History']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 275'),
  ('A Conversation with Nina Zannieri, Executive Director, Paul Revere Memorial Association on Four Decades of Historic Education and Preservation in Boston, and the Challenges Ahead', 'Nina Zannieri', '', 'Interviewed by Lee Wright', '[]', ARRAY['Public History', 'Local History']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 285'),
  ('Thirty days hath September … Except when it doesn''t', 'Jake Sconyers', 'jsconyers@gmail.com', '', '[]', ARRAY['Social History']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 295'),
  ('The Making of Abolition Acre! A Black Freedom Trail in Boston', 'Peter Snoad', 'psnoad@gmail.com', '', '[{"name":"Christie Rawlins-Jackson","credentials":null,"bio":null},{"name":"Mikayla Harden","credentials":null,"bio":null}]', ARRAY['Local History', 'Black History', 'Public History']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 315'),
  ('Park Street: A Mirror of Boston for Centuries', 'Rose A. Doherty', 'roseadoherty@aol.com', '', '[]', ARRAY['Local History']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 335'),
  ('Martians! What the War of the Worlds Broadcast Tells Us about American Society on the Eve of WWII', 'Lori Rogers-Stokes', 'lori.stokes@comcast.net', '', '[]', ARRAY['Radio', 'Mass Media', 'Popular Culture', 'Journalism', 'Public Panic', 'Technology', 'American Culture', 'Storytelling', 'Myth', '20th Century']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 385'),
  ('The Trial of Lizzie Borden: Whacks and Hacks', 'Dennis J. Curran', 'jdenniscurran@gmail.com', '', '[]', ARRAY['Women''s History', 'Legal History']::text[], 'Session 4 — 1:30–2:15 PM', 'Room 425'),
  ('The ''Industrial Beehive'' Takes Shape: Ideas, Innovation, and Enterprise in the Connecticut River Valley, 1820-1970', 'Robert Forrant', 'robert_forrant@uml.edu', '', '[]', ARRAY['Industrial Revolution', 'Manufacturing', 'Labor History', 'Technology', 'Innovation', 'New England', 'Economic History', 'Factories', 'Industry', '19th Century']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 235'),
  ('''I Am Not a Cautious Man'': The Most Important Founding Father You''ve Never Heard Of', 'Rebecca Flynt', 'flyntrebecca@yahoo.com', '', '[]', ARRAY['Am Rev']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 275'),
  ('Dr. Joseph Warren and an American Rebellion', 'Salina B. Baker', 'jlbopa@gmail.com', '', '[]', ARRAY['American Revolution', 'Biography', 'Joseph Warren', 'Boston', 'Bunker Hill', 'Historical Fiction', 'Revolutionary Leadership', 'Medicine', 'Massachusetts', 'Patriot Movement']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 285'),
  ('Is he really buried there? Searching for the graves of the Signers of the Declaration of Independence', 'Jennifer Epstein Rudnick', 'eppiejb@aol.com', '', '[]', ARRAY['American Revolution', 'Declaration of Independence', 'Founding Fathers', 'Founding Era', 'Historic Cemeteries', 'Burial Sites', 'Memorials', 'Historic Preservation', 'Genealogy', 'Public History']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 295'),
  ('Searching for Zickery Prince: A Journey Through the Archives', 'Melissa M. Cybulski', 'melissa.cybulski@longmeadowhistoricalsociety.org', '', '[]', ARRAY['Am Rev']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 315'),
  ('Quaker Girl Takes Washington''s Center Stage: The Influence of Dolley Madison', 'Janet Parnes', 'ladiestell@gmail.com', '', '[]', ARRAY['Living History']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 335'),
  ('Amelia Earhart, George Putnam, and the Making of an American Icon', 'Laurie Gwen Shapiro', 'lgsnyc@gmail.com', '', '[]', ARRAY['Women''s History', 'Biography', 'Aviation', 'Journalism', 'Publishing', 'Media', '20th Century', 'Exploration', 'American Culture', 'Celebrity']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 385'),
  ('Broken Promises on the Road Revolution in Natick, 1650-1783', 'Niki Lefebvre', 'director@natickhistoricalsociety.org', '', '[]', ARRAY['American Revolution', 'Indigenous History', 'Native Americans', 'Nipmuc', 'Black History', 'Colonial Massachusetts', 'Military Service', 'Community History', 'Local History', 'Massachusetts']::text[], 'Session 5 — 2:30–3:15 PM', 'Room 425'),
  ('Mapping Boston''s Literary History: From Colonial Printing Presses to Confessional Poets', 'Jessica A. Kent', 'info@literaryboston.com', '', '[]', ARRAY['Boston', 'Literature', 'Authors', 'Literary History', 'Maps', 'Walking Tour', 'Public History', 'Local History', 'Cultural History', 'Historic Sites']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 235'),
  ('How King Philip''s War led to the Revolutionary War', 'David Weed', 'drweed@cox.net', '', '[]', ARRAY['Indigenous History', 'King Philip''s War', 'Native Americans', 'Colonial America', 'New England', 'Military History', 'Colonial Conflict', 'Wampanoag', '17th Century', 'Massachusetts']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 275'),
  ('Revolutionary Revelation: Identifying Revolutionary War KIAs using Forensic Genealogy', 'Stacey Ferguson', 'stacey@historiccamden.org', '', '[]', ARRAY['Am Rev', 'Genealogy']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 285'),
  ('Paul Revere: Messenger Boy turned Industrial Entrepreneur', 'John Morton', 'johndmorton@gmail.com', '', '[]', ARRAY['Am Rev']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 295'),
  ('Maine Women and the Great Gathering of 10,000 in 1854', 'Judith C. Granger', 'judithgranger@comcast.net', '', '[]', ARRAY['Women''s History', 'Genealogy']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 315'),
  ('Printing Revolution: Declaration Edition', 'Andy Volpe', 'avarthistory@gmail.com', '', '[]', ARRAY['Am Rev']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 335'),
  ('Remembering 1918: Stories from an Epidemic', 'Patricia J. Fanning', 'pfanning@bridgew.edu', '', '[]', ARRAY['WWI', 'Medical History']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 385'),
  ('Sleuthing the ''Crime of the Century,'' the 1910 Bombing of the Los Angeles Times: A Bomb Detective''s Perspective', 'Michael Digby', 'mfdigby@msn.com', '', '[]', ARRAY['True Crime', 'Labor History', 'Legal History', 'Trial', 'Journalism', 'Industrial America', 'Bombing', '20th Century', 'Unions', 'Criminal Justice']::text[], 'Session 6 — 3:30–4:15 PM', 'Room 425'),
  ('Transforming Dark Tourism Sites Into Cultural Hubs Through the Lens of Medfield State Hospital', 'Emma Bickford', 'efbickford@gmail.com', '', '[]', ARRAY['Medical History', 'Mental Health', 'Architecture', 'Historic Preservation', 'Massachusetts', 'Public Institutions', 'Local History', '20th Century', 'Social History', 'Photography']::text[], 'Session 7 — 4:30–5:15 PM', 'Room 235'),
  ('Nathanael Greene: Savior of the Continental Army', 'Janet Uhlar', 'janetuhlar@comcast.net', '', '[]', ARRAY['American Revolution', 'Military History', 'Biography', 'Southern Campaign', 'Continental Army', 'George Washington', 'Leadership', 'Strategy', 'Rhode Island', 'Revolutionary War']::text[], 'Session 7 — 4:30–5:15 PM', 'Room 285'),
  ('The Pursuit of History for America''s 250th', 'J.L. Bell', '', '', '[{"name":"Lee Wright","credentials":null,"bio":null},{"name":"Mary Adams","credentials":null,"bio":null},{"name":"Ricardo A. Herrera","credentials":null,"bio":null}]', '{}'::text[], 'Session 7 — 4:30–5:15 PM', 'Room 295'),
  ('Fredrick Douglass on the Massachusetts'' Antislavery Circuit, 1840-1860', 'Anne F Mattina', 'anne.mattina@gmail.com', '', '[]', ARRAY['Black History', 'Frederick Douglass', 'Abolition', 'Civil Rights', 'Massachusetts', 'Public Speaking', 'Reform Movement', 'Slavery', 'Biography', '19th Century']::text[], 'Session 7 — 4:30–5:15 PM', 'Room 315'),
  ('Living Historian: Britain''s Glider Pilot Regiment', 'Kevin Getz', 'kgetz661944@gmail.com', '', '[]', ARRAY['Living History']::text[], 'Session 7 — 4:30–5:15 PM', 'Room 335'),
  ('Samuel Parris: Villain, Victim, or...? Yet Another Question Raised by the Salem Witch Trials', 'Marilynne K. Roach', 'mkr12y@yahoo.com', '', '[]', ARRAY['Legal History', 'Salem']::text[], 'Session 7 — 4:30–5:15 PM', 'Room 385'),
  ('From the Triangle Fire to Today: Women, Work, and the Fight for Safety and Dignity', 'Alycia Asai', 'civicscoffeepod@gmail.com', '', '[]', ARRAY['Women''s History', 'Labor History', 'Triangle Shirtwaist Factory Fire', 'Workplace Safety', 'Workers'' Rights', 'Industrial History', 'Progressive Era', 'Immigration', 'Labor Reform', 'Women''s Rights', 'Social Reform', 'New York City', 'Occupational Safety', 'Labor Activism', '20th Century']::text[], 'Session 7 — 4:30–5:15 PM', 'Room 425')
) as v(title, presenter_name, presenter_email, presenter_credentials, co_presenters, tags, tb_label, room_name)
join time_blocks tb on tb.label = v.tb_label
join rooms r on r.name = v.room_name;
