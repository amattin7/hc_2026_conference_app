-- History Camp Boston 2026 — session descriptions and presenter bios
--
-- Backfills sessions.session_description, sessions.presenter_bio, and
-- co_presenters[].bio from the organizers' full session write-ups
-- (docs/source-data/2026-session-descriptions-and-bios.csv). 51 of 55
-- sessions matched; the remaining 4 simply aren't in that export yet and
-- are left as-is (nullable fields, fine to backfill later).

update sessions set
  session_description = 'As our first and only disabled Founding Father, Gouverneur Morris of New York didn''t let the loss of a leg slow him down. He was an ardent Federalist, a passionate and outspoken Abolitionist, and a delegate to the Constitutional Convention who played a vital role in writing the Preamble. He succeeded Thomas Jefferson as U.S. Minister to France, served as a Senator, and helped design the street grid of Manhattan. In this session, we will explore the many accomplishments of a man whose ideas were ahead of their time.',
  presenter_bio = 'Rebecca Flynt is an author and storyteller with a passion for early American history. Her first novel, American Harlot, was published in 2024. Flynt enjoys speaking about the founding period and was a guest on historian Clay Jenkinson''s podcast Listening to America. Her second novel, Upon Leaving Bizarre, tells the scandalous story of Nancy Randolph, who would go on to become the wife of Gouverneur Morris.',
  co_presenters = '[]'::jsonb
where id = '0336b649-6ca9-4c25-8426-8892acdcecb3';

update sessions set
  session_description = 'The Continental Navy and the Continental Marines forced Britain to look at the American Revolution as something far more serious than a localized rebellion. This presentation focuses on the earliest days of the Continental Marines, their operations, arms, material culture, and contributions to the War for Independence, and how they helped George Washington secure victory during the 10 Crucial Days.',
  presenter_bio = 'Richard Tucker, MMH, is a Marine Corps veteran, lifelong reenactor, and accredited historian. Richard holds a BA in US History from Keene State College and an MA in Military History from Norwich University. He has done historical programming for the Tun Tavern Legacy Foundation and is commanding officer of Baker Company, 21st Marine Regiment (WW2 reenacted).',
  co_presenters = '[]'::jsonb
where id = '1346676b-4590-4d19-adf9-2e1ee26eb587';

update sessions set
  session_description = 'Why did the American colonies declare Independence in 1776? What were the challenges, and what potential opportunities did they see? How did their thinking change from trying to preserve their long-cherished charter rights, to announcing their arrival as an independent entity, equal among the powers of the earth to all other nations?',
  presenter_bio = 'Robert J. Allison, a professor of history at Suffolk University, also teaches in the Harvard Extension School. He has written a series of short books about the American Revolution, on the histories of Boston and of Cape Cod, as well as longer works on the Barbary Wars and Naval hero Stephen Decatur. He edited an edition of The Interesting Narrative of Olaudah Equiano, or Gustavus Vassa, the African. Allison created two classes for The Teaching Company''s series "The Great Courses," on colonial America drawn from his teaching which has covered all phases of American history, though his primary focus is the American Revolution and the early American republic. He is president of the Colonial Society of Massachusetts, a scholarly organization which publishes primary documents on early American history, a life-trustee of the USS CONSTITUTION Museum, and as chair of Revolution 250, Allison hosts its weekly podcast, a series of conversations on the Revolution with historians, museum curators, and re-enactors.',
  co_presenters = '[]'::jsonb
where id = '92ecbadf-59a1-4380-968c-dae7e6f2a5e9';

update sessions set
  session_description = 'With her 40 years of experience as the Executive Director of the Paul Revere Memorial Association in Boston, few people have the perspective that Nina does on the way in which Boston and Boston historic sites and organizations carry out their mission of historic education and preservation, including the challenges faced and the changes that have taken place over the last four decades. When Nina announced in May that she would be retiring, I immediately knew that she should be our guest for a conversation at History Camp Boston 2026. Please join us and bring your questions. — Lee Wright',
  presenter_bio = 'Nina Zannieri, Executive Director, Paul Revere Memorial Association. Since 1986, Nina Zannieri has been the Executive Director of the Paul Revere Memorial Association in Boston, MA, which owns and operates a now fully accessible complex of three historic buildings that includes the Paul Revere House. Ms. Zannieri has held leadership positions in several national and regional professional museum organizations including American Alliance of Museum, New England Museum Association, and the American Association for State and Local History. In 2015 she received a NEMA Lifetime Achievement Award. She currently sits on the board of the Freedom Trail Foundation, Seamans Port and Aid Society, Harvard University Museum Studies Advisory Board, and is a member of the Boston Green Ribbon Commission Cultural Organization Working Group Leadership team. She received her BA in history from Boston College and her MA in Anthropology/Museum Studies from Brown University.',
  co_presenters = '[]'::jsonb
where id = '4a76164e-738b-4597-bec2-2040915510f1';

update sessions set
  session_description = 'Amelia Earhart did not become Amelia Earhart by accident. In this talk, Laurie Gwen Shapiro shares the story behind The Aviator and the Showman, her new biography of Earhart and publisher-promoter George Palmer Putnam, tracing how a record-setting pilot, a gifted publicist, and a hungry American media culture together created one of the twentieth century''s most enduring legends. Drawing on deep archival research, Shapiro looks past the familiar disappearance story to explore Earhart''s ambition, marriage, fame, and the machinery that turned a complicated woman into an icon.',
  presenter_bio = 'Laurie Gwen Shapiro is the author of The Aviator and the Showman: Amelia Earhart, George Putnam, and the Marriage That Made an American Icon, published by Viking. She is also the author of The Stowaway and has written for The New Yorker, The New York Times, The Atlantic, and other publications. A journalist, filmmaker, and historian, she is currently at work on a biography of Albert Einstein in America.',
  co_presenters = '[]'::jsonb
where id = '35add064-a3cc-4d0e-ada5-39ab6d5bd24a';

