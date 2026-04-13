import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()
app.use('*', async (c, next) => {
  await next()
})
const users: any[] = [] 

// 1. Home Route
app.get('/', (c) => c.text('Hono is live!'))

// 2. Get All Users
app.get('/users', (c) => c.json(users))

// 3. Get User by ID
app.get('/users/:id', (c) => {
  const user = users.find((u) => u.id === c.req.param('id'))
  return user ? c.json(user) : c.json({ error: "Not found" }, 404)
})

// 4. Signup 
app.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.email || !body.password) {
      return c.json({ error: "Missing email or password" }, 400);
    }
    const newUser = { 
      id: Math.random().toString(36).substring(2, 9), 
      ...body,
    email: body.email.toLowerCase()
    }
    users.push(newUser);
    return c.json(newUser, 201);
  } catch (err) {
    return c.json({ error: "Invalid JSON body" }, 400);
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