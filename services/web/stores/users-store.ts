import { create } from 'zustand'

type Role = 'student' | 'admin'

interface UserState {
    role: Role
    setRole: (role: Role) => void
}

export const useUserStore = create<UserState>((set) => ({
    role: 'student', // Default view
    setRole: (role) => set({ role }),
}))