update sessions set
  session_description = 'Founded as a Puritan Mission in 1651, Natick and its Indigenous residents endured a painful pattern of dispossession of rights, lands, and liberties in the century leading up to the American Revolution. And yet, more than forty Indigenous and Black men with ties to Natick enlisted to fight for the Patriot cause. Learn about the histories these soldiers carried with them into battle and how a community that lived through broken promises refused to be limited by them.',
  presenter_bio = 'Niki Lefebvre has been the Executive Director of the Natick Historical Society since 2018. In 2020, she was named a Rising Star by the Massachusetts History Alliance. She has spoken about Natick history to countless school, university, and public groups, as well as on regional media, including WCVB News and Chronicle. She holds an MA in Public History from the University of Massachusetts Amherst and a PhD in American Studies from Boston University.',
  co_presenters = '[]'::jsonb
where id = '81aceaf6-5f95-4b1f-b19e-6038812704ef';

update sessions set
  session_description = 'The Civil War monument is an iconic element of hundreds of Massachusetts''s town landscapes. From a shared anguish–sons and fathers killed on distant battlefields, and never to return–they give us a range of answers to the question of what those soldiers fought for. They also hold a mirror up to the nation we were becoming in the generation after Appomattox. We can see in these monuments a new America emerging, one reflected in an evolving architectural language of mourning and commemoration. This talk will relocate our Civil War monuments from the ubiquitous background of the town common to symbols of our American destiny.',
  presenter_bio = 'A. Michael Ruderman is a noted speaker and presenter on topics of Colonial and local history. He provided the research to substantiate the "First Map of the American Revolution", published in American Heritage magazine. He most recently appeared at History Camp in 2025 telling the story of the Battle of Menotomy, the Royal forces'' fight for their lives through an enraged countryside.',
  co_presenters = '[]'::jsonb
where id = '6e6c6872-a770-44f7-8ae5-634ac87398c3';

update sessions set
  session_description = 'Conspiracy theories have been part of American life from the beginning. The land of the free and the home of the brave has also been the den of false rumors and conspiratorial claims about one''s political enemies—not merely by rank-and-file Americans but also by our most powerful and consequential elected leaders. This talk will focus on presidents from the past who circulated falsehoods designed to undermine their opponents and enhance their own power, not just on the campaign trail but also during their tenure in office. The talk will conclude with a discussion of those presidents who shunned conspiracy mongering and embraced the "better angels of our nature."',
  presenter_bio = 'Dr. Stephen Knott is the Thomas & Mabel Guy Professor of American History & Government at Ashland University, and an Emeritus Professor of National Security Affairs at the United States Naval War College. Prior to accepting his position at the Naval War College, Knott was Co-Chair of the Presidential Oral History Program at the Miller Center of Public Affairs at the University of Virginia. He is the author or co-author of eleven books dealing with the American presidency, the early republic, and American foreign policy.',
  co_presenters = '[]'::jsonb
where id = 'f2a4c5ef-ecd4-47f6-a346-0b359c753848';

update sessions set
  session_description = 'The person who dispatched Paul Revere on that famous ride was also a citizen whose life and example has shaped the American experience in important ways. The impact and legacy of early Revolutionary War figure Dr. Joseph Warren is earning renewed attention from directions as disparate as Ken Burns'' documentary The American Revolution and Communist Chinese censors. Sam Forman, Warren''s biographer, will describe a compelling example of situational leadership at the outbreak of the Revolutionary War. Captivating and influential to both friends and enemies, Warren led in many roles effectively and simultaneously – Patriot leader, writer, and orator; Masonic grand master; and physician.',
  presenter_bio = 'Dr. Sam Forman is an historian and Harvard faculty member. He is educated in the history of the American Revolution as well as the practice of medicine. Throughout successful careers as a physician, military officer, and businessman, he has published and lectured on historical topics that inform current issues. Sam is the author of the award-winning biography Dr. Joseph Warren: The Boston Tea Party, Bunker Hill, and the Birth of American Liberty and Ill-Fated Frontier: Peril and Possibilities in the Early American West. Dr. Forman is a founding board member of The Pursuit of History and is a regular presenter at History Camp Boston.',
  co_presenters = '[]'::jsonb
where id = 'bb03bb6c-9c2a-4aff-811c-25bc34ce2812';

update sessions set
  session_description = 'He lit the spark that ignited a revolution, and then he paid for it with his life. In 1755, fourteen-year-old Joseph Warren left his family''s farm in Roxbury, Massachusetts, and walked into destiny when he entered Harvard. As a respected Boston physician, Warren healed the sick and challenged the British Empire, but as a leader of the Sons of Liberty and the radical resistance to English rule, he stood at the center of a growing storm. He authored the Suffolk Resolves, laying the philosophical groundwork for the Declaration of Independence. On the night of April 18, 1775, the responsibility to warn the countryside fell to Warren alone; he dispatched Paul Revere and William Dawes on their legendary rides. He died on the battlefield of Bunker Hill, becoming one of the Revolution''s earliest and most noble martyrs.',
  presenter_bio = 'Salina B. Baker is an author, presenter, and historian of the American Revolution. In 2023, she published a biographical novel about Major General Nathanael Greene titled The Line of Splendor, A Novel of Nathanael Greene and the American Revolution. Her latest work is a biographical novel about Dr. Joseph Warren titled Act Worthy of Yourselves: A Novel of Dr. Joseph Warren and an American Rebellion due to publish in July 2026. She has done presentations at Washington Crossing Historic Park, the General Nathanael Greene Homestead, Cowpens National Battlefield, Ninety-Six National Park, and Camden Revolutionary War Visitor Center. Salina serves as secretary and social media director for the Board of Directors of the Dr. Joseph Warren Foundation. Salina holds a degree in Computer Science and lives in Austin with her husband John.',
  co_presenters = '[]'::jsonb
where id = 'c562b38b-940b-42de-ad80-e1a3b24bb17e';

update sessions set
  session_description = 'The Massachusetts Capitol features a portrait gallery of colonial governors, all faithfully copied in the early 20th century from original portraits held by individuals and institutions—but many of the originals are fake. They are legitimately old paintings of unknown sitters by unknown artists being passed off as famous American people by famous American artists like Blackburn, Feke, and Smibert. Find out how Boston art dealer Frank W. Bayley and others pulled off their crimes and how to spot portraits with fake credentials.',
  presenter_bio = 'Margo Burns, AB, MA is a Project Manager and Associate Editor of Records of the Salem Witch-Hunt (published in 2009 by the Cambridge University Press), the definitive comprehensive record of legal documents pertaining to the Salem witchcraft trials, organized in chronological order. She is currently working on a book about William Stoughton, the Chief Magistrate of those trials, and has been studying early American painting.',
  co_presenters = '[]'::jsonb
