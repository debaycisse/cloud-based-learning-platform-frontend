import { api } from "./apiClient"

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("image", file)

    console.log(`formData :::: ${formData}`)

    // Send the file to the backend
    const response = await api.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    // Return the URL of the uploaded image
    console.log(`Image url : ${response.data.url}`)
    return response.data.url
  } catch (error) {
    console.error("Image upload error:", error)
    throw error
  }
}
