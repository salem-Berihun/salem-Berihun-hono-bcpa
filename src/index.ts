import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()
app.use('*', async (c, next) => {
  await next()
})
const users: any[] = [] 

// 1. Home Route
app.get('/', (c) => c.text('Hono is live!'))

// 2. Get All Users (UPDATED: Hiding passwords)
app.get('/users', (c) => {
  // This removes the password from each user object before sending it
  const safeUsers = users.map(({ password, ...user }) => user);
  return c.json(safeUsers);
})

// 3. Get User by ID (UPDATED: Hiding password)
app.get('/users/:id', (c) => {
  const user = users.find((u) => u.id === c.req.param('id'))
  if (!user) {
    return c.json({ error: "Not found" }, 404);
  }
  
  // Destructuring to pull out the password and keep the rest
  const { password, ...safeUser } = user;
  return user ? c.json(safeUser) : c.json({ error: "Not found" }, 404)
})

// 4. Signup 
app.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.email || !body.password) {
      return c.json({ error: "Missing email or password" }, 400);
    }
    
    const emailLower = body.email.toLowerCase();
    const userExists = users.find(u => u.email === emailLower);

    if (userExists) {
      return c.json({ error: "User already exists" }, 400);
    }

    const newUser = { 
      id: Math.random().toString(36).substring(2, 9), 
      name: body.name,
      email: emailLower, // using the variable we already lowered
      password: body.password
    };
    users.push(newUser);

    // Return the new user without their password
    const { password, ...safeUser } = newUser;
    return c.json(safeUser, 201);
  } catch (err) {
    return c.json({ error: "Invalid JSON body"}, 400);
  }
})

// 5. Signin 
app.post('/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
    return user ? c.json({ message: "Login successful" }) : c.json({ error: "Invalid credentials" }, 401);
  } catch (err) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app