where id = '61db7cc6-72c7-4519-be92-69bd41c740bd';

update sessions set
  session_description = 'American history is filled with extraordinary women who shaped the nation—yet many rarely appear in textbooks. In this presentation, audiences will hear riveting, rarely told stories about both well-known and lesser-known women. Among those featured are Harriet Tubman, Clara Barton, Eleanor Roosevelt, and Rosa Parks, as well as figures such as Ellen Craft, Jo Ann Robinson, Mamie Phipps Clark, Elizabeth Peratrovich, and Virginia Hall. In this intriguing and interactive session, you''ll learn how they did it and the impact they had.',
  presenter_bio = 'Alan Fishel, Esq. is the President of LearningPlunge, a nonprofit organization he started in 2012 to engage students and adults in U.S. history and geography. Alan researched and created content for HistoryPlunge (developed in collaboration with the Smithsonian''s National Portrait Gallery) and Women''s HistoryPlunge, developed in collaboration with the National Women''s History Museum. In addition to his work with LearningPlunge, Alan practiced law for nearly 40 years.',
  co_presenters = '[{"bio":"Robin Hayutin, Esq. is the Executive Director of the nonprofit LearningPlunge and is a lead researcher and writer behind its educational games, including HistoryPlunge and Women''s HistoryPlunge. Robin also produces daily historical content for LearningPlunge''s social media platforms. A former litigator, Robin later served as Director of Legal Education at a national bar association.","credentials":null,"name":"Robin Hayutin"}]'::jsonb
where id = 'bbd8cd31-d8f1-4f30-8664-35ae73463027';

update sessions set
  session_description = 'In 1838, newly self-emancipated Frederick Douglass arrived in New Bedford, Massachusetts with his bride Anna Murray Douglass, seeking nothing more than the safety of freedom. This presentation follows Douglass across Massachusetts—from his first public address on Nantucket to the radical "One Hundred Conventions" tour sponsored by the Massachusetts Antislavery Society. Through examining his experiences speaking at over 140 different cities and towns, we examine how his experiences in the Bay State served as a primary laboratory for Douglass''s activism, his groundbreaking publications, and his unwavering pursuit of justice for all.',
  presenter_bio = 'Anne F. Mattina, PhD, is Professor Emerita in the Department of Communication at Stonehill College, where she served as Department Chair from 2013 to 2021. A specialist in rhetoric and political communication, her research focuses on 19th-century American social movements and 20th-century gender and politics. In 2023, she was awarded a research fellowship by Mass Humanities. Dr. Mattina is a Distinguished Teaching Fellow of the Eastern Communication Association and currently serves as President of the Hopkinton, Massachusetts Historical Society. She holds a PhD from The Ohio State University.',
  co_presenters = '[]'::jsonb
where id = '9868ef2b-134b-49ea-bf6f-952ee99a7c7e';

update sessions set
  session_description = 'In March 1911, a fire raced through the Triangle Shirtwaist Factory in New York City, killing 146 garment workers — most of them young immigrant women. This talk explores how the Triangle Fire sparked new conversations about safety, workers'' rights, and the role of women in shaping reform. Attendees will meet the women who turned tragedy into action — including Frances Perkins and Clara Lemlich. More than a century later, the echoes of that day still shape the way we work today.',
  presenter_bio = 'Alycia Asai, M.A., holds a master''s degree in United States history, with research interests in women, labor, and the evolution of the social safety net in America. Her writing has appeared in Nursing Clio and Inside History Magazine. She is the lead researcher, writer, and producer of Civics & Coffee: A History Podcast. She is currently researching a book that examines the evolution of welfare policy in the United States.',
  co_presenters = '[]'::jsonb
where id = '35894df7-c809-4723-90f6-0394da23c3db';

update sessions set
  session_description = 'George Boutwell (1818-1905) is the most consequential public figure Americans have never heard of. As the youngest-ever governor of Massachusetts, Boutwell fought for equality and civil rights for all Americans from before the Civil War through the end of Reconstruction. He helped write the 14th and 15th amendments to the Constitution, led the impeachment of Andrew Johnson while in Congress, and helped establish the Modern American economy as Grant''s Secretary of the Treasury. George Boutwell fought to "redeem America''s promise" of equal rights and equal opportunity, and even took on Teddy Roosevelt as President of the Anti-Imperialist League.',
  presenter_bio = 'Jeffrey Boutwell, PhD, is retired from a 30-year-career on nuclear weapons arms control and the author of the biography of family member George S. Boutwell titled BOUTWELL: Radical Republican and Champion of Democracy, published by W.W. Norton in 2025. Jeffrey grew up in Concord, Massachusetts, received his PhD from M.I.T., and worked for many years at the American Academy of Arts and Sciences in Cambridge, Mass.',
  co_presenters = '[]'::jsonb
where id = '5baada71-dc04-446e-bc61-598516a14c37';

update sessions set
  session_description = 'Witchcraft belief in colonial New England was primarily imported from England by the colonists and refreshed through transatlantic trade and communication networks. Ministers and judges in New England consulted English legal and theological works for advice on the practical matters of operating a witchcraft prosecution. In this talk, we''ll cover the Malleus Maleficarum, King James'' Demonology, and works by William Perkins, Richard Bernard, and other English authors, comparing them to themes prevalent in New England books of the colonial period.',
  presenter_bio = 'Josh Hutchinson descends from people accused of witchcraft and people who accused others of witchcraft. He is the co-host of three history podcasts with Sarah Jack, and a co-founder of the Connecticut Witch Trial Exoneration Project and of End Witch Hunts.',
  co_presenters = '[{"bio":"Sarah Jack is a documented descendant of victims of witch trials held in Salem, Boston, and Hartford. She co-hosts three history podcasts with Josh Hutchinson, co-founded the Connecticut Witch Trial Exoneration Project, and is the Founding Executive Director of End Witch Hunts.","credentials":null,"name":"Sarah Jack"}]'::jsonb
