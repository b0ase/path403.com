-- Update the handle_new_user function to extract Google profile picture and full name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    display_name, 
    full_name, 
    avatar_url
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile with Google OAuth data including avatar URL and full name when a new user signs up'; 