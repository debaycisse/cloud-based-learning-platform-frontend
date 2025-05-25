import { api } from "./apiClient"
import type { ContactSupport } from "../types"

export const contactSupport = async (
    data: ContactSupport
): Promise<{
    message: string;
}> => {
    try {
        const response = await api.post("/email/contact_support", {data})
        return response.data
    } catch (error) {
        console.error("Error occured while emailing support", error)
        throw error
    }
}