where id = 'bb7000c0-d56d-4d72-8a9d-98675705855c';

update sessions set
  session_description = 'While the nation commemorates 250 years since the Declaration of Independence, this year also marks 350 years since King Philip''s War (1675–1676)—a pivotal but often overlooked conflict fought right here in New England. This presentation by Dr. David Weed will shed light on the causes, key events, and lasting legacy of the war, connecting it to the growing spirit of independence that would emerge a century later.',
  presenter_bio = 'David Weed, Psy.D., a retired clinical psychologist living in Warren, RI, became interested in the history of the 17th century in and around his community. In 2020 he launched the Sowams Heritage Area Project which is working to create a new National Heritage Area encompassing nine communities between Bristol and Providence, R.I.',
  co_presenters = '[]'::jsonb
where id = '5cd27b90-003f-43f8-bd65-e84fcf20a84b';

update sessions set
  session_description = 'What started out as a quirky hobby soon became an obsession: traveling to and photographing the graves of the 56 signers of the Declaration of Independence. A number of Declaration signers were not interred in their original burial locations or perhaps in unmarked graves. Hear some of the unusual stories of signers who were moved from their original burial places and whether all 56 were found.',
  presenter_bio = 'Jennifer Epstein Rudnick knew she wanted a career in history after being inspired by her fifth-grade teacher. She grew up in northwestern Connecticut and earned a Bachelor of Arts from Gettysburg College. She has worked for the National Park Service at several sites, and for more than 25 years, has been on the National Mall in Washington, DC. She lives in Northern Virginia with her husband.',
  co_presenters = '[]'::jsonb
where id = 'c0fe8f2e-0f67-4e0f-99b4-be0fbdd1ac68';

update sessions set
  session_description = 'Join living historian Kevin Getz for a presentation on the creation and history of the British Airborne''s Glider Pilot Regiment, from its inception through Operation Husky, Overlord, Arnhem, and Operation Varsity. Getz will be in a kit which includes a kilt in order to better tell the story of Captain James G. Ogilvie, a glider pilot who flew into Arnhem wearing his Gordon Highland kilt.',
  presenter_bio = 'Kevin Getz has been a living historian for nearly 30 years, Former 2IC of the 9th Parachute Battalion, Co-podcaster of the Ham & Jam – the British Airborne podcast, and a 33-year veteran of the Indiana State Police.',
  co_presenters = '[]'::jsonb
where id = '8570faca-68ed-4815-bc74-380d19005cf7';

update sessions set
  session_description = 'As early as the 1830s, rural Maine women committed themselves to the cause of abolition, a risky and radical stance. This presentation focuses on the Great Gathering of 10,000 in 1854, identifying what informed them and the many substantive local and national actions they accomplished to make a difference, speaking to the power of rural women to do far more than take care of home and hearth.',
  presenter_bio = 'Judith C. Granger, MEd, is a genealogist, a citizen historian, and a story teller. Since retiring, she has focused her research on the lives of two Black self-emancipating families who joined their kith and kin to settle wilderness Maine. She presents their evolving stories at genealogical and historical societies from Bar Harbor to Boston, and Kittery to Concord.',
  co_presenters = '[]'::jsonb
where id = 'ce46ab3f-3066-4c9e-8ccb-8bcf4e12caf1';

update sessions set
  session_description = 'Boston has an incredibly rich literary history, yet many people walk past sites every day where authors of the past lived, wrote, gathered, and published without realizing it. In this session, Kent will walk attendees through the highlights of Boston''s literary past, from Colonial printing presses to 20th-century poets, placing each location on a map of Boston and Cambridge. Note: Jessica will also be hosting walking tours of the Boston area on Sunday, August 9, 2026.',
  presenter_bio = 'Jessica A. Kent is the founder and director of Literary Boston, a cultural initiative that promotes the Boston literary community, past and present. She holds a BFA in Creative Writing from Emerson College and a Master''s in Literature from Harvard University. Her short fiction has appeared in the North American Review and the Emerson Review. She is currently working on a novel about paramedics in 1970s Boston.',
  co_presenters = '[]'::jsonb
where id = '497e13af-c15c-4f2a-985f-69aaf40956ac';

update sessions set
  session_description = 'The 1938 Orson Welles radio production of H.G. Wells''s War of the Worlds has gone down in history for causing a panic about a Martian invasion. Were people back then really so gullible, or were there close connections between that story and the state of the world on the brink of another world war? We''ll explore the details of this amazing historical moment and listen to some clips from the actual broadcast together.',
  presenter_bio = 'Lori Rogers-Stokes, PhD, is an independent scholar, public historian, and contributing editor for New England''s Hidden Histories, a digital history project from the Congregational Library and Archives. She is the author of Gathered into a Church: Indigenous-English Congregationalism in Woodland New England. Lori has also spent many years analyzing U.S. history through the lens of mid-century horror radio broadcasts from the 1930s-80s.',
  co_presenters = '[]'::jsonb
where id = '647c0af8-43d6-4c4e-af2b-b0ddb069c415';

update sessions set
  session_description = 'While many motives compelled colonists to resist British efforts to impose greater control over the colonies, taxes and commercial restrictions became the flashpoints of overt colonial resistance. This talk explores why Britain was so intransigent on these points, examining contemporary European attitudes shaped by the predominant economic theory of the day: Mercantilism.',
  presenter_bio = 'Steven C. Call, PhD, earned his bachelor''s degree in history from SUNY Binghamton in 1981 and his PhD in 1997 from Ohio State University, specializing in military, European, and American history. Steve retired from the Air Force in 2001 after twenty years and began his career as a college professor. His books include Danger Close: Tactical Air Controllers in Afghanistan and Iraq and Selling Air Power. Steve retired from teaching in 2024 and now works as an independent historian, living in Upstate New York.',
  co_presenters = '[]'::jsonb
where id = 'd5cc6b6d-46ff-453c-bf10-e4e8064dc247';

