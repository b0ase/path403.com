-- Clear existing video data
DELETE FROM "Video";

-- Insert Cherry videos (symlinked from cherry-xxx)
INSERT INTO "Video" (filename, url, "projectSlug") VALUES
  ('chrerry-video-1.mp4', '/studio/projects/Cherry/chrerry-video-1.mp4', 'cherry'),
  ('chrerry-video-2.mp4', '/studio/projects/Cherry/chrerry-video-2.mp4', 'cherry'),
  ('chrerry-video-3.mp4', '/studio/projects/Cherry/chrerry-video-3.mp4', 'cherry'),
  ('chrerry-video-4.mp4', '/studio/projects/Cherry/chrerry-video-4.mp4', 'cherry'),
  ('chrerry-video-5.mp4', '/studio/projects/Cherry/chrerry-video-5.mp4', 'cherry'),
  ('chrerry-video-6.mp4', '/studio/projects/Cherry/chrerry-video-6.mp4', 'cherry'),
  ('chrerry-video-7.mp4', '/studio/projects/Cherry/chrerry-video-7.mp4', 'cherry'),
  ('cherry-video-1.mp4', '/studio/projects/Cherry/cherry-video-1.mp4', 'cherry'),
  ('cherry-video-2.mp4', '/studio/projects/Cherry/cherry-video-2.mp4', 'cherry'),
  ('cherry-video-3.mp4', '/studio/projects/Cherry/cherry-video-3.mp4', 'cherry');

-- Insert NPG videos (symlinked from ninja-punk-girls-com)
INSERT INTO "Video" (filename, url, "projectSlug") VALUES
  ('1.mp4', '/studio/projects/NPG/1.mp4', 'npg'),
  ('2.mp4', '/studio/projects/NPG/2.mp4', 'npg'),
  ('3.mp4', '/studio/projects/NPG/3.mp4', 'npg'),
  ('4.mp4', '/studio/projects/NPG/4.mp4', 'npg'),
  ('hero-centre.mp4', '/studio/projects/NPG/hero-centre.mp4', 'npg'),
  ('grok-video-4c567c38.mp4', '/studio/projects/NPG/grok-video-4c567c38-1d08-45bd-9172-0bf4768595a0.mp4', 'npg'),
  ('grok-video-a62a6660.mp4', '/studio/projects/NPG/grok-video-a62a6660-fa0f-4f22-912e-7496e7aa7679.mp4', 'npg');

-- Insert AIVJ videos (first 10 from the square folder)
INSERT INTO "Video" (filename, url, "projectSlug") VALUES
  ('grok-video-612a7c54.mp4', '/studio/projects/AIVJ/grok-video-612a7c54-ce56-42b3-b12b-e1a3b017e55d.mp4', 'aivj'),
  ('grok-video-a742ad71.mp4', '/studio/projects/AIVJ/grok-video-a742ad71-f5fb-4e79-924a-bcf596f8709d.mp4', 'aivj'),
  ('grok-video-b1bb94b5.mp4', '/studio/projects/AIVJ/grok-video-b1bb94b5-79c5-46e6-9564-2761046675f1.mp4', 'aivj'),
  ('grok-video-7473a580.mp4', '/studio/projects/AIVJ/grok-video-7473a580-54a2-4521-928c-5988532af71d.mp4', 'aivj'),
  ('grok-video-297eddd2.mp4', '/studio/projects/AIVJ/grok-video-297eddd2-c1a7-4c89-8608-476c700b6c1a.mp4', 'aivj'),
  ('grok-video-6f690d62.mp4', '/studio/projects/AIVJ/grok-video-6f690d62-1e0a-4324-a1dd-b1a8748cf4e1.mp4', 'aivj'),
  ('grok-video-10156c0f.mp4', '/studio/projects/AIVJ/grok-video-10156c0f-8eeb-4c3d-96fb-64318f18ed5f.mp4', 'aivj'),
  ('grok-video-13b8a72f.mp4', '/studio/projects/AIVJ/grok-video-13b8a72f-8879-4264-9e98-e14765b794c6.mp4', 'aivj'),
  ('grok-video-111c5d70.mp4', '/studio/projects/AIVJ/grok-video-111c5d70-b869-4eb1-9fa8-5478203665ed.mp4', 'aivj'),
  ('grok-video-86d946e2.mp4', '/studio/projects/AIVJ/grok-video-86d946e2-0fc5-4242-afc2-b3ccdc7905ac (1).mp4', 'aivj');

-- Insert ZeroDice videos
INSERT INTO "Video" (filename, url, "projectSlug") VALUES
  ('grok-video-0a24a128.mp4', '/studio/projects/ZeroDice/grok-video-0a24a128-6be5-4d85-8072-9b7455044638-1.mp4', 'zerodice'),
  ('grok-video-14fa84ac.mp4', '/studio/projects/ZeroDice/grok-video-14fa84ac-5736-4432-9b51-f273b1c1e4e8-3.mp4', 'zerodice'),
  ('grok-video-2613faca.mp4', '/studio/projects/ZeroDice/grok-video-2613faca-ed51-4e09-aaaa-926ff0f44a99-1.mp4', 'zerodice'),
  ('grok-video-2682d986.mp4', '/studio/projects/ZeroDice/grok-video-2682d986-8dbe-421e-b560-4f0d78ccb240-1.mp4', 'zerodice'),
  ('grok-video-2ce6bfd5.mp4', '/studio/projects/ZeroDice/grok-video-2ce6bfd5-0723-4d62-b37f-cc9d5d10d4ff-5.mp4', 'zerodice'),
  ('grok-video-317f6023.mp4', '/studio/projects/ZeroDice/grok-video-317f6023-12d1-46f9-8448-81163b3bdbe8-2.mp4', 'zerodice'),
  ('grok-video-32cf6457.mp4', '/studio/projects/ZeroDice/grok-video-32cf6457-d295-4e73-847d-cef90fdccd11-4.mp4', 'zerodice'),
  ('grok-video-35ea12f0.mp4', '/studio/projects/ZeroDice/grok-video-35ea12f0-4c53-40af-9246-80a9d7812370-3.mp4', 'zerodice'),
  ('grok-video-36a72480.mp4', '/studio/projects/ZeroDice/grok-video-36a72480-3efe-46a0-824d-206a91c61ffa-2.mp4', 'zerodice'),
  ('grok-video-3cdba4db.mp4', '/studio/projects/ZeroDice/grok-video-3cdba4db-bd35-4800-8319-6153d91b0fae-0.mp4', 'zerodice');
