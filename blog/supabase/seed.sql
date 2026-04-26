-- Run this in your Supabase SQL Editor to populate dummy posts!
-- It automatically assigns these posts to the first user it finds in your database.

DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first available user ID to act as the author
  SELECT id INTO first_user_id FROM public.users LIMIT 1;

  -- Ensure we actually have a user, otherwise exit gracefully
  IF first_user_id IS NULL THEN
    RAISE NOTICE 'No users found! Please register at least one account via the UI first before seeding posts.';
    RETURN;
  END IF;

  -- Insert premium dummy posts
  INSERT INTO public.posts (title, body, image_url, author_id, summary) VALUES 
  (
    'The Future of Serverless Architecture in 2026', 
    'Serverless computing has evolved drastically. Gone are the days of experiencing painful cold starts and massive API latency. With the rise of Edge computing paradigms like Next.js Middleware and Cloudflare Workers, developers can now run full-stack server-side logic globally with near-zero ms latency. This fundamentally changes how we design our microservices and how we scale enterprise applications without DevOps overhead.', 
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    first_user_id,
    'Serverless computing has shifted towards Edge architectures, practically eliminating cold starts and latency. This enables developers to deploy full-stack logic globally, revolutionizing backend scalability and reducing DevOps complexity.'
  ),
  (
    'Mastering Next.js 15: What You Need to Know', 
    'Next.js 15 brings a massive paradigm shift with its aggressive default caching strategies and stabilization of Turbopack. As a developer, understanding how Server Actions replace traditional API endpoints is crucial for keeping your bundle size small. Furthermore, partial prerendering allows you to seamlessly weave dynamic user-specific content into static shells. It is a golden era for React developers.', 
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    first_user_id,
    'Next.js 15 stabilizes Turbopack and prioritizes Server Actions over classical API routes to minimize bundle sizes. With partial prerendering, it offers an optimal balance between static performance and dynamic personalization.'
  ),
  (
    'Why Glassmorphism is Dominating UI Design', 
    'In recent years, flat design began to feel stagnant. Enter Glassmorphism: a beautiful intersection of translucency, vivid background gradients, and subtle drop shadows. Driven by modern OS capabilities (like macOS and Windows 11) and CSS backdrop-filter support, designers are utilizing frosted glass aesthetics to establish visual hierarchy without heavy opaque block elements. It provides a luxurious "premium" feel that users subconsciously trust.', 
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    first_user_id,
    'Glassmorphism has superseded flat design by using translucent layers, background blurs, and vibrant gradients. Supported by modern CSS, it creates a premium, visually engaging hierarchy that enhances user trust and aesthetic appeal.'
  ),
  (
    'Integrating AI: The Rise of Agentic Development', 
    'We are moving beyond simple chatbots. Agentic AI refers to autonomous code generation tools that can iterate, compile, and execute logic natively within your IDE. Tools like Cursor, Windsurf, and Antigravity can understand an entire monolithic codebase, refactoring and injecting full-stack features seamlessly. As developers learn to act more as "Reviewers" and "Architects" rather than typists, engineering velocity is reaching unprecedented heights.', 
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop',
    first_user_id,
    'Agentic AI is moving software development beyond chatbots into autonomous full-stack code generation. Developers are transitioning into architectural roles, allowing AI tools to execute native logic and drastically accelerate engineering velocity.'
  );

  RAISE NOTICE 'Successfully generated 4 beautiful posts assigned to your user account!';
END $$;