update sessions set
  session_description = 'Nathanael Greene was the strategist of the American Revolution. His role in the War for Independence was second only to General George Washington. Born and reared a Quaker, with no military experience, he was promoted from private to brigadier general literally overnight. It was Greene who drove British General Cornwallis to surrender at Yorktown. Three years after the official end of the war, Nathanael Greene was dead at the age of forty-four, a result not only of the hardships of the War, but the cruelty inflicted on him by members of Congress.',
  presenter_bio = 'Janet Uhlar imparts accurate history through biographical-fiction. Her research on Joseph Warren and Nathanael Greene began in 1985, culminating in her book and screenplay Liberty''s Martyr, and the book Freedom''s Cost. Janet teaches "The American Revolution: A Different Perspective" at the Cape Cod Community College and has been published in the Journal of the American Revolution. She served on the Board of Trustees of the Nathanael Greene Homestead.',
  co_presenters = '[]'::jsonb
where id = '5c24681e-7841-426e-97e7-5c1d5e8e59e3';

update sessions set
  session_description = 'The invaluable service of Marblehead''s many Patriots in the American Revolution is well documented. Lesser known is that of nearly 950 families, only about a dozen heads of households can be identified as Loyalists, and all left town — though ten years later, half of them returned. In this illustrated talk, architectural and social historian Judy Anderson will present some of their stories and showcase their homes.',
  presenter_bio = 'Judy Anderson is an architectural, cultural, and social historian who has spoken about Marblehead for more than 30 years. She became the first year-round staff person and administrative director at the Marblehead Museum, later serving as curator of the Colonel Jeremiah Lee Mansion. She has spoken at museums and cultural organizations up and down the Atlantic seaboard, including the Colonial Williamsburg Antiques Forum and the Victoria & Albert Museum in London.',
  co_presenters = '[]'::jsonb
where id = 'cdeac414-ab32-43fe-951b-3d07cae63d74';

update sessions set
  session_description = 'March 17, 1776: cannons roar from Dorchester Heights, moved from Fort Ticonderoga by Colonel Henry Knox in one of the greatest logistical feats in military history. It was oxen who carved a path through the American War of Independence, keeping the armies clothed, fed, and armed. Learn about oxen themselves — the terminology, anatomy, and science behind these amazing animals — and follow them from Lexington to Yorktown.',
  presenter_bio = 'Owen Laurenzo has always been interested in the American and French Revolutionary Wars, as well as animal husbandry and training. He has two pairs of oxen, raised and trained almost entirely on his own, and has been involved with 4H for 8 years and re-enacting since 2023. His oxen pulled the cannon at nine events during the 250th anniversary celebration of Henry Knox''s Noble Train of Artillery.',
  co_presenters = '[]'::jsonb
where id = '170263d4-9c26-49ad-a678-29e8772fffc5';

update sessions set
  session_description = 'Park Street has overlooked Boston Common, the country''s oldest public park, for almost four centuries. This illustrated talk will show how Park Street changed to echo the people and architecture of each era, from the Granary, Almshouse, Workhouse, and jail of the early period to private homes and Park Street Church in the 19th century.',
  presenter_bio = 'Rose A. Doherty is a board member of The Pursuit of History, Honorary Fellow of the Massachusetts Historical Society, and tour leader for the Friends of the Public Garden. Rose was academic dean and later chair of the board of trustees of Gibbs College. She is the author of Katharine Gibbs: Beyond White Gloves.',
  co_presenters = '[]'::jsonb
where id = '7a03ee94-c548-424d-b502-8a7e6c23541d';

update sessions set
  session_description = 'Almost everyone knows about Paul Revere''s midnight ride, but less discussed is Revere''s role during the Revolution as a man always on the go. His revolutionary experience — from replicating a gunpowder mill to becoming a bell maker and opening a copper rolling mill — transformed him from a small-time silversmith to an industrial entrepreneur.',
  presenter_bio = 'John Morton, PhD, is the Executive Director of the Paul Revere Museum of Discovery and Innovation (MoDI) in Canton, Massachusetts. Before becoming director of the MoDI, John was a visiting professor at Saint Joseph''s University in Philadelphia and at Boston College. He studied history at Boston College, UMass Amherst, and the University of Vermont, and his research focuses on New England and Atlantic Canada after the American Revolution.',
  co_presenters = '[]'::jsonb
where id = '938ce7ae-ba80-4804-995a-b0e410ab424d';

update sessions set
  session_description = 'America was founded on the principle of liberty, yet, as citizens, we are sometimes called upon to sacrifice for the government. In 1918 the United States prepared to enter World War I just as history''s most devastating influenza pandemic began its spread. How did Americans respond, and what priorities did the government have? We will explore culture, mandates and details of what played out to put both government and public health into perspective.',
  presenter_bio = 'B. Dale Magee, MD, is a retired physician whose career has included public health and public policy as well as clinical practice. He began the New England History of Medicine Society in 2025 and has served as Commissioner of Public Health for the City of Worcester and president of both the Massachusetts and Worcester Medical Societies.',
  co_presenters = '[]'::jsonb
where id = '94618505-3f2d-4548-8d5a-9752b9646ab0';

update sessions set
  session_description = 'This presentation looks at the development of the printing press and printing technologies, with an emphasis on the legal & publication battles fought for Freedom of the Press and Free Speech as it unfolded between the American Colonies and England, culminating with the printing of the Declaration of Independence.',
  presenter_bio = 'Andy Volpe is an artist, printer, and living history presenter based in Worcester, MA. He works with the Museum of Printing in Haverhill, MA, and the Printing Office of Edes & Gill, where he replicates engravings of Paul Revere. He can also be found giving arms and armor presentations at the Worcester Art Museum.',
  co_presenters = '[]'::jsonb
where id = '53b338f5-163f-4fea-b19d-02ad7c182c19';

update sessions set
  session_description = 'Stroll through the social and political swirl of post-Revolution America! Your escort will be Dolley Madison, the Quaker child who transformed herself into one of America''s most powerful First Ladies. Discover how this patriot used her charm, wit, and resourcefulness to unite our country and influence it socially and politically.',
  presenter_bio = 'Janet Parnes has been whisking overlooked American heroines out of History''s dusty archives and bringing them to life for 20 years. Through her company, Historical Portrayals by Lady J, Janet brings to life ladies that include Dolley Madison, Deborah Sampson, and Frances Perkins. Janet has performed at History Camp Boston, the Massachusetts State House, and the JFK Presidential Library & Museum.',
  co_presenters = '[]'::jsonb
