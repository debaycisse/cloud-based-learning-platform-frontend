import { api } from "./apiClient"
import type { 
    CooldownHistory 
} from "../types"

export const getCooldownHistoryByUserId = async (
    userId: string
): Promise<{
    cooldown: CooldownHistory
}>  => {
    try {
        const response = await api.get(`/cooldown_history/${userId}`)
        return response.data
    } catch (error) {
        console.error("Get cooldown history API error", error)
        throw error        
    }
}