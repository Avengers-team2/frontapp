import { User } from "@/types/user";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

const useAuthStore = create(
    persist(
        combine(
            {
                user: null as User | null,
                isAuthenticated: false as boolean
            },
            (set) => ({
                setIsAuthenticated: (status: boolean) => set({isAuthenticated: status}),
                setUser: (user: User | null) => set({user: user})
            })
        ),
        {
            name: "auth-store",
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user
            })
        }
    )
)


export default useAuthStore;