where id = '7e608796-3d0c-4a81-ae68-7c6c7b888e05';

update sessions set
  session_description = 'In the wake of the battles around New York City in 1776, the Neutral Ground of Westchester County became contested terrain between Patriot forces and Loyalist irregulars known as "Cowboys." The second part of this session focuses on Colonel Christopher Greene, cousin of General Nathaniel Greene, who commanded the integrated First Rhode Island Regiment and lost his life in a violent raid on his headquarters at Pine''s Bridge. Together, these presentations reveal a lesser-known aspect of the American Revolution at the small unit level.',
  presenter_bio = 'Ben Powers, MA, resides in Texas with his wife and four children. Ben is a retired Army officer, author, YouTuber, and President of the Board of Directors of the American Veterans Archaeological Recovery Project (AVAR).',
  co_presenters = '[{"bio":"Bjorn Bruckshaw is an independent historian of the American Revolution and host of the YouTube Channel Rogue Island. A combat infantryman and Purple Heart recipient, he has written for the Journal of the American Revolution and resides in New Hampshire with his daughter.","credentials":null,"name":"Bjorn Bruckshaw"}]'::jsonb
where id = '3918db6c-4bcd-4c2a-8bcc-9eccd9c2583b';

update sessions set
  session_description = 'The letters between John and Abigail Adams survive as one of the most comprehensive records of day to day life during the Revolution and Early Federal period. At the time, reading letters was a communal act. Join Abigail Adams interpreter Sarah Walsh and historical dialect coach Christopher S. Davis in a live recording session of "Adams Letters and Language: A Revolutionary, Elocutionary Podcast" as they explore how reconstructing the voices of the past can help us more deeply connect to our forebears.',
  presenter_bio = 'Sarah Walsh is a librarian and educator who became involved in living history thanks to theater, taking on the role of Abigail Adams in the first fully staged production of "1776" with an all-women and nonbinary cast, and later joining an 18th century re-enactment group.',
  co_presenters = '[{"bio":"Christopher S. Davis has over 12 years of experience as a dialect coach, actor, and historical interpreter, specializing in spoken English from about 1500 to the early-1900s. He is a member of VASTA and the American Dialect Society, and has a particular passion for the Boston Tea Party.","credentials":null,"name":"Christopher S. Davis"}]'::jsonb
where id = '77a3757b-8a6a-4e4f-9869-3d3074c22110';

update sessions set
  session_description = 'Growing up, Patricia Fanning heard only one story about her grandmother: that she died in the 1918 influenza epidemic at age 38. Years later, researching that epidemic in Norwood, Massachusetts, it was the interviews with survivors and family stories that illuminated the experience of the epidemic. This session focuses on those conversations and the rewards of gathering forgotten or ignored accounts of this tragic episode.',
  presenter_bio = 'Patricia J. Fanning, PhD, is a public historian and Professor of Sociology Emeritus at Bridgewater State University. A lifelong resident of Norwood, Massachusetts, she is a long-time member and former president of the Norwood Historical Society. Her work was published in Influenza and Inequality: One Town''s Tragic Response to the Great Epidemic of 1918.',
  co_presenters = '[]'::jsonb
where id = 'a47103cc-b25e-443f-9106-defa7ca5e933';

update sessions set
  session_description = 'In 2022, fourteen soldiers from the Battle of Camden on August 16th, 1780, were exhumed from the battlefield and reburied with full military honors. The archaeology offered many clues about how these soldiers lived and died, but not their names. Groundbreaking DNA science and expert genealogy have unlocked many tantalizing clues about their identities… and maybe even their names.',
  presenter_bio = 'Stacey Ferguson is the Deputy Director and Battlefield Manager for the Historic Camden Foundation in Camden, South Carolina, and an Archaeological Field Technician with American Veterans Archaeological Recovery. A retired Lieutenant Colonel in the United States Air Force, she has appeared on shows on PBS, CBS, and NBC and will be featured in an upcoming episode of Secrets of the Dead.',
  co_presenters = '[]'::jsonb
where id = '2f49ab6b-f924-434c-b129-05d521a51216';

update sessions set
  session_description = 'Generations of commentators have delighted in depicting the Rev. Samuel Parris as an arch-villain. What exactly did Parris do during the witch trials–and not do? What was the situation in the Village that resulted in such an avoidable tragedy? And how did Parris spend the rest of his life both before and after the Salem witch trials?',
  presenter_bio = 'Marilynne K. Roach, independent researcher, writer, and illustrator, has delved into the 1692 trials for nearly half a century. Roach was one of the sub-editors contributing to the definitive Records of the Salem Witch-Hunt, and has authored several books about the Salem Witch Trials including The Salem Witch Trials: a Day-by-Day Chronicle of a Community Under Siege and Six Women of Salem.',
  co_presenters = '[]'::jsonb
where id = '523c8971-6fb5-4b01-bbde-b1043ab0e3cb';

update sessions set
  session_description = 'In this session, Melissa M. Cybulski will share her journey through archives, databases, and libraries looking for details of the life of a man enslaved in 18th Century Longmeadow, MA and Simsbury, CT. Zickery''s life can be traced for more than 40 years, through 7 owners, 2 states, and ultimately a Revolutionary War hospital in Fishkill, NY where he died during his service in the Continental Army.',
  presenter_bio = 'Melissa M. Cybulski is Vice-President of the Longmeadow Historical Society in Western Massachusetts. She is a local historian, museum guide at the Emily Dickinson Museum, and consultant for Historic New England''s Witness Stones program. Melissa presented on the topic of Johnny Appleseed''s Revolutionary Childhood at History Camp 2025.',
  co_presenters = '[]'::jsonb
where id = '0e070578-1144-4f43-85fd-6195e6c995a1';

update sessions set
  session_description = 'This presentation reframes the Great Migration (1620–1640) by showing that religion was only one motivation. Many migrants also left England out of Duty and a desire for Justice, reacting to Crown-controlled courts and uneven legal protections. This talk explores how Faith, Duty, and Justice shaped both the immigrant experience and the development of local institutions.',
  presenter_bio = 'John Cass has been a family historian since the 1980s, researching history in the UK, the west coast, and New England. He has presented at previous Boston History camps and at Historical Society Meetings.',
  co_presenters = '[]'::jsonb
