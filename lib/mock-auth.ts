// Mock user database
const mockUsers = [{ id: "1", email: "demo@example.com", password: "password123" }]

export function mockLogin(email: string, password: string) {
  return new Promise<{ success: boolean; userId?: string; error?: string }>((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find((u) => u.email === email && u.password === password)
      if (user) {
        resolve({ success: true, userId: user.id })
      } else {
        resolve({ success: false, error: "Invalid email or password" })
      }
    }, 500)
  })
}

export function mockSignup(email: string, password: string) {
  return new Promise<{ success: boolean; userId?: string; error?: string }>((resolve) => {
    setTimeout(() => {
      const exists = mockUsers.some((u) => u.email === email)
      if (exists) {
        resolve({ success: false, error: "Email already registered" })
      } else {
        const newUser = { id: String(mockUsers.length + 1), email, password }
        mockUsers.push(newUser)
        resolve({ success: true, userId: newUser.id })
      }
    }, 500)
  })
}
