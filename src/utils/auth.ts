import jwtDecode from "jwt-decode"

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

export default isTokenExpired;