where id = 'daeda81f-d33a-4463-8334-8de25f10ad8b';

update sessions set
  session_description = 'Shays'' Rebellion presents an uncomfortable chapter in our history. How do we account for an armed insurrection against the state in the cradle of the American Revolution? We will take a new look at this tumultuous period by focusing on the experiences of three men from Williamsburg, all made prisoners of debt just before the Rebellion.',
  presenter_bio = 'Tom Goldscheider earned his Masters degree in History at UMass Amherst with a concentration in the Colonial Period. He is a public historian who has published and lectured on Shays'' Rebellion and labor unions in Greenfield, and is the Education Coordinator at the David Ruggles Center for History and Education.',
  co_presenters = '[]'::jsonb
where id = 'c7571d4c-e862-4b66-aad2-b5998b2f52e0';

update sessions set
  session_description = 'In the late afternoon of September 30, 1910, James Barnabus (JB) McNamara left his downtown Los Angeles hotel on a mission to plant bombs as part of a years-long, nationwide campaign of industrial sabotage and terror. A powerful explosion ripped through the Los Angeles Times building, killing twenty-one employees. In this presentation, Mike Digby, a 43-year veteran bomb detective, will discuss the so-called National Dynamite Plot from its origins to its demise.',
  presenter_bio = 'Michael Digby retired after seven years in the US Army, followed by a 44-year law enforcement career in Los Angeles where he spent the majority of his time as a detective and FBI certified bomb technician. A native of Manchester, Massachusetts, Mike has used the 1910 bombing in his training of bomb detectives and technicians.',
  co_presenters = '[]'::jsonb
where id = '3eb6e034-37e5-4b09-885d-7d0f51cd9655';

update sessions set
  session_description = 'What does it mean to remember someone history forgot? Physical markers — plaques, monuments, and public art installations — offer powerful opportunities to reconnect communities with the past. The staff of Stopping Stones share their experience creating commemorations at sites of enslavement, labor, and worship, exploring how honoring forgotten lives can restore the humanity of enslaved Americans and open unexpected pathways to racial healing today.',
  presenter_bio = 'Mikayla Harden, MA, holds degrees from the University of Texas at Austin and the University of Delaware, where she is completing her doctorate on the lives of enslaved Black children in eighteenth-century New York.',
  co_presenters = '[{"bio":"Pat Wilson Pheanious, JD MSSW, a Connecticut native, social worker and attorney, discovered five generations of her enslaved ancestors in 2017, becoming the Witness Stones Project''s founding Board Chair in 2019 and Executive Director in 2024.","credentials":null,"name":"Pat Wilson Pheanious"},{"bio":"Liz Lightfoot serves as School and Youth Program Manager at Stopping Stones, coming from the Witness Stones Project. A journalist-turned-educator, she has a bachelor''s degree from Harvard and a masters in Journalism from Columbia.","credentials":null,"name":"Liz Lightfoot"}]'::jsonb
where id = 'fbc08e4a-1d88-4b86-beba-33b25f528d03';

update sessions set
  session_description = 'Two hundred fifty years ago this month, members of the Continental Congress put their signatures on a handwritten copy of their Declaration. This talk explores selected stories about those signatures: who was among the first to sign yet doesn''t appear today, who helped draft the Declaration but never signed it, who was last to sign, and the handprint that mysteriously appeared on the document.',
  presenter_bio = 'J. L. Bell is the author of The Road to Concord: How Four Stolen Cannon Ignited the Revolutionary War and numerous articles. He maintains the Boston 1775 website, offering daily postings of history, analysis, and unabashed gossip about Revolutionary New England.',
  co_presenters = '[]'::jsonb
where id = '7f9ac175-4944-4b79-a6bc-91fbc4edc116';

update sessions set
  session_description = 'How do small historic sites responsibly interpret histories of enslavement—especially when records are limited and the stories are difficult to tell? Join moderator Jake Sconyers for a panel discussion featuring leaders from Old North Church, King''s Chapel, and the Shirley-Eustis House, exploring the challenges and opportunities of this work and offering practical insights for public history professionals.',
  presenter_bio = 'Nikki Stewart serves as the Executive Director of Old North Illuminated, managing research, interpretation, and preservation at Old North Church. Her initiatives earned an Award of Excellence from AASLH in 2024.',
  co_presenters = '[{"bio":"Roeshana Moore-Evans is the Director of the Living Memorial at King''s Chapel, leading public memory and reparative justice efforts, including the activation of Unbound: A Memorial to Enslaved Persons.","credentials":null,"name":"Roeshana Moore-Evans"},{"bio":"Suzy Buchanan is Executive Director of the Shirley-Eustis House Association, and led the effort to save the estate''s former stable, resulting in its designation as Boston''s first Landmark recognized for its association with chattel slavery.","credentials":null,"name":"Suzy Buchanan"}]'::jsonb
where id = '44cbc1f4-0f17-442d-a1a5-aca3ed3e49d5';

update sessions set
  session_description = 'This talk explores 150 years of innovative and collaborative precision manufacturing in the Connecticut River Valley. Springfield was at the center of a prosperous 200-mile industrial corridor, benefiting from a 1794 decision by Congress to locate a federal armory there — a clearinghouse that diffused production techniques to firms building everything from rifles to Henry Ford''s Model T assembly line.',
  presenter_bio = 'Robert Forrant has been on the University of Massachusetts Lowell history faculty since 1994, teaching labor and immigration history. Prior to 1994, he worked for nearly fifteen years as a machinist and union business agent in Springfield, MA. His newest book, Where Are the Workers, was published by the University of Illinois Press in 2022.',
  co_presenters = '[]'::jsonb
where id = '4cba5a6d-59e4-473d-9824-599c60b8341f';

update sessions set
  session_description = 'Boston is renowned as the cradle of the American Revolution, but it was also the birthplace of the movement to end slavery. Beacon Hill Scholars launched Abolition Acre! A Black Freedom Trail in Boston, a self-guided tour of 10 downtown abolitionist sites with audio narration. As a session participant, you will learn why and how it was created and discuss the practical challenges of creating a walking trail of historic sites.',
  presenter_bio = 'Peter Snoad is the volunteer Project Coordinator at Beacon Hill Scholars (BHS), a history buff, former journalist, and award-winning playwright.',
  co_presenters = '[{"bio":"Christle Rawlins-Jackson is President of Beacon Hill Scholars, a fiber and multimedia artist, poet, photographer, and independent researcher.","credentials":null,"name":"Christie Rawlins-Jackson"},{"bio":"Mikayla Harden volunteers with Beacon Hill Scholars as its Social Media Coordinator, and is Assistant Program Director and Researcher of the Stopping Stones Project at Historic New England.","credentials":null,"name":"Mikayla Harden"}]'::jsonb
where id = '57ff38bb-fea7-4f30-8cac-3ae0ce996eed';

update sessions set
  session_description = 'The Pursuit of History is the only organization in the country with a series of programs that covers the entire span of the conflict, from the rebellion in 1774 through the Treaty of Paris in 1783. In this program we''ll explain the idea behind the series and the key events we''ll cover, including programs in Philadelphia and Trenton, plus a look ahead to Quincy in Spring 2027.',
  presenter_bio = 'John Bell is the program director for the series.',
  co_presenters = '[{"bio":null,"credentials":null,"name":"Lee Wright"},{"bio":null,"credentials":null,"name":"Mary Adams"},{"bio":"Ricardo A. Herrera, Ph.D., began his career as an armor and cavalry officer in the U.S. Army and is Senior Historian, George Washington Leadership Institute, and Professor Emeritus, U.S. Army War College. He is the author of Feeding Washington''s Army and For Liberty and the Republic: The American Citizen as Soldier, 1775-1861, among other works.","credentials":null,"name":"Ricardo A. Herrera"}]'::jsonb
where id = '38d9b76f-31e1-409a-938c-632fc0ce90d0';

update sessions set
  session_description = 'This case presents one of America''s most notorious and enduring murder mysteries. When Andrew and Abby Borden were brutally hacked to death in Fall River, Massachusetts in August 1892, the arrest of their daughter Lizzie turned the case into international news and her trial into a spectacle unparalleled in American history. The trial of Lizzie Borden offers a window into America in the Gilded Age.',
  presenter_bio = 'Justice Dennis J. Curran (Ret.) is a graduate of Boston Latin School, the University of Pennsylvania, and the University of Virginia Law School. He served as a Massachusetts trial judge for 15 years and received four statewide awards for judicial excellence. He has served as a Professor of the Practice at Tufts University.',
  co_presenters = '[]'::jsonb
where id = '81055eae-a1ca-4628-b010-e60d78298afd';

update sessions set
  session_description = 'In 1908, a pair of newlyweds trade their last belongings for a green tandem bicycle and ride 2,000 miles back to California. In 1917, The Adventures of a Woman Hobo by Ethel Lynn was published — an engaging memoir of the trip. Evidence suggests it is also largely fabricated. Join historian and writer Heather Cole as she shares highlights from the book and her own adventures uncovering the truth.',
  presenter_bio = 'Heather Cole, MA, is a writer and historian living in the Shenandoah Valley of Virginia. She is author of several local history books and runs a small publishing company (Rock Street Press). Her day job is as editor and director of media relations for Bridgewater College in Virginia.',
  co_presenters = '[]'::jsonb
where id = '0a5ecacb-f327-4c3c-9e80-a769c038fa93';

update sessions set
  session_description = 'Much has been made of the American "Gilded Age" as a time of impressive wealth generation and technological experimentation. In fewer than twenty years the United States Navy transformed itself from a coastal defense force into a far-ranging maritime force. This presentation illuminates the specific character of Gilded Age politics and technology that re-engineered the Navy into the first herald of the American empire.',
  presenter_bio = 'Steve Parode, Rear Admiral, U.S. Navy (Retired), retired in 2020 after a career focused on technical intelligence and defense acquisition; he was the last Flag Officer to have served aboard USS WISCONSIN. A graduate of UCLA and Georgetown, and a Distinguished Graduate of the Naval War College, Steve rejoined the Navy as a civilian executive in 2022.',
  co_presenters = '[]'::jsonb
where id = 'af1aa007-4e2e-44e4-b8e6-30c4efe9d4b0';

update sessions set
  session_description = 'In July 1862, Brigadier General Daniel Butterfield and bugler Oliver W. Norton collaborated to transform an existing bugle call into what became Taps, officially adopted by the U.S. Army in 1891. There is no contemporaneous account of its development, creating an opportunity to tell a different story, with a new character who may have contributed materially to its creation: a third participant, an Unknown Musician.',
  presenter_bio = 'Tom Mannle, Jr., BS, MPA, Lieutenant Colonel, U.S. Army (retired), is a healthcare consultant specializing in market analysis for the Departments of Defense and Veterans Affairs, and an avid family genealogist.',
  co_presenters = '[{"bio":"Timothy A. Wray, BS, MA, MMAS, JD, Colonel, U.S. Army (retired), taught military history at West Point and did a fellowship at Harvard''s Center for International Affairs before obtaining a JD and working as a government attorney.","credentials":null,"name":"Timothy A. Wray"}]'::jsonb
where id = '1e22d3b3-5e2a-4f87-8115-ec48ae8c5901';

update sessions set
  session_description = 'We all know the mnemonic: thirty days hath September, April, June, and November — but what if September suddenly had only nineteen days? That''s exactly what Boston experienced in 1752, when the town went to bed on September 2nd and woke up on the 14th, as the British Empire switched to a new calendar system. How did Bostonians adapt to the change?',
  presenter_bio = 'Jake Sconyers hosts the HUB History podcast, a show about Boston history that goes far beyond the Freedom Trail. With over 350 episodes, HUB History celebrates its tenth anniversary this October. Jake has also been a Back Bay tour guide, a docent at the Shirley-Eustis House, and producer of a new podcast series from Queer History Boston.',
  co_presenters = '[]'::jsonb
where id = '64352c58-dcf3-4df3-9b15-92931f3ff538';
